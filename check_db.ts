import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const statuses = await prisma.case_status_lu.findMany();
  console.log("Statuses:", statuses);
  
  const caseTypes = await prisma.case_type_lu.findMany();
  console.log("Case Types:", caseTypes);
  
  const investigations = await prisma.investigation.findMany({
    select: { status: true },
    distinct: ['status']
  });
  console.log("Investigation Statuses:", investigations);
}

main().catch(console.error).finally(() => prisma.$disconnect());
