-- migrations/003_partitioning_audit_log.sql
-- Create a partitioned audit_log table and provide steps to migrate data safely.
-- This file contains procedural steps; run carefully in maintenance window for large datasets.

-- 1) Create a new partitioned parent table with the same columns as audit_log
-- Adjust column definitions to match your existing schema exactly before running.

BEGIN;

-- Example: detect existing columns dynamically and create parent; for clarity we create a recommended parent shape.
CREATE TABLE IF NOT EXISTS audit_log_part (
  log_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  action TEXT,
  entity_type TEXT,
  entity_id BIGINT,
  workstation_id TEXT,
  timestamp timestamptz NOT NULL,
  payload JSONB
) PARTITION BY RANGE (timestamp);

COMMIT;

-- 2) Create a default partition for older rows and a current-month partition
CREATE TABLE IF NOT EXISTS audit_log_part_default PARTITION OF audit_log_part DEFAULT;

-- Example monthly partition for current month (adjust naming as needed)
CREATE TABLE IF NOT EXISTS audit_log_part_2026_07 PARTITION OF audit_log_part
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- 3) Backfill/move existing data from audit_log to audit_log_part
-- Recommended approach for large tables: use INSERT ... SELECT in batches or pg_rewrite tools
-- Example (small dataset):
-- INSERT INTO audit_log_part (log_id, user_id, action, entity_type, entity_id, workstation_id, timestamp, payload)
--   SELECT log_id, user_id, action, entity_type, entity_id, workstation_id, timestamp, payload FROM audit_log;

-- 4) Once data is validated, rename tables:
-- ALTER TABLE audit_log RENAME TO audit_log_old;
-- ALTER TABLE audit_log_part RENAME TO audit_log;

-- 5) Create indexes on partitions (or on parent using CONCURRENTLY where supported)
CREATE INDEX IF NOT EXISTS idx_audit_log_part_user ON audit_log_part (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_part_ts ON audit_log_part (timestamp DESC);

-- 6) Optional: drop old table after validation
-- DROP TABLE audit_log_old;

-- NOTE: For high-volume installations consider pg_repack, logical replication, or partition exchange methods to avoid long locks.
