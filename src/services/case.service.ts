import prisma from '../lib/prisma';

function toCaseId(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

export async function listCases(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [total, data] = await Promise.all([
    prisma.cases.count({ where: { is_deleted: false } }),
    prisma.cases.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        case_type_lu: true,
        case_status_lu: true,
        clinical_case: true,
        autopsy_case: true,
        users: true
      }
    })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getCaseById(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  return prisma.cases.findFirst({
    where: { case_id: id, is_deleted: false },
    include: {
      case_type_lu: true,
      case_status_lu: true,
      clinical_case: true,
      autopsy_case: true,
      users: true,
      media: true,
      documents: true
    }
  });
}

export async function createCase(input: any) {
  const { case_number, case_type_id, case_status_id, status, assigned_doctor_id, police_station_id, opened_date, closed_date, clinical, autopsy } = input;

  const data: any = {
    case_number,
    case_type_id: case_type_id ? Number(case_type_id) : null,
    case_status_id: case_status_id ? Number(case_status_id) : null,
    status: status || 'OPEN',
    assigned_doctor_id: assigned_doctor_id ? toCaseId(assigned_doctor_id) : null,
    police_station_id: police_station_id ? Number(police_station_id) : null,
    opened_date: opened_date ? new Date(opened_date) : null,
    closed_date: closed_date ? new Date(closed_date) : null
  };

  const created = await prisma.$transaction(async (tx) => {
    const caseRecord = await tx.cases.create({ data });

    if (clinical) {
      await tx.clinical_case.create({
        data: {
          case_id: caseRecord.case_id,
          referral_source: clinical.referral_source || null,
          ward_number: clinical.ward_number || null,
          clinical_category: clinical.clinical_category || null,
          mlef_serial_number: clinical.mlef_serial_number || null,
          referring_officer: clinical.referring_officer || null,
          referral_date_time: clinical.referral_date_time ? new Date(clinical.referral_date_time) : null,
          institution_details: clinical.institution_details || null,
          incident_date_time: clinical.incident_date_time ? new Date(clinical.incident_date_time) : null,
          incident_description: clinical.incident_description || null,
          past_medical_history: clinical.past_medical_history || null,
          examination_findings: clinical.examination_findings || null,
          provisional_diagnosis: clinical.provisional_diagnosis || null
        }
      });
    }

    if (autopsy) {
      await tx.autopsy_case.create({
        data: {
          case_id: caseRecord.case_id,
          postmortem_number: autopsy.postmortem_number || null,
          death_category: autopsy.death_category || null,
          authorization_id: autopsy.authorization_id ? toCaseId(autopsy.authorization_id) : null,
          is_authorized: Boolean(autopsy.is_authorized),
          place_of_death: autopsy.place_of_death || null,
          date_time_of_death: autopsy.date_time_of_death ? new Date(autopsy.date_time_of_death) : null,
          notification_source: autopsy.notification_source || null,
          notification_date_time: autopsy.notification_date_time ? new Date(autopsy.notification_date_time) : null,
          informing_officer: autopsy.informing_officer || null,
          body_received_date_time: autopsy.body_received_date_time ? new Date(autopsy.body_received_date_time) : null,
          receiving_officer: autopsy.receiving_officer || null,
          condition_upon_arrival: autopsy.condition_upon_arrival || null,
          identification_status: autopsy.identification_status || null,
          immediate_cause_of_death: autopsy.immediate_cause_of_death || null,
          antecedent_causes: autopsy.antecedent_causes || null,
          manner_of_death: autopsy.manner_of_death || null,
          external_findings: autopsy.external_findings || null,
          internal_findings: autopsy.internal_findings || null
        }
      });
    }
    
    return caseRecord;
  });

  return getCaseById(created.case_id);
}

export async function updateCase(caseId: string | number | bigint, input: any) {
  const id = toCaseId(caseId);
  const { case_number, case_type_id, case_status_id, status, assigned_doctor_id, police_station_id, opened_date, closed_date, clinical, autopsy, version } = input;

  const updateData: any = {};
  if (case_number !== undefined) updateData.case_number = case_number;
  if (case_type_id !== undefined) updateData.case_type_id = case_type_id ? Number(case_type_id) : null;
  if (case_status_id !== undefined) updateData.case_status_id = case_status_id ? Number(case_status_id) : null;
  if (status !== undefined) updateData.status = status;
  if (assigned_doctor_id !== undefined) updateData.assigned_doctor_id = assigned_doctor_id ? toCaseId(assigned_doctor_id) : null;
  if (police_station_id !== undefined) updateData.police_station_id = police_station_id ? Number(police_station_id) : null;
  if (opened_date !== undefined) updateData.opened_date = opened_date ? new Date(opened_date) : null;
  if (closed_date !== undefined) updateData.closed_date = closed_date ? new Date(closed_date) : null;

  if (closed_date !== undefined) updateData.closed_date = closed_date ? new Date(closed_date) : null;

  let updated;
  if (version !== undefined) {
    // Optimistic Concurrency Control
    const result = await prisma.cases.updateMany({
      where: { case_id: id, version: Number(version) },
      data: { ...updateData, version: { increment: 1 } }
    });
    
    if (result.count === 0) {
      throw new Error("ConcurrencyError: The case was updated by another user. Please refresh and try again.");
    }
    
    updated = await prisma.cases.findUnique({ where: { case_id: id } });
    if (!updated) throw new Error("Case not found");
  } else {
    // Legacy update without OCC
    updated = await prisma.cases.update({ 
      where: { case_id: id }, 
      data: { ...updateData, version: { increment: 1 } } 
    });
  }

  if (clinical) {
    await prisma.clinical_case.upsert({
      where: { case_id: updated.case_id },
      update: {
        referral_source: clinical.referral_source ?? undefined,
        ward_number: clinical.ward_number ?? undefined,
        clinical_category: clinical.clinical_category ?? undefined,
        mlef_serial_number: clinical.mlef_serial_number ?? undefined,
        referring_officer: clinical.referring_officer ?? undefined,
        referral_date_time: clinical.referral_date_time ? new Date(clinical.referral_date_time) : undefined,
        institution_details: clinical.institution_details ?? undefined,
        incident_date_time: clinical.incident_date_time ? new Date(clinical.incident_date_time) : undefined,
        incident_description: clinical.incident_description ?? undefined,
        past_medical_history: clinical.past_medical_history ?? undefined,
        examination_findings: clinical.examination_findings ?? undefined,
        provisional_diagnosis: clinical.provisional_diagnosis ?? undefined
      },
      create: {
        case_id: updated.case_id,
        referral_source: clinical.referral_source || null,
        ward_number: clinical.ward_number || null,
        clinical_category: clinical.clinical_category || null,
        mlef_serial_number: clinical.mlef_serial_number || null,
        referring_officer: clinical.referring_officer || null,
        referral_date_time: clinical.referral_date_time ? new Date(clinical.referral_date_time) : null,
        institution_details: clinical.institution_details || null,
        incident_date_time: clinical.incident_date_time ? new Date(clinical.incident_date_time) : null,
        incident_description: clinical.incident_description || null,
        past_medical_history: clinical.past_medical_history || null,
        examination_findings: clinical.examination_findings || null,
        provisional_diagnosis: clinical.provisional_diagnosis || null
      }
    });
  }

  if (autopsy) {
    await prisma.autopsy_case.upsert({
      where: { case_id: updated.case_id },
      update: {
        postmortem_number: autopsy.postmortem_number ?? undefined,
        death_category: autopsy.death_category ?? undefined,
        authorization_id: autopsy.authorization_id ? toCaseId(autopsy.authorization_id) : undefined,
        is_authorized: autopsy.is_authorized !== undefined ? Boolean(autopsy.is_authorized) : undefined,
        place_of_death: autopsy.place_of_death ?? undefined,
        date_time_of_death: autopsy.date_time_of_death ? new Date(autopsy.date_time_of_death) : undefined,
        notification_source: autopsy.notification_source ?? undefined,
        notification_date_time: autopsy.notification_date_time ? new Date(autopsy.notification_date_time) : undefined,
        informing_officer: autopsy.informing_officer ?? undefined,
        body_received_date_time: autopsy.body_received_date_time ? new Date(autopsy.body_received_date_time) : undefined,
        receiving_officer: autopsy.receiving_officer ?? undefined,
        condition_upon_arrival: autopsy.condition_upon_arrival ?? undefined,
        identification_status: autopsy.identification_status ?? undefined,
        immediate_cause_of_death: autopsy.immediate_cause_of_death ?? undefined,
        antecedent_causes: autopsy.antecedent_causes ?? undefined,
        manner_of_death: autopsy.manner_of_death ?? undefined,
        external_findings: autopsy.external_findings ?? undefined,
        internal_findings: autopsy.internal_findings ?? undefined
      },
      create: {
        case_id: updated.case_id,
        postmortem_number: autopsy.postmortem_number || null,
        death_category: autopsy.death_category || null,
        authorization_id: autopsy.authorization_id ? toCaseId(autopsy.authorization_id) : null,
        is_authorized: Boolean(autopsy.is_authorized),
        place_of_death: autopsy.place_of_death || null,
        date_time_of_death: autopsy.date_time_of_death ? new Date(autopsy.date_time_of_death) : null,
        notification_source: autopsy.notification_source || null,
        notification_date_time: autopsy.notification_date_time ? new Date(autopsy.notification_date_time) : null,
        informing_officer: autopsy.informing_officer || null,
        body_received_date_time: autopsy.body_received_date_time ? new Date(autopsy.body_received_date_time) : null,
        receiving_officer: autopsy.receiving_officer || null,
        condition_upon_arrival: autopsy.condition_upon_arrival || null,
        identification_status: autopsy.identification_status || null,
        immediate_cause_of_death: autopsy.immediate_cause_of_death || null,
        antecedent_causes: autopsy.antecedent_causes || null,
        manner_of_death: autopsy.manner_of_death || null,
        external_findings: autopsy.external_findings || null,
        internal_findings: autopsy.internal_findings || null
      }
    });
  }

  return getCaseById(updated.case_id);
}

export async function softDeleteCase(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  return prisma.cases.update({
    where: { case_id: id },
    data: {
      is_deleted: true,
      deleted_at: new Date()
    }
  });
}
