import { Request, Response } from 'express';
import { createAuthorization, getAuthorizationsByCase } from '../../services/authorizations.service';
import { saveDocument } from '../../services/documents.service';

type UploadedFile = { path: string; originalname: string };
type RequestWithFile = Request & { file?: UploadedFile };

export async function addAuthorizationToCase(req: RequestWithFile, res: Response) {
  try {
    const caseId = req.params.id;
    const file = req.file as UploadedFile | undefined;
    let documentId: number | undefined;

    if (file) {
      const uploaderId = req.user?.userId;
      const out = await saveDocument({
        tmpPath: file.path,
        originalName: file.originalname,
        caseId: Number(caseId),
        uploaderId: uploaderId ? Number(uploaderId) : undefined,
        documentType: req.body.authorization_type || 'Authorization',
        title: `${req.body.authorization_type || 'Authorization'} Document`,
        dateIssued: req.body.issue_date,
        issuingAuthority: req.body.issuing_authority,
        remarks: 'Uploaded from Authorization tab'
      });
      documentId = out.document.document_id ? Number(out.document.document_id) : undefined;
    }

    let details: any = {};
    if (req.body.authorization_type === 'MLEF') {
      details = {
        MLEF_number: req.body.MLEF_number,
        police_station: req.body.police_station
      };
    } else if (req.body.authorization_type === 'REQUEST_LETTER') {
      details = {
        reference_number: req.body.reference_number,
        requesting_institution: req.body.requesting_institution,
        requesting_officer: req.body.requesting_officer
      };
    }

    const payload = { ...req.body, document_id: documentId, details };
    const auth = await createAuthorization(caseId, payload);
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
