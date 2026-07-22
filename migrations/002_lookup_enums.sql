-- migrations/002_lookup_enums.sql
-- Create lookup tables for enums and add FK columns (non-destructive)
-- Run inside a transaction. Data migration from text columns to FK ids is manual and must be validated.

BEGIN;

-- 1) Lookup tables
CREATE TABLE IF NOT EXISTS case_type_lu (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_status_lu (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS document_type_lu (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_type_lu (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_priority_lu (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

-- 2) Populate some common values (idempotent)
INSERT INTO case_type_lu (code,label)
  SELECT v.code, v.label FROM (VALUES
    ('forensic','Forensic'), ('clinical','Clinical'), ('autopsy','Autopsy')
  ) AS v(code,label)
  ON CONFLICT (code) DO NOTHING;

INSERT INTO case_status_lu (code,label)
  SELECT v.code, v.label FROM (VALUES
    ('open','Open'), ('closed','Closed'), ('archived','Archived')
  ) AS v(code,label)
  ON CONFLICT (code) DO NOTHING;

INSERT INTO document_type_lu (code,label)
  SELECT v.code, v.label FROM (VALUES
    ('report','Report'), ('investigation','Investigation'), ('referral','Referral')
  ) AS v(code,label)
  ON CONFLICT (code) DO NOTHING;

INSERT INTO media_type_lu (code,label)
  SELECT v.code, v.label FROM (VALUES
    ('image','Image'), ('video','Video'), ('audio','Audio')
  ) AS v(code,label)
  ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_priority_lu (code,label)
  SELECT v.code, v.label FROM (VALUES
    ('low','Low'), ('normal','Normal'), ('high','High')
  ) AS v(code,label)
  ON CONFLICT (code) DO NOTHING;

-- 3) Add FK columns to existing tables (non-destructive: keep original text columns)
ALTER TABLE IF EXISTS cases ADD COLUMN IF NOT EXISTS case_type_id INTEGER REFERENCES case_type_lu(id);
ALTER TABLE IF EXISTS cases ADD COLUMN IF NOT EXISTS case_status_id INTEGER REFERENCES case_status_lu(id);
ALTER TABLE IF EXISTS documents ADD COLUMN IF NOT EXISTS document_type_id INTEGER REFERENCES document_type_lu(id);
ALTER TABLE IF EXISTS media ADD COLUMN IF NOT EXISTS media_type_id INTEGER REFERENCES media_type_lu(id);
ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS priority_id INTEGER REFERENCES notification_priority_lu(id);

-- 4) Index the FK columns for fast joins
CREATE INDEX IF NOT EXISTS idx_cases_case_type_id ON cases(case_type_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_status_id ON cases(case_status_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type_id ON documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_media_media_type_id ON media(media_type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority_id ON notifications(priority_id);

COMMIT;

-- NOTE:
-- After running this migration, perform a controlled data migration:
-- 1) Map existing string values to lookup rows and fill *_id columns.
-- 2) Test application behavior, then drop the legacy text columns or keep them as canonical until cutover.
