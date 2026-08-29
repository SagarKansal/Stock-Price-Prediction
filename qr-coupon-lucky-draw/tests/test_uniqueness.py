"""Uniqueness is the one property this system cannot recover from losing.

Two coupons sharing a code means two people scan the same prize, and no
reconciliation afterwards can decide who should have had it. These tests cover
every layer that stands between a print run and that outcome.
"""

from __future__ import annotations

import hashlib
import io

import pytest

from coupon.codes import generate
from coupon.qr import coupon_url, make_qr_image
from coupon.store import Coupon, DuplicateCodeError, SQLiteStore, find_duplicates


# -- the helper -------------------------------------------------------------


def test_find_duplicates_reports_each_repeat_once():
    assert find_duplicates(["a", "b", "a", "c", "a"]) == ["a"]
    assert find_duplicates(["a", "b", "a", "b"]) == ["a", "b"]
    assert find_duplicates(["a", "b", "c"]) == []
    assert find_duplicates([]) == []


# -- codes, payloads and bitmaps -------------------------------------------


def test_a_large_batch_is_unique_at_every_layer(settings):
    """Distinct codes -> distinct URLs -> distinct QR images."""
    codes = generate(1500)
    urls = [coupon_url(settings, code) for code in codes]

    assert len(set(codes)) == 1500, "codes collided"
    assert len(set(urls)) == 1500, "QR payloads collided"

    # Hash the rendered bitmap for a sample -- the thing actually printed.
    def bitmap_hash(url: str) -> str:
        buffer = io.BytesIO()
        make_qr_image(url, box_size=3, border=1).save(buffer, format="PNG")
        return hashlib.sha256(buffer.getvalue()).hexdigest()

    sample = urls[:200]
    assert len({bitmap_hash(url) for url in sample}) == len(sample), "QR images collided"


def test_a_different_code_always_changes_the_qr_image(settings):
    """The QR is a pure function of the code, so this must never regress."""
    first, second = generate(2)
    assert coupon_url(settings, first) != coupon_url(settings, second)

    def render(code: str) -> bytes:
        buffer = io.BytesIO()
        make_qr_image(coupon_url(settings, code)).save(buffer, format="PNG")
        return buffer.getvalue()

    assert render(first) != render(second)


def test_the_same_code_always_renders_the_same_qr(settings):
    """Reprinting a lost coupon must produce a QR that still works."""
    code = generate(1)[0]

    def render() -> bytes:
        buffer = io.BytesIO()
        make_qr_image(coupon_url(settings, code)).save(buffer, format="PNG")
        return buffer.getvalue()

    assert render() == render()


def test_successive_print_runs_cannot_collide():
    """The second batch must exclude everything the first one issued."""
    first = generate(500)
    second = generate(500, exclude=set(first))
    assert not set(first).intersection(second)
    assert len(set(first) | set(second)) == 1000


# -- the SQLite write path --------------------------------------------------


def test_sqlite_refuses_a_duplicate_inside_one_batch(store):
    code = generate(1)[0]
    with pytest.raises(DuplicateCodeError) as caught:
        store.add_batch([Coupon(code=code), Coupon(code=code)])
    assert code in str(caught.value)
    assert store.all_codes() == [], "nothing should have been written"


def test_sqlite_refuses_a_code_it_already_holds(store):
    code = generate(1)[0]
    store.add_batch([Coupon(code=code, prize_amount=100)])

    with pytest.raises(DuplicateCodeError):
        store.add_batch([Coupon(code=code, prize_amount=9999)])

    # The original prize must be untouched by the rejected write.
    assert store.get(code).prize_amount == 100
    assert len(store.all_codes()) == 1


def test_the_primary_key_still_backs_up_the_checks(tmp_path):
    """Bypass add_batch entirely; the schema must still refuse."""
    import sqlite3

    backing = SQLiteStore(tmp_path / "pk.db")
    code = generate(1)[0]
    backing.add_batch([Coupon(code=code)])

    with pytest.raises(sqlite3.IntegrityError):
        backing._connect().execute(
            "INSERT INTO coupons (code) VALUES (?)", (code,)
        )
    backing.close()


def test_a_rejected_batch_leaves_no_partial_rows(store):
    """A duplicate late in the batch must not half-write the good ones."""
    codes = generate(20)
    coupons = [Coupon(code=code) for code in codes]
    coupons.append(Coupon(code=codes[0]))          # duplicate at the end

    with pytest.raises(DuplicateCodeError):
        store.add_batch(coupons)
    assert store.all_codes() == []


# -- the Google Sheets write path ------------------------------------------


class FakeWorksheet:
    """Just enough gspread surface to exercise add_batch's duplicate check."""

    def __init__(self, headers: list[str]) -> None:
        self.rows: list[list] = [headers]

    def row_values(self, index: int) -> list:
        return [str(cell) for cell in self.rows[index - 1]]

    def get_all_values(self) -> list[list[str]]:
        return [[str(cell) for cell in row] for row in self.rows]

    def append_rows(self, rows: list[list], value_input_option: str = "RAW") -> None:
        self.rows.extend(rows)

    def update(self, values=None, range_name=None) -> None:
        pass


@pytest.fixture
def fake_sheet():
    """A GoogleSheetsStore wired to an in-memory worksheet."""
    from coupon.store.sheets import HEADERS, GoogleSheetsStore

    sheet = GoogleSheetsStore(credentials_file="unused", sheet_id="unused")
    worksheet = FakeWorksheet(HEADERS)
    sheet._worksheet = worksheet
    sheet._open = lambda: worksheet
    return sheet, worksheet


def test_sheets_refuses_a_duplicate_inside_one_batch(fake_sheet):
    sheet, worksheet = fake_sheet
    code = generate(1)[0]

    with pytest.raises(DuplicateCodeError):
        sheet.add_batch([Coupon(code=code), Coupon(code=code)])
    assert len(worksheet.rows) == 1, "only the header should remain"


def test_sheets_refuses_a_code_the_worksheet_already_carries(fake_sheet):
    """The gap a spreadsheet leaves open: no unique constraint of its own."""
    sheet, worksheet = fake_sheet
    codes = generate(3)

    assert sheet.add_batch([Coupon(code=c, prize_amount=100) for c in codes]) == 3
    assert len(worksheet.rows) == 4

    with pytest.raises(DuplicateCodeError) as caught:
        sheet.add_batch([Coupon(code=codes[1], prize_amount=5000)])

    assert codes[1] in str(caught.value)
    assert len(worksheet.rows) == 4, "the duplicate must not have been appended"


def test_sheets_accepts_a_genuinely_new_batch(fake_sheet):
    sheet, worksheet = fake_sheet
    first = generate(3)
    second = generate(3, exclude=set(first))

    sheet.add_batch([Coupon(code=c) for c in first])
    sheet.add_batch([Coupon(code=c) for c in second])

    written = [row[0] for row in worksheet.rows[1:]]
    assert sorted(written) == sorted(first + second)
    assert find_duplicates(written) == []


# -- the QR carries the code printed beside it ------------------------------


def test_the_qr_encodes_the_code_printed_on_the_coupon(settings, make_coupons):
    """Scanning must yield the same identifier the coupon shows in text."""
    from coupon.codes import printed_form
    from coupon.qr import code_from_url, qr_payload

    for coupon in make_coupons(20):
        payload = qr_payload(coupon, settings)
        assert code_from_url(payload) == coupon.code
        # And the text under it is that same code, just grouped for reading.
        printed = printed_form(coupon.code)
        assert printed.replace("-", "") == code_from_url(payload)


def test_code_from_url_recovers_the_code(settings):
    from coupon.qr import code_from_url, coupon_url

    code = generate(1)[0]
    assert code_from_url(coupon_url(settings, code)) == code
    assert code_from_url(f"https://x.example.com/c/{code}/") == code
    assert code_from_url(f"  https://x.example.com/c/{code.lower()}  ") == code


def test_rendering_refuses_a_coupon_whose_qr_points_at_another_code(settings, tmp_path):
    """The failure this guards against: a QR opening someone else's prize."""
    from coupon.qr import CouponArtworkError, build_print_sheet, qr_payload

    mine, theirs = generate(2)
    tampered = Coupon(code=mine, qr_url=f"{settings.public_base_url}/c/{theirs}")

    with pytest.raises(CouponArtworkError) as caught:
        qr_payload(tampered, settings)
    assert mine in str(caught.value) and theirs in str(caught.value)

    # And it must stop the print run, not just the single coupon.
    with pytest.raises(CouponArtworkError):
        build_print_sheet([tampered], tmp_path / "bad.pdf", settings=settings)


def test_a_missing_qr_url_falls_back_to_the_code(settings):
    """A coupon with no stored URL still prints a QR for its own code."""
    from coupon.qr import code_from_url, qr_payload

    code = generate(1)[0]
    assert code_from_url(qr_payload(Coupon(code=code), settings)) == code


def test_printed_code_and_code_are_the_same_identifier(settings):
    """Hyphens are presentation; the two must normalise to one another."""
    from coupon.codes import normalize, parse, printed_form

    for code in generate(50):
        printed = printed_form(code)
        assert normalize(printed) == code
        assert parse(printed).canonical == code
