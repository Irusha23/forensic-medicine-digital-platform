import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export async function getCourtsController(req: Request, res: Response) {
  try {
    const courts = await prisma.court_event.findMany({
      select: { court_name: true },
      distinct: ['court_name'],
      where: { court_name: { not: null } },
      orderBy: { court_name: 'asc' }
    });
    // Transform to simple array of names
    res.json(courts.map(c => c.court_name));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch courts' });
  }
}
