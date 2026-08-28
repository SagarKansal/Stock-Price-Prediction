"""The Sheets row <-> Coupon mapping, tested without touching the network.

The API calls themselves need real credentials, so what is covered here is the
part that actually goes wrong in practice: a sheet someone has edited by hand.
"""

from __future__ import annotations

from coupon.store import Coupon
from coupon.store.sheets import (
    FIELDS,
    HEADERS,
    LAST_COLUMN,
    GoogleSheetsStore,
    _column_letter,
)


def test_header_and_field_lists_line_up():
    assert len(HEADERS) == len(FIELDS)
    assert HEADERS[0] == "Code" and FIELDS[0] == "code"
    blank = Coupon(code="X")
    for field in FIELDS:
        assert hasattr(blank, field), field


def test_column_letters():
    assert _column_letter(1) == "A"
    assert _column_letter(26) == "Z"
    assert _column_letter(27) == "AA"
    assert LAST_COLUMN == _column_letter(len(HEADERS))


def test_a_coupon_round_trips_through_a_row():
    coupon = Coupon(
        code="DRABCD1234EF", prize_amount=5000, status="CLAIMED", batch="DIWALI",
        mobile="9876543210", name="Priya Sharma", state="Karnataka",
        district="Bengaluru Urban", claimed_at="2026-01-01T00:00:00+00:00",
        sms_status="SENT", sms_reference="ref-1", scan_count=3,
        first_scanned_at="2026-01-01T00:00:00+00:00", qr_url="https://x/c/DRABCD1234EF",
    )
    row = GoogleSheetsStore._coupon_to_row(coupon)
    assert GoogleSheetsStore._row_to_coupon(row) == coupon


def test_a_short_row_is_padded_not_dropped():
    """Sheets truncates trailing empties, so a fresh row arrives short."""
    coupon = GoogleSheetsStore._row_to_coupon(["DRABCD1234EF", "1000"])
    assert coupon.code == "DRABCD1234EF"
    assert coupon.prize_amount == 1000
    assert coupon.status == "AVAILABLE"      # defaulted, not blank
    assert coupon.name == ""


def test_amounts_typed_by_hand_are_understood():
    """Somebody will format the prize column as currency. Cope with it."""
    for raw, expected in [("₹1,000", 1000), ("2500", 2500), ("1000.0", 1000),
                          ("", 0), ("not a number", 0)]:
        coupon = GoogleSheetsStore._row_to_coupon(["DRABCD1234EF", raw])
        assert coupon.prize_amount == expected, raw


def test_codes_are_upper_cased_and_trimmed():
    coupon = GoogleSheetsStore._row_to_coupon([" drabcd1234ef ", "0"])
    assert coupon.code == "DRABCD1234EF"


def test_scan_count_survives_a_blank_cell():
    assert GoogleSheetsStore._row_to_coupon(["DRABCD1234EF"]).scan_count == 0
