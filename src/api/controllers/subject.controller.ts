import { Request, Response } from 'express';
import { createSubject, getSubjectsByCase } from '../../services/subject.service';

export async function addSubjectToCase(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    const data = { ...req.body, case_id: caseId };
    const subject = await createSubject(data);
    res.status(201).json({ ok: true, subject });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to create subject' });
  }
}

export async function listCaseSubjects(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    const subjects = await getSubjectsByCase(caseId);
    res.json(subjects);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch subjects' });
  }
}
