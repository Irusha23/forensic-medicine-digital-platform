import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

describe('Strict Backend RBAC Enforcement', () => {
  let createdCaseId: bigint;

  beforeAll(async () => {
    // Create a real case to attempt to delete
    const newCase = await prisma.cases.create({
      data: {
        case_number: `RBAC-TEST-${Date.now()}`,
        status: 'OPEN',
      }
    });
    createdCaseId = newCase.case_id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.cases.delete({ where: { case_id: createdCaseId } }).catch(() => {});
    jest.restoreAllMocks();
  });

  it('should violently reject DELETE /api/cases/:id if the user only has the Clerk role', async () => {
    // Mock the token verification to return ONLY the Clerk role
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 999, roles: ['Clerk'] });

    const res = await request(app)
      .delete(`/api/cases/${createdCaseId}`)
      .set('Authorization', 'Bearer clerk-token');

    // Assert that the request is forbidden
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);

    // Verify the case was NOT deleted from the database
    const caseInDb = await prisma.cases.findUnique({
      where: { case_id: createdCaseId }
    });
    expect(caseInDb).not.toBeNull();
    expect(caseInDb?.is_deleted).toBe(false);
  });
  
  it('should allow DELETE /api/cases/:id if the user has the Admin role', async () => {
    // Mock the token verification to return the Admin role
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 999, roles: ['Admin'] });

    const res = await request(app)
      .delete(`/api/cases/${createdCaseId}`)
      .set('Authorization', 'Bearer admin-token');

    // Assert that the request is successful (soft delete)
    expect(res.status).toBe(200);

    // Verify the case WAS soft-deleted from the database
    const caseInDb = await prisma.cases.findUnique({
      where: { case_id: createdCaseId }
    });
    expect(caseInDb?.is_deleted).toBe(true);
  });
});
