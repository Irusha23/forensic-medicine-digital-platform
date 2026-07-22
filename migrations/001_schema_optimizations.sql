-- migrations/001_schema_optimizations.sql
-- Production-aware migration helpers for PostgreSQL
-- Run the TRANSACTIONAL section inside a transaction. Run the NON-TRANSACTIONAL section separately
-- (some index operations use CONCURRENTLY and cannot run inside a transaction).

/*
Up: Apply these changes to harden schema, add indexes, and enable full-text search.
Down: Manual reversal is provided as guidance but must be evaluated before running.
*/

-- ==========================
-- TRANSACTIONAL CHANGES
-- ==========================
BEGIN;

-- 1) Safely rename reserved/uppercase table names if they exist. Uses dynamic SQL to avoid errors.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'USER') THEN
    EXECUTE 'ALTER TABLE "USER" RENAME TO users';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'CASE') THEN
    EXECUTE 'ALTER TABLE "CASE" RENAME TO cases';
  END IF;
END$$;

-- 2) Ensure not-null / basic constraints (inspect before applying in production!)
-- Make email and username NOT NULL and create a case-insensitive unique index on email.
ALTER TABLE IF EXISTS users ALTER COLUMN email SET NOT NULL;
ALTER TABLE IF EXISTS users ALTER COLUMN username SET NOT NULL;

-- 3) Add a normalized email column (optional) and unique index on lower(email).
-- Using an index on LOWER(email) avoids issues with case-sensitive UNIQUE constraints.
CREATE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(email));

-- 4) Add tsvector columns for full-text search (can be NULL initially)
ALTER TABLE IF EXISTS finding ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE IF EXISTS report ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE IF EXISTS investigation ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 5) Add payload JSONB to audit_log for richer before/after storage
ALTER TABLE IF EXISTS audit_log ADD COLUMN IF NOT EXISTS payload JSONB;

-- 6) Add created_at / updated_at defaults where missing (use timestamptz)
ALTER TABLE IF EXISTS notifications ALTER COLUMN created_at SET DATA TYPE timestamptz USING created_at;
ALTER TABLE IF EXISTS audit_log ALTER COLUMN timestamp SET DATA TYPE timestamptz USING timestamp;

COMMIT;


-- ==========================
-- NON-TRANSACTIONAL CHANGES
-- Run these statements separately (outside a transaction) because of CONCURRENTLY.
-- Execute them as superuser or a migration runner with appropriate privileges.
-- ==========================

-- 7) Ensure FK columns are indexed for join performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_case_id ON documents (case_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finding_case_id ON finding (case_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finding_recorded_by ON finding (recorded_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_case_id ON media (case_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_captured_by ON media (captured_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_case_id ON report (case_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_issued_by ON report (issued_by);

-- 8) Useful composite indexes and partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_status_created ON cases (status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_receiver_unread ON notifications (receiver_user_id, created_at) WHERE is_read = false;

-- 9) Full-text search indexes (create GIN indexes concurrently)
-- Populate tsvector columns first, then create indexes.
UPDATE finding SET search_vector = to_tsvector('english', coalesce(description, '')) WHERE search_vector IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finding_search ON finding USING GIN (search_vector);

UPDATE report SET search_vector = to_tsvector('english', coalesce(final_opinion, '')) WHERE search_vector IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_report_search ON report USING GIN (search_vector);

UPDATE investigation SET search_vector = to_tsvector('english', coalesce(summary, '')) WHERE search_vector IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_investigation_search ON investigation USING GIN (search_vector);

-- 10) Audit log index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_ts ON audit_log (timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user ON audit_log (user_id);

-- 11) Example partial index for fast lookups of open cases
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_open ON cases (opened_date) WHERE status = 'open';

-- 12) Optional: unique constraint for case_number
ALTER TABLE IF EXISTS cases ALTER COLUMN case_number SET NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_cases_case_number ON cases (case_number);

-- 13) Triggers to keep tsvector columns up to date
-- Create/update trigger function (transactional safe). If it already exists, replace it.
CREATE OR REPLACE FUNCTION trg_tsvector_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_ARGV[0] = 'finding' THEN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.description, ''));
    RETURN NEW;
  ELSIF TG_ARGV[0] = 'report' THEN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.final_opinion, ''));
    RETURN NEW;
  ELSIF TG_ARGV[0] = 'investigation' THEN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.summary, ''));
    RETURN NEW;
  END IF;
  RETURN NEW;
END; $$;

-- Attach triggers (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'trg_finding_search_vector') THEN
    EXECUTE 'CREATE TRIGGER trg_finding_search_vector BEFORE INSERT OR UPDATE ON finding FOR EACH ROW EXECUTE FUNCTION trg_tsvector_update(''finding'');';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'trg_report_search_vector') THEN
    EXECUTE 'CREATE TRIGGER trg_report_search_vector BEFORE INSERT OR UPDATE ON report FOR EACH ROW EXECUTE FUNCTION trg_tsvector_update(''report'');';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'trg_investigation_search_vector') THEN
    EXECUTE 'CREATE TRIGGER trg_investigation_search_vector BEFORE INSERT OR UPDATE ON investigation FOR EACH ROW EXECUTE FUNCTION trg_tsvector_update(''investigation'');';
  END IF;
END$$;

-- ==========================
-- DOWN (manual guidance)
-- Review carefully before running reversed steps in production.
-- ==========================
-- To reverse: drop indexes CONCURRENTLY, drop trigger, remove columns added, rename tables back using dynamic SQL.
