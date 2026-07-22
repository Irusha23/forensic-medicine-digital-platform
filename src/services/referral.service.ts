import prisma from '../lib/prisma';

export async function createReferral(data: any) {
  return prisma.referral.create({
    data: {
      case_id: data.case_id ? BigInt(data.case_id) : null,
      specialty: data.specialty,
      consultant_name: data.consultant_name,
      referral_date: data.referral_date ? new Date(data.referral_date) : null,
      recommendation: data.recommendation,
    }
  });
}

export async function getReferralsByCase(caseId: string | number) {
  return prisma.referral.findMany({
    where: { case_id: BigInt(caseId) }
  });
}
