-- mysql_schema_rollback.sql
-- Rollback script to reverse migrations/mysql_schema_full.sql
-- WARNING: This will DROP tables and data. Run only if you intend to destroy the schema.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS summon;
DROP TABLE IF EXISTS court_order;
DROP TABLE IF EXISTS inquest_order;
DROP TABLE IF EXISTS legal_authorizations;
DROP TABLE IF EXISTS subject;
DROP TABLE IF EXISTS court_event;
DROP TABLE IF EXISTS report;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS referral;
DROP TABLE IF EXISTS investigation;
DROP TABLE IF EXISTS review_visit;
DROP TABLE IF EXISTS finding;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS autopsy_case;
DROP TABLE IF EXISTS clinical_case;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS police_stations;

DROP TABLE IF EXISTS notifications;

DROP TABLE IF EXISTS audit_log;

DROP TABLE IF EXISTS user_role;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS notification_priority_lu;
DROP TABLE IF EXISTS media_type_lu;
DROP TABLE IF EXISTS document_type_lu;
DROP TABLE IF EXISTS case_status_lu;
DROP TABLE IF EXISTS case_type_lu;

-- Optional: drop the database
-- DROP DATABASE IF EXISTS forensic_platform;

SET FOREIGN_KEY_CHECKS = 1;

-- End of rollback
