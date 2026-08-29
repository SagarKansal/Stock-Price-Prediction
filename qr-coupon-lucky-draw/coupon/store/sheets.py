"""Google Sheets storage: the coupon list as a spreadsheet the client can read.

The sheet is one row per printed code. Columns to the right of the code hold
the prize assigned to it and, once claimed, the participant's details -- which
is exactly the layout asked for: scan the list, see who won what.

Two things about Sheets shape this module. It has no transactions, so claims
are serialised by the SQLite ledger before they ever reach here (see
:mod:`coupon.store.sqlite`). And its API is rate limited to roughly 60 reads a
minute per user, so reads come from a short-lived cache of the whole sheet
rather than a request per lookup.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Iterator

from .base import Coupon, CouponStore, DuplicateCodeError, StoreError, find_duplicates

logger = logging.getLogger(__name__)

# Column order as it appears in the spreadsheet, paired with the Coupon field
# it maps to. Adding a column here is the only change needed to widen the sheet.
COLUMN_MAP: list[tuple[str, str]] = [
    ("Code", "code"),
    ("Printed Code", "printed_code"),
    ("Prize Amount", "prize_amount"),
    ("Status", "status"),
    ("Mobile", "mobile"),
    ("Name", "name"),
    ("State", "state"),
    ("District", "district"),
    ("Claimed At (UTC)", "claimed_at"),
    ("SMS Status", "sms_status"),
    ("SMS Reference", "sms_reference"),
    ("Scan Count", "scan_count"),
    ("First Scanned At (UTC)", "first_scanned_at"),
    ("Batch", "batch"),
    ("QR URL", "qr_url"),
    ("Notes", "notes"),
]
HEADERS = [header for header, _ in COLUMN_MAP]
FIELDS = [field for _, field in COLUMN_MAP]
_INT_FIELDS = {"prize_amount", "scan_count"}

CACHE_TTL_SECONDS = 45
_RETRY_STATUS = {429, 500, 502, 503, 504}


def _column_letter(index_one_based: int) -> str:
    """1 -> A, 27 -> AA."""
    letters = ""
    n = index_one_based
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        letters = chr(ord("A") + remainder) + letters
    return letters


LAST_COLUMN = _column_letter(len(HEADERS))


def _with_retries(operation, *, attempts: int = 4, what: str = "sheets call"):
    """Retry a gspread call through rate limits and transient 5xx."""
    from gspread.exceptions import APIError

    delay = 1.0
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return operation()
        except APIError as exc:
            status = getattr(getattr(exc, "response", None), "status_code", None)
            if status not in _RETRY_STATUS or attempt == attempts:
                raise StoreError(f"{what} failed: {exc}") from exc
            last_error = exc
            logger.warning(
                "%s hit HTTP %s (attempt %d/%d), retrying in %.0fs",
                what, status, attempt, attempts, delay,
            )
            time.sleep(delay)
            delay *= 2
    raise StoreError(f"{what} failed: {last_error}")


class GoogleSheetsStore(CouponStore):
    """Coupon list held in a Google Sheet, reached with a service account."""

    def __init__(self, *, credentials_file: str, sheet_id: str,
                 worksheet_name: str = "Coupons") -> None:
        self.sheet_id = sheet_id
        self.worksheet_name = worksheet_name
        self._credentials_file = credentials_file
        self._lock = threading.Lock()
        self._worksheet = None
        self._rows_by_code: dict[str, int] = {}
        self._coupons: dict[str, Coupon] = {}
        self._cached_at = 0.0

    # -- connection ---------------------------------------------------------

    def _open(self):
        if self._worksheet is not None:
            return self._worksheet

        try:
            import gspread
            from google.oauth2.service_account import Credentials
        except ImportError as exc:  # pragma: no cover - dependency guard
            raise StoreError(
                "the Google Sheets backend needs 'gspread' and 'google-auth' "
                "(pip install -r requirements.txt)"
            ) from exc

        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
        ]
        try:
            credentials = Credentials.from_service_account_file(
                self._credentials_file, scopes=scopes
            )
            client = gspread.authorize(credentials)
            spreadsheet = client.open_by_key(self.sheet_id)
        except FileNotFoundError as exc:
            raise StoreError(
                f"service account file not found: {self._credentials_file}"
            ) from exc
        except Exception as exc:
            raise StoreError(f"could not open Google Sheet {self.sheet_id}: {exc}") from exc

        try:
            worksheet = spreadsheet.worksheet(self.worksheet_name)
        except Exception:
            worksheet = spreadsheet.add_worksheet(
                title=self.worksheet_name, rows=1000, cols=len(HEADERS)
            )
            worksheet.update(values=[HEADERS], range_name=f"A1:{LAST_COLUMN}1")

        self._worksheet = worksheet
        self._ensure_headers()
        return worksheet

    def _ensure_headers(self) -> None:
        worksheet = self._worksheet
        existing = _with_retries(lambda: worksheet.row_values(1), what="reading the header row")
        if existing[: len(HEADERS)] != HEADERS:
            if any(cell.strip() for cell in existing):
                logger.warning(
                    "worksheet %r has unexpected headers; rewriting row 1 to the "
                    "expected layout", self.worksheet_name,
                )
            _with_retries(
                lambda: worksheet.update(values=[HEADERS], range_name=f"A1:{LAST_COLUMN}1"),
                what="writing the header row",
            )

    # -- cache --------------------------------------------------------------

    def _refresh(self, force: bool = False) -> None:
        with self._lock:
            if not force and (time.monotonic() - self._cached_at) < CACHE_TTL_SECONDS:
                return
            worksheet = self._open()
            values = _with_retries(worksheet.get_all_values, what="reading the coupon sheet")
            rows_by_code: dict[str, int] = {}
            coupons: dict[str, Coupon] = {}
            for offset, row in enumerate(values[1:], start=2):
                if not row or not row[0].strip():
                    continue
                coupon = self._row_to_coupon(row)
                rows_by_code[coupon.code] = offset
                coupons[coupon.code] = coupon
            self._rows_by_code = rows_by_code
            self._coupons = coupons
            self._cached_at = time.monotonic()

    def invalidate(self) -> None:
        with self._lock:
            self._cached_at = 0.0

    @staticmethod
    def _row_to_coupon(row: list) -> Coupon:
        # Sheets drops trailing empty cells, so a freshly appended row comes
        # back shorter than the header. Pad before zipping or the fields slide.
        padded = list(row) + [""] * (len(FIELDS) - len(row))
        data: dict[str, object] = {}
        for field_name, raw in zip(FIELDS, padded):
            # get_all_values() yields strings, but a numeric cell can arrive as
            # an int or float through other read paths -- and through our own
            # _coupon_to_row, which writes real numbers so the sheet can sum
            # the prize column.
            value = "" if raw is None else str(raw).strip()
            if field_name in _INT_FIELDS:
                digits = value.replace(",", "").replace("₹", "").strip()
                try:
                    data[field_name] = int(float(digits)) if digits else 0
                except ValueError:
                    data[field_name] = 0
            else:
                data[field_name] = value
        data["code"] = str(data["code"]).strip().upper()
        if not data.get("status"):
            data["status"] = "AVAILABLE"
        return Coupon(**data)  # type: ignore[arg-type]

    @staticmethod
    def _coupon_to_row(coupon: Coupon) -> list:
        return [getattr(coupon, field_name) for field_name in FIELDS]

    # -- CouponStore --------------------------------------------------------

    def get(self, code: str) -> Coupon | None:
        self._refresh()
        coupon = self._coupons.get(code)
        if coupon is None:
            # A code we have never seen may simply post-date the cache.
            self._refresh(force=True)
            coupon = self._coupons.get(code)
        return coupon

    def all_codes(self) -> list[str]:
        self._refresh(force=True)
        return list(self._rows_by_code.keys())

    def iter_coupons(self) -> Iterator[Coupon]:
        self._refresh(force=True)
        yield from self._coupons.values()

    def add_batch(self, coupons: list[Coupon]) -> int:
        """Append coupons, refusing any code the sheet already carries.

        A spreadsheet has no unique constraint, so unlike SQLite this backend
        cannot have uniqueness enforced for it -- it has to check. The check
        is not atomic: two operators generating against the same sheet at the
        same moment could both pass it and both append. Generate from one
        machine, and run ``cli.py verify`` before a print run to be sure.
        """
        if not coupons:
            return 0

        codes = [coupon.code for coupon in coupons]
        repeated = find_duplicates(codes)
        if repeated:
            raise DuplicateCodeError(repeated, "within the batch being written")

        already_there = sorted(set(self.all_codes()).intersection(codes))
        if already_there:
            raise DuplicateCodeError(already_there, f"already in worksheet {self.worksheet_name!r}")

        worksheet = self._open()
        rows = [self._coupon_to_row(coupon) for coupon in coupons]
        # Chunked so a large print run stays under the request size limit.
        chunk_size = 500
        for start in range(0, len(rows), chunk_size):
            chunk = rows[start:start + chunk_size]
            _with_retries(
                lambda c=chunk: worksheet.append_rows(c, value_input_option="RAW"),
                what="appending coupons",
            )
        self.invalidate()
        return len(rows)

    def update(self, coupon: Coupon) -> None:
        worksheet = self._open()
        row_number = self._row_number(coupon.code)
        if row_number is None:
            raise StoreError(f"code {coupon.code} is not in the sheet")
        range_name = f"A{row_number}:{LAST_COLUMN}{row_number}"
        values = [self._coupon_to_row(coupon)]
        _with_retries(
            lambda: worksheet.update(values=values, range_name=range_name),
            what=f"updating row {row_number}",
        )
        with self._lock:
            self._coupons[coupon.code] = coupon

    def _row_number(self, code: str) -> int | None:
        self._refresh()
        row_number = self._rows_by_code.get(code)
        if row_number is None:
            self._refresh(force=True)
            row_number = self._rows_by_code.get(code)
        return row_number
