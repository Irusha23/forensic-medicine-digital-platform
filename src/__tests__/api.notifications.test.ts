import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    notifications: {
      findMany: jest.fn().mockResolvedValue([
        { notification_id: BigInt(1), receiver_user_id: BigInt(1), is_read: false, title: 'Test', message: 'Hello' }
      ]),
      findUnique: jest.fn().mockResolvedValue({
        notification_id: BigInt(1), receiver_user_id: BigInt(1), is_read: false
      }),
      update: jest.fn().mockResolvedValue({
        notification_id: BigInt(1), receiver_user_id: BigInt(1), is_read: true
      }),
    }
  }
}));

describe('Notifications API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/notifications/unread', () => {
    it('should return unread notifications for the user', async () => {
      const res = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.status).toBe(200);
      expect(prisma.notifications.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          receiver_user_id: BigInt(1),
          is_read: false
        }
      }));
      expect(res.body.length).toBe(1);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/1/read')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.status).toBe(200);
      expect(prisma.notifications.findUnique).toHaveBeenCalledWith({
        where: { notification_id: BigInt(1) }
      });
      expect(prisma.notifications.update).toHaveBeenCalledWith({
        where: { notification_id: BigInt(1) },
        data: expect.objectContaining({ is_read: true })
      });
    });

    it('should fail if notification belongs to another user', async () => {
      (prisma.notifications.findUnique as jest.Mock).mockResolvedValueOnce({
        notification_id: BigInt(2), receiver_user_id: BigInt(99)
      });

      const res = await request(app)
        .patch('/api/notifications/2/read')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/unauthorized/i);
    });
  });
});
