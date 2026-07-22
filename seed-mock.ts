import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data...');

  // 1. Police Stations
  const stations = [
    { station_name: 'Cinnamon Gardens Police Station', district: 'Colombo', contact_number: '0112699333' },
    { station_name: 'Bambalapitiya Police Station', district: 'Colombo', contact_number: '0112581111' },
    { station_name: 'Mount Lavinia Police Station', district: 'Colombo', contact_number: '0112715333' },
    { station_name: 'Kandy Police Station', district: 'Kandy', contact_number: '0812222222' }
  ];

  for (const st of stations) {
    const exists = await prisma.police_stations.findFirst({ where: { station_name: st.station_name } });
    if (!exists) {
      await prisma.police_stations.create({ data: st });
    }
  }
  console.log('Police stations seeded.');

  // 2. Mock Courts (via court_event since no courts table exists)
  const courts = ['Colombo Fort Magistrate Court', 'Mount Lavinia Magistrate Court', 'Kandy High Court', 'Supreme Court of Sri Lanka'];
  
  for (const c of courts) {
    const exists = await prisma.court_event.findFirst({ where: { court_name: c } });
    if (!exists) {
      await prisma.court_event.create({
        data: {
          court_name: c,
          event_type: 'Mock Hearing',
          outcome_or_response: 'Pending',
          event_date: new Date()
        }
      });
    }
  }
  console.log('Courts seeded (via court_event).');

  // 3. Inspectors (Users with designation 'Police Inspector')
  let clerkRole = await prisma.roles.findUnique({ where: { role_name: 'Clerk' } });
  if (!clerkRole) {
    clerkRole = await prisma.roles.create({ data: { role_name: 'Clerk', description: 'Clerk' } });
  }

  const inspectors = [
    { username: 'insp_perera', first_name: 'Kamal', last_name: 'Perera', email: 'kamal@police.lk' },
    { username: 'insp_silva', first_name: 'Nimal', last_name: 'Silva', email: 'nimal@police.lk' }
  ];

  const password_hash = await bcrypt.hash('password123', 10);

  for (const insp of inspectors) {
    const exists = await prisma.users.findUnique({ where: { username: insp.username } });
    if (!exists) {
      const user = await prisma.users.create({
        data: {
          username: insp.username,
          first_name: insp.first_name,
          last_name: insp.last_name,
          email: insp.email,
          designation: 'Police Inspector',
          password_hash,
          is_active: true
        }
      });
      await prisma.user_role.create({
        data: {
          user_id: user.user_id,
          role_id: clerkRole.role_id
        }
      });
    }
  }
  console.log('Inspectors seeded.');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
