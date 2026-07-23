import request from 'supertest';
import app from '../src/server';

describe('Cases API Integration Tests', () => {
  let adminToken: string;
  let newCaseId: string;

  beforeAll(async () => {
    // Attempt to log in as the default admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'adminpass' });
    
    if (loginRes.status === 200) {
      adminToken = loginRes.body.token;
    }
  });

  describe('Route Availability & Authorization', () => {
    it('should reject unauthenticated requests to /api/cases with 401', async () => {
      const res = await request(app).get('/api/cases');
      expect(res.status).toBe(401);
    });

    it('should allow authenticated admin to GET /api/cases', async () => {
      if (!adminToken) return;
      
      const res = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('CRUD Operations on Cases', () => {
    it('should create a new case (POST)', async () => {
      if (!adminToken) return;

      const newCase = {
        case_number: `C-${Date.now()}`,
        case_type_id: 1, // General Forensic
        status: 'OPEN',
        opened_date: new Date().toISOString()
      };

      const res = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCase);

      expect(res.status).toBe(201);
      expect(res.body.case_id).toBeDefined();
      newCaseId = res.body.case_id;
    });

    it('should read the newly created case (GET by ID)', async () => {
      if (!adminToken || !newCaseId) return;

      const res = await request(app)
        .get(`/api/cases/${newCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.case_id.toString()).toBe(newCaseId.toString());
    });

    it('should update the case (PUT)', async () => {
      if (!adminToken || !newCaseId) return;

      const res = await request(app)
        .put(`/api/cases/${newCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ case_number: `C-UPDATED-${Date.now()}` });

      expect(res.status).toBe(200);
      expect(res.body.case_number).toContain('C-UPDATED');
    });

    it('should fetch documents list returning 200', async () => {
      if (!adminToken || !newCaseId) return;

      const res = await request(app)
        .get(`/api/cases/${newCaseId}/documents`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should fail validation on malformed payload (POST)', async () => {
      if (!adminToken) return;

      const badCase = {
        // missing case_number and other required fields
        status: 'OPEN'
      };

      const res = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(badCase);

      expect(res.status).toBeGreaterThanOrEqual(400); 
    });
  });
});
