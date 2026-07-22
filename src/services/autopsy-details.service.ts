import prisma from '../lib/prisma';

function toCaseId(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

function normalizeOrganFindings(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export async function getAutopsyDetailsByCase(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  return prisma.autopsy_details.findUnique({ where: { case_id: id } });
}

export async function upsertAutopsyDetails(caseId: string | number | bigint, input: any) {
  const id = toCaseId(caseId);

  const caseRecord = await prisma.cases.findUnique({ where: { case_id: id } });
  if (!caseRecord) throw new Error('Case not found');

  const data: any = {
    time_since_death_estimate: input?.time_since_death_estimate ?? undefined,
    clothing_details: input?.clothing_details ?? undefined,
    identification_marks: input?.identification_marks ?? undefined,
    external_injuries: normalizeOrganFindings(input?.external_injuries),
    internal_injuries: normalizeOrganFindings(input?.internal_injuries),
    organ_findings: normalizeOrganFindings(input?.organ_findings),
    immediate_cause_of_death: input?.immediate_cause_of_death ?? undefined,
    antecedent_causes: input?.antecedent_causes ?? undefined,
    manner_of_death: input?.manner_of_death ?? undefined
  };

  return prisma.autopsy_details.upsert({
    where: { case_id: id },
    create: { case_id: id, ...data },
    update: data
  });
}

export async function deleteAutopsyDetailsByCase(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  await prisma.autopsy_details.deleteMany({ where: { case_id: id } });
  return { ok: true };
}
