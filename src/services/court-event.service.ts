import prisma from '../lib/prisma';

function toBigInt(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

export async function listCourtEventsByCase(caseId: string | number | bigint) {
  return prisma.court_event.findMany({
    where: { case_id: toBigInt(caseId) },
    orderBy: { event_date: 'desc' }
  });
}

export async function createCourtEvent(caseId: string | number | bigint, data: any) {
  return prisma.court_event.create({
    data: {
      case_id: toBigInt(caseId),
      event_date: data.event_date ? new Date(data.event_date) : null,
      event_type: data.event_type || null,
      court_name: data.court_name || null,
      outcome_or_response: data.outcome_or_response || null,
    }
  });
}

export async function updateCourtEvent(courtEventId: string | number | bigint, data: any) {
  return prisma.court_event.update({
    where: { court_event_id: toBigInt(courtEventId) },
    data: {
      event_date: data.event_date ? new Date(data.event_date) : undefined,
      event_type: data.event_type !== undefined ? data.event_type : undefined,
      court_name: data.court_name !== undefined ? data.court_name : undefined,
      outcome_or_response: data.outcome_or_response !== undefined ? data.outcome_or_response : undefined,
    }
  });
}

export async function deleteCourtEvent(courtEventId: string | number | bigint) {
  return prisma.court_event.delete({
    where: { court_event_id: toBigInt(courtEventId) }
  });
}
