import { Router } from 'express';
import { param } from 'express-validator';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { deleteAutopsyDetailsController, getAutopsyDetailsController, upsertAutopsyDetailsController } from '../controllers/autopsy-details.controller';

const router = Router();

const idValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

router.get('/cases/:id/autopsy-details', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, getAutopsyDetailsController);
router.post('/cases/:id/autopsy-details', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, upsertAutopsyDetailsController);
router.put('/cases/:id/autopsy-details', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, upsertAutopsyDetailsController);
router.delete('/cases/:id/autopsy-details', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, deleteAutopsyDetailsController);

export default router;
