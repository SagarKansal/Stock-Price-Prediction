"""Validation and normalisation of what a participant types into the form."""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field

from .geo import is_known_state

_DIGITS = re.compile(r"\D+")

# Punctuation that appears in real names and place names: S. K. Rao, D'Souza,
# Jean-Pierre. ZWJ/ZWNJ are included because Indic scripts use them to control
# conjunct forms, and a name typed on an Indic keyboard can legitimately carry
# them.
_NAME_PUNCTUATION = set(" .'\u2019-\u200c\u200d")


def _looks_like_a_name(value: str) -> bool:
    r"""True for a plausible person or place name in any script.

    A regex over ``\w`` is not enough here: in Devanagari, Tamil, Bengali and
    the rest the vowel signs are combining marks, which ``\w`` does not match,
    so a perfectly ordinary name would be rejected. Testing Unicode categories
    directly lets सागर कंसल through while still rejecting digits, angle brackets
    and other markup.
    """
    if not value:
        return False
    if unicodedata.category(value[0])[0] != "L":
        return False
    for char in value:
        # L* = letters, M* = combining marks (matras, nuktas, viramas).
        if unicodedata.category(char)[0] in {"L", "M"}:
            continue
        if char in _NAME_PUNCTUATION:
            continue
        return False
    return True


NAME_MAX = 60
PLACE_MAX = 60


class ValidationError(ValueError):
    """A single field failed validation."""

    def __init__(self, field_name: str, message: str) -> None:
        super().__init__(message)
        self.field = field_name
        self.message = message


@dataclass
class Participant:
    mobile: str
    name: str
    state: str
    district: str


@dataclass
class FormErrors:
    errors: dict[str, str] = field(default_factory=dict)

    def add(self, field_name: str, message: str) -> None:
        self.errors.setdefault(field_name, message)

    def __bool__(self) -> bool:
        return bool(self.errors)

    def get(self, field_name: str) -> str:
        return self.errors.get(field_name, "")


def _collapse_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def normalize_mobile(raw: str, *, country: str = "IN") -> str:
    """Return a bare national mobile number, or raise :class:`ValidationError`.

    Accepts the shapes people actually type -- ``+91 98765 43210``,
    ``098765-43210``, ``9876543210`` -- and returns ``9876543210``.
    """
    digits = _DIGITS.sub("", raw or "")
    if not digits:
        raise ValidationError("mobile", "Please enter your mobile number.")

    if country == "IN":
        # Shed the country code and the trunk prefix, in that order.
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        elif len(digits) == 13 and digits.startswith("091"):
            digits = digits[3:]
        elif len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]

        if len(digits) != 10:
            raise ValidationError("mobile", "Enter the 10-digit mobile number.")
        if digits[0] not in "6789":
            raise ValidationError("mobile", "An Indian mobile number starts with 6, 7, 8 or 9.")
        if len(set(digits)) == 1:
            raise ValidationError("mobile", "That does not look like a real mobile number.")
        return digits

    if not 6 <= len(digits) <= 15:
        raise ValidationError("mobile", "Enter a valid mobile number.")
    return digits


def to_e164(mobile: str, *, country: str = "IN") -> str:
    """Return the number in E.164 form, which is what SMS gateways want."""
    digits = _DIGITS.sub("", mobile or "")
    if country == "IN" and len(digits) == 10:
        return f"+91{digits}"
    if digits.startswith("00"):
        return f"+{digits[2:]}"
    return f"+{digits}"


def mask_mobile(mobile: str) -> str:
    """``9876543210`` -> ``98XXXXX210``, for anything shown back on screen."""
    digits = _DIGITS.sub("", mobile or "")
    if len(digits) < 6:
        return "X" * len(digits)
    return f"{digits[:2]}{'X' * (len(digits) - 5)}{digits[-3:]}"


def display_mobile(mobile: str, mode: str = "full") -> str:
    """Render a claimant's number for a page a stranger might be looking at.

    ``full`` is the default because the point of the already-claimed page is
    to let the holder of a coupon see who claimed it. That does mean anyone
    who picks up a spent coupon can read a real mobile number, so ``masked``
    and ``hidden`` are there for campaigns that would rather not.
    """
    digits = _DIGITS.sub("", mobile or "")
    if not digits:
        return ""
    if mode == "hidden":
        return ""
    if mode == "masked":
        return mask_mobile(digits)
    return digits


def clean_name(raw: str) -> str:
    value = _collapse_whitespace(unicodedata.normalize("NFC", raw or ""))
    if len(value) < 2:
        raise ValidationError("name", "Please enter your full name.")
    if len(value) > NAME_MAX:
        raise ValidationError("name", f"Please keep the name under {NAME_MAX} characters.")
    if not _looks_like_a_name(value):
        raise ValidationError("name", "Please use letters only in the name.")
    return value


def clean_state(raw: str) -> str:
    value = _collapse_whitespace(raw or "")
    if not value:
        raise ValidationError("state", "Please choose your state.")
    canonical = is_known_state(value)
    if not canonical:
        raise ValidationError("state", "Please choose a state from the list.")
    return canonical


def clean_district(raw: str) -> str:
    value = _collapse_whitespace(raw or "")
    if len(value) < 2:
        raise ValidationError("district", "Please enter your district.")
    if len(value) > PLACE_MAX:
        raise ValidationError("district", f"Please keep the district under {PLACE_MAX} characters.")
    if not _looks_like_a_name(value):
        raise ValidationError("district", "Please use letters only in the district.")
    return value


def validate_participant(form: dict, *, country: str = "IN") -> tuple[Participant | None, FormErrors]:
    """Validate the whole form, collecting every error rather than the first.

    Returning all the errors at once matters here: the audience is filling this
    in on a phone, and a form that rejects one field per round trip is a form
    people abandon.
    """
    errors = FormErrors()
    values: dict[str, str] = {}

    for field_name, cleaner in (
        ("mobile", lambda v: normalize_mobile(v, country=country)),
        ("name", clean_name),
        ("state", clean_state),
        ("district", clean_district),
    ):
        try:
            values[field_name] = cleaner(form.get(field_name, ""))
        except ValidationError as exc:
            errors.add(exc.field, exc.message)

    if errors:
        return None, errors
    return Participant(**values), errors
