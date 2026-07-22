# Forensic Medicine Digital Platform - User Manual

Welcome to the Forensic Medicine Digital Platform. This system is designed to streamline the management of clinical, forensic, and autopsy cases while maintaining strict confidentiality and a clear chain of custody. 

This manual is divided into three role-specific guides: **Clerk**, **Doctor (JMO)**, and **System Administrator**.

---

## General Navigation & Login

1. **Accessing the System:**
   - Open your web browser and navigate to the platform URL (e.g., `http://localhost:5173`).
   - You will be presented with the **Login Screen**.
2. **Logging In:**
   - Enter your assigned `Username` and `Password`.
   - Click **Login**.
   - The system will automatically route you to the **Dashboard**, unlocking features based on your specific role.
3. **Logging Out:**
   - Click on your profile icon in the top right corner and select **Logout** to safely end your session.

---

## 1. User Guide: Clerk

The Clerical Officer is typically the first point of contact when a subject or case arrives. Your primary responsibility is demographic data entry, initial case creation, and legal document processing.

### 1.1 Creating a New Case
1. On the left sidebar, click on **New Case** (`/cases/new`).
2. **Subject/Patient Details:**
   - Fill out the subject's `Full Name`, `NIC`, `Gender`, `Date of Birth`, and `Address`.
   - If applicable, enter the `BHT Number` (Bed Head Ticket) and select the `Subject Type` (e.g., Suspect, Victim, Deceased).
3. **Case Details:**
   - Select the **Case Type** from the dropdown (*Clinical*, *Autopsy*, or *Forensic*).
   - Enter the `Case Number` provided by the police or hospital registry.
   - Select the `Police Station` and assign a `Doctor (JMO)` to the case if known.
4. **Submit:**
   - Click the **Create Case** button. You will be redirected to the Dashboard where the new case will appear as `OPEN`.

### 1.2 Processing Legal Authorizations (Court Orders & Summons)
1. From the Dashboard, open the relevant case.
2. Navigate to the **Legal Authorizations** tab.
3. Click **Add Authorization**.
4. Select the type (e.g., *Court Order*, *Inquest Order*, *Summons*).
5. Enter the issuing authority details, court case numbers, and dates.
6. (Optional) Upload a scanned PDF copy of the physical order.
7. Click **Save**.

### 1.3 Viewing the Dashboard & Searching
1. Click on **Dashboard** (`/`).
2. You will see a paginated list of all active cases.
3. You can search for a specific case using the Search bar by typing the Case Number, Subject Name, or NIC.
4. *Note:* Clerks are restricted from viewing the medical findings inside a case to maintain patient confidentiality.

---

## 2. User Guide: Doctor (JMO)

The Judicial Medical Officer (JMO) or Doctor uses the system to record medical findings, manage laboratory investigations, upload evidence, and issue final court reports.

### 2.1 Finding and Opening a Case
1. Log in and navigate to the **Dashboard**.
2. Locate your assigned cases. You can filter the list to show only `OPEN` cases assigned to you.
3. Click on the **Case ID/Number** to open the **Case Detail View** (`/cases/:id`).

### 2.2 Recording Clinical Findings (For Living Subjects)
1. Inside the Case Detail view of a *Clinical Case*, navigate to the **Clinical Examination** tab.
2. Fill out the sections for `Incident Description`, `Past Medical History`, and `Examination Findings`.
3. Add any `Provisional Diagnosis`.
4. Click **Save Findings**. The system logs the timestamp of your entry automatically.

### 2.3 Recording Postmortem Findings (For Deceased Subjects)
1. Inside an *Autopsy Case*, navigate to the **Autopsy Details** tab.
2. Log the `Date/Time of Death`, `Place of Death`, and `Condition Upon Arrival`.
3. Enter detailed observations in `External Injuries`, `Internal Injuries`, and `Organ Findings`.
4. Specify the `Immediate Cause of Death`, `Antecedent Causes`, and select the `Manner of Death` (e.g., Natural, Homicide, Accident).
5. Click **Save Findings**.

### 2.4 Requesting and Managing Investigations (Lab Tests)
1. Navigate to the **Investigations** tab.
2. Click **New Investigation** to order tests (e.g., Toxicology, Histopathology).
3. Specify the test type and request date.
4. Once the physical lab results return, open the investigation record, update the `Status` to *Completed*, type in the `Results`, and upload the scanned lab report.

### 2.5 Uploading Evidence (Media & Documents)
1. Navigate to the **Evidence/Media** tab within the case.
2. Click **Upload Media**.
3. Select the file type (Image, Video, Audio).
4. Choose the file from your computer (e.g., scene photographs, injury close-ups).
5. Add a brief description/category (e.g., "Left forearm laceration") and click **Upload**.
6. Evidence is securely linked to the case and cannot be permanently deleted by a doctor.

### 2.6 Generating and Issuing a Report
1. Once all findings and lab results are recorded, navigate to the **Reports** tab.
2. Select **Draft Final Opinion**.
3. Fill in the concluding remarks, the `Final Opinion`, and select the recipient (e.g., Magistrate Court, Police Station).
4. Select the `Method of Delivery` (e.g., Registered Post, Hand Delivered).
5. Click **Issue Report**. A printable Medico-Legal Examination Form (MLEF) or Court Report is generated.
6. The case status can now be marked as `CLOSED`.

### 2.7 Managing Court Events
1. Navigate to the **Court Events** tab to log upcoming court dates where your expert testimony is required.
2. Enter the `Event Date`, `Court Name`, and the outcome after you return from court.

### 2.8 Reviewing Notifications
1. Click the **Bell Icon** in the top navigation bar.
2. Here you will see alerts (e.g., "New case assigned to you" or "High priority: Toxicology results returned for Case #102").
3. Click a notification to jump directly to the relevant case.

---

## 3. User Guide: System Administrator

The Admin is responsible for managing staff access, monitoring system health, configuring lookups, and ensuring security protocols are followed.

### 3.1 Managing Staff (Users)
1. On the left sidebar, click on **User Management** (`/users`). *(This tab is invisible to Clerks and Doctors).*
2. **To Add a New User:**
   - Click **Add User**.
   - Enter the `Username`, `Email`, `First Name`, `Last Name`, and `Designation`.
   - Assign the appropriate **Role** (`Admin`, `Doctor`, or `Clerk`).
   - Create a temporary password for the user and click **Save**.
3. **To Deactivate a User:**
   - Locate the user in the list and click **Edit**.
   - Toggle the `Active` status to `Inactive`. This immediately revokes their login access without deleting their historical audit trails (e.g., past reports they issued).

### 3.2 Audit and Security Monitoring
- Admins have access to the **System Logs / Audit** tab.
- This view tracks every `INSERT`, `UPDATE`, and `DELETE` action across the platform.
- You can search the logs by `User ID`, `Case ID`, or `Timestamp` to investigate unauthorized access attempts or track the chain of custody for evidence.

### 3.3 Data Recovery (Soft Deletes)
- The platform uses "Soft Deletes". If a clerk accidentally clicks "Delete" on a record, it is merely hidden (`is_deleted = true`).
- Admins can view deleted records by toggling the "Show Deleted" filter in the database management view and restore them with a single click.

---

## Troubleshooting & FAQ

- **Error: "403 Forbidden"**
  - You are trying to access a page or perform an action not permitted by your Role (e.g., a Clerk trying to read an autopsy report). Ensure you are logged into the correct account.
- **Error: "413 Payload Too Large" or "File Too Large"**
  - When uploading evidence, ensure the file size does not exceed the server limits (typically 50MB for videos/images). Use compression software for larger videos.
- **Page Not Loading / "Network Error"**
  - Ensure that the backend API is running (`npm run dev` in the root folder) and the database server (MySQL) is active. Contact your System Administrator if the issue persists.
- **I forgot my password.**
  - Currently, passwords must be reset manually by the System Administrator. Please contact them to issue a temporary password.
