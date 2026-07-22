#!/usr/bin/env python3
"""Simple DB smoke test for the forensic_platform MySQL schema.

Usage:
  Ensure `PyMySQL` is installed: `pip install pymysql`
  Set env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (defaults provided)
  Run: `python migrations/db_smoke_test.py`
"""
import os
import sys
import pymysql

DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = int(os.getenv('DB_PORT', '3306'))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', '')
DB_NAME = os.getenv('DB_NAME', 'forensic_platform')

CHECKS = [
    ("connect", "SELECT 1"),
    ("tables", "SHOW TABLES"),
    ("case_type_lookup", "SELECT COUNT(*) FROM case_type_lu"),
    ("case_status_lookup", "SELECT COUNT(*) FROM case_status_lu"),
    ("users_table", "SELECT COUNT(*) FROM users"),
    ("cases_table", "SELECT COUNT(*) FROM cases"),
    ("finding_fulltext", "SHOW INDEX FROM finding"),
    ("audit_log_index", "SHOW INDEX FROM audit_log"),
]


def run():
    print(f"Connecting to {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    try:
        conn = pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER,
                               password=DB_PASS, database=DB_NAME,
                               cursorclass=pymysql.cursors.Cursor, autocommit=True)
    except Exception as e:
        print("ERROR: cannot connect:", e)
        sys.exit(2)

    ok = True
    with conn:
        cur = conn.cursor()
        for name, sql in CHECKS:
            try:
                cur.execute(sql)
                rows = cur.fetchall()
                print(f"[OK] {name}: returned {len(rows)} row(s)")
            except Exception as e:
                ok = False
                print(f"[FAIL] {name}: {e}")

    if ok:
        print("\nSmoke test PASSED. Schema appears present and basic checks OK.")
        sys.exit(0)
    else:
        print("\nSmoke test FAILED. See errors above.")
        sys.exit(1)


if __name__ == '__main__':
    run()
