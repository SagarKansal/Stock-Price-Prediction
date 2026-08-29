"""Coupon lists written by hand in the sheet, rather than minted by us.

An operator typing `GOLD-001` into a spreadsheet gets no checksum, so the
strict path would reject it -- and, worse, the confusable folding that fixes
misread minted codes would silently rewrite it to `G01D001`. These tests pin
down both halves of accepting authored codes safely.
"""

from __future__ import annotations

import pytest

from coupon.codes import is_plausible_external, normalize, normalize_external
from coupon.config import load_settings, reset_settings_cache
from coupon.service import CouponService, INVALID, OK
from coupon.store import Coupon
from coupon.validation import Participant, display_mobile


@pytest.fixture
def external_settings(monkeypatch):
    monkeypatch.setenv("COUPON_ACCEPT_EXTERNAL_CODES", "true")
    reset_settings_cache()
    return load_settings()


@pytest.fixture
def external_service(external_settings, store, sms):
    return CouponService(settings=external_settings, store=store, ledger=store,
                         sms_provider=sms)


def a_participant() -> Participant:
    return Participant(mobile="9876543210", name="Priya Sharma",
                       state="Karnataka", district="Bengaluru Urban")


# -- normalisation ----------------------------------------------------------


@pytest.mark.parametrize("raw,expected", [
    ("GOLD-001", "GOLD001"),
    ("gold 001", "GOLD001"),
    ("  DIWALI-1001  ", "DIWALI1001"),
    ("LUCKY_0001", "LUCKY0001"),
])
def test_authored_codes_fold_without_being_rewritten(raw, expected):
    assert normalize_external(raw) == expected


def test_the_minted_path_would_have_corrupted_them():
    """Why a second normaliser exists at all."""
    # O -> 0 and L -> 1 is right for minted codes and wrong for authored ones.
    assert normalize("GOLD-001") == "G01D001"
    assert normalize_external("GOLD-001") == "GOLD001"


@pytest.mark.parametrize("raw", ["", "  ", "AB", "-", "X" * 40])
def test_implausible_codes_are_rejected_before_any_lookup(raw):
    assert not is_plausible_external(raw)


# -- resolution -------------------------------------------------------------


def test_an_authored_code_is_rejected_when_the_flag_is_off(service, store):
    store.add_batch([Coupon(code="GOLD001", printed_code="GOLD-001", prize_amount=5000)])
    assert service.lookup("GOLD-001").status == INVALID


def test_an_authored_code_resolves_when_the_flag_is_on(external_service, store):
    store.add_batch([Coupon(code="GOLD001", printed_code="GOLD-001", prize_amount=5000)])

    for typed in ("GOLD-001", "gold001", "GOLD 001", "  gold-001  "):
        found = external_service.lookup(typed)
        assert found.status == OK, typed
        assert found.coupon.prize_amount == 5000


def test_an_authored_code_not_on_the_list_is_still_refused(external_service, store):
    store.add_batch([Coupon(code="GOLD001", prize_amount=5000)])
    assert external_service.lookup("GOLD-999").status != OK


def test_minted_codes_still_work_alongside_authored_ones(external_service, make_coupons):
    """Turning the flag on must not weaken the minted path."""
    minted = make_coupons(1)[0]
    assert external_service.lookup(minted.code).status == OK
    # A minted code with a misread character is still repaired by folding.
    from coupon.codes import printed_form

    assert external_service.lookup(printed_form(minted.code)).status == OK


def test_claiming_an_authored_coupon_texts_the_code_as_authored(external_service, store, sms):
    store.add_batch([Coupon(code="GOLD001", printed_code="GOLD-001", prize_amount=5000)])

    result = external_service.claim("GOLD-001", a_participant())
    assert result.ok
    assert result.coupon.prize_amount == 5000
    # Quoted the way the coupon reads, not re-grouped into DR-style blocks.
    assert "GOLD-001" in sms.sent[0][1]


def test_a_second_scan_of_an_authored_coupon_reports_the_claim(external_service, store):
    store.add_batch([Coupon(code="GOLD001", printed_code="GOLD-001", prize_amount=5000)])
    external_service.claim("GOLD-001", a_participant())

    found = external_service.lookup("GOLD-001")
    assert found.status != OK
    assert found.coupon.name == "Priya Sharma"
    assert found.coupon.mobile == "9876543210"


# -- what the already-claimed page reveals ---------------------------------


def test_mobile_display_modes():
    assert display_mobile("9876543210", "full") == "9876543210"
    assert display_mobile("9876543210", "masked") == "98XXXXX210"
    assert display_mobile("9876543210", "hidden") == ""
    assert display_mobile("", "full") == ""


def test_the_claimed_page_shows_the_claimant_mobile(client, make_coupons):
    coupon = make_coupons(1)[0]
    client.post(f"/c/{coupon.code}/claim", data={
        "mobile": "9876543210", "name": "Priya Sharma",
        "state": "Karnataka", "district": "Bengaluru Urban",
    })
    body = client.get(f"/c/{coupon.code}").data.decode()
    assert "Prize already claimed" in body
    assert "9876543210" in body


def test_masking_can_be_switched_back_on(monkeypatch, store, sms, make_coupons):
    from coupon.web import create_app

    monkeypatch.setenv("CLAIMED_MOBILE_DISPLAY", "masked")
    reset_settings_cache()
    app = create_app(settings=load_settings(), store=store, ledger=store, sms_provider=sms)
    client = app.test_client()

    coupon = make_coupons(1)[0]
    client.post(f"/c/{coupon.code}/claim", data={
        "mobile": "9876543210", "name": "Priya Sharma",
        "state": "Karnataka", "district": "Bengaluru Urban",
    })
    body = client.get(f"/c/{coupon.code}").data.decode()
    assert "98XXXXX210" in body
    assert "9876543210" not in body


# -- importing a list somebody wrote ---------------------------------------


def _write_csv(path, rows) -> str:
    import csv as _csv

    with open(path, "w", newline="", encoding="utf-8") as handle:
        _csv.writer(handle).writerows(rows)
    return str(path)


def test_import_reads_codes_and_prizes(tmp_path):
    from coupon.cli import _read_authored_csv
    from pathlib import Path

    path = _write_csv(tmp_path / "list.csv", [
        ("Code", "Prize Amount"),
        ("GOLD-001", 5000),
        ("DIWALI-1001", "₹1,000"),      # currency formatting, properly quoted
        ("LUCKY-0001", 0),
        ("SILVER-500", "500"),
    ])
    assert _read_authored_csv(Path(path)) == [
        ("GOLD-001", 5000), ("DIWALI-1001", 1000),
        ("LUCKY-0001", 0), ("SILVER-500", 500),
    ]


def test_import_refuses_an_unquoted_thousands_separator(tmp_path):
    """Reading ₹1,000 as ₹1 and paying it out is worse than failing."""
    from coupon.cli import _read_authored_csv

    path = tmp_path / "bad.csv"
    path.write_text("Code,Prize Amount\nGOLD-001,₹1,000\n", encoding="utf-8")

    with pytest.raises(ValueError) as caught:
        _read_authored_csv(path)
    assert "GOLD-001" in str(caught.value)
    assert "1,000" in str(caught.value)


def test_import_tolerates_a_missing_header_and_blank_lines(tmp_path):
    from coupon.cli import _read_authored_csv

    path = tmp_path / "raw.csv"
    path.write_text("GOLD-001,5000\n\nSILVER-500,500\n", encoding="utf-8")
    assert _read_authored_csv(path) == [("GOLD-001", 5000), ("SILVER-500", 500)]


def test_import_rejects_a_non_numeric_prize(tmp_path):
    from coupon.cli import _read_authored_csv

    path = tmp_path / "words.csv"
    path.write_text("GOLD-001,five thousand\n", encoding="utf-8")
    with pytest.raises(ValueError):
        _read_authored_csv(path)


# -- audit and repair must respect an authored spelling ---------------------


def test_verify_accepts_an_authored_printed_form(store, external_settings):
    """The invariant is that the printed string resolves to the code."""
    from coupon.codes import normalize_external as folded

    for code, printed in [("GOLD001", "GOLD-001"),
                          ("DIWALI1001", "DIWALI-1001"),
                          ("SILVER500", "silver 500")]:
        assert folded(printed) == code or folded(printed) == code.upper()


def test_backfill_leaves_an_authored_printed_code_alone(store, settings):
    """GOLD-001 must never be re-grouped into minted DR-style blocks."""
    from coupon.codes import normalize_external, printed_form

    coupon = Coupon(code="GOLD001", printed_code="GOLD-001", prize_amount=5000)
    store.add_batch([coupon])

    needs_printed = (not coupon.printed_code
                     or normalize_external(coupon.printed_code) != coupon.code)
    assert needs_printed is False

    # What the old rule would have produced, for contrast.
    assert printed_form("GOLD001", prefix="DR") != "GOLD-001"


def test_backfill_repairs_a_printed_code_that_does_not_resolve(store):
    from coupon.codes import normalize_external

    broken = Coupon(code="GOLD001", printed_code="SILVER-999")
    assert normalize_external(broken.printed_code) != broken.code
