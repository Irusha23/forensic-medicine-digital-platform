import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import prisma from '../lib/prisma';

function toCaseId(value: string | number | bigint) {
  return typeof value === 'string' ? BigInt(value) : BigInt(value);
}

function escapeHtml(value: unknown) {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB');
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function buildReportHtml(caseRecord: any, reportType: 'pmr' | 'mlef') {
  const findings = Array.isArray(caseRecord.finding) ? caseRecord.finding : [];
  const investigations = Array.isArray(caseRecord.investigation) ? caseRecord.investigation : [];
  const autopsyDetails = caseRecord.autopsy_details;
  const autopsyCase = caseRecord.autopsy_case;
  const hasAutopsyContext = Boolean(autopsyDetails || autopsyCase);
  const title = reportType === 'pmr' || hasAutopsyContext ? 'Postmortem Report (PMR)' : 'Medico-Legal Examination Form (MLEF)';
  const heading = reportType === 'pmr' || hasAutopsyContext ? 'Postmortem Examination Report' : 'Medico-Legal Examination Form';
  const subtitle = reportType === 'pmr' || hasAutopsyContext
    ? 'Formal postmortem documentation for legal and clinical review'
    : 'Formal examination documentation for legal and investigative review';

  const findingsMarkup = findings.length
    ? findings.map((finding: any) => `
        <tr>
          <td>${escapeHtml(finding.phase || 'Unspecified')}</td>
          <td>${escapeHtml(formatDate(finding.recorded_at))}</td>
          <td>${escapeHtml(finding.description || 'No description supplied')}</td>
        </tr>`).join('')
    : '<tr><td colspan="3">No findings recorded.</td></tr>';

  const investigationsMarkup = investigations.length
    ? investigations.map((investigation: any) => `
        <tr>
          <td>${escapeHtml(investigation.investigation_type || 'Unspecified')}</td>
          <td>${escapeHtml(investigation.status || 'Pending')}</td>
          <td>${escapeHtml(formatDate(investigation.requested_date))}</td>
          <td>${escapeHtml(formatDate(investigation.completed_date))}</td>
          <td>${escapeHtml(investigation.results || investigation.summary || 'No results submitted')}</td>
        </tr>`).join('')
    : '<tr><td colspan="5">No investigations requested.</td></tr>';

  const organFindingsMarkup = autopsyDetails?.organ_findings
    ? typeof autopsyDetails.organ_findings === 'object'
      ? Object.entries(autopsyDetails.organ_findings as Record<string, unknown>)
          .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(formatValue(value))}</li>`)
          .join('')
      : `<li>${escapeHtml(formatValue(autopsyDetails.organ_findings))}</li>`
    : '<li>Not recorded.</li>';

  const caseSummary = caseRecord.status || 'No summary recorded';
  const examinerRemarks = findings.length
    ? findings.slice(0, 3).map((finding: any) => finding.description || 'Observation recorded').join(' • ')
    : 'No examination remarks entered.';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: 'Times New Roman', serif; color: #111827; line-height: 1.4; margin: 0; padding: 20px; font-size: 11pt; }
      .page { border: 1.5px solid #111827; padding: 16px 18px 20px; }
      .header { border-bottom: 2px solid #111827; padding-bottom: 8px; margin-bottom: 10px; }
      .title { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 2px 0; }
      .subtitle { text-align: center; font-size: 10pt; color: #374151; margin-bottom: 6px; }
      .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 6px 18px; margin: 8px 0 12px; }
      .meta-item { border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
      .label { font-weight: bold; }
      .section { border: 1px solid #111827; margin-top: 10px; padding: 8px 10px; }
      .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0 0 6px; }
      .section-number { display: inline-block; min-width: 24px; font-weight: bold; margin-right: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 4px; }
      th, td { border: 1px solid #111827; padding: 6px; vertical-align: top; text-align: left; }
      th { background: #f3f4f6; font-weight: bold; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .block { border: 1px solid #111827; padding: 6px; min-height: 50px; }
      .signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; }
      .signature-block { border-top: 1px solid #111827; padding-top: 4px; margin-top: 40px; font-size: 10pt; }
      .small { font-size: 9pt; color: #374151; }
      ul { margin: 4px 0 0 16px; padding: 0; }
      .footer { margin-top: 12px; font-size: 9pt; color: #4b5563; border-top: 1px solid #d1d5db; padding-top: 6px; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div class="title">${escapeHtml(heading)}</div>
        <div class="subtitle">${escapeHtml(subtitle)}</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><span class="label">Institution:</span> Forensic Medicine Digital Platform</div>
        <div class="meta-item"><span class="label">Report Type:</span> ${escapeHtml(reportType.toUpperCase())}</div>
        <div class="meta-item"><span class="label">Case Number:</span> ${escapeHtml(caseRecord.case_number || '—')}</div>
        <div class="meta-item"><span class="label">Case Status:</span> ${escapeHtml(caseRecord.status || '—')}</div>
        <div class="meta-item"><span class="label">Case Type:</span> ${escapeHtml(caseRecord.case_type_lu?.label || '—')}</div>
        <div class="meta-item"><span class="label">Opened Date:</span> ${escapeHtml(formatDate(caseRecord.opened_date))}</div>
        <div class="meta-item"><span class="label">Assigned Doctor:</span> ${escapeHtml(caseRecord.users?.username || '—')}</div>
        <div class="meta-item"><span class="label">Date Issued:</span> ${escapeHtml(formatDate(new Date()))}</div>
      </div>

      <div class="section">
        <div class="section-title"><span class="section-number">1.</span>Case Summary</div>
        <div class="block">${escapeHtml(caseSummary)}</div>
      </div>

      <div class="section">
        <div class="section-title"><span class="section-number">2.</span>Administrative Details</div>
        <div class="grid-2">
          <div class="block">
            <div><span class="label">Police Station:</span> ${escapeHtml(caseRecord.police_station_id ? `Station ${caseRecord.police_station_id}` : '—')}</div>
            <div><span class="label">BHT No.:</span> ${escapeHtml(autopsyCase?.postmortem_number || '—')}</div>
            <div><span class="label">Magistrate / ISD Ref:</span> ${escapeHtml(autopsyCase?.authorization_id ? `Ref ${autopsyCase.authorization_id}` : '—')}</div>
          </div>
          <div class="block">
            <div><span class="label">Witness Name:</span> __________________________</div>
            <div><span class="label">Witness Designation:</span> __________________</div>
            <div><span class="label">Consent Obtained:</span> Yes / No</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title"><span class="section-number">3.</span>${reportType === 'pmr' || hasAutopsyContext ? 'Postmortem Examination Details' : 'Examination Details'}</div>
        <div class="grid-2">
          <div class="block">
            <div><span class="label">Postmortem / Examination Number:</span> ${escapeHtml(autopsyCase?.postmortem_number || '—')}</div>
            <div><span class="label">Death Category:</span> ${escapeHtml(autopsyCase?.death_category || '—')}</div>
            <div><span class="label">Place of Death:</span> ${escapeHtml(autopsyCase?.place_of_death || '—')}</div>
          </div>
          <div class="block">
            <div><span class="label">Date/Time of Death:</span> ${escapeHtml(formatDate(autopsyCase?.date_time_of_death))}</div>
            <div><span class="label">Time Since Death:</span> ${escapeHtml(autopsyDetails?.time_since_death_estimate || '—')}</div>
            <div><span class="label">Manner of Death:</span> ${escapeHtml(autopsyDetails?.manner_of_death || '—')}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title"><span class="section-number">4.</span>Findings and Observations</div>
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Recorded At</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>${findingsMarkup}</tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title"><span class="section-number">5.</span>Investigations and Laboratory Results</div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Completed</th>
              <th>Results</th>
            </tr>
          </thead>
          <tbody>${investigationsMarkup}</tbody>
        </table>
      </div>

      ${autopsyDetails ? `
      <div class="section">
        <div class="section-title"><span class="section-number">6.</span>Autopsy / Anatomical Findings</div>
        <div class="grid-2">
          <div class="block">
            <div><span class="label">Immediate Cause:</span> ${escapeHtml(autopsyDetails.immediate_cause_of_death || '—')}</div>
            <div><span class="label">Antecedent Causes:</span> ${escapeHtml(autopsyDetails.antecedent_causes || '—')}</div>
          </div>
          <div class="block">
            <div><span class="label">Organ Findings</span></div>
            <ul>${organFindingsMarkup}</ul>
          </div>
        </div>
      </div>` : ''}

      <div class="section">
        <div class="section-title"><span class="section-number">7.</span>Chain of Custody and Legal Certification</div>
        <div class="block">All specimens, evidence items, and associated documents were handled, recorded, and preserved in accordance with legal and procedural requirements. Chain of custody maintained from receipt to examination and final disposition. Any deviations, limitations, or outstanding requests are recorded herein.</div>
      </div>

      <div class="section">
        <div class="section-title"><span class="section-number">8.</span>Examiner’s Remarks</div>
        <div class="block">${escapeHtml(examinerRemarks)}</div>
      </div>

      <div class="signature-row">
        <div>
          <div class="signature-block">Prepared by: ______________________________</div>
          <div class="small">Name / Designation</div>
        </div>
        <div>
          <div class="signature-block">Approved by: ______________________________</div>
          <div class="small">Medical Officer / Supervisor</div>
        </div>
      </div>

      <div class="footer">
        Generated by the Forensic Medicine Digital Platform on ${escapeHtml(new Date().toLocaleString('en-GB'))}
      </div>
    </div>
  </body>
</html>`;
}

export async function generateCaseReportPdf(caseId: string | number | bigint, options: { reportType?: 'pmr' | 'mlef' | 'auto' } = {}) {
  const id = toCaseId(caseId);
  const reportType = options.reportType === 'pmr' || options.reportType === 'mlef' ? options.reportType : 'auto';

  const caseRecord = await prisma.cases.findFirst({
    where: { case_id: id, is_deleted: false },
    include: {
      case_type_lu: true,
      users: true,
      autopsy_case: true,
      autopsy_details: true,
      finding: {
        orderBy: { recorded_at: 'desc' },
        include: { users: true }
      },
      investigation: {
        orderBy: { requested_date: 'asc' },
        include: { documents: true, media: true }
      }
    }
  });

  if (!caseRecord) throw new Error('Case not found');

  const resolvedReportType: 'pmr' | 'mlef' = reportType === 'pmr' || reportType === 'mlef'
    ? reportType
    : (caseRecord.autopsy_details || caseRecord.autopsy_case ? 'pmr' : 'mlef');

  const reportDir = path.resolve(process.cwd(), 'data', 'uploads', 'cases', String(caseRecord.case_id), 'reports');
  await fs.mkdir(reportDir, { recursive: true });

  const { v4: uuidv4 } = require('uuid');
  const safeCaseNumber = String(caseRecord.case_number || `case-${caseRecord.case_id}`).replace(/[^a-zA-Z0-9._-]+/g, '-');
  const filename = `${resolvedReportType.toUpperCase()}-${safeCaseNumber}-${uuidv4()}.pdf`;
  const filePath = path.join(reportDir, filename);

  const html = buildReportHtml(caseRecord, resolvedReportType);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
    });
    await fs.writeFile(filePath, pdfBuffer);

    // Notification Trigger: Alert clerks that a report has been generated
    try {
      const { createNotification } = require('./notification.service');
      const clerks = await prisma.users.findMany({
        where: { user_role: { some: { roles: { role_name: 'Clerk' } } } }
      });
      for (const clerk of clerks) {
        await createNotification({
          receiver_user_id: clerk.user_id,
          case_id: caseRecord.case_id,
          notification_type: 'REPORT_GENERATED',
          title: 'Report Generated',
          message: `A new ${resolvedReportType.toUpperCase()} has been generated for Case ${caseRecord.case_number}.`
        });
      }
    } catch (e) {
      console.error('Failed to send report notification:', e);
    }

    return { pdfBuffer, filePath, filename, reportType: resolvedReportType };
  } finally {
    await browser.close();
  }
}
