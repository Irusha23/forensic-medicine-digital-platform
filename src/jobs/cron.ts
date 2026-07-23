import cron from 'node-cron';
import prisma from '../lib/prisma';
import { createNotification } from '../services/notification.service';
import { backupDatabase } from '../scripts/backup';

export function initCronJobs() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job for pending investigations and delayed reports...');
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Pending investigations > 14 days
      const pendingInvs = await prisma.investigation.findMany({
        where: {
          status: 'PENDING',
          requested_date: { lte: fourteenDaysAgo }
        },
        include: { cases: true }
      });

      for (const inv of pendingInvs) {
        if (inv.cases?.assigned_doctor_id) {
          await createNotification({
            receiver_user_id: Number(inv.cases.assigned_doctor_id),
            notification_type: 'INVESTIGATION_DELAYED',
            title: 'Investigation Delayed',
            message: `Investigation ID ${inv.investigation_id} for Case ${inv.cases.case_number} is pending for over 14 days.`
          });
        }
      }

      // Delayed reports (open cases > 30 days old without a report)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const delayedCases = await prisma.cases.findMany({
        where: {
          status: 'OPEN',
          is_deleted: false,
          opened_date: { lte: thirtyDaysAgo },
          report: { none: {} }
        }
      });

      for (const c of delayedCases) {
        if (c.assigned_doctor_id) {
          await createNotification({
            receiver_user_id: Number(c.assigned_doctor_id),
            notification_type: 'REPORT_DELAYED',
            title: 'Report Delayed',
            message: `Case ${c.case_number} is open for over 30 days without a report.`
          });
        }
      }
      
      console.log('Daily cron job completed successfully.');
    } catch (e) {
      console.error('Error running daily cron job:', e);
    }
  });

  // Run database backup daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await backupDatabase();
    } catch (e) {
      console.error('Scheduled backup failed:', e);
    }
  });
}
