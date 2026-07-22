import { Request, Response } from 'express';
import { createReferral, getReferralsByCase } from '../../services/referral.service';

export async function addReferralToCase(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    const data = { ...req.body, case_id: caseId };
    const referral = await createReferral(data);
    res.status(201).json({ ok: true, referral });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to create referral' });
  }
}

export async function listCaseReferrals(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    const referrals = await getReferralsByCase(caseId);
    res.json(referrals);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch referrals' });
  }
}
