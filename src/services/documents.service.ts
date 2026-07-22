import storage, { UploadResult } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import prisma from '../lib/prisma';

export async function saveDocument({ tmpPath, originalName, caseId, uploaderId, documentType, title }: { tmpPath: string; originalName: string; caseId?: number | bigint; uploaderId?: number | bigint; documentType?: string; title?: string }) {
  const ext = path.extname(originalName) || '';
  const y = new Date().getFullYear();
  const resolvedCaseId = caseId ? BigInt(caseId) : null;
  const id = resolvedCaseId ? String(resolvedCaseId) : 'unassigned';
  const destKey = `cases/${id}/documents/${y}/${uuidv4()}${ext}`;
  
  const res: UploadResult = await storage.put(tmpPath, destKey);
  const doc = await prisma.documents.create({ data: {
    case_id: resolvedCaseId as any || null,
    document_type: documentType || null,
    title: title || originalName,
    file_path: res.path,
    uploaded_by: uploaderId as any || null,
    uploaded_at: new Date()
  }});
  return { document: doc, storage: res };
}

export async function getDocumentById(documentId: string | number | bigint) {
  const id = typeof documentId === 'string' ? BigInt(documentId) : BigInt(documentId);
  return prisma.documents.findFirst({
    where: { document_id: id, cases: { is_deleted: false } },
    include: { cases: true, users: true }
  });
}

export async function listDocumentsByCase(caseId: string | number | bigint) {
  const id = typeof caseId === 'string' ? BigInt(caseId) : BigInt(caseId);
  return prisma.documents.findMany({ where: { case_id: id, cases: { is_deleted: false } }, orderBy: { uploaded_at: 'desc' } });
}

export async function streamDocumentFile(documentId: string | number | bigint) {
  const id = typeof documentId === 'string' ? BigInt(documentId) : BigInt(documentId);
  const doc = await prisma.documents.findFirst({ where: { document_id: id, cases: { is_deleted: false } } });
  if (!doc || !doc.file_path) return null;
  const stream = await storage.getStream(doc.file_path);
  return { document: doc, stream };
}
