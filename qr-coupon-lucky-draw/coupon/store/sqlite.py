"""SQLite-backed coupon storage.

This module does double duty:

* As a **store backend** it is the whole system, which is what the tests and a
  laptop demo use -- no Google account required.
* As a **ledger** it sits in front of the Google Sheets backend, because
  Sheets has no notion of a transaction. A conditional ``UPDATE ... WHERE
  status = 'AVAILABLE'`` here is the single point at which a coupon flips to
  claimed, so two people scanning the same code at the same moment can never
  both win: SQLite serialises them and exactly one ``UPDATE`` reports a
  changed row.
"""

from __future__ import annotations

import sqlite3
import threading
from pathlib import Path
from typing import Iterator

from .base import (
    AVAILABLE,
    CLAIMED,
    Coupon,
    CouponStore,
    DuplicateCodeError,
    utc_now_iso,
    find_duplicates,
)

_COLUMNS = (
    "code", "prize_amount", "status", "batch", "mobile", "name", "state",
    "district", "claimed_at", "sms_status", "sms_reference", "scan_count",
    "first_scanned_at", "qr_url", "notes",
)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS coupons (
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
    -- 0 while a claim still has to be mirrored into Google Sheets.
    synced           INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_batch  ON coupons(batch);
CREATE INDEX IF NOT EXISTS idx_coupons_synced ON coupons(synced);
CREATE INDEX IF NOT EXISTS idx_coupons_mobile ON coupons(mobile);
"""


def _row_to_coupon(row: sqlite3.Row) -> Coupon:
    return Coupon(**{column: row[column] for column in _COLUMNS})


class SQLiteStore(CouponStore):
    """A coupon store in a single local file."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        if str(self.path) != ":memory:":
            self.path.parent.mkdir(parents=True, exist_ok=True)
        self._local = threading.local()
        # An in-memory database lives only as long as its connection, so it
        # has to be shared rather than opened per thread.
        self._shared: sqlite3.Connection | None = None
        if str(self.path) == ":memory:":
            self._shared = self._new_connection()
        self._write_lock = threading.Lock()
        with self._connect() as conn:
            conn.executescript(_SCHEMA)

    # -- connection handling ------------------------------------------------

    def _new_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(
            self.path, timeout=15, check_same_thread=False, isolation_level=None
        )
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        if str(self.path) != ":memory:":
            # WAL lets readers run while a claim is being written.
            conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA busy_timeout = 15000")
        return conn

    def _connect(self) -> sqlite3.Connection:
        if self._shared is not None:
            return self._shared
        conn = getattr(self._local, "conn", None)
        if conn is None:
            conn = self._new_connection()
            self._local.conn = conn
        return conn

    def close(self) -> None:
        if self._shared is not None:
            self._shared.close()
            self._shared = None
            return
        conn = getattr(self._local, "conn", None)
        if conn is not None:
            conn.close()
            self._local.conn = None

    # -- reads --------------------------------------------------------------

    def get(self, code: str) -> Coupon | None:
        row = self._connect().execute(
            "SELECT * FROM coupons WHERE code = ?", (code,)
        ).fetchone()
        return _row_to_coupon(row) if row else None

    def all_codes(self) -> list[str]:
        rows = self._connect().execute("SELECT code FROM coupons").fetchall()
        return [row["code"] for row in rows]

    def iter_coupons(self) -> Iterator[Coupon]:
        cursor = self._connect().execute("SELECT * FROM coupons ORDER BY batch, code")
        for row in cursor:
            yield _row_to_coupon(row)

    def batches(self) -> list[tuple[str, int]]:
        rows = self._connect().execute(
            "SELECT batch, COUNT(*) AS n FROM coupons GROUP BY batch ORDER BY batch"
        ).fetchall()
        return [(row["batch"], row["n"]) for row in rows]

    def unsynced(self) -> list[Coupon]:
        """Claims recorded locally that Google Sheets has not accepted yet."""
        cursor = self._connect().execute(
            "SELECT * FROM coupons WHERE synced = 0 ORDER BY claimed_at"
        )
        return [_row_to_coupon(row) for row in cursor]

    # -- writes -------------------------------------------------------------

    def add_batch(self, coupons: list[Coupon]) -> int:
        """Append coupons. The PRIMARY KEY is the real guarantee here.

        The explicit checks below exist so the operator gets an actionable
        message naming the clashing codes, rather than a bare IntegrityError.
        The constraint still backs them up, including against a race the
        checks cannot see.
        """
        if not coupons:
            return 0

        codes = [coupon.code for coupon in coupons]
        repeated = find_duplicates(codes)
        if repeated:
            raise DuplicateCodeError(repeated, "within the batch being written")

        existing = set(self.all_codes()).intersection(codes)
        if existing:
            raise DuplicateCodeError(sorted(existing), "already in the ledger")

        placeholders = ", ".join(["?"] * len(_COLUMNS))
        sql = f"INSERT INTO coupons ({', '.join(_COLUMNS)}) VALUES ({placeholders})"
        rows = [tuple(getattr(c, column) for column in _COLUMNS) for c in coupons]
        with self._write_lock:
            conn = self._connect()
            try:
                conn.execute("BEGIN IMMEDIATE")
                conn.executemany(sql, rows)
                conn.execute("COMMIT")
            except sqlite3.IntegrityError as exc:
                # The PRIMARY KEY caught what the checks above could not --
                # another process wrote the same code in between.
                conn.execute("ROLLBACK")
                raise DuplicateCodeError(codes, "rejected by the ledger's PRIMARY KEY") from exc
            except Exception:
                conn.execute("ROLLBACK")
                raise
        return len(rows)

    def update(self, coupon: Coupon) -> None:
        assignments = ", ".join(f"{column} = ?" for column in _COLUMNS if column != "code")
        values = [getattr(coupon, column) for column in _COLUMNS if column != "code"]
        values.append(coupon.code)
        with self._write_lock:
            self._connect().execute(
                f"UPDATE coupons SET {assignments} WHERE code = ?", values
            )

    def upsert(self, coupon: Coupon, *, synced: int = 1) -> None:
        """Insert or overwrite -- used when pulling the code list from Sheets."""
        columns = ", ".join([*_COLUMNS, "synced"])
        placeholders = ", ".join(["?"] * (len(_COLUMNS) + 1))
        updates = ", ".join(
            [*(f"{column} = excluded.{column}" for column in _COLUMNS if column != "code"),
             "synced = excluded.synced"]
        )
        values = [*(getattr(coupon, column) for column in _COLUMNS), synced]
        with self._write_lock:
            self._connect().execute(
                f"INSERT INTO coupons ({columns}) VALUES ({placeholders}) "
                f"ON CONFLICT(code) DO UPDATE SET {updates}",
                values,
            )

    def record_scan(self, code: str) -> None:
        """Count a scan. Cheap enough to do on every page view."""
        now = utc_now_iso()
        with self._write_lock:
            self._connect().execute(
                "UPDATE coupons "
                "SET scan_count = scan_count + 1, "
                "    first_scanned_at = CASE WHEN first_scanned_at = '' THEN ? "
                "                            ELSE first_scanned_at END "
                "WHERE code = ?",
                (now, code),
            )

    def try_claim(self, code: str, *, mobile: str, name: str, state: str,
                  district: str) -> Coupon | None:
        """Atomically flip an available coupon to claimed.

        Returns the claimed coupon, or ``None`` when the coupon was already
        claimed, voided or unknown -- in which case the caller must not send
        an SMS. This is the only place a coupon changes hands.
        """
        claimed_at = utc_now_iso()
        with self._write_lock:
            conn = self._connect()
            try:
                conn.execute("BEGIN IMMEDIATE")
                cursor = conn.execute(
                    "UPDATE coupons SET status = ?, mobile = ?, name = ?, state = ?, "
                    "district = ?, claimed_at = ?, sms_status = '', synced = 0 "
                    "WHERE code = ? AND status = ?",
                    (CLAIMED, mobile, name, state, district, claimed_at, code, AVAILABLE),
                )
                won = cursor.rowcount == 1
                row = conn.execute("SELECT * FROM coupons WHERE code = ?", (code,)).fetchone()
                conn.execute("COMMIT")
            except Exception:
                conn.execute("ROLLBACK")
                raise
        return _row_to_coupon(row) if (won and row) else None

    def set_sms_result(self, code: str, status: str, reference: str = "") -> None:
        with self._write_lock:
            self._connect().execute(
                "UPDATE coupons SET sms_status = ?, sms_reference = ?, synced = 0 "
                "WHERE code = ?",
                (status, reference, code),
            )

    def mark_synced(self, code: str, synced: bool = True) -> None:
        with self._write_lock:
            self._connect().execute(
                "UPDATE coupons SET synced = ? WHERE code = ?", (1 if synced else 0, code)
            )

    def set_status(self, code: str, status: str, note: str = "") -> bool:
        with self._write_lock:
            cursor = self._connect().execute(
                "UPDATE coupons SET status = ?, notes = ?, synced = 0 WHERE code = ?",
                (status, note, code),
            )
        return cursor.rowcount == 1
