# Forensic Medicine Digital Platform: Technical Database Exploration Guide

**Target Audience:** CO2050 Database Systems Lecturer / Expert Database Architect
**Database Engine:** MySQL (InnoDB)
**ORM:** Prisma

This guide serves as a technical walkthrough of the `forensic_platform` database architecture. The system models complex medical and legal workflows using advanced relational design patterns. It relies heavily on strict normalization rules, structural inheritance for domain-specific data, and JSON data types for highly variable inputs, all secured by rigorous referential constraints.

---

## 1. Executive Summary of Architecture

The database is built on **MySQL utilizing the InnoDB engine** to guarantee ACID compliance and enforce robust foreign key (FK) constraints. The schema avoids the common anti-pattern of maintaining "wide, sparse tables" by implementing rigorous table inheritance (Entity Subtyping). 

Data integrity is handled entirely at the database level rather than application-side. All entities strictly declare `ON DELETE CASCADE`, `ON DELETE SET NULL`, or `ON DELETE NO ACTION` policies to prevent orphaned records. 

---

## 2. Core Architectural Highlights (Showcase)

When exploring the schema, we recommend reviewing the following specific implementations of advanced database design patterns:

### 2.1 Entity Subtyping (Inheritance)
To prevent nullable sprawl caused by divergent entity properties, the database uses **Class Table Inheritance (Subtyping)** via 1:1 foreign key relationships acting as primary keys.

* **Case Inheritance:** Examine the `cases` base table. Instead of holding all possible medical fields, it delegates specialized domains to `clinical_case` and `autopsy_case`. 
* **Authorization Inheritance:** Examine the `legal_authorizations` base table. It acts as the parent to the `court_order`, `inquest_order`, and `summon` tables. The child tables utilize `authorization_id` as both their Primary Key and Foreign Key to strictly map 1:1 back to the parent authorization.

### 2.2 JSON Data Types for Unstructured Data
While strict relational structures govern the application logic, forensic medical documentation often contains variable, hierarchical, or schema-less data. We utilized native `JSON` column types for these exceptions to avoid over-normalizing EAV (Entity-Attribute-Value) anti-patterns:

* **Audit Tracing:** Inspect the `payload` JSON column in the `audit_log` table. It captures full delta snapshots of complex operations without requiring parallel shadow-tables.
* **Autopsy Findings:** Inspect the `autopsy_details` table, specifically the `organ_findings`, `external_injuries`, and `internal_injuries` JSON columns. This allows doctors to store highly nested anatomical observations (e.g., organ weight arrays, spatial injury coordinates) efficiently.

### 2.3 Role-Based Access Control (RBAC) via Bridge Entities
User privileges are strictly isolated using a standard many-to-many resolution pattern:
* Inspect the junction table `user_role` mapping the `users` and `roles` tables using a composite primary key `(user_id, role_id)`.

### 2.4 Lookup Tables (Domain Constraints)
To enforce domain integrity and prevent data anomalies caused by string typos, static categories are normalized into distinct Lookup (`_lu`) tables:
* Review `case_status_lu`, `case_type_lu`, `document_type_lu`, and `media_type_lu`. These act as canonical dictionaries for foreign key references.

---

## 3. Complex Query Walkthroughs

The following SQL queries demonstrate the relational strength of the system. You may run these directly against the instance to test JOIN efficiencies and indexing strategies.

### Query A: Core Entity Aggregation (Cases, Patients, Users, Stations)
Demonstrates the resolution of base cases against their assigned medical officers, patient demographics, and police jurisdictions.

```sql
SELECT 
    c.case_number,
    c.opened_date,
    p.full_name AS patient_name,
    p.nic,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_doctor,
    ps.station_name AS police_station
FROM cases c
INNER JOIN patients p ON c.patient_id = p.patient_id
LEFT JOIN users u ON c.assigned_doctor_id = u.user_id
LEFT JOIN police_stations ps ON c.police_station_id = ps.police_station_id
ORDER BY c.opened_date DESC;
```

### Query B: Document Tracking via Lookup Tables
Demonstrates filtering by dynamic document domains (e.g., Medico-Legal Reports or Postmortem Reports) utilizing the normalized `document_type_lu` table.

```sql
SELECT 
    d.document_id,
    c.case_number,
    dt.label AS document_category,
    d.title,
    d.uploaded_at
FROM documents d
INNER JOIN cases c ON d.case_id = c.case_id
INNER JOIN document_type_lu dt ON d.document_type_id = dt.id
WHERE dt.code IN ('medico_legal_report__mlr_', 'autopsy_notes', 'postmortem_report__pmr_');
```

### Query C: Evidence Chain of Custody
Demonstrates chronological tracking of forensic evidence movements through the 1-to-Many `evidence` -> `chain_of_custody` relationship.

```sql
SELECT 
    e.description AS evidence_item,
    e.evidence_type,
    coc.transferred_from,
    coc.transferred_to,
    coc.date_time AS transfer_time,
    coc.purpose
FROM evidence e
INNER JOIN chain_of_custody coc ON e.evidence_id = coc.evidence_id
WHERE e.case_id = ? -- Substitute with an active case_id integer
ORDER BY coc.date_time ASC;
```

---

## 4. Data Integrity & Triggers

The schema aggressively enforces referential and entity integrity at the engine level:

* **UNIQUE Constraints:** High-value identifiers are strictly gated. E.g., `uq_users_username` on `users.username`, `uq_users_email_lower` on `users.email_lower`, and `case_number` on `cases.case_number`.
* **ON DELETE CASCADE:** Parent deletions are safely cascaded to dependents to prevent dangling pointers. For example, deleting a `cases` record safely ripples down and automatically drops `clinical_case`, `autopsy_details`, `documents`, and `evidence` records associated with it. Deleting `evidence` automatically cascades to `chain_of_custody`.
* **ON DELETE SET NULL / NO ACTION:** Relationships that must be preserved for historical logging, such as the `recorded_by` FK from `finding` to `users`, use `NoAction` to prevent the deletion of a User account from corrupting medical finding historical attribution.
