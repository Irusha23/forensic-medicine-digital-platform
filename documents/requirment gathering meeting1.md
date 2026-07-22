To conduct a requirement gathering interview with doctors, forensic officers, and 
administrative staff. 
You should ask questions to understand: 
• 
What information they collect 
• 
How they currently store records 
• 
What reports they generate 
• 
What workflow they follow 
• 
What legal documents they maintain 
You can ask questions in a structured way like this: 
 
1. General Department Information 
• 
What are the main activities performed in the department? 
• 
What types of cases do you handle? 
o Postmortem cases 
o Clinical forensic cases 
o Accident cases 
o Assault cases 
o Sexual assault cases 
o Toxicology cases 
• 
How are cases currently recorded? 
o Paper files 
o Registers 
o Excel sheets 
o Existing software 
 
2. Patient / Victim Information 
Ask: 
• 
What personal details do you collect from patients or deceased persons? 
• 
Do you record: 
o Full name 
o NIC/Passport number 
o Age 
o Gender 
o Address 
o Contact details 
o Hospital number 
Example follow-up: 
• 
Can one patient have multiple forensic cases? 
This helps identify relationships in the database. 
 
3. Case Information 
Ask: 
• 
What information is recorded for each case? 
• 
How is a case identified? 
o Case number 
o Police reference number 
o Court reference number 
• 
What dates are recorded? 
o Admission date 
o Examination date 
o Report submission date 
Important questions: 
• 
Can one case involve multiple examinations? 
• 
Can multiple doctors work on the same case? 
These determine database table relationships. 
 
4. Examination Details 
Ask: 
• 
What types of examinations are conducted? 
• 
What findings are recorded? 
• 
Do you store: 
o Injury details 
o Cause of death 
o Photographs 
o X-rays 
o Lab reports 
o Toxicology reports 
Follow-up: 
• 
Are images and scanned documents stored digitally? 
 
5. Police and Court Information 
Ask: 
• 
What information is collected from police? 
• 
Do you store: 
o Police station 
o Investigating officer 
o Court name 
o Magistrate details 
Ask: 
• 
What reports are submitted to courts? 
 
6. Report Generation 
Ask: 
• 
What types of reports do you generate? 
• 
Can you show sample reports? 
• 
What information appears in reports? 
• 
Who signs the reports? 
This is very important for database output design. 
 
7. Workflow Questions 
Ask them to explain the complete process: 
“Can you explain step-by-step what happens from receiving a case until sending the final report 
to court?” 
This helps identify: 
• 
entities 
• 
processes 
• 
user roles 
• 
system modules 
 
8. User and Security Requirements 
Ask: 
• 
Who uses the system? 
o Doctors 
o Clerks 
o Lab staff 
o Administrators 
• 
Should different users have different access permissions? 
 
9. File and Document Storage 
Ask: 
• 
Do you need to store: 
o PDF reports 
o Images 
o Scanned documents 
o Videos 
Ask: 
• 
Approximately how many cases are handled per month/year? 
This helps estimate storage requirements. 
 
10. Future Requirements 
Ask: 
• 
What problems exist with the current manual system? 
• 
What improvements do you expect from the new database system? 
• 
What reports or statistics are difficult to prepare now? 
 
Important Technique 
Instead of only asking: 
“What data do you collect?” 
Ask: 
“Can you show me the forms/registers you currently use?” 
Existing forms help identify: 
• 
entities 
• 
attributes 
• 
relationships 
• 
mandatory fields 
 
Example Final Requirement Questions 
You can directly ask: 
1. What information is collected when a new forensic case arrives? 
2. What documents are attached to a case? 
3. How are cases categorized? 
4. What information is included in medico-legal reports? 
5. Who can access or edit records? 
6. How long are records stored? 
7. What reports are sent to police or courts? 
8. Are photographs or lab reports linked to cases? 
9. Can one patient have multiple cases? 
10. What information should be searchable? 
 
After Collecting Information 
Then you can identify: 
Database Design Component 
Example 
Entities 
Patient, Case, Doctor, Examination, Report 
Attributes 
Case_ID, Name, Date, Injury_Type 
Relationships 
Doctor handles Case 
Tables 
Patient, Case, Examination, Court_Report 
Primary Keys 
Case_ID 
Foreign Keys 
Patient_ID in Case table 
 
A very effective method is: 
1. Observe current paper forms 
2. Interview doctors 
3. Interview clerical staff 
4. Study report formats 
5. Draw workflow diagrams 
6. Then design ER diagrams and tables 
This is the standard database requirement collection process used in real system development 
projects. 
 
