import prisma from '../lib/prisma';

export async function createReferral(data: any) {
  return prisma.referral.create({
    data: {
      case_id: data.case_id ? BigInt(data.case_id) : null,
      specialty: data.specialty,
      consultant_name: data.consultant_name,
      referred_to_user_id: data.referred_to_user_id ? BigInt(data.referred_to_user_id) : null,
      referral_date: data.referral_date ? new Date(data.referral_date) : null,
      recommendation: data.recommendation,
    }
  });
}

export async function getReferralsByCase(caseId: string | number) {
  return prisma.referral.findMany({
    where: { case_id: BigInt(caseId) },
    include: {
      users: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          designation: true
        }
      }
    }
  });
}
