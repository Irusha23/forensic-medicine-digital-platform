# Forensic Medicine Digital Platform - Final Project Plan

We have successfully established the foundational database, backend services, and frontend interfaces for the Clinical and Autopsy pipelines. To bring this platform to full, client-ready completion, we must address the remaining features present in the database design but not yet surfaced in the UI.

This project plan outlines the sequential phases required to finalize the application.

## Phase 1: Media and Document Management
The forensic workflow heavily relies on external evidence, photos, and legal documents.
- **Backend**: Implement AWS S3 or local file storage logic for the `/api/cases/:id/media` and `/api/cases/:id/documents` endpoints.
- **Frontend `MediaGallery.tsx`**: Build an image/video gallery with lightbox support and metadata tagging (e.g., categorizing photos by injury type).
- **Frontend `Documents.tsx`**: Build a document repository for PDF/Word uploads (e.g., Police Reports, Toxicology results).

## Phase 2: Legal Authorizations & Subjects
Cases do not exist in a vacuum; they involve people and legal mandates.
- **Subjects**: Implement UI to manage the `subject` table (Victims, Suspects, Unknown Bodies). Add capability to link multiple subjects to a complex case.
- **Legal Authorizations**: Implement UI to track `inquest_order`, `court_order`, and `summon` forms.
- **Investigations & Referrals**: Build forms to request external toxicology investigations or refer clinical victims to specialists (e.g., Psychiatrists) and track their return dates.

## Phase 3: Notifications and Workflow Automation
Enhance collaboration between Clerks, Doctors, and Admins.
- **Notification System**: Build a real-time (WebSockets) or polling-based notification system utilizing the `notifications` table. Alert doctors when lab results are uploaded or alert clerks when a report is finalized.
- **Audit Trail UI Polish**: We have the `audit_log` table tracking actions. We need to finalize the `AuditTrail.tsx` component to present a chronological, human-readable timeline of the case history.

## Phase 4: Advanced Dashboard & Analytics
The landing page should provide actionable insights, not just a static table.
- **Data Visualization**: Integrate a charting library (like Recharts or Chart.js) to display:
  - Cases per month (Clinical vs. Autopsy)
  - Pending reports vs. Issued reports
  - Workload distribution among assigned doctors
- **Advanced Filtering**: Add complex search capabilities to the case list (filter by date range, police station, investigating officer, or status).

## Phase 5: Security, RBAC, and Deployment
Final hardening before client handover.
- **Frontend RBAC**: Currently, the backend restricts access using the `authorize()` middleware. The frontend needs to read the user's JWT role and hide/disable buttons accordingly (e.g., Clerks cannot finalize an Autopsy report).
- **User Management Portal**: Build an Admin-only dashboard to create new accounts, assign roles (`user_role` table), and deactivate retired staff.
- **Deployment**: Containerize the frontend (Nginx) and backend (Node.js) using Docker. Configure a CI/CD pipeline for staging and production deployment.

---

## Open Questions for the Client / User
- **Storage**: Do you prefer to store uploaded images and PDFs locally on the server's hard drive (easier setup), or in a cloud bucket like AWS S3 (more scalable)?
- **Notifications**: Should notifications be strictly in-app (a bell icon in the navigation bar), or do we need to integrate an Email/SMS gateway to notify doctors when they are off-site?
- **Next Step**: Which phase would you like to prioritize next? Phase 1 (File Uploads) or Phase 4 (Dashboards) are usually the most visually impactful.
