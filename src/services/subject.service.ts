import prisma from '../lib/prisma';

export async function createSubject(data: any) {
  return prisma.subject.create({
    data: {
      case_id: data.case_id ? BigInt(data.case_id) : null,
      bht_number: data.bht_number,
      subject_type: data.subject_type,
      full_name: data.full_name,
      nic: data.nic,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      gender: data.gender,
      address: data.address,
      telephone: data.telephone
    }
  });
}

export async function getSubjectsByCase(caseId: string | number) {
  return prisma.subject.findMany({
    where: { case_id: BigInt(caseId) }
  });
}
