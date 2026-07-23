import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    cases: {
      count: jest.fn(),
      groupBy: jest.fn()
    },
    case_type_lu: {
      findMany: jest.fn()
    },
    investigation: {
      count: jest.fn().mockResolvedValue(0)
    },
    audit_log: {
      create: jest.fn().mockResolvedValue({})
    }
  }
}));

describe('Dashboard API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/dashboard/metrics', () => {
    it('should return aggregated metrics for the dashboard', async () => {
      (prisma.cases.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(6)  // open
        .mockResolvedValueOnce(4); // closed

      (prisma.cases.groupBy as jest.Mock)
        .mockResolvedValueOnce([ // statusGroups
          { status: 'OPEN', _count: { case_id: 6 } },
          { status: 'CLOSED', _count: { case_id: 4 } }
        ])
        .mockResolvedValueOnce([ // typeGroups
          { case_type_id: 1, _count: { case_id: 8 } },
          { case_type_id: 2, _count: { case_id: 2 } }
        ]);

      (prisma.case_type_lu.findMany as jest.Mock).mockResolvedValue([
        { id: 1, label: 'Clinical' },
        { id: 2, label: 'Autopsy' }
      ]);

      const res = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.status).toBe(200);
      expect(res.body.summary).toEqual({ totalCases: 10, openCases: 6, closedCases: 4, pendingInvestigations: 0, pendingReports: undefined });
      expect(res.body.statusDistribution).toEqual([
        { name: 'OPEN', value: 6 },
        { name: 'CLOSED', value: 4 }
      ]);
      expect(res.body.typeDistribution).toEqual([
        { name: 'Clinical', value: 8 },
        { name: 'Autopsy', value: 2 }
      ]);
    });
  });
});
