import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import authRoutes from './api/routes/auth.routes';
import mediaRoutes from './api/routes/media.routes';
import caseRoutes from './api/routes/case.routes';
import investigationRoutes from './api/routes/investigation.routes';
import autopsyDetailsRoutes from './api/routes/autopsy-details.routes';
import reportRoutes from './api/routes/report.routes';
import notificationRoutes from './api/routes/notification.routes';
import dashboardRoutes from './api/routes/dashboard.routes';
import userRoutes from './api/routes/user.routes';

// Handle BigInt serialization globally so JWTs and JSON responses do not crash.
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
app.use(cors());
app.use(json());
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api', investigationRoutes);
app.use('/api', autopsyDetailsRoutes);
app.use('/api', reportRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '127.0.0.1';

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://${host}:${port}`);
  });
}

export default app;
