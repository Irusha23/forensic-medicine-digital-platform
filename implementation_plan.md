# Comprehensive Missing Pieces Implementation Plan

Based on a detailed analysis of the provided documentation (`Mini Project Assignment.pdf`, `Mini Project SRS.pdf`, `requirment gathering meeting1.pdf`, `Clinical and Autopsy Case Workflow Pipelines.pdf`, and `Digital database.pdf`), the current system lacks several critical modules and features mandated by the requirements.

## Open Questions

> [!IMPORTANT]
> **Schema Refactoring (Patients vs Cases):** The assignment specifically requires "Patient Management: Register patients, Maintain personal details, Track patient history". Currently, the system uses a `subject` table tightly coupled to a specific `case_id`. To properly track "patient history" (one patient having multiple cases over time), we should ideally extract a centralized `patients` table. **Do you approve a database schema migration to extract a `patients` table from the `subject` table?**

> [!WARNING]
> **Email Notifications:** The requirements specify an "Email notification system". Do you have a preferred SMTP service (e.g., Gmail, SendGrid) to use for development, or should I mock this out using `nodemailer` and `ethereal.email` (a fake SMTP service for testing)?

## Proposed Changes

---

### 1. Evidence Management & Chain of Custody
The system lacks the required Evidence Management module.

#### [NEW] Database Schema (`prisma/schema.prisma`)
- Add `evidence` model: `evidence_id`, `case_id`, `evidence_type`, `description`, `storage_location`, `collection_date`.
- Add `chain_of_custody` model: `custody_id`, `evidence_id`, `transferred_from`, `transferred_to`, `date_time`, `purpose`.

#### [NEW] Backend Endpoints (`src/api/routes/evidence.routes.ts`)
- CRUD operations for Evidence and Chain of Custody transfers.

#### [NEW] Frontend UI (`frontend/src/pages/Evidence.tsx` or inside `CaseDetail.tsx`)
- Tab in Case details to log evidence and view chain of custody.

---

### 2. Advanced Search and Retrieval (FR7)
The current `/api/cases` endpoint only supports basic pagination. The SRS demands comprehensive search capabilities.

#### [MODIFY] `src/api/controllers/case.controller.ts` & `src/services/case.service.ts`
- Implement filtering logic to search by:
  - Case number
  - Patient/Deceased name (joining `subject` table)
  - NIC number
  - Police station (joining `police_stations`)
  - Date range (`opened_date`)
  - Assigned Doctor
  - Report type (joining `report` table)

#### [MODIFY] `frontend/src/pages/Dashboard.tsx` (or new Search component)
- Build a robust search form utilizing the new backend parameters.

---

### 3. Dashboard and Analytics
The assignment demands statistical reporting ("Daily case reports", "Monthly statistics", "Pending case reports") and optional use of Chart libraries.

#### [NEW] Backend Endpoints (`src/api/routes/analytics.routes.ts`)
- Calculate case volume by month, pending cases by doctor, and case distribution (Clinical vs Autopsy).

#### [MODIFY] `frontend/src/pages/Dashboard.tsx`
- Integrate `recharts` or `chart.js` to visualize the analytics data, displaying metrics for JMOs and Admins.

---

### 4. Barcode/QR Code & Digital Signatures
The assignment lists these as "Additional Features".

#### [MODIFY] `prisma/schema.prisma`
- Add `qr_code_hash` and `digital_signature` to the `report` table.

#### [MODIFY] `src/services/report.service.ts`
- Use the `qrcode` library to generate a QR code linking to a verification endpoint for the report.
- Inject the QR code image into the generated PDF buffer.
- Generate a cryptographic hash of the PDF buffer and store it in `digital_signature` to ensure tamper-proofing.

---

### 5. Document Archival Metadata Updates (FR5)
The SRS mandates specific metadata for all uploaded documents.

#### [MODIFY] `prisma/schema.prisma`
- Add `date_received`, `date_issued`, `issuing_authority`, and `remarks` fields to the `documents` table.

#### [MODIFY] Frontend & Backend Document Upload Logic
- Update upload forms to capture this extended metadata.

---

### 6. Email Notification System
The SRS mandates notifications for "Pending reports, Unissued MLEFs, Pending court dates".

#### [MODIFY] `src/services/notification.service.ts`
- Integrate `nodemailer` to dispatch actual emails whenever a high-priority notification is created in the database.

---

## Verification Plan

### Automated Tests
- Run `npm run test` after schema modifications to ensure existing relations aren't broken.
- Add new test suites for `evidence.routes.ts` and `analytics.routes.ts`.

### Manual Verification
- Deploy the updated Prisma schema (`npx prisma db push`).
- Open the frontend to verify the new Analytics dashboard.
- Generate a Report and scan the embedded QR code using a mobile device to test verification.
- Test searching by multiple combinations (NIC + Date Range) in the UI.
