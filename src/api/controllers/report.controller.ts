import { Request, Response } from 'express';
import { generateCaseReportPdf } from '../../services/report.service';
import prisma from '../../lib/prisma';

function toCaseId(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

export async function generateReportController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reportType = req.query.reportType as 'pmr' | 'mlef' | 'auto' | undefined;
    const result = await generateCaseReportPdf(id, { reportType });
    const pdfBuffer = Buffer.isBuffer(result.pdfBuffer)
      ? result.pdfBuffer
      : Buffer.from(result.pdfBuffer as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.end(pdfBuffer, 'binary');
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate report' });
  }
}

export async function issueReportController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { report_type, final_opinion, recipient_name, recipient_designation, method_of_delivery, receipt_document_id } = req.body;
    const userId = (req as any).user?.userId; // Assuming user is injected by authenticateJWT
    
    // Create the report
    const report = await prisma.report.create({
      data: {
        case_id: toCaseId(id),
        report_type,
        final_opinion,
        issued_date: new Date(),
        issued_by: userId ? toCaseId(userId) : null
      }
    });

    // Create the issuance record
    if (recipient_name || method_of_delivery) {
      await prisma.report_issuance.create({
        data: {
          report_id: report.report_id,
          recipient_name,
          recipient_designation,
          issued_date: new Date(),
          method_of_delivery,
          receipt_document_id: receipt_document_id ? toCaseId(receipt_document_id) : null
        }
      });
    }
    
    res.status(201).json(report);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'failed to issue report' });
  }
}
