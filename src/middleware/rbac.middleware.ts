import { Request, Response, NextFunction } from 'express';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const has = user.roles.some(r => allowedRoles.includes(r));
    if (!has) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
