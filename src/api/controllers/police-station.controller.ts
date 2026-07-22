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

export async function createPoliceStationController(req: Request, res: Response) {
  try {
    const { station_name, district, contact_number } = req.body;
    
    if (!station_name) {
      return res.status(400).json({ error: 'Station name is required' });
    }

    const station = await prisma.police_stations.create({
      data: {
        station_name,
        district,
        contact_number
      }
    });
    
    res.status(201).json(station);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create police station' });
  }
}
