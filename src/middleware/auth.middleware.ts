import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = { userId: payload.userId, roles: payload.roles || [] };
  next();
}
