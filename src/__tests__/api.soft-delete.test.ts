import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });

describe('Soft-Delete Leak Verification', () => {
  let createdCaseId: bigint;
  let mediaId: bigint;

  beforeAll(async () => {
    // 1. Create a case
    const newCase = await prisma.cases.create({
      data: {
        case_number: `SOFT-DEL-${Date.now()}`,
        status: 'OPEN',
      }
    });
    createdCaseId = newCase.case_id;

    // 2. Attach media
    const newMedia = await prisma.media.create({
      data: {
        case_id: createdCaseId,
        media_type: 'IMAGE',
        file_path: '/fake/path/test.jpg'
      }
    });
    mediaId = newMedia.media_id;

    // 3. Soft-delete the case
    await prisma.cases.update({
      where: { case_id: createdCaseId },
      data: { is_deleted: true, deleted_at: new Date() }
    });
  });

  afterAll(async () => {
    // Hard delete cleanup
    await prisma.cases.delete({ where: { case_id: createdCaseId } }).catch(() => {});
    jest.restoreAllMocks();
  });

  it('should not leak the soft-deleted case in the main list endpoint', async () => {
    const res = await request(app).get('/api/cases').set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
    const data = Array.isArray(res.body) ? res.body : res.body.data;
    const found = data.find((c: any) => c.case_id === String(createdCaseId));
    expect(found).toBeUndefined();
  });

  it('should not leak the soft-deleted case media via API', async () => {
    // Media by case endpoint
    const resList = await request(app).get(`/api/cases/${createdCaseId}/media`).set('Authorization', 'Bearer fake-token');
    expect(resList.status).toBe(200);
    expect(resList.body.length).toBe(0); // Should be empty

    // Direct media fetch
    const resDirect = await request(app).get(`/api/media/${mediaId}`).set('Authorization', 'Bearer fake-token');
    expect(resDirect.status).toBe(404); // Should be 404 Not Found since parent is soft-deleted
  });
});
