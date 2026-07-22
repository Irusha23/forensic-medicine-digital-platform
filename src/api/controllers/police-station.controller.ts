import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export async function getPoliceStationsController(req: Request, res: Response) {
  try {
    const stations = await prisma.police_stations.findMany({
      orderBy: { station_name: 'asc' }
    });
    res.json(stations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch police stations' });
  }
}
