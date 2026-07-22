import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    subject: {
      findMany: jest.fn().mockResolvedValue([{ subject_id: BigInt(1), full_name: 'John Doe', subject_type: 'Victim' }]),
      create: jest.fn().mockResolvedValue({ subject_id: BigInt(2), full_name: 'Jane Doe' }),
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
      expect(prisma.subject.findMany).toHaveBeenCalledWith({
        where: { case_id: BigInt(1) }
      });
    });

    it('should create a subject for a case', async () => {
      const payload = {
        subject_type: 'Victim',
        full_name: 'Jane Doe',
        nic: '123456789V'
      };
      const res = await request(app)
        .post('/api/cases/1/subjects')
        .set('Authorization', 'Bearer fake-token')
        .send(payload);
      
      expect(res.status).toBe(201);
      expect(prisma.subject.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          case_id: BigInt(1),
          subject_type: 'Victim',
          full_name: 'Jane Doe'
        })
      }));
    });
  });
});
