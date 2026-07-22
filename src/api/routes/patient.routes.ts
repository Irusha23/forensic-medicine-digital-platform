import { Router } from 'express';
import { getPatients } from '../controllers/patient.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

// Protect all patient routes with JWT authentication
router.use(authenticateJWT);

router.get('/', getPatients);

export default router;
