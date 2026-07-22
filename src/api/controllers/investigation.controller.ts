import { Request, Response } from 'express';
import { createInvestigation, deleteInvestigation, getInvestigationById, listInvestigationsByCase, updateInvestigation } from '../../services/investigation.service';

export async function listInvestigationsController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const investigations = await listInvestigationsByCase(id);
    res.json(investigations);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to list investigations' });
  }
}

export async function createInvestigationController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const investigation = await createInvestigation(id, req.body);
    res.status(201).json(investigation);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'failed to create investigation' });
  }
}

export async function getInvestigationController(req: Request, res: Response) {
  try {
    const { investigationId } = req.params;
    const investigation = await getInvestigationById(investigationId);
    if (!investigation) return res.status(404).json({ error: 'investigation not found' });
    res.json(investigation);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to get investigation' });
  }
}

export async function updateInvestigationController(req: Request, res: Response) {
  try {
    const { investigationId } = req.params;
    const investigation = await updateInvestigation(investigationId, req.body);
    res.json(investigation);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'failed to update investigation' });
  }
}

export async function deleteInvestigationController(req: Request, res: Response) {
  try {
    const { investigationId } = req.params;
    await deleteInvestigation(investigationId);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to delete investigation' });
  }
}
