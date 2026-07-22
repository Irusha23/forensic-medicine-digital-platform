import { Request, Response } from 'express';
import { createCase, getCaseById, listCases, softDeleteCase, updateCase } from '../../services/case.service';

export async function listCaseController(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const cases = await listCases(page, limit);
    const isClerk = req.user?.roles && req.user.roles.includes('Clerk') && !req.user.roles.includes('Doctor') && !req.user.roles.includes('Admin');
    
    if (isClerk) {
      cases.data = cases.data.map((c: any) => {
        const { clinical_case, autopsy_case, ...rest } = c;
        return rest;
      });
    }

    res.json(cases);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to list cases' });
  }
}

export async function getCaseController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await getCaseById(id);
    if (!item) return res.status(404).json({ error: 'Case not found' });
    
    const isClerk = req.user?.roles && req.user.roles.includes('Clerk') && !req.user.roles.includes('Doctor') && !req.user.roles.includes('Admin');
    if (isClerk) {
      const { clinical_case, autopsy_case, ...clerkSafeItem } = item as any;
      return res.json(clerkSafeItem);
    }
    
    res.json(item);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to fetch case' });
  }
}

export async function createCaseController(req: Request, res: Response) {
  try {
    const item = await createCase(req.body);
    res.status(201).json(item);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to create case' });
  }
}

export async function updateCaseController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await updateCase(id, req.body);
    res.json(item);
  } catch (e: any) {
    if (e.message && e.message.startsWith('ConcurrencyError')) {
      return res.status(409).json({ error: e.message });
    }
    res.status(500).json({ error: e.message || 'failed to update case' });
  }
}

export async function deleteCaseController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await softDeleteCase(id);
    res.json({ ok: true, case: item });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to delete case' });
  }
}
