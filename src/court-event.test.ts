import { createCourtEvent, deleteCourtEvent, listCourtEventsByCase, updateCourtEvent } from './services/court-event.service';
import prisma from './lib/prisma';

// A mock implementation just to verify tests can run
jest.mock('./lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      court_event: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ court_event_id: BigInt(1), case_id: BigInt(10) }),
        update: jest.fn().mockResolvedValue({ court_event_id: BigInt(1) }),
        delete: jest.fn().mockResolvedValue({ success: true }),
      }
    }
  };
});

describe('Court Event Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list court events', async () => {
    const events = await listCourtEventsByCase(10);
    expect(events).toEqual([]);
    expect(prisma.court_event.findMany).toHaveBeenCalledTimes(1);
  });

  it('should create court event', async () => {
    const event = await createCourtEvent(10, { court_name: 'Supreme Court' });
    expect(event).toBeDefined();
    expect(prisma.court_event.create).toHaveBeenCalledTimes(1);
  });

  it('should update court event', async () => {
    const event = await updateCourtEvent(1, { event_type: 'Hearing' });
    expect(event).toBeDefined();
    expect(prisma.court_event.update).toHaveBeenCalledTimes(1);
  });

  it('should delete court event', async () => {
    await deleteCourtEvent(1);
    expect(prisma.court_event.delete).toHaveBeenCalledTimes(1);
  });
});
