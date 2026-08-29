"""Widening the ledger schema must not cost a live campaign its claims.

A ledger in production holds claims that may not have reached Google Sheets
yet, so a new column has to be added in place rather than by starting a fresh
file.
"""

from __future__ import annotations

import sqlite3

from coupon.codes import generate, printed_form
from coupon.store import CLAIMED, SQLiteStore

# The schema as it stood before `printed_code` was introduced.
_OLD_SCHEMA = """
CREATE TABLE coupons (
    code             TEXT PRIMARY KEY,
    prize_amount     INTEGER NOT NULL DEFAULT 0,
    status           TEXT    NOT NULL DEFAULT 'AVAILABLE',
    batch            TEXT    NOT NULL DEFAULT '',
    mobile           TEXT    NOT NULL DEFAULT '',
    name             TEXT    NOT NULL DEFAULT '',
    state            TEXT    NOT NULL DEFAULT '',
    district         TEXT    NOT NULL DEFAULT '',
    claimed_at       TEXT    NOT NULL DEFAULT '',
    sms_status       TEXT    NOT NULL DEFAULT '',
    sms_reference    TEXT    NOT NULL DEFAULT '',
    scan_count       INTEGER NOT NULL DEFAULT 0,
    first_scanned_at TEXT    NOT NULL DEFAULT '',
    qr_url           TEXT    NOT NULL DEFAULT '',
    notes            TEXT    NOT NULL DEFAULT '',
    synced           INTEGER NOT NULL DEFAULT 1
);
"""


def _old_ledger(path, code: str) -> None:
    conn = sqlite3.connect(path)
    conn.executescript(_OLD_SCHEMA)
    conn.execute(
        "INSERT INTO coupons (code, prize_amount, status, mobile, name, state, district) "
        "VALUES (?, 5000, 'CLAIMED', '9876543210', 'Priya Sharma', 'Karnataka', 'Bengaluru Urban')",
        (code,),
    )
    conn.commit()
    conn.close()


def test_an_older_ledger_gains_the_column_without_losing_claims(tmp_path):
    path = tmp_path / "old.db"
    code = generate(1)[0]
    _old_ledger(path, code)

    store = SQLiteStore(path)
    columns = {row[1] for row in store._connect().execute("PRAGMA table_info(coupons)")}
    assert "printed_code" in columns

    coupon = store.get(code)
    assert coupon is not None
    assert coupon.status == CLAIMED
    assert coupon.name == "Priya Sharma"          # the claim survived
    assert coupon.prize_amount == 5000
    assert coupon.printed_code == ""              # blank until backfilled
    store.close()


def test_the_migration_is_idempotent(tmp_path):
    path = tmp_path / "twice.db"
    code = generate(1)[0]
    _old_ledger(path, code)

    for _ in range(3):
        store = SQLiteStore(path)
        store.close()

    store = SQLiteStore(path)
    columns = [row[1] for row in store._connect().execute("PRAGMA table_info(coupons)")]
    assert columns.count("printed_code") == 1
    assert store.get(code).name == "Priya Sharma"
    store.close()


def test_a_backfilled_printed_code_round_trips(tmp_path, settings):
    path = tmp_path / "backfill.db"
    code = generate(1)[0]
    _old_ledger(path, code)

    store = SQLiteStore(path)
    coupon = store.get(code)
    coupon.printed_code = printed_form(code, prefix=settings.code_prefix)
    store.update(coupon)

    reloaded = store.get(code)
    assert reloaded.printed_code == printed_form(code, prefix=settings.code_prefix)
    assert reloaded.printed_code.replace("-", "") == reloaded.code
    assert reloaded.status == CLAIMED             # untouched by the backfill
    store.close()
