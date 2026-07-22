SOFTWARE REQUIREMENTS SPECIFICATION (SRS) 
Forensic Medicine Department Database System 
Version 1.0 
 
1. Introduction 
1.1 Purpose 
The purpose of this system is to provide a secure digital platform for managing Clinical 
Forensic and Autopsy cases handled by the Department of Forensic Medicine. The 
system will facilitate case registration, evidence storage, medico-legal documentation, 
report generation, case tracking, and long-term archival. 
1.2 Scope 
The system shall: 
 Manage Clinical Forensic cases. 
 Manage Autopsy/Postmortem cases. 
 Digitally store all medico-legal documents. 
 Manage investigations, referrals, photographs, and reports. 
 Track court requests and report issuance. 
 Generate reports automatically using templates. 
 Provide secure access with role-based permissions. 
 Maintain audit logs and notifications. 
1.3 Intended Users 
 Judicial Medical Officers (JMOs) 
 Medical Officers 
 Administrative Staff 
 Researchers 
 Department Heads 
 System Administrators 
 
2. Overall Description 
2.1 Product Perspective 
The system is a web-based centralized repository used by the Department of Forensic 
Medicine. 
2.2 Product Functions 
Clinical Module 
 Register clinical cases. 
 Store MLEF details. 
 Upload photographs. 
 Record investigations and referrals. 
 Generate Medico-Legal Reports (MLR). 
 Track report issuance. 
Autopsy Module 
 Register autopsy cases. 
 Store court/inquest orders. 
 Record postmortem findings. 
 Store photographs and investigation findings. 
 Generate PMRs and Cause of Death forms. 
 Track court proceedings. 
Administrative Module 
 User management. 
 Access control. 
 Audit logs. 
 Notifications. 
 Search and retrieval. 
 
3. Functional Requirements 
FR1 User Authentication 
The system shall: 
 Allow secure login. 
 Support password encryption. 
 Allow password reset. 
FR2 Role-Based Access Control 
Roles: 
 Administrator 
 JMO 
 Doctor 
 Researcher 
 Data Entry Operator 
Permissions shall vary according to role. 
 
FR3 Clinical Case Management 
The system shall allow users to: 
 Register new clinical cases. 
 Assign case numbers. 
 Record patient demographics. 
 Record referral source. 
 Upload MLEF documents. 
 Upload photographs. 
 Record examination findings. 
 Record investigations. 
 Record referrals. 
 Generate MLR reports. 
 Archive completed cases. 
 
FR4 Autopsy Case Management 
The system shall: 
 Register autopsy cases. 
 Record death category. 
 Upload court/inquest orders. 
 Store pre-autopsy information. 
 Record postmortem findings. 
 Upload photographs. 
 Store investigation results. 
 Generate PMR reports. 
 Generate Cause of Death certificates. 
 Archive cases. 
 
FR5 Document Management and Archival 
The system shall store document metadata within the database while scanned 
documents and media files shall be maintained in a secure file storage repository 
linked to the corresponding case records. 
The system shall: 
 Allow scanning and uploading of all physical documents associated with a case. 
 Maintain digital copies of every document received or issued by the department. 
 Associate multiple documents with a single case. 
 Support uploading documents in PDF, JPEG, PNG, and TIFF formats. 
 Record document metadata including: 
o Document ID 
o Document type 
o Case ID 
o Date received 
o Date issued 
o Issuing authority 
o Upload date 
o Uploaded by 
o Version number 
o Remarks 
 Allow retrieval of archived documents at any time. 
 Preserve documents for long-term medico-legal and research purposes. 
Clinical Document Archival 
The system shall digitally archive the following clinical documents: 
 Medico-Legal Examination Forms (MLEF) 
 Police request letters 
 Court orders 
 Referral letters 
 Doctor’s copy of MLEF 
 Bed Head Ticket (BHT) extracts 
 Investigation reports (X-ray, CT, toxicology, DNA, laboratory reports) 
 Specialist referral reports 
 Clinical photographs 
 Body diagrams 
 Issued Medico-Legal Reports (MLR) 
 Court summons 
 Supplementary reports 
 Certificates of receipt 
Autopsy Document Archival 
The system shall digitally archive the following autopsy documents: 
 Inquest orders 
 Court orders 
 Police requests 
 Crime scene reports 
 Bed Head Tickets (BHT) 
 Hospital records 
 Witness statements 
 Family statements 
 Police statements 
 Postmortem reports (PMR) 
 Autopsy notes 
 Histopathology reports 
 Toxicology reports 
 Radiology reports 
 DNA reports 
 Crime scene photographs 
 Postmortem photographs 
 Cause of Death forms 
 Court summons 
 Supplementary reports 
 Certificates of receipt 
Business Rule 
The system shall maintain digital copies of every paper document received, generated, 
or issued by the Department of Forensic Medicine to ensure complete medico-legal 
traceability, facilitate long-term archival, and support future legal proceedings. 
 
FR6 Media Management 
The system shall: 
 Upload images. 
 Categorize images. 
 Store image metadata. 
 Restrict image access. 
 
FR7 Search and Retrieval 
Users shall search cases using: 
 Case number. 
 Patient/deceased name. 
 NIC number. 
 Police station. 
 Date range. 
 Doctor. 
 Report type. 
 
FR8 Notifications 
The system shall notify users regarding: 
 Pending reports. 
 Unissued MLEFs. 
 Pending court dates. 
 Outstanding investigations. 
 
FR9 Report Generation 
The system shall automatically generate: 
 Medico-Legal Reports. 
 Postmortem Reports. 
 Cause of Death forms. 
 Receipt certificates. 
 
FR10 Audit Logging 
The system shall record: 
 User logins. 
 Record creation. 
 Record modification. 
 Report generation. 
 Report downloads. 
 
4. Non-Functional Requirements 
Security 
 HTTPS communication. 
 Encrypted passwords. 
 Role-based authorization. 
 Audit trails. 
Reliability 
 99.9% availability. 
 Automatic backup. 
Performance 
 Search response < 3 seconds. 
 Support multiple concurrent users. 
Scalability 
 Support increasing case volumes. 
 The system architecture shall support the storage and management of large 
volumes of scanned documents and multimedia files without significant 
degradation of system performance. 
 The system shall support external or dedicated file storage mechanisms for 
long-term archival. 
Usability 
 User-friendly interface. 
 Minimal training required. 
Maintainability 
 Modular architecture. 
 Well-documented APIs. 
Data Retention 
 The system shall support long-term archival of medico-legal records. 
 The system shall retain records indefinitely or according to institutional and legal 
regulations. 
 Archived records shall remain searchable and retrievable throughout the 
retention period. 
 Regular backups shall be maintained to prevent data loss. 
This requirement is especially important in forensic systems because cases can be 
reopened many years after the initial examination. 
 
5. System Architecture 
Presentation Layer 
↓ 
Application Layer 
↓ 
Business Logic Layer 
↓ 
Database Layer 
↓ 
File Storage Layer 
 
6. External Interfaces 
User Interface 
 Web browser interface. 
Hardware Interface 
 Desktop computers. 
 Scanners. 
 Printers. 
Software Interface 
 Hospital Information System. 
 Email/SMS notification service. 
 
7. Database Entities 
Core entities: 
 Users 
 Roles 
 ClinicalCases 
 AutopsyCases 
 Patients 
 DeceasedPersons 
 MLEF 
 PMR 
 Investigations 
 Referrals 
 Documents 
 Photographs 
 Reports 
 CourtOrders 
 Notifications 
 AuditLogs 
