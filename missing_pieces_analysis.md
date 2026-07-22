# Exhaustive Missing Pieces Analysis

After a meticulous review of all project documentation (`Mini Project Assignment.md`, `Mini Project SRS.md`, `Clinical and Autopsy Case Workflow Pipelines.md`, `Digital database.md`, and `requirment gathering meeting1.md`), the following is a complete and exhaustive list of everything missing from the current system implementation:

## 1. Database Schema & Models
- **Patients / Subject History (Assignment - Core Module 1):** The current `subject` table is tied 1-to-1 with a case. The requirement dictates tracking "patient history" across multiple cases. We need an independent `patients` table (or logic to link `subjects` by NIC).
- **Evidence Management (Assignment - Core Module 4):** Completely missing. Needs `evidence` and `chain_of_custody` tables to track forensic samples, laboratory evidence information, and chain of custody.
- **Investigation Enhancements (Pipeline - Step 6/8):** The `investigation` table is missing `laboratory_name` and `sample_details`.
- **Document Metadata (SRS FR5):** The `documents` table is missing `date_received`, `date_issued`, `issuing_authority`, and `remarks`.
- **Report Security (Assignment - Sec 5):** The `report` table is missing `qr_code_hash` and `digital_signature`.
- **Missing Roles (SRS FR2):** The database needs roles for `JMO`, `Researcher`, `Data Entry Operator`, and `Laboratory staff` seeded.
- **Missing Document Types (SRS FR5):** Seed data for all 35 document types (e.g., BHT extracts, Witness statements, Toxicology, Histopathology, Cause of Death forms, etc.) needs to be added to `document_type_lu`.

## 2. API & Backend Functionality
- **Advanced Search and Retrieval (SRS FR7):** Currently, the backend only supports pagination. It must support searching by Case number, Patient/deceased name, NIC number, Police station, Date range, Doctor, and Report type.
- **Dashboard & Analytics (Assignment - Sec 3.8 & 5):** Backend routes needed to generate: Daily case reports, Monthly statistics, Pending case reports, and general dashboard analytics.
- **Password Reset (SRS FR1):** Missing API routes and logic for "Allow password reset" (Forgot password flow).
- **Audit Logging Exhaustiveness (SRS FR10):** The system must guarantee logs for "User logins" and "Report downloads", which may not be currently captured by generic interceptors.
- **Automated Notifications / CRON (SRS FR8):** Missing automated background jobs to notify users of: Pending reports, Unissued MLEFs, Pending court dates, and Outstanding investigations.
- **Digital Signatures & QR Codes (Assignment - Sec 5):** Implementation of PDF signing and embedded QR code generation for report validation.
- **Email & SMS Notifications (Assignment Sec 5 & SRS Sec 6):** Integration with an Email service (and potentially SMS) for the notification system.
- **Database Backup & Recovery (Assignment - Sec 4):** A mechanism/script for automated SQL backups (e.g., `mysqldump` via cron) to demonstrate backup concepts.

## 3. Frontend UI & Application
- **Search Interface:** UI to support the complex multi-parameter search (FR7).
- **Evidence UI:** Interfaces to add/manage evidence and view the chain of custody.
- **Analytics Dashboard:** Graphical charts (using a chart library) displaying case statistics.
- **Password Reset UI:** "Forgot Password" and "Reset Password" screens.
- **Document Upload Form:** Needs to be updated to capture the new metadata fields (`date_received`, `issuing_authority`, etc.).
- **Investigation Form:** Needs to be updated to capture `laboratory_name` and `sample_details`.
- **User Management UI:** Ability to assign the newly discovered roles (JMO, Researcher, etc.).
- **Mobile Responsiveness:** Ensure all new (and existing) complex tables/forms are usable on mobile devices.
