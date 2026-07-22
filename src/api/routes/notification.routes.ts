import { Router } from 'express';
import { getUnreadNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.get('/unread', authenticateJWT, getUnreadNotifications);
router.patch('/:id/read', authenticateJWT, markAsRead);

export default router;
