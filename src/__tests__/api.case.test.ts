import request from 'supertest';
import app from '../server';
import prisma from '../lib/prisma';
import * as authService from '../services/auth.service';

jest.mock('../lib/prisma', () => {
  const mockCasesCreate = jest.fn().mockResolvedValue({ case_id: BigInt(1), status: 'Open' });
  const mockClinicalCaseCreate = jest.fn();
  const mockAutopsyCaseCreate = jest.fn();

  return {
    __esModule: true,
    default: {
      cases: {
        create: mockCasesCreate,
        update: jest.fn().mockResolvedValue({ case_id: BigInt(1), status: 'Open' }),
        findMany: jest.fn().mockResolvedValue([{ case_id: BigInt(1), status: 'Open' }]),
        findFirst: jest.fn().mockResolvedValue({ case_id: BigInt(1) }),
        count: jest.fn().mockResolvedValue(1),
      },
      clinical_case: {
        create: mockClinicalCaseCreate,
        update: jest.fn(),
      },
      autopsy_case: {
        create: mockAutopsyCaseCreate,
        update: jest.fn(),
      },
      case_status_history: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => {
        return cb({
          cases: { create: mockCasesCreate, update: jest.fn().mockResolvedValue({ case_id: BigInt(1), status: 'Open' }), findFirst: jest.fn().mockResolvedValue({ case_id: BigInt(1) }) },
          clinical_case: { create: mockClinicalCaseCreate, update: jest.fn() },
          autopsy_case: { create: mockAutopsyCaseCreate, update: jest.fn() },
          case_status_history: { create: jest.fn() }
        });
      })
    }
  };
});


describe('Case API endpoints', () => {
  beforeAll(() => {
    jest.spyOn(authService, 'verifyToken').mockReturnValue({ userId: 1, roles: ['Admin', 'Doctor'] });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should list cases', async () => {
    const res = await request(app).get('/api/cases').set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
    expect(prisma.cases.findMany).toHaveBeenCalled();
  });

  it('should create clinical case', async () => {
    const payload = {
      clinical: {
        referral_date_time: '2023-01-01T10:00:00Z',
        referring_officer: 'Officer John'
      }
    };
    const res = await request(app).post('/api/cases').set('Authorization', 'Bearer fake-token').send(payload);
    if (res.status === 500) console.error(res.body);
    expect(res.status).toBe(201);
    expect(prisma.cases.create).toHaveBeenCalled();
    expect(prisma.clinical_case.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        referring_officer: 'Officer John',
        referral_date_time: new Date('2023-01-01T10:00:00Z')
      })
    }));
  });

  it('should create autopsy case', async () => {
    const payload = {
      autopsy: {
        body_received_date_time: '2023-01-02T10:00:00Z',
        condition_upon_arrival: 'Cold'
      }
    };
    const res = await request(app).post('/api/cases').set('Authorization', 'Bearer fake-token').send(payload);
    expect(res.status).toBe(201);
    expect(prisma.cases.create).toHaveBeenCalled();
    expect(prisma.autopsy_case.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        condition_upon_arrival: 'Cold',
        body_received_date_time: new Date('2023-01-02T10:00:00Z')
      })
    }));
  });
});
