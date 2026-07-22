import { Router } from 'express';
import { getUsersController, createUserController, updateUserRolesController, toggleUserStatusController } from '../controllers/user.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();

// Protect ALL routes with Admin role
router.use(authenticateJWT, authorize('Admin'));

router.get('/', getUsersController);
router.post('/', createUserController);
router.patch('/:id/roles', updateUserRolesController);
router.patch('/:id/status', toggleUserStatusController);

export default router;
