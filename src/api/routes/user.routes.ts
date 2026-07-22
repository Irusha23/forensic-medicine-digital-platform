import { Router } from 'express';
import { getUsersController, createUserController, updateUserRolesController, toggleUserStatusController } from '../controllers/user.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorize('Admin', 'Doctor', 'Clerk'), getUsersController);
router.post('/', authorize('Admin'), createUserController);
router.patch('/:id/roles', authorize('Admin'), updateUserRolesController);
router.patch('/:id/status', authorize('Admin'), toggleUserStatusController);

export default router;
