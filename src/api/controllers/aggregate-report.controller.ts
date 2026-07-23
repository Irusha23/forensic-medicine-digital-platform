import { Request, Response } from 'express';
import {
  generateDailyCaseReportPdf,
  generateMonthlyReportPdf,
  generatePendingCasesReportPdf,
  generateCourtReportPdf,
  generateStatisticalReportPdf
} from '../../services/aggregate-report.service';
import { logAudit } from '../../services/audit.service';

function sendPdfResponse(res: Response, result: { pdfBuffer: Uint8Array<ArrayBufferLike>; filePath: string; filename: string }) {
  const pdfBuffer = Buffer.isBuffer(result.pdfBuffer)
    ? result.pdfBuffer
    : Buffer.from(result.pdfBuffer as any);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.setHeader('Content-Length', String(pdfBuffer.length));
  res.send(pdfBuffer);
}

export async function getDailyReportController(req: Request, res: Response) {
  try {
    const { date } = req.query;
    const result = await generateDailyCaseReportPdf(date as string);
    const userId = (req as any).user?.userId || (req as any).user?.user_id;
    if (userId) await logAudit(userId, 'REPORT_DOWNLOAD_DAILY', 'report', null, { date }, req.ip);
    sendPdfResponse(res, result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate daily report' });
  }
}

export async function getMonthlyReportController(req: Request, res: Response) {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month as string, 10) : undefined;
    const y = year ? parseInt(year as string, 10) : undefined;
    
    const result = await generateMonthlyReportPdf(m, y);
    const userId = (req as any).user?.userId || (req as any).user?.user_id;
    if (userId) await logAudit(userId, 'REPORT_DOWNLOAD_MONTHLY', 'report', null, { month: m, year: y }, req.ip);
    sendPdfResponse(res, result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate monthly report' });
  }
}

export async function getPendingReportController(req: Request, res: Response) {
  try {
    const result = await generatePendingCasesReportPdf();
    const userId = (req as any).user?.userId || (req as any).user?.user_id;
    if (userId) await logAudit(userId, 'REPORT_DOWNLOAD_PENDING', 'report', null, {}, req.ip);
    sendPdfResponse(res, result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate pending cases report' });
  }
}

export async function getCourtReportController(req: Request, res: Response) {
  try {
    const result = await generateCourtReportPdf();
    const userId = (req as any).user?.userId || (req as any).user?.user_id;
    if (userId) await logAudit(userId, 'REPORT_DOWNLOAD_COURT', 'report', null, {}, req.ip);
    sendPdfResponse(res, result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate court report' });
  }
}

export async function getStatisticalReportController(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const result = await generateStatisticalReportPdf(startDate as string, endDate as string);
    const userId = (req as any).user?.userId || (req as any).user?.user_id;
    if (userId) await logAudit(userId, 'REPORT_DOWNLOAD_STATISTICAL', 'report', null, { startDate, endDate }, req.ip);
    sendPdfResponse(res, result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate statistical report' });
  }
}
