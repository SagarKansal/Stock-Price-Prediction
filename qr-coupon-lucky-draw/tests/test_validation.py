"""What the form accepts, and what it must not."""

from __future__ import annotations

import pytest

from coupon.geo import all_districts, districts, is_known_state, states
from coupon.validation import (
    ValidationError,
    clean_district,
    clean_name,
    clean_state,
    mask_mobile,
    normalize_mobile,
    to_e164,
    validate_participant,
)


@pytest.mark.parametrize("raw", [
    "9876543210", "+91 9876543210", "+919876543210", "09876543210",
    "919876543210", "98765 43210", "98765-43210", " 9876543210 ",
])
def test_indian_numbers_normalise_to_ten_digits(raw):
    assert normalize_mobile(raw) == "9876543210"


@pytest.mark.parametrize("raw", [
    "", "abc", "12345", "1234567890", "5876543210", "98765432101234", "9999999999",
])
def test_bad_indian_numbers_are_rejected(raw):
    with pytest.raises(ValidationError):
        normalize_mobile(raw)


def test_repeated_digits_are_rejected():
    with pytest.raises(ValidationError):
        normalize_mobile("8888888888")


def test_any_country_mode_is_lenient():
    assert normalize_mobile("+1 415 555 0123", country="ANY") == "14155550123"


def test_e164_conversion():
    assert to_e164("9876543210") == "+919876543210"
    assert to_e164("+91 9876543210") == "+919876543210"


def test_mobile_masking_hides_the_middle():
    assert mask_mobile("9876543210") == "98XXXXX210"
    assert "6543" not in mask_mobile("9876543210")


@pytest.mark.parametrize("raw,expected", [
    ("  Sagar   Kansal ", "Sagar Kansal"),
    ("S. K. Rao", "S. K. Rao"),
    ("D'Souza", "D'Souza"),
    ("Jean-Pierre", "Jean-Pierre"),
    ("सागर कंसल", "सागर कंसल"),
])
def test_real_names_are_accepted(raw, expected):
    assert clean_name(raw) == expected


@pytest.mark.parametrize("raw", ["", "A", "x" * 61, "<script>alert(1)</script>", "12345"])
def test_bad_names_are_rejected(raw):
    with pytest.raises(ValidationError):
        clean_name(raw)


def test_state_must_be_on_the_list():
    assert clean_state("maharashtra") == "Maharashtra"
    assert clean_state("  TAMIL NADU ") == "Tamil Nadu"
    with pytest.raises(ValidationError):
        clean_state("Atlantis")


def test_district_is_open_but_sane():
    assert clean_district(" pune ") == "pune"
    # A district too new for the bundled list must still get through.
    assert clean_district("Some New District") == "Some New District"
    with pytest.raises(ValidationError):
        clean_district("x" * 61)
    with pytest.raises(ValidationError):
        clean_district("<b>")


def test_the_whole_form_reports_every_error_at_once():
    participant, errors = validate_participant(
        {"mobile": "123", "name": "", "state": "Nowhere", "district": ""}
    )
    assert participant is None
    assert set(errors.errors) == {"mobile", "name", "state", "district"}


def test_a_good_form_validates():
    participant, errors = validate_participant({
        "mobile": "+91 98765 43210",
        "name": "  Priya   Sharma ",
        "state": "karnataka",
        "district": "Bengaluru Urban",
    })
    assert not errors
    assert participant.mobile == "9876543210"
    assert participant.name == "Priya Sharma"
    assert participant.state == "Karnataka"


def test_geo_dataset_is_complete_enough():
    assert len(states()) == 36                      # 28 states + 8 UTs
    assert "Maharashtra" in states()
    assert "Pune" in districts("Maharashtra")
    assert districts("Nowhere") == []
    assert len(all_districts()) > 600
    assert is_known_state("delhi") == "Delhi"
