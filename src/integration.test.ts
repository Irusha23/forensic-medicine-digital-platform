import request from 'supertest';
import app from './server';

describe('Forensic API Integration Tests', () => {
  let adminToken = '';
  let clerkToken = '';

  beforeAll(async () => {
    // Attempt to login to get tokens
    const adminRes = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'adminpass' });
    if (adminRes.status === 200) adminToken = adminRes.body.token;

    const clerkRes = await request(app).post('/api/auth/login').send({ username: 'clerk', password: 'clerkpass' });
    if (clerkRes.status === 200) clerkToken = clerkRes.body.token;
  });

  describe('Happy Path', () => {
    it('should login as admin and return 200 with token', async () => {
      expect(adminToken).toBeTruthy();
    });
  });

  describe('Negative Testing', () => {
    it('should return 401 Unauthorized without token for /api/cases', async () => {
      const res = await request(app).get('/api/cases');
      expect(res.status).toBe(401);
    });

    it('should return 401 Unauthorized without token for /api/media/upload', async () => {
      const res = await request(app).post('/api/media/upload');
      expect(res.status).toBe(401);
    });

    it('should return 400 Bad Request or 404 for invalid case ID on GET', async () => {
      const res = await request(app).get('/api/cases/invalid-id').set('Authorization', `Bearer ${adminToken}`);
      expect([400, 404]).toContain(res.status);
    });
    
    it('should return 403 Forbidden for RBAC violation (clerk deleting case)', async () => {
      // Assuming a case with ID 99999 doesn't exist, but RBAC should block before DB query
      const res = await request(app).delete('/api/cases/99999').set('Authorization', `Bearer ${clerkToken}`);
      expect(res.status).toBe(403);
    });
  });
});
