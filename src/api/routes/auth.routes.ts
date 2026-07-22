import { Router } from 'express';
import { login, register, forgotPasswordController, resetPasswordController } from '../controllers/auth.controller';

const router = Router();
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
