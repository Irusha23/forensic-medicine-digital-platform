import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/metrics', authenticateJWT, authorize('Clerk', 'Doctor', 'Admin'), getDashboardMetrics);

export default router;
