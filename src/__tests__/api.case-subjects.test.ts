import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    patients: {
      create: jest.fn().mockResolvedValue({ patient_id: BigInt(2), full_name: 'Jane Doe' }),
    },
    cases: {
      findUnique: jest.fn().mockResolvedValue({ 
        case_id: BigInt(1), 
        patients: { patient_id: BigInt(1), full_name: 'John Doe', gender: 'Male' } 
      }),
      update: jest.fn().mockResolvedValue({})
    }
  }
}));

describe('Case Subjects API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Subjects Endpoints', () => {
    it('should list subjects for a case', async () => {
      const res = await request(app).get('/api/cases/1/subjects').set('Authorization', 'Bearer fake-token');
      expect(res.status).toBe(200);
      expect(prisma.cases.findUnique).toHaveBeenCalledWith({
        where: { case_id: BigInt(1) },
        include: { patients: true }
      });
    });

    it('should create a subject for a case', async () => {
      const payload = {
        subject_type: 'Victim',
        full_name: 'Jane Doe',
        nic: '123456789V',
        case_id: 1
      };
      const res = await request(app)
        .post('/api/cases/1/subjects')
        .set('Authorization', 'Bearer fake-token')
        .send(payload);
      
      expect(res.status).toBe(201);
      expect(prisma.patients.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          full_name: 'Jane Doe',
          nic: '123456789V'
        })
      }));
    });
  });
});
