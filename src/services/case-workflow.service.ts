import prisma from '../lib/prisma';
import { validateCaseReadyForClose } from './case.service';

function toCaseId(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

export async function getAvailableStatuses() {
  return prisma.case_status_lu.findMany();
}

async function logCaseStatusTransition(
  caseId: bigint,
  oldStatusId: number | null,
  newStatusId: number,
  userId: bigint | number | null,
  caseNumber: string
) {
  try {
    await prisma.audit_log.create({
      data: {
        user_id: userId ? BigInt(userId) : null,
        action: 'CASE_STATUS_TRANSITION',
        entity_type: 'case',
        entity_id: caseId,
        payload: {
          case_number: caseNumber,
          old_status_id: oldStatusId,
          new_status_id: newStatusId,
          transition_reason: 'User initiated status change'
        }
      }
    });
  } catch (e) {
    console.error('Failed to log status transition:', e);
    // Don't throw - audit logging should never break the main operation
  }
}

export async function transitionCaseStatus(caseId: string | number | bigint, newStatus: string | number, userId?: bigint | number | null) {
  const id = toCaseId(caseId);
  const resolvedStatusId: number = Number(typeof newStatus === 'string' ? Number(newStatus) : newStatus);

  const status = await prisma.case_status_lu.findUnique({ where: { id: resolvedStatusId } });
  if (!status) throw new Error('Invalid status');

  const caseRecord = await prisma.cases.findUnique({ where: { case_id: id } });
  if (!caseRecord) throw new Error('Case not found');

  if (status.code === 'closed') {
    await validateCaseReadyForClose(id);
  }

  const updated = await prisma.cases.update({
    where: { case_id: id },
    data: { case_status_id: resolvedStatusId, status: status.label }
  });

  // Log the status transition to audit_log
  const previousStatusId = caseRecord.case_status_id != null ? Number(caseRecord.case_status_id) : null;
  await logCaseStatusTransition(id, previousStatusId, resolvedStatusId, userId ?? null, caseRecord.case_number);

  return updated;
}

export async function createFinding(caseId: string | number | bigint, input: any) {
  const id = toCaseId(caseId);
  const { phase, description, recorded_by } = input;

  return prisma.finding.create({
    data: {
      case_id: id,
      phase: phase || null,
      description: description || null,
      recorded_by: recorded_by ? toCaseId(recorded_by) : null
    }
  });
}

export async function listFindingsByCase(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  return prisma.finding.findMany({
    where: { case_id: id },
    orderBy: { recorded_at: 'desc' },
    include: { users: true }
  });
}

export async function getAuditLogForCase(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  return prisma.audit_log.findMany({
    where: { entity_id: id, entity_type: 'case' },
    orderBy: { timestamp: 'desc' },
    include: { users: true }
  });
}

export async function updateFinding(findingId: string | number | bigint, input: any) {
  const id = toCaseId(findingId);
  const { phase, description } = input;

  const updateData: any = {};
  if (phase !== undefined) updateData.phase = phase;
  if (description !== undefined) updateData.description = description;

  return prisma.finding.update({ where: { finding_id: id }, data: updateData });
}

export async function deleteFinding(findingId: string | number | bigint) {
  const id = toCaseId(findingId);
  return prisma.finding.delete({ where: { finding_id: id } });
}
