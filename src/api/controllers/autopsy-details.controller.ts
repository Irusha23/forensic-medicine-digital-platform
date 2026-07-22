import { Request, Response } from 'express';
import { deleteAutopsyDetailsByCase, getAutopsyDetailsByCase, upsertAutopsyDetails } from '../../services/autopsy-details.service';

export async function getAutopsyDetailsController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const details = await getAutopsyDetailsByCase(id);
    if (!details) return res.status(404).json({ error: 'autopsy details not found' });
    res.json(details);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to get autopsy details' });
  }
}

export async function upsertAutopsyDetailsController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const details = await upsertAutopsyDetails(id, req.body);
    res.status(201).json(details);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'failed to save autopsy details' });
  }
}

export async function deleteAutopsyDetailsController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const out = await deleteAutopsyDetailsByCase(id);
    res.json(out);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to delete autopsy details' });
  }
}
