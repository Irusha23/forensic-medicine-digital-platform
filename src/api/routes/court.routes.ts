import { Router } from 'express';
import { getCourtsController, createCourtController } from '../controllers/court.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', authorize('Admin', 'Doctor', 'Clerk'), getCourtsController);
router.post('/', authorize('Admin'), createCourtController);

export default router;
