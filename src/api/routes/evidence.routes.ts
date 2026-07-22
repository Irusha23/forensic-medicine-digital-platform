import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../middleware/validation.middleware';
import { authenticateJWT } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';

const router = Router();

// Get evidence for a case
router.get('/cases/:id/evidence', authenticateJWT, async (req, res) => {
  try {
    const caseId = BigInt(req.params.id);
    const evidence = await prisma.evidence.findMany({
      where: { case_id: caseId },
      include: {
        chain_of_custody: {
          orderBy: { transferred_at: 'desc' }
        }
      }
    });
    // Serialize BigInt safely - handled by global prototype in server.ts
    res.json(evidence);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Add evidence to a case
router.post('/cases/:id/evidence', authenticateJWT, [
  body('item_name').notEmpty(),
  body('description').optional().isString()
], validateRequest, async (req: any, res: any) => {
  try {
    const caseId = BigInt(req.params.id);
    const newEvidence = await prisma.evidence.create({
      data: {
        case_id: caseId,
        item_name: req.body.item_name,
        description: req.body.description,
        collected_at: req.body.collected_at ? new Date(req.body.collected_at) : new Date(),
        collected_by: req.user?.userId ? BigInt(req.user.userId) : null,
        storage_location: req.body.storage_location || 'Pending'
      }
    });
    res.status(201).json(newEvidence);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Add chain of custody record
router.post('/evidence/:id/custody', authenticateJWT, [
  body('transferred_to').notEmpty(),
  body('purpose').notEmpty()
], validateRequest, async (req: any, res: any) => {
  try {
    const evidenceId = BigInt(req.params.id);
    const custody = await prisma.chain_of_custody.create({
      data: {
        evidence_id: evidenceId,
        transferred_by: req.user?.userId ? BigInt(req.user.userId) : null,
        transferred_to: req.body.transferred_to,
        transferred_at: new Date(),
        purpose: req.body.purpose,
        notes: req.body.notes
      }
    });
    res.status(201).json(custody);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
