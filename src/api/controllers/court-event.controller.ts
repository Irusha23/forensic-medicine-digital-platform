import { Request, Response } from 'express';
import * as courtEventService from '../../services/court-event.service';

export async function listCourtEvents(req: Request, res: Response) {
  try {
    const { caseId } = req.params;
    const events = await courtEventService.listCourtEventsByCase(caseId);
    res.json(events);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to list court events' });
  }
}

export async function createCourtEvent(req: Request, res: Response) {
  try {
    const { caseId } = req.params;
    const data = req.body;
    const event = await courtEventService.createCourtEvent(caseId, data);
    res.status(201).json(event);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to create court event' });
  }
}

export async function updateCourtEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const event = await courtEventService.updateCourtEvent(id, data);
    res.json(event);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to update court event' });
  }
}

export async function deleteCourtEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await courtEventService.deleteCourtEvent(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to delete court event' });
  }
}
