"""Codes must be unique, unguessable, typo-tolerant and stable."""

from __future__ import annotations

import pytest

from coupon.codes import (
    ALPHABET,
    InvalidCode,
    format_for_print,
    generate,
    is_valid,
    normalize,
    parse,
)

SECRET = "test-secret-do-not-use-in-production"


def test_generated_codes_validate():
    for code in generate(50):
        assert is_valid(code)


def test_generated_codes_are_unique():
    codes = generate(2000)
    assert len(set(codes)) == 2000


def test_generate_avoids_excluded_codes():
    first = set(generate(100))
    second = generate(100, exclude=first)
    assert not first.intersection(second)


def test_codes_use_only_the_unambiguous_alphabet():
    for code in generate(30):
        assert set(code[2:]) <= set(ALPHABET)
        # The characters people misread must never be printed.
        assert not set("ILOU").intersection(code[2:])


def test_checksum_rejects_a_forged_code():
    real = generate(1)[0]
    # Flip one character of the random body; the check characters no longer fit.
    body_char = real[2]
    replacement = "Z" if body_char != "Z" else "Y"
    forged = real[:2] + replacement + real[3:]
    assert not is_valid(forged)


def test_checksum_is_secret_dependent():
    code = generate(1, secret="secret-one")[0]
    assert is_valid(code, secret="secret-one")
    assert not is_valid(code, secret="secret-two")


def test_normalisation_forgives_how_people_type():
    code = generate(1)[0]
    printed = format_for_print(code, "DR")
    for variant in (
        printed,
        printed.lower(),
        printed.replace("-", " "),
        printed.replace("-", ""),
        f"  {printed}  ",
    ):
        assert parse(variant).canonical == code


def test_confusable_characters_are_folded():
    assert normalize("dr-o1il-0000") == "DR01110000"


def test_wrong_prefix_is_rejected():
    code = generate(1, prefix="DR")[0]
    with pytest.raises(InvalidCode):
        parse(code, prefix="XX")


@pytest.mark.parametrize("bad", ["", "   ", "DR", "DR-1234", "DR-1234-5678-90-11", "hello"])
def test_malformed_input_is_rejected(bad):
    assert not is_valid(bad)


def test_display_format_is_grouped():
    code = generate(1)[0]
    printed = format_for_print(code, "DR")
    assert printed.count("-") == 3
    parts = printed.split("-")
    assert [len(p) for p in parts] == [2, 4, 4, 2]


def test_parse_round_trips_display_form():
    code = generate(1)[0]
    assert parse(code).display == format_for_print(code, "DR")


def test_prefix_must_use_the_printable_alphabet():
    with pytest.raises(ValueError):
        generate(1, prefix="LU")     # U is not in the alphabet
    with pytest.raises(ValueError):
        generate(1, prefix="TOOLONGX")


def test_count_must_be_positive():
    with pytest.raises(ValueError):
        generate(0)
