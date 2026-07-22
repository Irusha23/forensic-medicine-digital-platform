import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding courts and police stations...');
  
  const courts = [
    { court_name: 'Supreme Court of Colombo', location: 'Colombo', contact_number: '0112123456' },
    { court_name: 'High Court of Kandy', location: 'Kandy', contact_number: '0812123456' },
    { court_name: 'Magistrate Court of Galle', location: 'Galle', contact_number: '0912123456' },
    { court_name: 'District Court of Negombo', location: 'Negombo', contact_number: '0312123456' },
    { court_name: 'Magistrate Court of Mount Lavinia', location: 'Mount Lavinia', contact_number: '0112233445' }
  ];

  for (const c of courts) {
    await prisma.courts.upsert({
      where: { court_name: c.court_name },
      update: {},
      create: c
    });
  }

  const stations = [
    { station_name: 'Bambalapitiya Police Station', district: 'Colombo', contact_number: '0112581122' },
    { station_name: 'Kandy Police Station', district: 'Kandy', contact_number: '0812222222' },
    { station_name: 'Galle Police Station', district: 'Galle', contact_number: '0912222222' },
    { station_name: 'Negombo Police Station', district: 'Gampaha', contact_number: '0312222222' },
    { station_name: 'Mount Lavinia Police Station', district: 'Colombo', contact_number: '0112716222' }
  ];

  for (const s of stations) {
    // police_stations doesn't have a unique constraint on station_name, so we use findFirst
    const existing = await prisma.police_stations.findFirst({
      where: { station_name: s.station_name }
    });
    
    if (!existing) {
      await prisma.police_stations.create({ data: s });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
