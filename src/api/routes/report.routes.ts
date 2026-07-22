import { Router } from 'express';
import { param } from 'express-validator';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { generateReportController, issueReportController } from '../controllers/report.controller';

const router = Router();

const idValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

router.get('/cases/:id/report', authenticateJWT, authorize('Doctor', 'Admin', 'Clerk'), idValidator, generateReportController);
router.post('/cases/:id/report/issue', authenticateJWT, authorize('Doctor', 'Admin', 'Clerk'), idValidator, issueReportController);

export default router;
