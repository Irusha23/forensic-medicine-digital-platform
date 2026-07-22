import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    media: {
      findMany: jest.fn().mockResolvedValue([{ media_id: BigInt(1), file_path: 'local/path/img.png' }]),
      create: jest.fn().mockResolvedValue({ media_id: BigInt(2) }),
    },
    documents: {
      findMany: jest.fn().mockResolvedValue([{ document_id: BigInt(1), title: 'Autopsy Report' }]),
      create: jest.fn().mockResolvedValue({ document_id: BigInt(2) }),
    }
  }
}));

describe('Case Assets API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Media Endpoints', () => {
    it('should list media for a case', async () => {
      const res = await request(app).get('/api/cases/1/media').set('Authorization', 'Bearer fake-token');
      expect(res.status).toBe(200);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { case_id: 1n, cases: { is_deleted: false } },
        orderBy: { captured_at: 'desc' }
      });
    });

    it('should upload media for a case', async () => {
      const res = await request(app)
        .post('/api/cases/1/media')
        .set('Authorization', 'Bearer fake-token')
        .attach('file', Buffer.from('fake image data'), 'test.png');
      
      expect(res.status).toBe(200);
    });
  });

  describe('Documents Endpoints', () => {
    it('should list documents for a case', async () => {
      const res = await request(app).get('/api/cases/1/documents').set('Authorization', 'Bearer fake-token');
      expect(res.status).toBe(200);
      expect(prisma.documents.findMany).toHaveBeenCalledWith({
        where: { case_id: 1n, cases: { is_deleted: false } },
        orderBy: { uploaded_at: 'desc' }
      });
    });

    it('should upload a document for a case', async () => {
      const res = await request(app)
        .post('/api/cases/1/documents')
        .set('Authorization', 'Bearer fake-token')
        .attach('file', Buffer.from('fake doc data'), 'report.pdf');
      
      expect(res.status).toBe(201);
    });
  });
});
