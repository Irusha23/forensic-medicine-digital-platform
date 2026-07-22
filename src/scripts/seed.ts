import dotenv from 'dotenv';
dotenv.config();
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding roles and sample users...');
  const roles = ['Doctor', 'Clerk', 'Admin'];
  for (const r of roles) {
    await prisma.roles.upsert({ where: { role_name: r }, update: {}, create: { role_name: r, description: r } });
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

  console.log('Seed complete: usernames and passwords: admin/adminpass, doctor/doctorpass, clerk/clerkpass');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
