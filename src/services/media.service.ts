import storage, { UploadResult } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import prisma from '../lib/prisma';

export async function saveMediaFile({ tmpPath, originalName, caseId, investigationId, uploaderId, category, mediaType }: { tmpPath: string; originalName: string; caseId?: number | bigint; investigationId?: number | bigint; uploaderId?: number | bigint; category?: string; mediaType?: string }) {
  const ext = path.extname(originalName) || '';
  const y = new Date().getFullYear();
  let resolvedCaseId = caseId ? BigInt(caseId) : null;

  if (investigationId) {
    const investigation = await prisma.investigation.findUnique({ where: { investigation_id: BigInt(investigationId) } });
    if (!investigation) throw new Error('Investigation not found');
    if (!resolvedCaseId && investigation.case_id) resolvedCaseId = investigation.case_id;
    if (resolvedCaseId && investigation.case_id && resolvedCaseId !== investigation.case_id) {
      throw new Error('Investigation does not belong to the provided case');
    }
  }

  const id = resolvedCaseId ? String(resolvedCaseId) : 'unassigned';
  const destKey = `cases/${id}/media/${y}/${uuidv4()}${ext}`;
  const res: UploadResult = await storage.put(tmpPath, destKey);
  const media = await prisma.media.create({ data: {
    case_id: resolvedCaseId as any || null,
    investigation_id: investigationId ? BigInt(investigationId) : null,
    media_type: mediaType || null,
    category: category || null,
    file_path: res.path,
    captured_by: uploaderId as any || null,
    captured_at: new Date()
  }});
  return { media, storage: res };
}

export async function getMediaById(mediaId: string | number | bigint) {
  const id = typeof mediaId === 'string' ? BigInt(mediaId) : BigInt(mediaId);
  return prisma.media.findFirst({
    where: { media_id: id, cases: { is_deleted: false } },
    include: { cases: true, users: true }
  });
}

export async function listMediaByCase(caseId: string | number | bigint) {
  const id = typeof caseId === 'string' ? BigInt(caseId) : BigInt(caseId);
  return prisma.media.findMany({ where: { case_id: id, cases: { is_deleted: false } }, orderBy: { captured_at: 'desc' } });
}

export async function streamMediaFile(mediaId: string | number | bigint) {
  const id = typeof mediaId === 'string' ? BigInt(mediaId) : BigInt(mediaId);
  const media = await prisma.media.findFirst({ where: { media_id: id, cases: { is_deleted: false } } });
  if (!media || !media.file_path) return null;
  const stream = await storage.getStream(media.file_path);
  return { media, stream };
}
