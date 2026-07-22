import prisma from '../lib/prisma';

export async function createSubject(data: any) {
  const newPatient = await prisma.patients.create({
    data: {
      full_name: data.full_name,
      nic: data.nic,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      gender: data.gender,
      address: data.address,
      telephone: data.telephone
    }
  });

  if (data.case_id) {
    await prisma.cases.update({
      where: { case_id: BigInt(data.case_id) },
      data: { patient_id: newPatient.patient_id }
    });
  }

  return {
    ...newPatient,
    id: newPatient.patient_id,
    case_id: data.case_id || null
  };
}

export async function getSubjectsByCase(caseId: string | number) {
  const c = await prisma.cases.findUnique({
    where: { case_id: BigInt(caseId) },
    include: { patients: true }
  });
  
  if (c && c.patients) {
    return [{
      ...c.patients,
      id: c.patients.patient_id,
      case_id: c.case_id
    }];
  }
  return [];
}
