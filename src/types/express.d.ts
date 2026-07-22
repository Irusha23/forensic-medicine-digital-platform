import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: bigint | number; roles: string[] } | null;
    }
  }
}

export {};
