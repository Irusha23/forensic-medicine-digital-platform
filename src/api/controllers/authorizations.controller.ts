import { Request, Response } from 'express';
import { createAuthorization, getAuthorizationsByCase } from '../../services/authorizations.service';

export async function addAuthorizationToCase(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    const auth = await createAuthorization(caseId, req.body);
    res.status(201).json({ ok: true, authorization: auth });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to create authorization' });
  }
}

export async function listCaseAuthorizations(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    const auths = await getAuthorizationsByCase(caseId);
    res.json(auths);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch authorizations' });
  }
}
