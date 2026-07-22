import { Router } from 'express';
import { getPoliceStationsController, createPoliceStationController } from '../controllers/police-station.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', authorize('Admin', 'Doctor', 'Clerk'), getPoliceStationsController);
router.post('/', authorize('Admin'), createPoliceStationController);

export default router;
