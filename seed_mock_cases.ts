import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const caseTypeClinical = await prisma.case_type_lu.findFirst({ where: { code: 'clinical' } });
  const caseTypeAutopsy = await prisma.case_type_lu.findFirst({ where: { code: 'autopsy' } });

  const typeClinicalId = caseTypeClinical ? caseTypeClinical.id : null;
  const typeAutopsyId = caseTypeAutopsy ? caseTypeAutopsy.id : null;

  // Get or create a doctor user
  let doctor = await prisma.users.findFirst({
    where: { user_role: { some: { roles: { role_name: 'Doctor' } } } }
  });
  if (!doctor) {
    const roleDoctor = await prisma.roles.findFirst({ where: { role_name: 'Doctor' } });
    if (roleDoctor) {
      doctor = await prisma.users.create({
        data: {
          username: 'doctor.mock',
          password_hash: 'hash',
          first_name: 'Jane',
          last_name: 'Mock',
          email: 'doctor.mock@example.com',
          user_role: { create: { role_id: roleDoctor.role_id } }
        }
      });
    }
  }

  // Get or create a police station
  let station = await prisma.police_stations.findFirst();
  if (!station) {
    station = await prisma.police_stations.create({
      data: { station_name: 'Central Police Station', district: 'Colombo' }
    });
  }

  const today = new Date();
  
  const daysAgo10 = new Date();
  daysAgo10.setDate(today.getDate() - 10);
  
  const daysAgo20 = new Date();
  daysAgo20.setDate(today.getDate() - 20);

  const future10 = new Date();
  future10.setDate(today.getDate() + 10);

  // 1. daily-001 (Clinical)
  const case1 = await prisma.cases.upsert({
    where: { case_number: 'daily-001' },
    update: {},
    create: {
      case_number: 'daily-001',
      opened_date: today,
      status: 'OPEN',
      case_type_id: typeClinicalId,
      assigned_doctor_id: doctor?.user_id,
      police_station_id: station?.police_station_id,
      clinical_case: {
        create: {
          examination_findings: 'Severe trauma to left arm',
          provisional_diagnosis: 'Fracture',
          incident_description: 'Fall from height'
        }
      },
      finding: {
        create: [
          { phase: 'Initial Examination', description: 'Patient conscious, complains of arm pain.', recorded_by: doctor?.user_id }
        ]
      },
      investigation: {
        create: [
          { investigation_type: 'X-Ray', status: 'Completed', requested_date: today, completed_date: today, results: 'Fracture of radius bone' }
        ]
      }
    }
  });

  // 2. pending-001 (Autopsy)
  const case2 = await prisma.cases.upsert({
    where: { case_number: 'pending-001' },
    update: {},
    create: {
      case_number: 'pending-001',
      opened_date: today,
      status: 'Pending',
      case_type_id: typeAutopsyId,
      assigned_doctor_id: doctor?.user_id,
      police_station_id: station?.police_station_id,
      autopsy_case: {
        create: {
          immediate_cause_of_death: 'Myocardial Infarction',
          manner_of_death: 'NATURAL',
          postmortem_number: 'PM/2026/001',
          date_time_of_death: daysAgo10
        }
      },
      autopsy_details: {
        create: {
          time_since_death_estimate: '2-4 hours',
          immediate_cause_of_death: 'Myocardial Infarction',
          manner_of_death: 'NATURAL',
          organ_findings: { "Heart": "Enlarged", "Lungs": "Congested" }
        }
      },
      finding: {
        create: [
          { phase: 'External Examination', description: 'No external injuries noted.', recorded_by: doctor?.user_id }
        ]
      },
      investigation: {
        create: [
          { investigation_type: 'Toxicology', status: 'Pending', requested_date: today }
        ]
      }
    }
  });

  // 3. monthly-001 (Clinical)
  const case3 = await prisma.cases.upsert({
    where: { case_number: 'monthly-001' },
    update: {},
    create: {
      case_number: 'monthly-001',
      opened_date: daysAgo10,
      status: 'OPEN',
      case_type_id: typeClinicalId,
      assigned_doctor_id: doctor?.user_id,
      police_station_id: station?.police_station_id,
      clinical_case: {
        create: {
          examination_findings: 'Mild concussion',
          provisional_diagnosis: 'Concussion',
          incident_description: 'Motor vehicle accident'
        }
      },
      finding: {
        create: [
          { phase: 'Follow-up', description: 'Patient symptoms improving.', recorded_by: doctor?.user_id }
        ]
      }
    }
  });

  // 4. court-001 (Autopsy with court events)
  const courtCase = await prisma.cases.upsert({
    where: { case_number: 'court-001' },
    update: {},
    create: {
      case_number: 'court-001',
      opened_date: daysAgo20,
      status: 'OPEN',
      case_type_id: typeAutopsyId,
      assigned_doctor_id: doctor?.user_id,
      police_station_id: station?.police_station_id,
      autopsy_case: {
        create: {
          immediate_cause_of_death: 'Asphyxiation',
          manner_of_death: 'HOMICIDE'
        }
      },
      autopsy_details: {
        create: {
          immediate_cause_of_death: 'Asphyxiation',
          manner_of_death: 'HOMICIDE',
          organ_findings: { "Neck": "Ligature mark present" }
        }
      },
      finding: {
        create: [
          { phase: 'Internal Examination', description: 'Signs of asphyxia observed in lungs.', recorded_by: doctor?.user_id }
        ]
      }
    }
  });

  // Add court events for court-001
  const existingEvents = await prisma.court_event.findMany({ where: { case_id: courtCase.case_id } });
  if (existingEvents.length === 0) {
    await prisma.court_event.create({
      data: {
        case_id: courtCase.case_id,
        event_date: daysAgo10,
        event_type: 'Hearing',
        court_name: 'High Court of Colombo',
        outcome_or_response: 'Adjourned for further evidence'
      }
    });

    await prisma.court_event.create({
      data: {
        case_id: courtCase.case_id,
        event_date: future10,
        event_type: 'Trial',
        court_name: 'High Court of Colombo',
        outcome_or_response: 'Pending'
      }
    });
  }

  console.log('Successfully created mock cases: daily-001, pending-001, monthly-001, court-001 with relevant data details');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
