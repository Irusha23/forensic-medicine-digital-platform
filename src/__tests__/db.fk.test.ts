import prisma from '../lib/prisma';

describe('Database Constraint Verification (Live DB Test)', () => {
  let createdCaseId: bigint;
  let findingId: bigint;
  let subjectId: bigint;

  beforeAll(async () => {
    // 1. Create a dummy case directly in the DB
    const newCase = await prisma.cases.create({
      data: {
        case_number: `FK-TEST-${Date.now()}`,
        status: 'OPEN',
      }
    });
    createdCaseId = newCase.case_id;

    // 2. Attach a finding to the case
    const newFinding = await prisma.finding.create({
      data: {
        case_id: createdCaseId,
        phase: 'Initial',
        description: 'Test finding for FK verification',
      }
    });
    findingId = newFinding.finding_id;

    // 3. Attach a document to the case
    const newDoc = await prisma.documents.create({
      data: {
        case_id: createdCaseId,
        title: 'Document for FK Test',
      }
    });
    subjectId = newDoc.document_id;
  });

  afterAll(async () => {
    // Cleanup just in case the test fails to delete it
    await prisma.cases.delete({ where: { case_id: createdCaseId } }).catch(() => {});
  });

  it('should correctly cascade hard deletes from cases to findings and documents', async () => {
    // Act: Attempt to hard delete the case
    // The schema defines onDelete: Cascade for both relations.
    // If MySQL has the correct FK constraints, it should delete child records and not throw an error.
    await prisma.cases.delete({
      where: { case_id: createdCaseId }
    });

    // Assert: The case should be gone
    const deletedCase = await prisma.cases.findUnique({
      where: { case_id: createdCaseId }
    });
    expect(deletedCase).toBeNull();

    // Assert: The attached finding should be cascaded (gone)
    const orphanedFinding = await prisma.finding.findUnique({
      where: { finding_id: findingId }
    });
    expect(orphanedFinding).toBeNull(); // It should NOT exist as an orphan

    // Assert: The attached document should be cascaded (gone)
    const orphanedDoc = await prisma.documents.findUnique({
      where: { document_id: subjectId }
    });
    expect(orphanedDoc).toBeNull(); // It should NOT exist as an orphan
  });
});
