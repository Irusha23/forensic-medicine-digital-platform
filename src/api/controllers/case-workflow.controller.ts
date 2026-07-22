import { Request, Response } from 'express';
import { createFinding, deleteFinding, getAuditLogForCase, getAvailableStatuses, listFindingsByCase, transitionCaseStatus, updateFinding } from '../../services/case-workflow.service';

export async function getStatusesController(req: Request, res: Response) {
  try {
    const statuses = await getAvailableStatuses();
    res.json(statuses);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to fetch statuses' });
  }
}

export async function transitionStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { case_status_id } = req.body;
    if (!case_status_id) return res.status(400).json({ error: 'case_status_id required' });
    const userId = req.user?.userId;
    const updated = await transitionCaseStatus(id, case_status_id, userId);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to transition status' });
  }
}

export async function createFindingController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const finding = await createFinding(id, { ...req.body, recorded_by: userId });
    res.status(201).json(finding);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to create finding' });
  }
}

export async function listFindingsController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const findings = await listFindingsByCase(id);
    res.json(findings);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to list findings' });
  }
}

export async function updateFindingController(req: Request, res: Response) {
  try {
    const { id, findingId } = req.params;
    const updated = await updateFinding(findingId, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to update finding' });
  }
}

export async function deleteFindingController(req: Request, res: Response) {
  try {
    const { id, findingId } = req.params;
    await deleteFinding(findingId);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to delete finding' });
  }
}

export async function getAuditLogController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const logs = await getAuditLogForCase(id);
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to fetch audit logs' });
  }
}
