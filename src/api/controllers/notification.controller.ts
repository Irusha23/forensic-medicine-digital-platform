import { Request, Response } from 'express';
import { getUnreadNotificationsForUser, markNotificationAsRead } from '../../services/notification.service';

export async function getUnreadNotifications(req: Request, res: Response) {
  try {
    // @ts-ignore - set by auth middleware
    const userId = req.user.userId;
    const notifications = await getUnreadNotificationsForUser(userId);
    res.json(notifications);
  } catch (error: any) {
    console.error('Fetch unread notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.id, 10);
    await markNotificationAsRead(notificationId, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark as read' });
  }
}
