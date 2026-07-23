import { Router } from 'express';
import { param } from 'express-validator';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { generateReportController, issueReportController } from '../controllers/report.controller';
import {
  getDailyReportController,
  getMonthlyReportController,
  getPendingReportController,
  getCourtReportController,
  getStatisticalReportController
} from '../controllers/aggregate-report.controller';

const router = Router();

const idValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
];

// Single case reports
router.get('/cases/:id/report', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, generateReportController);
router.post('/cases/:id/report/issue', authenticateJWT, authorize('Doctor', 'Admin'), idValidator, issueReportController);

// Aggregate system reports
router.get('/reports/daily', authenticateJWT, authorize('Doctor', 'Admin'), getDailyReportController);
router.get('/reports/monthly', authenticateJWT, authorize('Doctor', 'Admin'), getMonthlyReportController);
router.get('/reports/pending', authenticateJWT, authorize('Doctor', 'Admin'), getPendingReportController);
router.get('/reports/court', authenticateJWT, authorize('Doctor', 'Admin'), getCourtReportController);
router.get('/reports/statistical', authenticateJWT, authorize('Doctor', 'Admin'), getStatisticalReportController);

export default router;
