import prisma from '../lib/prisma';

export async function createNotification(data: {
  sender_user_id?: bigint | number;
  receiver_user_id: bigint | number;
  case_id?: bigint | number;
  notification_type: string;
  title: string;
  message: string;
}) {
  return prisma.notifications.create({
    data: {
      sender_user_id: data.sender_user_id ? BigInt(data.sender_user_id) : null,
      receiver_user_id: BigInt(data.receiver_user_id),
      case_id: data.case_id ? BigInt(data.case_id) : null,
      notification_type: data.notification_type,
      title: data.title,
      message: data.message,
      is_read: false,
      status: 'NEW',
    }
  });
}

export async function getUnreadNotificationsForUser(userId: bigint | number) {
  return prisma.notifications.findMany({
    where: { 
      receiver_user_id: BigInt(userId),
      is_read: false
    },
    orderBy: { created_at: 'desc' },
    include: { cases: true }
  });
}

export async function markNotificationAsRead(notificationId: bigint | number, userId: bigint | number) {
  const notification = await prisma.notifications.findUnique({
    where: { notification_id: BigInt(notificationId) }
  });

  if (!notification || notification.receiver_user_id !== BigInt(userId)) {
    throw new Error('Notification not found or unauthorized');
  }

  return prisma.notifications.update({
    where: { notification_id: BigInt(notificationId) },
    data: {
      is_read: true,
      read_at: new Date(),
    }
  });
}
