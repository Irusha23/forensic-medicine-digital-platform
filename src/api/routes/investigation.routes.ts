import { Router } from 'express';
import { param } from 'express-validator';
import multer from '../../lib/multer';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createInvestigationController, deleteInvestigationController, getInvestigationController, listInvestigationsController, updateInvestigationController } from '../controllers/investigation.controller';
import { uploadInvestigationMedia } from '../controllers/media.controller';

const router = Router();

const idValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

const investigationIdValidator = [
  param('investigationId').isInt().withMessage('investigationId must be an integer'),
  validateRequest
];

router.get('/cases/:id/investigations', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, listInvestigationsController);
router.post('/cases/:id/investigations', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), idValidator, createInvestigationController);
router.get('/investigations/:investigationId', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), investigationIdValidator, getInvestigationController);
router.put('/investigations/:investigationId', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), investigationIdValidator, updateInvestigationController);
router.delete('/investigations/:investigationId', authenticateJWT, authorize('Doctor', 'Admin'), investigationIdValidator, deleteInvestigationController);
router.post('/investigations/:investigationId/media/upload', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), investigationIdValidator, (req, res, next) => {
  multer.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload error' });
    next();
  });
}, uploadInvestigationMedia);

export default router;
