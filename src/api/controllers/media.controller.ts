import { Request, Response } from 'express';
import path from 'path';
import { saveMediaFile, getMediaById, listMediaByCase, streamMediaFile } from '../../services/media.service';

type UploadedFile = { path: string; originalname: string };
type RequestWithFile = Request & { file?: UploadedFile };

export async function uploadMedia(req: RequestWithFile, res: Response) {
  try {
    const file = req.file as UploadedFile | undefined;
    if (!file) return res.status(400).json({ error: 'file required' });
    const caseId = req.params.id || req.body.case_id ? Number(req.params.id || req.body.case_id) : undefined;
    const investigationId = req.body.investigation_id ? Number(req.body.investigation_id) : undefined;
    const category = req.body.category;
    const mediaType = req.body.media_type;
    const uploaderId = req.user?.userId;
    const out = await saveMediaFile({ tmpPath: file.path, originalName: file.originalname, caseId: caseId, investigationId: investigationId, uploaderId: uploaderId, category, mediaType });
    res.json({ ok: true, media: out.media, storage: out.storage });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'upload failed' });
  }
}

export async function uploadInvestigationMedia(req: RequestWithFile, res: Response) {
  try {
    const file = req.file as UploadedFile | undefined;
    if (!file) return res.status(400).json({ error: 'file required' });
    const { investigationId } = req.params;
    const caseId = req.body.case_id ? Number(req.body.case_id) : undefined;
    const category = req.body.category || 'LAB_REPORT';
    const mediaType = req.body.media_type;
    const uploaderId = req.user?.userId;
    const out = await saveMediaFile({ tmpPath: file.path, originalName: file.originalname, caseId: caseId ? Number(caseId) : undefined, investigationId: investigationId ? Number(investigationId) : undefined, uploaderId: uploaderId ? Number(uploaderId) : undefined, category, mediaType });
    res.json({ ok: true, media: out.media, storage: out.storage });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'upload failed' });
  }
}

export async function getMedia(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const media = await getMediaById(id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    res.json(media);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch media' });
  }
}

export async function getMediaByCase(req: Request, res: Response) {
  try {
    const { caseId } = req.params;
    const media = await listMediaByCase(caseId);
    res.json(media);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'failed to fetch media by case' });
  }
}

export async function downloadMedia(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await streamMediaFile(id);
    if (!result?.media || !result.stream) return res.status(404).json({ error: 'Media not found' });

    const fileName = path.basename(result.media.file_path || `media-${id}`);
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
    res.status(500).json({ error: e.message || 'failed to download media' });
  }
}
