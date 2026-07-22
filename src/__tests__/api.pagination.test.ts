import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });

describe('Pagination & Load Testing', () => {
  let createdCaseIds: bigint[] = [];

  beforeAll(async () => {
    // We will create 15 dummy cases to test pagination limits
    const casesToCreate = Array.from({ length: 15 }).map((_, i) => ({
      case_number: `PAGE-TEST-${Date.now()}-${i}`,
      status: 'OPEN',
    }));

    await prisma.cases.createMany({
      data: casesToCreate
    });

    // Fetch the created IDs so we can clean them up later
    const created = await prisma.cases.findMany({
      where: {
        case_number: { startsWith: 'PAGE-TEST-' }
      }
    });
    createdCaseIds = created.map(c => c.case_id);
  });

  afterAll(async () => {
    await prisma.cases.deleteMany({
      where: { case_id: { in: createdCaseIds } }
    }).catch(() => {});
    jest.restoreAllMocks();
  });

  it('should restrict the response payload to the specified limit and return metadata', async () => {
    const limit = 5;
    const res = await request(app)
      .get(`/api/cases?page=1&limit=${limit}`)
      .set('Authorization', 'Bearer fake-token');
    
    expect(res.status).toBe(200);
    
    // Check if the response follows the { data, meta } structure
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    
    // Assert the data array is constrained by the limit
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(limit);
    
    // Assert metadata
    expect(res.body.meta.limit).toBe(limit);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(15);
  });
});
