import dotenv from 'dotenv';
dotenv.config();
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding roles, document types, and sample users...');
  const roles = ['Doctor', 'Clerk', 'Admin', 'JMO', 'Researcher', 'Data Entry Operator', 'Laboratory staff'];
  for (const r of roles) {
    await prisma.roles.upsert({ where: { role_name: r }, update: {}, create: { role_name: r, description: r } });
  }

  const documentTypes = [
    'MLEF', 'Police Request Letter', 'Court Order', 'Referral Letter', 'Doctor Copy of MLEF', 
    'BHT Extract', 'X-ray Report', 'CT Scan Report', 'Toxicology Report', 'DNA Report', 
    'Laboratory Report', 'Specialist Referral Report', 'Clinical Photograph', 'Body Diagram', 
    'Medico-Legal Report (MLR)', 'Court Summons', 'Supplementary Report', 'Certificate of Receipt', 
    'Inquest Order', 'Crime Scene Report', 'Bed Head Ticket (BHT)', 'Hospital Record', 
    'Witness Statement', 'Family Statement', 'Police Statement', 'Postmortem Report (PMR)', 
    'Autopsy Notes', 'Histopathology Report', 'Radiology Report', 'Crime Scene Photograph', 
    'Postmortem Photograph', 'Cause of Death Form'
  ];

  for (const dt of documentTypes) {
    const code = dt.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await prisma.document_type_lu.upsert({
      where: { code },
      update: { label: dt },
      create: { code, label: dt }
    });
  }

  const adminPw = 'adminpass';
  const doctorPw = 'doctorpass';
  const clerkPw = 'clerkpass';

  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash: await bcrypt.hash(adminPw, 10), email: 'admin@example.local' }
  });
  const doctor = await prisma.users.upsert({
    where: { username: 'doctor' },
    update: {},
    create: { username: 'doctor', password_hash: await bcrypt.hash(doctorPw, 10), email: 'doctor@example.local' }
  });
  const clerk = await prisma.users.upsert({
    where: { username: 'clerk' },
    update: {},
    create: { username: 'clerk', password_hash: await bcrypt.hash(clerkPw, 10), email: 'clerk@example.local' }
  });

  const adminRole = await prisma.roles.findUnique({ where: { role_name: 'Admin' } });
  const doctorRole = await prisma.roles.findUnique({ where: { role_name: 'Doctor' } });
  const clerkRole = await prisma.roles.findUnique({ where: { role_name: 'Clerk' } });

  if (adminRole) await prisma.user_role.upsert({ where: { user_id_role_id: { user_id: admin.user_id as any, role_id: adminRole.role_id } }, update: {}, create: { user_id: admin.user_id as any, role_id: adminRole.role_id } });
  if (doctorRole) await prisma.user_role.upsert({ where: { user_id_role_id: { user_id: doctor.user_id as any, role_id: doctorRole.role_id } }, update: {}, create: { user_id: doctor.user_id as any, role_id: doctorRole.role_id } });
  if (clerkRole) await prisma.user_role.upsert({ where: { user_id_role_id: { user_id: clerk.user_id as any, role_id: clerkRole.role_id } }, update: {}, create: { user_id: clerk.user_id as any, role_id: clerkRole.role_id } });

  const jmoPw = 'jmopass';
  const researcherPw = 'researcherpass';

  const jmoUser = await prisma.users.upsert({
    where: { username: 'jmo' },
    update: {},
    create: { username: 'jmo', password_hash: await bcrypt.hash(jmoPw, 10), email: 'jmo@example.local', first_name: 'John', last_name: 'Doe' }
  });
  const researcherUser = await prisma.users.upsert({
    where: { username: 'researcher' },
    update: {},
    create: { username: 'researcher', password_hash: await bcrypt.hash(researcherPw, 10), email: 'researcher@example.local', first_name: 'Jane', last_name: 'Smith' }
  });

  const jmoRole = await prisma.roles.findUnique({ where: { role_name: 'JMO' } });
  const researcherRole = await prisma.roles.findUnique({ where: { role_name: 'Researcher' } });

  if (jmoRole) await prisma.user_role.upsert({ where: { user_id_role_id: { user_id: jmoUser.user_id as any, role_id: jmoRole.role_id } }, update: {}, create: { user_id: jmoUser.user_id as any, role_id: jmoRole.role_id } });
  if (researcherRole) await prisma.user_role.upsert({ where: { user_id_role_id: { user_id: researcherUser.user_id as any, role_id: researcherRole.role_id } }, update: {}, create: { user_id: researcherUser.user_id as any, role_id: researcherRole.role_id } });

  // Seed case types if they don't exist
  const clinicalType = await prisma.case_type_lu.upsert({
    where: { code: 'clinical' },
    update: { label: 'Clinical' },
    create: { code: 'clinical', label: 'Clinical' }
  });
  const autopsyType = await prisma.case_type_lu.upsert({
    where: { code: 'autopsy' },
    update: { label: 'Autopsy' },
    create: { code: 'autopsy', label: 'Autopsy' }
  });

  // Add mock patients and cases
  await prisma.patients.create({
    data: {
      full_name: 'Mock Clinical Patient',
      nic: '951234567V',
      date_of_birth: new Date('1995-05-15T00:00:00.000Z'),
      gender: 'Male',
      address: '123 Fake St, Colombo',
      telephone: '0771234567',
      cases: {
        create: {
          case_number: `CLI-${Date.now()}`,
          case_type_id: clinicalType.id,
          opened_date: new Date()
        }
      }
    }
  });

  await prisma.patients.create({
    data: {
      full_name: 'Mock Autopsy Subject',
      nic: '821987654V',
      date_of_birth: new Date('1982-10-20T00:00:00.000Z'),
      gender: 'Female',
      address: '456 Test Rd, Kandy',
      telephone: '0719876543',
      cases: {
        create: {
          case_number: `AUT-${Date.now() + 1}`,
          case_type_id: autopsyType.id,
          opened_date: new Date()
        }
      }
    }
  });

  console.log('Seed complete! User credentials: admin/adminpass, doctor/doctorpass, clerk/clerkpass, jmo/jmopass, researcher/researcherpass');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
