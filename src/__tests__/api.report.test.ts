import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    report: {
      create: jest.fn().mockResolvedValue({ report_id: BigInt(1), case_id: BigInt(10) })
    },
    report_issuance: {
      create: jest.fn().mockResolvedValue({ issuance_id: BigInt(1) })
    }
  }
}));

describe('Report API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should issue a report and create report_issuance record', async () => {
    const payload = {
      report_type: 'pmr',
      final_opinion: 'Death by natural causes',
      recipient_name: 'Dr. Smith',
      method_of_delivery: 'Email',
    };
    const res = await request(app).post('/api/cases/10/report/issue').set('Authorization', 'Bearer fake-token').send(payload);
    
    expect(res.status).toBe(201);
    expect(prisma.report.create).toHaveBeenCalled();
    expect(prisma.report_issuance.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        recipient_name: 'Dr. Smith',
        method_of_delivery: 'Email',
        report_id: BigInt(1)
      })
    }));
  });
});
