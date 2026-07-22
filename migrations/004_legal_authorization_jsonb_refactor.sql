-- migrations/004_legal_authorization_jsonb_refactor.sql
-- Refactor LEGAL_AUTHORIZATION + specialized tables (SUMMON, COURT_ORDER, INQUEST_ORDER)
-- into a single table using JSONB `details`. This is non-destructive: creates a new table and copies data.

BEGIN;

-- 1) Create the new consolidated table
CREATE TABLE IF NOT EXISTS legal_authorizations_new (
  authorization_id BIGINT PRIMARY KEY,
  case_id BIGINT NOT NULL,
  authorization_type TEXT,
  issue_date DATE,
  issuing_authority TEXT,
  details JSONB,
  document_id BIGINT,
  created_at timestamptz DEFAULT now()
);

-- 2) Copy existing base rows from LEGAL_AUTHORIZATION if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_authorization') THEN
    INSERT INTO legal_authorizations_new (authorization_id, case_id, authorization_type, issue_date, issuing_authority, details, document_id)
    SELECT la.authorization_id, la.case_id, NULL, la.issue_date, la.issuing_authority,
      jsonb_strip_nulls(jsonb_build_object('base', to_jsonb(la) - 'authorization_id')),
      la.document_id
    FROM legal_authorization la
    ON CONFLICT (authorization_id) DO NOTHING;
  END IF;
END$$;

-- 3) Attach specialized rows (summon, court_order, inquest_order) into details JSONB
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'summon') THEN
    INSERT INTO legal_authorizations_new (authorization_id, details)
    SELECT s.authorization_id, jsonb_strip_nulls(jsonb_build_object('summon', to_jsonb(s) - 'authorization_id'))
    FROM summon s
    ON CONFLICT (authorization_id) DO UPDATE SET details = legal_authorizations_new.details || EXCLUDED.details;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_order') THEN
    INSERT INTO legal_authorizations_new (authorization_id, details)
    SELECT co.authorization_id, jsonb_strip_nulls(jsonb_build_object('court_order', to_jsonb(co) - 'authorization_id'))
    FROM court_order co
    ON CONFLICT (authorization_id) DO UPDATE SET details = legal_authorizations_new.details || EXCLUDED.details;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inquest_order') THEN
    INSERT INTO legal_authorizations_new (authorization_id, details)
    SELECT io.authorization_id, jsonb_strip_nulls(jsonb_build_object('inquest_order', to_jsonb(io) - 'authorization_id'))
    FROM inquest_order io
    ON CONFLICT (authorization_id) DO UPDATE SET details = legal_authorizations_new.details || EXCLUDED.details;
  END IF;
END$$;

COMMIT;

-- 4) Post-migration tasks (manual):
-- - Validate rows and details content.
-- - Update application code to use `legal_authorizations_new` or rename table after validation.
-- - Optional: create indexes on JSONB paths used frequently, e.g. (
--     CREATE INDEX ON legal_authorizations_new USING GIN (details jsonb_path_ops);
--   )
