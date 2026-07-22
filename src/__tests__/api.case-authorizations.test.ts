import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    legal_authorizations: {
      findMany: jest.fn().mockResolvedValue([{ authorization_id: BigInt(1), authorization_type: 'COURT_ORDER' }]),
      create: jest.fn().mockResolvedValue({ authorization_id: BigInt(2), authorization_type: 'INQUEST_ORDER' }),
    },
    court_order: { create: jest.fn() },
    inquest_order: { create: jest.fn() },
    summon: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (cb) => {
      return cb({
        legal_authorizations: { create: jest.fn().mockResolvedValue({ authorization_id: BigInt(2), authorization_type: 'INQUEST_ORDER' }) },
        court_order: { create: jest.fn() },
        inquest_order: { create: jest.fn() },
        summon: { create: jest.fn() }
      });
    })
  }
}));

describe('Case Legal Authorizations API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Authorizations Endpoints', () => {
    it('should list authorizations for a case', async () => {
      const res = await request(app).get('/api/cases/1/authorizations').set('Authorization', 'Bearer fake-token');
      expect(res.status).toBe(200);
      expect(prisma.legal_authorizations.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { case_id: BigInt(1) }
      }));
    });

    it('should create an inquest order', async () => {
      const payload = {
        authorization_type: 'INQUEST_ORDER',
        issuing_authority: 'Coroner John',
        inquest_order_number: 'IO-2023-01',
        isd_officer_name: 'Officer Smith',
        police_station: 'Central Station'
      };
      const res = await request(app)
        .post('/api/cases/1/authorizations')
        .set('Authorization', 'Bearer fake-token')
        .send(payload);
      
      expect(res.status).toBe(201);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
