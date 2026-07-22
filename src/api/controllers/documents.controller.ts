import { Request, Response } from 'express';
import path from 'path';
import { saveDocument, getDocumentById, listDocumentsByCase, streamDocumentFile } from '../../services/documents.service';

type UploadedFile = { path: string; originalname: string };
type RequestWithFile = Request & { file?: UploadedFile };

export async function uploadDocument(req: RequestWithFile, res: Response) {
  try {
    const file = req.file as UploadedFile | undefined;
    if (!file) return res.status(400).json({ error: 'file required' });
    const caseId = req.params.id || req.body.case_id;
    const documentType = req.body.document_type;
    const title = req.body.title;
    const uploaderId = req.user?.userId;
    const out = await saveDocument({ tmpPath: file.path, originalName: file.originalname, caseId: caseId ? Number(caseId) : undefined, uploaderId: uploaderId ? Number(uploaderId) : undefined, documentType, title });
    res.status(201).json({ ok: true, document: out.document, storage: out.storage });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'upload failed' });
  }
}

export async function getDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = await getDocumentById(id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch document' });
  }
}

export async function getDocumentsByCase(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const docs = await listDocumentsByCase(id);
    res.json(docs);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch documents by case' });
  }
}

export async function downloadDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await streamDocumentFile(id);
    if (!result?.document || !result.stream) return res.status(404).json({ error: 'Document not found' });

    const fileName = path.basename(result.document.file_path || `document-${id}`);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.type(path.extname(fileName) || 'application/octet-stream');

    result.stream.on('error', (err: Error) => {
      console.error('stream error', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'failed to stream file' });
      }
    });

    result.stream.pipe(res);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to download document' });
  }
}
