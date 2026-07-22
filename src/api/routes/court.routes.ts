import { Router } from 'express';
import { getCourtsController } from '../controllers/court.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', authorize('Admin', 'Doctor', 'Clerk'), getCourtsController);

export default router;
