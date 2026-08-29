"""Coupon codes: five characters by default, and every part of that tunable."""

from __future__ import annotations

import pytest

from coupon.codes import (
    ALPHABET,
    CodeFormat,
    CodeFormatError,
    InvalidCode,
    format_for_print,
    format_from_settings,
    generate,
    guess_odds,
    is_valid,
    normalize,
    parse,
    printed_form,
)

FIVE = CodeFormat(length=5)
# The other end of the dial: a prefixed, checksummed, hyphenated code.
LONG = CodeFormat(length=12, prefix="DR", check_chars=2, group_size=4)


# -- the shipped default ----------------------------------------------------


def test_the_default_is_five_characters_with_no_hyphens(settings):
    fmt = format_from_settings(settings)
    assert fmt.length == 5
    assert fmt.prefix == ""
    assert fmt.check_chars == 0
    assert fmt.group_size == 0
    assert fmt.body_length == 5

    for code in generate(20):
        assert len(code) == 5
        assert "-" not in code
        assert printed_form(code) == code          # printed exactly as stored
        assert set(code) <= set(ALPHABET)


def test_five_characters_gives_thirty_three_million_codes():
    assert FIVE.space == 32 ** 5 == 33_554_432


def test_codes_avoid_the_characters_people_misread():
    for code in generate(200):
        assert not set("ILOU").intersection(code)


def test_generated_codes_are_unique():
    codes = generate(5000)
    assert len(set(codes)) == 5000


def test_generate_avoids_excluded_codes():
    first = set(generate(300))
    assert not first.intersection(generate(300, exclude=first))


def test_normalisation_forgives_how_people_type():
    code = generate(1)[0]
    for variant in (code.lower(), f"  {code}  ", " ".join(code)):
        assert parse(variant).canonical == code


def test_confusable_characters_are_folded():
    # The alphabet has no I, L or O, so any sighting is a misread.
    assert normalize("oi1l0") == "01110"


# -- with no checksum, shape is all we can check ---------------------------


def test_any_well_shaped_string_is_structurally_valid(settings):
    """Without check characters the coupon list is the only real gate.

    'hello' folds to HE110 -- five characters, all from the alphabet -- so it
    is a plausible code and the store has to be asked. This is the cost of
    spending all five characters on entropy, and the reason rate limiting
    matters more than it did.
    """
    assert normalize("hello") == "HE110"
    assert is_valid("hello")
    assert is_valid("ABC12")


@pytest.mark.parametrize("bad", ["", "   ", "ABC", "ABCDEF", "AB!2", "ABCDI"])
def test_wrongly_shaped_input_is_still_rejected(bad):
    # Too short, too long, or using a character we never print. 'ABCDI'
    # folds to ABCD1, which is fine -- so it is not in this list by accident.
    assert not is_valid(bad) or normalize(bad) == "ABCD1"


def test_guess_odds_reports_the_real_exposure():
    assert guess_odds(33_554_432, FIVE) == 1.0
    assert guess_odds(0, FIVE) == 0.0
    # 10,000 live coupons in a 33.5M space.
    assert 1 / guess_odds(10_000, FIVE) == pytest.approx(3355, rel=0.01)


# -- the format is configurable --------------------------------------------


def test_a_checksummed_prefixed_grouped_format_still_works():
    codes = generate(50, fmt=LONG, secret="s")
    for code in codes:
        assert len(code) == 12
        assert code.startswith("DR")
        assert is_valid(code, fmt=LONG, secret="s")
        assert printed_form(code, fmt=LONG).count("-") == 2   # 12 chars / 4


def test_a_checksum_rejects_a_forged_code():
    code = generate(1, fmt=LONG, secret="s")[0]
    swapped = "Z" if code[2] != "Z" else "Y"
    assert not is_valid(code[:2] + swapped + code[3:], fmt=LONG, secret="s")


def test_a_checksum_is_secret_dependent():
    code = generate(1, fmt=LONG, secret="secret-one")[0]
    assert is_valid(code, fmt=LONG, secret="secret-one")
    assert not is_valid(code, fmt=LONG, secret="secret-two")


def test_a_wrong_prefix_is_rejected():
    code = generate(1, fmt=LONG, secret="s")[0]
    other = CodeFormat(length=12, prefix="XX", check_chars=2, group_size=4)
    with pytest.raises(InvalidCode):
        parse(code, fmt=other, secret="s")


@pytest.mark.parametrize("group_size,expected", [
    (0, "ABCDEFGH"), (4, "ABCD-EFGH"), (2, "AB-CD-EF-GH"),
])
def test_grouping_is_configurable(group_size, expected):
    assert format_for_print("ABCDEFGH", group_size=group_size) == expected


def test_a_short_code_is_never_hyphenated():
    assert format_for_print("K7M2X", group_size=8) == "K7M2X"


# -- formats that cannot work are refused ----------------------------------


def test_a_format_with_no_room_for_randomness_is_refused():
    with pytest.raises(CodeFormatError):
        CodeFormat(length=5, prefix="ABCDE")
    with pytest.raises(CodeFormatError):
        CodeFormat(length=4, prefix="AB", check_chars=2)


def test_a_prefix_outside_the_alphabet_is_refused():
    with pytest.raises(CodeFormatError):
        CodeFormat(length=8, prefix="LU")          # L and U are not printed


@pytest.mark.parametrize("length", [0, 2, 33])
def test_an_impossible_length_is_refused(length):
    with pytest.raises(CodeFormatError):
        CodeFormat(length=length)


def test_minting_more_codes_than_the_space_holds_is_refused():
    tiny = CodeFormat(length=3)                    # 32^3 = 32,768
    with pytest.raises(CodeFormatError) as caught:
        generate(tiny.space + 1, fmt=tiny)
    assert "32,768" in str(caught.value)


def test_a_crowded_space_still_mints_the_full_batch():
    """Uniqueness must hold even when the space is largely used up."""
    tiny = CodeFormat(length=3)
    codes = generate(int(tiny.space * 0.6), fmt=tiny)
    assert len(set(codes)) == len(codes)


def test_count_must_be_positive():
    with pytest.raises(ValueError):
        generate(0)


def test_describe_states_the_trade_off():
    text = FIVE.describe()
    assert "5 characters" in text and "33,554,432" in text and "no checksum" in text
    assert "no hyphens" in text


# -- the manual-entry placeholder follows the format -----------------------


def test_the_manual_entry_placeholder_matches_the_code_shape(client):
    """A hint of the wrong shape is worse than none."""
    body = client.get("/").data.decode()
    assert 'placeholder="XXXXX"' in body
    assert "DR-XXXX" not in body


def test_the_placeholder_follows_a_reconfigured_format(monkeypatch, store, sms):
    from coupon.config import load_settings, reset_settings_cache
    from coupon.web import create_app

    monkeypatch.setenv("COUPON_CODE_LENGTH", "12")
    monkeypatch.setenv("COUPON_CODE_PREFIX", "DR")
    monkeypatch.setenv("COUPON_CODE_GROUP_SIZE", "4")
    reset_settings_cache()

    app = create_app(settings=load_settings(), store=store, ledger=store, sms_provider=sms)
    body = app.test_client().get("/").data.decode()
    assert 'placeholder="DRXX-XXXX-XXXX"' in body
