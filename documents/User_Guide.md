# Forensic Medicine Digital Platform - User Guide

Welcome to the Forensic Medicine Digital Platform (FMDP). This guide is designed to help you navigate and operate the system efficiently. The guide is broken down by user roles so you can quickly find the instructions relevant to your permissions.

---

## Table of Contents
1. [General Navigation](#general-navigation)
2. [Clerk Guide](#clerk-guide)
3. [Doctor & JMO Guide](#doctor--jmo-guide)
4. [Admin Guide](#admin-guide)

---

## General Navigation
Regardless of your role, the layout of the system is consistent:
- **Sidebar (Left):** Use this to navigate to the main sections like **Cases**, **Patients & Subjects**, **Users**, and **Registries** (Courts & Police Stations).
- **Top Bar:** Contains your active notifications (the bell icon) for case assignments and updates.
- **Main Content Area:** Displays the data for the active page you are viewing.

### Viewing a Case
Click on a **Case ID** or **Case Number** from the Dashboard to open the **Case Details**. A case is organized into **Tabs** to make finding information easier. At the top of the case, you will always see the **Case Info** section (Status, Case Number, Involved Parties, Assigned Doctor, etc.).

---

## Clerk Guide
Clerks handle the administrative side of case management, including intake, data entry for subjects, tracking physical evidence, and uploading legal authorizations.

**Demo Credentials for Clerk:**
- **Username:** `clerk`
- **Password:** `clerkpass`

### Daily Tasks for Clerks
1. **Adding a New Case**
   - Navigate to the **Cases** dashboard.
   - Click **Create Case**.
   - Select the Case Type (Clinical or Autopsy) and enter the initial details.
2. **Adding Subjects (Patients/Deceased)**
   - Inside a Case, go to the **SUBJECTS** tab.
   - Click **Add Subject** and fill out their demographic information (Name, NIC, Contact, Address).
3. **Uploading Documents & Authorizations**
   - Go to the **AUTHORIZATIONS & DOCUMENTS** tab.
   - **Legal Authorizations:** Use the top form to record Court Orders, Request Letters, Summons, or MLEF records. Select the Type, Issuing Authority, and fill out any specific numbers.
   - **General Documents:** Scroll to the bottom of the tab to the **Case Documents** section. Select the appropriate Document Category (e.g., Investigation Findings, MLR, PMR), choose your file, add an optional description, and click **Upload Document**.
4. **Managing Evidence & Court Events**
   - **EVIDENCE Tab:** Use this to log physical evidence items collected for the case.
   - **COURT Tab:** Log upcoming court dates and summons.
5. **Generating Aggregate Reports**
   - Use the reporting tools to generate standard administrative reports (Daily, Monthly, Pending Cases) which are exported as PDFs.

---

## Doctor & JMO Guide
Doctors and Judicial Medical Officers (JMOs) are responsible for the medical and forensic analysis of the case. You have all the capabilities of a Clerk, plus access to medical data and report generation.

**Demo Credentials for Doctor / JMO:**
- **Doctor Username:** `doctor` / **Password:** `doctorpass`
- **JMO Username:** `jmo` / **Password:** `jmopass`

### Conducting Medical & Forensic Work
1. **Reviewing Case Medical Intake**
   - In a Clinical Case, go to the **CLINICAL** tab to review or add incident history, examination details, and discharge info.
   - In an Autopsy Case, go to the **AUTOPSY INTAKE** and **AUTOPSY FINDINGS** tabs to log the post-mortem examination details.
2. **Logging Medical Findings & Investigations**
   - **FINDINGS Tab:** Document your medical observations, injury details, and conclusions.
   - **INVESTIGATIONS Tab:** Request and record results for external lab tests (e.g., Toxicology, Histopathology).
3. **Assigning Doctors & Referrals**
   - **Case Info (Top section):** If you are a JMO, you can assign yourself or another Doctor to the case.
   - **REFERRALS Tab:** Refer the case or subject to external specialists (e.g., Psychiatrist, Radiologist).
4. **Media Gallery**
   - Go to the **MEDIA** tab to upload and view categorized clinical media, such as Photographs, X-rays, Audio, and Video evidence.
5. **Issuing Official Reports**
   - Once your investigation is complete, click the green **Issue Official Report** button at the top right of the Case Details page.
   - The system will automatically compile the PMR (Post Mortem Report) or MLEF (Medico-Legal Examination Form) into a formatted PDF based on the data you entered into the tabs.

---

## Admin Guide
System Administrators have unrestricted access. They oversee the platform's infrastructure, manage user access, and can view all cases and system audit logs.

**Demo Credentials for Administrator:**
- **Username:** `admin`
- **Password:** `adminpass`

### Administrator Duties
1. **User Management**
   - Go to the **Users** section on the sidebar.
   - Create new accounts for incoming staff (Doctors, Clerks, JMOs).
   - Assign roles securely. *Note: A user must be assigned the 'Doctor' or 'JMO' role to be assignable to a case.*
   - Deactivate accounts for staff who leave.
2. **Managing System Registries**
   - **Registries:** Add and update the master lists of **Police Stations** and **Courts** so that Clerks and Doctors can easily select them from dropdown menus when filling out case forms.
3. **Audit & Security**
   - **Global Audit Log:** Accessible from the sidebar, this view tracks every action taken in the system (creation, updates, deletions) by every user. Use this to investigate discrepancies or track data changes over time.
   - **Case-Specific Audit:** Inside any case, click the **AUDIT** tab to see a filtered view of actions specifically related to that case.
4. **System Maintenance**
   - Admins can view and override Case Statuses (Open/Closed/Archived) across the platform if necessary.
