import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export async function getCourtsController(req: Request, res: Response) {
  try {
    const courts = await prisma.courts.findMany({
      orderBy: { court_name: 'asc' }
    });
    res.json(courts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch courts' });
  }
}

export async function createCourtController(req: Request, res: Response) {
  try {
    const { court_name, location, contact_number } = req.body;
    
    if (!court_name) {
      return res.status(400).json({ error: 'Court name is required' });
    }

    const court = await prisma.courts.create({
      data: {
        court_name,
        location,
        contact_number
      }
    });
    
    res.status(201).json(court);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Court name already exists' });
    }
    res.status(500).json({ error: error.message || 'Failed to create court' });
  }
}
