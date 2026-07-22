-- mysql_schema_full.sql
-- Complete MySQL-compatible schema for Forensic Medicine Digital Platform
-- Includes: database creation, lookup tables, core tables, FK indexes, FULLTEXT for text search,
-- JSON refactor for legal authorizations, and optional partitioning guidance for audit_log.
-- Tested for MySQL 8.0+ (uses JSON and generated columns).

-- WARNING: Review constraints and data types before running in production.

CREATE DATABASE IF NOT EXISTS forensic_platform CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_unicode_ci';
USE forensic_platform;

-- ==========================
-- Lookup / Enum Tables
-- ==========================
CREATE TABLE IF NOT EXISTS case_type_lu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS case_status_lu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_type_lu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media_type_lu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_priority_lu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Seed common values
INSERT IGNORE INTO case_type_lu (code,label) VALUES
  ('forensic','Forensic'), ('clinical','Clinical'), ('autopsy','Autopsy');
INSERT IGNORE INTO case_status_lu (code,label) VALUES
  ('open','Open'), ('closed','Closed'), ('archived','Archived');
INSERT IGNORE INTO document_type_lu (code,label) VALUES
  ('report','Report'), ('investigation','Investigation'), ('referral','Referral');
INSERT IGNORE INTO media_type_lu (code,label) VALUES
  ('image','Image'), ('video','Video'), ('audio','Audio');
INSERT IGNORE INTO notification_priority_lu (code,label) VALUES
  ('low','Low'), ('normal','Normal'), ('high','High');

-- ==========================
-- Core tables
-- ==========================

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  email VARCHAR(255) NOT NULL,
  email_lower VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED,
  designation VARCHAR(200),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email_lower (email_lower)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(150) NOT NULL UNIQUE,
  description VARCHAR(500)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_role (
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS police_stations (
  police_station_id INT AUTO_INCREMENT PRIMARY KEY,
  station_name VARCHAR(255),
  district VARCHAR(255),
  contact_number VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cases (
  case_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(200) NOT NULL UNIQUE,
  case_type_id INT,
  case_status_id INT,
  status VARCHAR(100),
  assigned_doctor_id BIGINT,
  police_station_id INT,
  opened_date DATE,
  closed_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (case_type_id) REFERENCES case_type_lu(id),
  FOREIGN KEY (case_status_id) REFERENCES case_status_lu(id),
  FOREIGN KEY (assigned_doctor_id) REFERENCES users(user_id),
  FOREIGN KEY (police_station_id) REFERENCES police_stations(police_station_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_case (
  case_id BIGINT PRIMARY KEY,
  referral_source VARCHAR(255),
  referral_date_time DATETIME,
  referring_officer VARCHAR(255),
  ward_number VARCHAR(100),
  clinical_category VARCHAR(255),
  mlef_serial_number VARCHAR(255),
  incident_date_time DATETIME,
  incident_description TEXT,
  past_medical_history TEXT,
  examination_findings TEXT,
  provisional_diagnosis TEXT,
  institution_details TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS autopsy_case (
  case_id BIGINT PRIMARY KEY,
  postmortem_number VARCHAR(200),
  death_category VARCHAR(200),
  authorization_id BIGINT,
  is_authorized BOOLEAN DEFAULT FALSE,
  place_of_death VARCHAR(400),
  date_time_of_death DATETIME,
  notification_source VARCHAR(255),
  notification_date_time DATETIME,
  informing_officer VARCHAR(255),
  body_received_date_time DATETIME,
  receiving_officer VARCHAR(255),
  condition_upon_arrival VARCHAR(255),
  identification_status VARCHAR(100),
  immediate_cause_of_death VARCHAR(500),
  antecedent_causes TEXT,
  manner_of_death VARCHAR(100),
  external_findings TEXT,
  internal_findings TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS autopsy_details (
  case_id BIGINT PRIMARY KEY,
  time_since_death_estimate VARCHAR(255),
  clothing_details TEXT,
  identification_marks TEXT,
  external_injuries JSON,
  internal_injuries JSON,
  organ_findings JSON,
  immediate_cause_of_death TEXT,
  antecedent_causes TEXT,
  manner_of_death ENUM('NATURAL', 'ACCIDENT', 'HOMICIDE', 'SUICIDE', 'UNDETERMINED', 'PENDING_INVESTIGATION'),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  document_type_id INT,
  document_type VARCHAR(200),
  title VARCHAR(500),
  file_path VARCHAR(2000),
  version INT DEFAULT 1,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploaded_by BIGINT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (document_type_id) REFERENCES document_type_lu(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS finding (
  finding_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  phase VARCHAR(100),
  description TEXT,
  recorded_by BIGINT,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_finding_description (description),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS review_visit (
  review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  review_date DATE,
  findings TEXT,
  recommendations TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS investigation (
  investigation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  investigation_type VARCHAR(200),
  requested_date DATE,
  completed_date DATE,
  status VARCHAR(100),
  summary TEXT,
  results TEXT,
  document_id BIGINT,
  FULLTEXT KEY ft_investigation_summary (summary),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(document_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS referral (
  referral_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  specialty VARCHAR(255),
  consultant_name VARCHAR(255),
  referral_date DATE,
  recommendation TEXT,
  document_id BIGINT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(document_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media (
  media_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  investigation_id BIGINT,
  media_type_id INT,
  media_type VARCHAR(200),
  category VARCHAR(200),
  file_path VARCHAR(2000),
  version INT DEFAULT 1,
  captured_at TIMESTAMP NULL DEFAULT NULL,
  captured_by BIGINT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (investigation_id) REFERENCES investigation(investigation_id) ON DELETE SET NULL,
  FOREIGN KEY (media_type_id) REFERENCES media_type_lu(id),
  FOREIGN KEY (captured_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report (
  report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  report_type VARCHAR(200),
  version INT DEFAULT 1,
  final_opinion TEXT,
  issued_date DATE,
  issued_by BIGINT,
  document_id BIGINT,
  recipient_details TEXT,
  method_of_delivery VARCHAR(200),
  certificate_of_receipt_id VARCHAR(255),
  FULLTEXT KEY ft_report_final_opinion (final_opinion),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(user_id),
  FOREIGN KEY (document_id) REFERENCES documents(document_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS court_event (
  court_event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  event_date DATE,
  event_type VARCHAR(100),
  court_name VARCHAR(255),
  outcome_or_response TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report_issuance (
  issuance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT,
  recipient_name VARCHAR(255),
  recipient_designation VARCHAR(255),
  issued_date DATE,
  method_of_delivery VARCHAR(100),
  receipt_document_id BIGINT,
  FOREIGN KEY (report_id) REFERENCES report(report_id) ON DELETE CASCADE,
  FOREIGN KEY (receipt_document_id) REFERENCES documents(document_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subject (
  subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT,
  bht_number VARCHAR(200),
  subject_type VARCHAR(100),
  full_name VARCHAR(400),
  nic VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(50),
  address TEXT,
  telephone VARCHAR(50),
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Consolidated legal_authorizations using JSON
CREATE TABLE IF NOT EXISTS legal_authorizations (
  authorization_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT NOT NULL,
  authorization_type VARCHAR(200),
  issue_date DATE,
  issuing_authority VARCHAR(400),
  remarks TEXT,
  document_id BIGINT,
  details JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(case_id),
  FOREIGN KEY (document_id) REFERENCES documents(document_id)
) ENGINE=InnoDB;

-- Optional specialized tables remain for backward compatibility (can be migrated)
CREATE TABLE IF NOT EXISTS summon (
  authorization_id BIGINT PRIMARY KEY,
  MLEF_number VARCHAR(255),
  court_case_number VARCHAR(255),
  court_date DATE,
  court_name VARCHAR(400),
  FOREIGN KEY (authorization_id) REFERENCES legal_authorizations(authorization_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS court_order (
  authorization_id BIGINT PRIMARY KEY,
  court_order_number VARCHAR(255),
  court_case_number VARCHAR(255),
  court_name VARCHAR(400),
  FOREIGN KEY (authorization_id) REFERENCES legal_authorizations(authorization_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inquest_order (
  authorization_id BIGINT PRIMARY KEY,
  inquest_order_number VARCHAR(255),
  isd_officer_name VARCHAR(255),
  police_station VARCHAR(400),
  FOREIGN KEY (authorization_id) REFERENCES legal_authorizations(authorization_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sender_user_id BIGINT,
  receiver_user_id BIGINT,
  case_id BIGINT,
  notification_type VARCHAR(200),
  title VARCHAR(500),
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority_id INT,
  status VARCHAR(100),
  FOREIGN KEY (sender_user_id) REFERENCES users(user_id),
  FOREIGN KEY (receiver_user_id) REFERENCES users(user_id),
  FOREIGN KEY (case_id) REFERENCES cases(case_id),
  FOREIGN KEY (priority_id) REFERENCES notification_priority_lu(id)
) ENGINE=InnoDB;

-- Audit log (non-partitioned by default). For very large datasets see partitioning section below.
CREATE TABLE IF NOT EXISTS audit_log (
  log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(255),
  entity_type VARCHAR(200),
  entity_id BIGINT,
  workstation_id VARCHAR(255),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payload JSON,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ==========================
-- Index and performance recommendations
-- ==========================

-- FK indexes (MySQL creates indexes for foreign keys automatically for InnoDB, but add extras for common queries)
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_finding_case_id ON finding(case_id);
CREATE INDEX idx_finding_recorded_by ON finding(recorded_by);
CREATE INDEX idx_media_case_id ON media(case_id);
CREATE INDEX idx_media_captured_by ON media(captured_by);
CREATE INDEX idx_reports_case_id ON report(case_id);
CREATE INDEX idx_reports_issued_by ON report(issued_by);

-- Composite / partial-like indexes: use WHERE in queries or separate columns
CREATE INDEX idx_cases_status_created ON cases(status, created_at);
CREATE INDEX idx_notifications_receiver_unread ON notifications(receiver_user_id, is_read, created_at);

-- Fulltext indexes already added in table definitions. Example search usage:
-- SELECT * FROM finding WHERE MATCH(description) AGAINST('needle' IN NATURAL LANGUAGE MODE);

-- Index for audit log timestamp and user
CREATE INDEX idx_audit_log_ts ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Optional: JSON indexes on legal_authorizations.details using JSON_EXTRACT paths (functional indexes)
-- Example: create an index on JSON_EXTRACT(details, '$.summon.MLEF_number') if frequently queried
-- ALTER TABLE legal_authorizations ADD COLUMN summon_MLEF VARCHAR(255) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(details, '$.summon.MLEF_number'))) STORED;
-- CREATE INDEX idx_legal_summon_mlef ON legal_authorizations(summon_MLEF);

-- ==========================
-- Optional Partitioning (audit_log)
-- MySQL partitioning requires that every UNIQUE KEY include the partitioning key. For simple setups
-- create partitions by RANGE COLUMNS (timestamp) but ensure unique constraints comply.
-- Example (uncomment and adapt before running):

-- ALTER TABLE audit_log
-- PARTITION BY RANGE COLUMNS (timestamp) (
--   PARTITION p2026_07 VALUES LESS THAN ('2026-08-01'),
--   PARTITION p2026_08 VALUES LESS THAN ('2026-09-01'),
--   PARTITION pmax VALUES LESS THAN (MAXVALUE)
-- );

-- ==========================
-- Data integrity & other suggestions
-- ==========================
-- - Use application-level salted password hashing (bcrypt/argon2); do not store plaintext.
-- - Store large binary files in object storage (S3) and keep file paths in `file_path`.
-- - Consider adding audit triggers in the application or DB-level triggers to capture before/after in `audit_log.payload`.
-- - Add CHECK constraints where supported and enforced by application-level validations.

-- ==========================
-- End of file
-- ==========================

-- ==========================
-- Data migration: map legacy text columns to lookup FK IDs
-- These statements are guarded: they detect if a legacy column exists and run a safe UPDATE.
-- Run this file as-is; the guards will run a harmless `SELECT 1` if the legacy column is absent.
-- Review unmapped counts after running.
-- ==========================

-- Map cases.case_type (legacy text) -> cases.case_type_id
SELECT COUNT(*) INTO @cnt FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'cases' AND column_name = 'case_type';
SET @sql = IF(@cnt>0,
  'UPDATE cases c JOIN case_type_lu lu ON LOWER(COALESCE(c.case_type, '''')) = LOWER(lu.code) SET c.case_type_id = lu.id WHERE (c.case_type_id IS NULL OR c.case_type_id = 0) AND c.case_type IS NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Map cases.status -> cases.case_status_id
SELECT COUNT(*) INTO @cnt FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'cases' AND column_name = 'status';
SET @sql = IF(@cnt>0,
  'UPDATE cases c JOIN case_status_lu lu ON LOWER(COALESCE(c.status, '''')) = LOWER(lu.code) SET c.case_status_id = lu.id WHERE (c.case_status_id IS NULL OR c.case_status_id = 0) AND c.status IS NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Map documents.document_type -> documents.document_type_id
SELECT COUNT(*) INTO @cnt FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'documents' AND column_name = 'document_type';
SET @sql = IF(@cnt>0,
  'UPDATE documents d JOIN document_type_lu lu ON LOWER(COALESCE(d.document_type, '''')) = LOWER(lu.code) SET d.document_type_id = lu.id WHERE (d.document_type_id IS NULL OR d.document_type_id = 0) AND d.document_type IS NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Map media.media_type -> media.media_type_id
SELECT COUNT(*) INTO @cnt FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'media' AND column_name = 'media_type';
SET @sql = IF(@cnt>0,
  'UPDATE media m JOIN media_type_lu lu ON LOWER(COALESCE(m.media_type, '''')) = LOWER(lu.code) SET m.media_type_id = lu.id WHERE (m.media_type_id IS NULL OR m.media_type_id = 0) AND m.media_type IS NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Map notifications.priority -> notifications.priority_id
SELECT COUNT(*) INTO @cnt FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'priority';
SET @sql = IF(@cnt>0,
  'UPDATE notifications n JOIN notification_priority_lu lu ON LOWER(COALESCE(n.priority, '''')) = LOWER(lu.code) SET n.priority_id = lu.id WHERE (n.priority_id IS NULL OR n.priority_id = 0) AND n.priority IS NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Verification queries: report unmapped legacy values (run manually to inspect)
-- Each block checks for column existence and only runs the count if the legacy column exists.

SELECT COUNT(*) INTO @cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'cases' AND column_name = 'case_type';
SET @sql = IF(@cnt>0,
  'SELECT ''cases_unmapped_case_type'' AS name, COUNT(*) AS cnt FROM cases WHERE case_type IS NOT NULL AND (case_type_id IS NULL OR case_type_id = 0)',
  'SELECT ''cases_unmapped_case_type'' AS name, 0 AS cnt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'cases' AND column_name = 'status';
SET @sql = IF(@cnt>0,
  'SELECT ''cases_unmapped_status'' AS name, COUNT(*) AS cnt FROM cases WHERE status IS NOT NULL AND (case_status_id IS NULL OR case_status_id = 0)',
  'SELECT ''cases_unmapped_status'' AS name, 0 AS cnt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'documents' AND column_name = 'document_type';
SET @sql = IF(@cnt>0,
  'SELECT ''documents_unmapped_doc_type'' AS name, COUNT(*) AS cnt FROM documents WHERE document_type IS NOT NULL AND (document_type_id IS NULL OR document_type_id = 0)',
  'SELECT ''documents_unmapped_doc_type'' AS name, 0 AS cnt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'media' AND column_name = 'media_type';
SET @sql = IF(@cnt>0,
  'SELECT ''media_unmapped_media_type'' AS name, COUNT(*) AS cnt FROM media WHERE media_type IS NOT NULL AND (media_type_id IS NULL OR media_type_id = 0)',
  'SELECT ''media_unmapped_media_type'' AS name, 0 AS cnt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'priority';
SET @sql = IF(@cnt>0,
  'SELECT ''notifications_unmapped_priority'' AS name, COUNT(*) AS cnt FROM notifications WHERE priority IS NOT NULL AND (priority_id IS NULL OR priority_id = 0)',
  'SELECT ''notifications_unmapped_priority'' AS name, 0 AS cnt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Optional cleanup suggestions (commented-out): after verifying mappings, you may:
-- 1) Make FK columns NOT NULL (if business rules allow):
-- ALTER TABLE cases MODIFY case_type_id INT NOT NULL;
-- 2) Drop legacy text columns when safe:
-- ALTER TABLE cases DROP COLUMN case_type;
-- ALTER TABLE documents DROP COLUMN document_type;
-- ALTER TABLE media DROP COLUMN media_type;
-- ALTER TABLE notifications DROP COLUMN priority;
