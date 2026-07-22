import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Mock Specialized Doctors...');

  // Roles cache mapping
  const roles = await prisma.roles.findMany();
  const doctorRole = roles.find((r) => r.role_name === 'Doctor');

  if (!doctorRole) {
    console.error('Doctor role not found in the DB. Make sure seed.ts is run first.');
    return;
  }

  const mockDoctors = [
    {
      username: 'jdoe_cardio',
      first_name: 'John',
      last_name: 'Doe',
      email: 'jdoe.cardio@example.com',
      designation: 'Cardiologist',
      password: 'password123'
    },
    {
      username: 'asmith_neuro',
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'asmith.neuro@example.com',
      designation: 'Neurologist',
      password: 'password123'
    },
    {
      username: 'bwayne_radio',
      first_name: 'Bruce',
      last_name: 'Wayne',
      email: 'bwayne.radio@example.com',
      designation: 'Radiologist',
      password: 'password123'
    },
    {
      username: 'rallen_patho',
      first_name: 'Robert',
      last_name: 'Allen',
      email: 'rallen.patho@example.com',
      designation: 'Pathologist',
      password: 'password123'
    }
  ];

  for (const doc of mockDoctors) {
    // Check if exists
    const existing = await prisma.users.findUnique({ where: { username: doc.username } });
    if (!existing) {
      const password_hash = await bcrypt.hash(doc.password, 10);
      const user = await prisma.users.create({
        data: {
          username: doc.username,
          first_name: doc.first_name,
          last_name: doc.last_name,
          email: doc.email,
          designation: doc.designation,
          password_hash,
          is_active: true
        }
      });

      await prisma.user_role.create({
        data: {
          user_id: user.user_id,
          role_id: doctorRole.role_id
        }
      });
      console.log(`Created specialist: ${user.username} (${user.designation})`);
    } else {
      console.log(`Specialist ${doc.username} already exists. Skipping.`);
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
