import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });

describe('Transaction Integrity & Rollback Testing', () => {
  beforeAll(async () => {
    // The test is isolated by generating a unique case_number.
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should rollback the entire transaction if autopsy insertion fails', async () => {
    const invalidPayload = {
      case_number: `TX-FAIL-${Date.now()}`,
      status: 'OPEN',
      autopsy: {
        // Intentionally provide an invalid date string to force Prisma to throw during child insertion
        body_received_date_time: 'this-is-not-a-valid-date',
        condition_upon_arrival: 'Cold'
      }
    };

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', 'Bearer fake-token')
      .send(invalidPayload);
    
    // Expect the API to reject the bad payload
    expect(res.status).not.toBe(201);
    // Verify that the parent Case record was rolled back / not inserted
    const ghostCase = await prisma.cases.findUnique({
      where: { case_number: invalidPayload.case_number }
    });
    expect(ghostCase).toBeNull();
  });
});
