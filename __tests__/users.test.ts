import request from 'supertest';
import app from '../src/server';

describe('Users API Integration Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    // Attempt to log in as the default admin seeded in the database
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'adminpass' });
    
    if (loginRes.status === 200) {
      adminToken = loginRes.body.token;
    } else {
      console.warn('Could not authenticate as admin, some tests might fail if database is not seeded.');
    }
  });

  describe('Route Availability & Authorization', () => {
    it('should reject unauthenticated requests to /api/users with 401', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('should allow authenticated admin to GET /api/users', async () => {
      if (!adminToken) return; // skip if no token
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('CRUD Operations on Users', () => {
    let newUserId: string;

    it('should create a new user (POST)', async () => {
      if (!adminToken) return;

      const newUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        designation: 'QA Tester',
        roles: ['Clerk']
      };

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.user_id).toBeDefined();
      newUserId = res.body.user_id;
    });

    it('should read the newly created user from the list (GET)', async () => {
      if (!adminToken || !newUserId) return;

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const user = res.body.find((u: any) => u.user_id === newUserId);
      expect(user).toBeDefined();
      expect(user.first_name).toBe('Test');
    });

    it('should update user status (PATCH)', async () => {
      if (!adminToken || !newUserId) return;

      const res = await request(app)
        .patch(`/api/users/${newUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('should fail validation on malformed payload (POST)', async () => {
      if (!adminToken) return;

      // Missing required fields
      const badUser = {
        first_name: 'Test'
      };

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(badUser);

      // We expect the server to catch this and not crash.
      expect(res.status).toBeGreaterThanOrEqual(400); 
    });
  });
});
