import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    court_event: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ court_event_id: BigInt(1), case_id: BigInt(10) }),
      update: jest.fn().mockResolvedValue({ court_event_id: BigInt(1) }),
      delete: jest.fn().mockResolvedValue({ success: true }),
    }
  }
}));

describe('Court Event API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should list court events', async () => {
    const res = await request(app).get('/api/cases/10/court-events').set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
    expect(prisma.court_event.findMany).toHaveBeenCalled();
  });

  it('should create court event', async () => {
    const payload = { court_name: 'High Court', event_type: 'Trial' };
    const res = await request(app).post('/api/cases/10/court-events').set('Authorization', 'Bearer fake-token').send(payload);
    expect(res.status).toBe(201);
    expect(prisma.court_event.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        court_name: 'High Court',
        event_type: 'Trial',
      })
    }));
  });

  it('should update court event', async () => {
    const payload = { outcome_or_response: 'Pending' };
    const res = await request(app).put('/api/cases/10/court-events/1').set('Authorization', 'Bearer fake-token').send(payload);
    expect(res.status).toBe(200);
    expect(prisma.court_event.update).toHaveBeenCalled();
  });

  it('should delete court event', async () => {
    const res = await request(app).delete('/api/cases/10/court-events/1').set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
    expect(prisma.court_event.delete).toHaveBeenCalled();
  });
});
