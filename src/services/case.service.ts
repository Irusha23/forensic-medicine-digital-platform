import prisma from '../lib/prisma';

function toCaseId(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

export async function validateCaseReadyForClose(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  const fullCase = await prisma.cases.findUnique({
    where: { case_id: id },
    include: {
      clinical_case: true,
      autopsy_case: true,
      investigation: true,
      report: true,
      case_type_lu: true
    }
  });

  if (!fullCase) throw new Error("Case not found");

  if (fullCase.case_type_lu?.code === 'clinical') {
    if (!fullCase.clinical_case?.examination_findings || !fullCase.clinical_case?.provisional_diagnosis) {
      throw new Error('Cannot close case: Clinical examination findings and provisional diagnosis must be filled.');
    }
  } else if (fullCase.case_type_lu?.code === 'autopsy') {
    if (!fullCase.autopsy_case?.immediate_cause_of_death || !fullCase.autopsy_case?.manner_of_death) {
      throw new Error('Cannot close case: Immediate cause of death and manner of death must be filled.');
    }
  }

  const pendingInvestigations = fullCase.investigation.filter((inv: any) => inv.status !== 'COMPLETED');
  if (pendingInvestigations.length > 0) {
    throw new Error('Cannot close case: All investigations must be completed.');
  }

  if (fullCase.report.length === 0) {
    throw new Error('Cannot close case: An official report must be issued first.');
  }
}

export async function validateCaseReadyForReport(caseId: string | number | bigint) {
  const id = toCaseId(caseId);
  const fullCase = await prisma.cases.findUnique({
    where: { case_id: id },
    include: {
      clinical_case: true,
      autopsy_case: true,
      investigation: true,
      report: true,
      case_type_lu: true
    }
  });

  if (!fullCase) throw new Error("Case not found");

  if (fullCase.status === 'CLOSED' || fullCase.status === 'closed' || (fullCase.case_status_id && Number(fullCase.case_status_id) === 2)) {
    throw new Error('Cannot issue report: The case is already closed.');
  }

  if (fullCase.case_type_lu?.code === 'clinical') {
    if (!fullCase.clinical_case?.examination_findings || !fullCase.clinical_case?.provisional_diagnosis) {
      throw new Error('Cannot issue report: Clinical examination findings and provisional diagnosis must be filled.');
    }
  } else if (fullCase.case_type_lu?.code === 'autopsy') {
    if (!fullCase.autopsy_case?.immediate_cause_of_death || !fullCase.autopsy_case?.manner_of_death) {
      throw new Error('Cannot issue report: Immediate cause of death and manner of death must be filled.');
    }
  }

  const pendingInvestigations = fullCase.investigation.filter((inv: any) => inv.status !== 'COMPLETED');
  if (pendingInvestigations.length > 0) {
    throw new Error('Cannot issue report: All investigations must be completed.');
  }
}

export async function listCases(page: number = 1, limit: number = 50, filters: any = {}) {
  const skip = (page - 1) * limit;

  const where: any = { is_deleted: false };

  if (filters.search) {
    where.case_number = { contains: filters.search };
  }
  if (filters.nic || filters.patient_name) {
    where.patients = {
      is: {
        ...(filters.nic && { nic: { contains: filters.nic } }),
        ...(filters.patient_name && { full_name: { contains: filters.patient_name } })
      }
    };
  }
  if (filters.police_station) {
    where.police_stations = {
      is: {
        station_name: { contains: filters.police_station }
      }
    };
  }
  if (filters.start_date || filters.end_date) {
    where.opened_date = {};
    if (filters.start_date) where.opened_date.gte = new Date(filters.start_date);
    if (filters.end_date) where.opened_date.lte = new Date(filters.end_date);
  }
  if (filters.doctor_id) {
    where.assigned_doctor_id = toCaseId(filters.doctor_id);
  }
  if (filters.report_type) {
    where.report = {
      some: {
        report_type: { equals: filters.report_type }
      }
    };
  }

  const [total, data] = await Promise.all([
    prisma.cases.count({ where }),
    prisma.cases.findMany({
      where,
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
      documents: true,
      report: true
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

  const existingCase = await prisma.cases.findUnique({ where: { case_id: id } });
  if (!existingCase) throw new Error("Case not found");

  const updateData: any = {};
  if (case_number !== undefined) updateData.case_number = case_number;
  if (case_type_id !== undefined) updateData.case_type_id = case_type_id ? Number(case_type_id) : null;
  if (case_status_id !== undefined) updateData.case_status_id = case_status_id ? Number(case_status_id) : null;
  if (status !== undefined) updateData.status = status;
  if (assigned_doctor_id !== undefined) updateData.assigned_doctor_id = assigned_doctor_id ? toCaseId(assigned_doctor_id) : null;
  if (police_station_id !== undefined) updateData.police_station_id = police_station_id ? Number(police_station_id) : null;
  if (opened_date !== undefined) updateData.opened_date = opened_date ? new Date(opened_date) : null;
  if (closed_date !== undefined) updateData.closed_date = closed_date ? new Date(closed_date) : null;

  const isClosing = (status === 'CLOSED' || status === 'closed') || (case_status_id && Number(case_status_id) === 2);
  if (isClosing) {
    await validateCaseReadyForClose(id);
  }

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

  // Notification Trigger: Alert doctor when newly assigned
  if (updated.assigned_doctor_id && updated.assigned_doctor_id !== existingCase.assigned_doctor_id) {
    try {
      const { createNotification } = require('./notification.service');
      await createNotification({
        title: 'New Case Assigned',
        message: `You have been assigned to case ${updated.case_number}.`,
        receiver_user_id: updated.assigned_doctor_id,
        notification_type: 'CASE_ASSIGNED',
        related_entity_id: updated.case_id.toString(),
        related_entity_type: 'cases'
      });
    } catch (e) {
      console.error('Failed to send case assignment notification:', e);
    }
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
