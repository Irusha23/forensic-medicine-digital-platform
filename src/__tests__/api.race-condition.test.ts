import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });

describe('PUT /api/cases/:id Race Conditions', () => {
  let caseId: string | number | bigint;
  
  beforeAll(async () => {
    // We assume there's a user seeded or we can just bypass auth for the test if it's mocked, 
    // or if the test database is used. The prompt implies hitting the endpoint. 
    // Let's create a test case directly in DB to update.
    const newCase = await prisma.cases.create({
      data: {
        case_number: `RACE-TEST-${Date.now()}`,
        status: 'OPEN',
      }
    });
    caseId = newCase.case_id;
  });

  afterAll(async () => {
    await prisma.cases.delete({ where: { case_id: BigInt(caseId) } }).catch(() => {});
  });

  it('should prevent lost updates when two requests try to update the same case simultaneously', async () => {
    // We will simulate two clients that both fetched the case at version 1
    // They both try to update the case.
    
    // First, fetch the current case to get its version
    const resGet = await request(app).get(`/api/cases/${caseId}`).set('Authorization', 'Bearer fake-token');
    expect(resGet.status).toBe(200);
    const version = resGet.body.version || 1; // Assuming we add a version field
    
    // Client A wants to change case_type_id to 2
    const reqA = request(app)
      .put(`/api/cases/${caseId}`)
      .set('Authorization', 'Bearer fake-token')
      .send({ case_type_id: 2, version });

    // Client B wants to change status to 'ARCHIVED'
    const reqB = request(app)
      .put(`/api/cases/${caseId}`)
      .set('Authorization', 'Bearer fake-token')
      .send({ status: 'ARCHIVED', version });

    // Send both simultaneously
    const [resA, resB] = await Promise.all([reqA, reqB]);

    // One should succeed, one should fail with 409 Conflict
    const statuses = [resA.status, resB.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409); // 409 Conflict

    // Verify the final state in the database matches the one that succeeded
    const finalCase = await prisma.cases.findUnique({ where: { case_id: BigInt(caseId) } });
    if (resA.status === 200) {
      expect(Number(finalCase?.case_type_id)).toBe(2);
    } else {
      expect(finalCase?.status).toBe('ARCHIVED');
    }
  });
});
