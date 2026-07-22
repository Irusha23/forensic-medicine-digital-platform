import prisma from '../lib/prisma';

function toBigInt(value: string | number | bigint | null | undefined) {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

function toOptionalDate(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeMediaIds(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => BigInt(item));
}

function buildSummary(input: any, mediaIds: bigint[]) {
  const summaryParts: any = {};
  if (input?.summary) summaryParts.summary = input.summary;
  if (mediaIds.length) summaryParts.linked_media_ids = mediaIds.map((id) => id.toString());
  if (input?.document_id) summaryParts.document_id = String(input.document_id);
  return summaryParts && Object.keys(summaryParts).length ? JSON.stringify(summaryParts) : null;
}

function buildResultsPayload(input: any) {
  if (input?.results === undefined) return undefined;
  return input.results === null ? null : String(input.results);
}

export async function listInvestigationsByCase(caseId: string | number | bigint) {
  const id = typeof caseId === 'string' ? BigInt(caseId) : BigInt(caseId);
  const investigations = await prisma.investigation.findMany({
    where: { case_id: id },
    orderBy: { requested_date: 'desc' },
    include: { documents: true }
  });

  return investigations.map((item) => ({
    ...item,
    metadata: item.summary ? JSON.parse(item.summary) : null
  }));
}

export async function getInvestigationById(investigationId: string | number | bigint) {
  const id = typeof investigationId === 'string' ? BigInt(investigationId) : BigInt(investigationId);
  const investigation = await prisma.investigation.findUnique({
    where: { investigation_id: id },
    include: { documents: true }
  });

  if (!investigation) return null;
  return {
    ...investigation,
    metadata: investigation.summary ? JSON.parse(investigation.summary) : null
  };
}

export async function createInvestigation(caseId: string | number | bigint, input: any) {
  const id = typeof caseId === 'string' ? BigInt(caseId) : BigInt(caseId);

  const caseRecord = await prisma.cases.findUnique({ where: { case_id: id } });
  if (!caseRecord) throw new Error('Case not found');

  const mediaIds = normalizeMediaIds(input?.media_ids);
  if (mediaIds.length) {
    const linkedMedia = await prisma.media.findMany({
      where: {
        case_id: id,
        media_id: { in: mediaIds }
      }
    });

    if (linkedMedia.length !== mediaIds.length) {
      throw new Error('One or more linked media items do not belong to this case');
    }
  }

  const summary = buildSummary(input, mediaIds);
  const documentId = toBigInt(input?.document_id);
  const results = buildResultsPayload(input);

  return prisma.investigation.create({
    data: {
      case_id: id,
      investigation_type: input?.investigation_type || 'LAB_REQUEST',
      requested_date: toOptionalDate(input?.requested_date),
      completed_date: toOptionalDate(input?.completed_date),
      status: input?.status || 'REQUESTED',
      summary,
      results,
      document_id: documentId
    }
  });
}

export async function updateInvestigation(investigationId: string | number | bigint, input: any) {
  const id = typeof investigationId === 'string' ? BigInt(investigationId) : BigInt(investigationId);

  const mediaIds = normalizeMediaIds(input?.media_ids);
  if (mediaIds.length) {
    const investigation = await prisma.investigation.findUnique({ where: { investigation_id: id } });
    if (!investigation) throw new Error('Investigation not found');

    const linkedMedia = await prisma.media.findMany({
      where: {
        case_id: investigation.case_id,
        media_id: { in: mediaIds }
      }
    });

    if (linkedMedia.length !== mediaIds.length) {
      throw new Error('One or more linked media items do not belong to this case');
    }
  }

  const updateData: any = {};
  if (input?.investigation_type !== undefined) updateData.investigation_type = input.investigation_type;
  if (input?.requested_date !== undefined) updateData.requested_date = toOptionalDate(input.requested_date);
  if (input?.completed_date !== undefined) updateData.completed_date = toOptionalDate(input.completed_date);
  if (input?.status !== undefined) updateData.status = input.status;
  if (input?.summary !== undefined || input?.media_ids !== undefined || input?.document_id !== undefined) {
    const existing = await prisma.investigation.findUnique({ where: { investigation_id: id } });
    const existingSummary = existing?.summary ? JSON.parse(existing.summary) : {};
    const nextSummary: any = { ...existingSummary };
    if (input?.summary !== undefined) nextSummary.summary = input.summary;
    if (input?.media_ids !== undefined) nextSummary.linked_media_ids = mediaIds.map((item) => item.toString());
    if (input?.document_id !== undefined) nextSummary.document_id = input.document_id ? String(input.document_id) : null;
    updateData.summary = Object.keys(nextSummary).length ? JSON.stringify(nextSummary) : null;
  }
  if (input?.results !== undefined) updateData.results = buildResultsPayload(input);
  if (input?.document_id !== undefined) updateData.document_id = toBigInt(input.document_id);

  const updated = await prisma.investigation.update({ where: { investigation_id: id }, data: updateData });

  // Notification Trigger: Alert assigned doctor when investigation is COMPLETED or results uploaded
  if (input?.status === 'COMPLETED' || input?.results !== undefined || input?.document_id !== undefined) {
    try {
      const caseRec = await prisma.cases.findUnique({ where: { case_id: updated.case_id! } });
      if (caseRec && caseRec.assigned_doctor_id) {
        const { createNotification } = require('./notification.service');
        await createNotification({
          receiver_user_id: caseRec.assigned_doctor_id,
          case_id: caseRec.case_id,
          notification_type: 'INVESTIGATION_UPDATE',
          title: 'Investigation Completed',
          message: `The investigation "${updated.investigation_type}" for Case ${caseRec.case_number} has new results or has been marked completed.`
        });
      }
    } catch (e) {
      console.error('Failed to send investigation notification:', e);
    }
  }

  return updated;
}

export async function deleteInvestigation(investigationId: string | number | bigint) {
  const id = typeof investigationId === 'string' ? BigInt(investigationId) : BigInt(investigationId);
  return prisma.investigation.delete({ where: { investigation_id: id } });
}
