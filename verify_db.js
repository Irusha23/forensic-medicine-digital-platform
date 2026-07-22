const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

BigInt.prototype.toJSON = function() { return this.toString(); };

async function verify() {
  console.log("=== CHECKING CASE AUTO-TEST-3 ===");
  const autopsyCase = await prisma.cases.findFirst({
    where: { case_number: 'AUTO-TEST-3' },
    include: {
      autopsy_case: true,
      court_event: true,
      report: {
        include: { report_issuance: true }
      }
    }
  });
  console.log(JSON.stringify(autopsyCase, null, 2));

  console.log("\n=== CHECKING CASE AUTO-TEST-1 (Clinical Test) ===");
  const clinicalCase = await prisma.cases.findFirst({
    where: { case_number: 'AUTO-TEST-1' },
    include: {
      clinical_case: true
    }
  });
  console.log(JSON.stringify(clinicalCase, null, 2));
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
