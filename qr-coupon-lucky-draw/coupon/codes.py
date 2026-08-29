"""Generation, formatting and verification of coupon codes.

A coupon code looks like ``DR-K7M2-9XQF-3A`` and is made of three parts:

``DR``
    A batch/campaign prefix, so codes from different print runs are
    distinguishable by eye.
``K7M29XQF``
    Eight characters of cryptographic randomness (40 bits, ~1.1e12
    possibilities) drawn from a Crockford-style alphabet.
``3A``
    Two check characters derived from an HMAC of the rest of the code and a
    server-side secret.

The check characters are what make a scanned or hand-typed code cheap to
reject: a typo or a made-up code fails the HMAC locally, so it never costs a
Google Sheets API call. They are *not* a substitute for the code actually
existing in the coupon list -- an attacker who learned the secret still could
not tell which codes were printed, and an attacker who did not is left
guessing at 40 bits.
"""

from __future__ import annotations

import hmac
import re
import secrets
from dataclasses import dataclass
from hashlib import sha256

# Crockford base32: the full alphabet minus I, L, O and U. Dropping I/L/O
# removes the classic 1/l and 0/O reading errors; dropping U keeps accidental
# profanity out of printed codes.
ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
_ALPHABET_INDEX = {ch: i for i, ch in enumerate(ALPHABET)}

# Characters a human is likely to type instead of the intended one.
_CONFUSABLES = str.maketrans({"I": "1", "L": "1", "O": "0"})

BODY_LENGTH = 8
CHECK_LENGTH = 2
_PREFIX_RE = re.compile(r"^[A-Z0-9]{1,6}$")


class InvalidCode(ValueError):
    """Raised when a string cannot be a coupon code issued by this system."""


@dataclass(frozen=True)
class ParsedCode:
    """A code that passed structural and checksum validation."""

    prefix: str
    body: str

    @property
    def canonical(self) -> str:
        """The code as stored and compared -- no hyphens, upper case."""
        return f"{self.prefix}{self.body}{check_characters(self.prefix, self.body)}"

    @property
    def display(self) -> str:
        """The code as printed on a coupon, in readable groups."""
        return format_for_print(self.canonical, self.prefix)


def check_characters(prefix: str, body: str, *, secret: str | None = None) -> str:
    """Return the check characters for ``prefix`` + ``body``."""
    from .config import get_settings

    key = (secret if secret is not None else get_settings().code_secret).encode("utf-8")
    digest = hmac.new(key, f"{prefix}{body}".encode("utf-8"), sha256).digest()
    return "".join(ALPHABET[digest[i] % len(ALPHABET)] for i in range(CHECK_LENGTH))


def normalize(raw: str) -> str:
    """Fold user input towards the canonical form of a code.

    Upper-cases, drops separators and whitespace, and rewrites the characters
    people habitually mistype (``I``/``L`` for ``1``, ``O`` for ``0``). It does
    not validate -- an unparseable string still comes back, just tidier.
    """
    if raw is None:
        return ""
    collapsed = re.sub(r"[^A-Za-z0-9]", "", str(raw)).upper()
    return collapsed.translate(_CONFUSABLES)


# A code somebody typed into a spreadsheet can be any shape, but it still has
# to survive being printed, scanned and read back.
_EXTERNAL_MAX = 32


def normalize_external(raw: str) -> str:
    """Fold an operator-authored code, WITHOUT the confusable rewriting.

    :func:`normalize` maps O to 0 and L to 1, which is right for codes minted
    from our alphabet -- it never contains those letters, so any sighting is a
    misread. It is destructive for a code somebody wrote themselves:
    ``GOLD-001`` would become ``G01D001``. Sheet-authored codes therefore get
    case folding and separator stripping only, and must match exactly.
    """
    return re.sub(r"[^A-Za-z0-9]", "", str(raw or "")).upper()


def is_plausible_external(raw: str) -> bool:
    """True if ``raw`` could be a coupon code somebody authored.

    Deliberately permissive -- the coupon list is what decides validity. This
    only rejects what could never be a code, so obvious junk costs no lookup.
    """
    folded = normalize_external(raw)
    return 3 <= len(folded) <= _EXTERNAL_MAX


def format_for_print(canonical: str, prefix: str) -> str:
    """Render ``canonical`` as ``PREFIX-XXXX-XXXX-CC`` for printing."""
    rest = canonical[len(prefix):]
    return "-".join([prefix, rest[0:4], rest[4:8], rest[8:]])


def printed_form(canonical: str, *, prefix: str | None = None) -> str:
    """The code exactly as it appears on the coupon: ``DR-5EMX-FC07-9J``.

    This is the string a participant reads off the paper, so it is also the
    string every screen and every SMS shows them. The hyphens are display-only
    -- :func:`normalize` strips them -- but a person comparing their coupon to
    their phone should not have to work out that ``DR5EMXFC079J`` is the same
    thing.
    """
    from .config import get_settings

    used_prefix = (prefix if prefix is not None else get_settings().code_prefix).upper()
    return format_for_print(canonical, used_prefix)


def parse(raw: str, *, prefix: str | None = None, secret: str | None = None) -> ParsedCode:
    """Validate ``raw`` and return its parsed form.

    Raises :class:`InvalidCode` if the string is the wrong shape, carries the
    wrong prefix, or fails its checksum.
    """
    from .config import get_settings

    expected_prefix = (prefix if prefix is not None else get_settings().code_prefix).upper()
    candidate = normalize(raw)

    if not candidate:
        raise InvalidCode("empty code")
    if not candidate.startswith(expected_prefix):
        raise InvalidCode("unrecognised code prefix")

    remainder = candidate[len(expected_prefix):]
    if len(remainder) != BODY_LENGTH + CHECK_LENGTH:
        raise InvalidCode("code is the wrong length")

    body, check = remainder[:BODY_LENGTH], remainder[BODY_LENGTH:]
    if any(ch not in _ALPHABET_INDEX for ch in remainder):
        raise InvalidCode("code contains characters we never print")

    expected_check = check_characters(expected_prefix, body, secret=secret)
    # Constant-time to avoid leaking the checksum a character at a time.
    if not hmac.compare_digest(check, expected_check):
        raise InvalidCode("code failed its checksum")

    return ParsedCode(prefix=expected_prefix, body=body)


def is_valid(raw: str, *, prefix: str | None = None, secret: str | None = None) -> bool:
    """``True`` when :func:`parse` would succeed."""
    try:
        parse(raw, prefix=prefix, secret=secret)
    except InvalidCode:
        return False
    return True


def _random_body(rng: secrets.SystemRandom) -> str:
    return "".join(rng.choice(ALPHABET) for _ in range(BODY_LENGTH))


def generate(count: int, *, prefix: str | None = None, secret: str | None = None,
             exclude: set[str] | None = None) -> list[str]:
    """Return ``count`` distinct canonical codes.

    ``exclude`` should hold the canonical codes already issued, so that
    successive print runs cannot collide.
    """
    from .config import get_settings

    if count < 1:
        raise ValueError("count must be positive")
    used_prefix = (prefix if prefix is not None else get_settings().code_prefix).upper()
    if not _PREFIX_RE.match(used_prefix):
        raise ValueError("prefix must be 1-6 characters, A-Z or 0-9")
    if any(ch not in _ALPHABET_INDEX for ch in used_prefix):
        raise ValueError(f"prefix may only use these characters: {ALPHABET}")

    seen = set(exclude or ())
    rng = secrets.SystemRandom()
    minted: list[str] = []

    # 40 bits of body means collisions are vanishingly rare, but retrying is
    # cheap and makes uniqueness a guarantee rather than a probability.
    attempts = 0
    budget = count * 20 + 100
    while len(minted) < count:
        attempts += 1
        if attempts > budget:
            raise RuntimeError(
                "could not mint enough distinct codes -- the code space for this "
                "prefix is close to exhausted, use a new prefix"
            )
        body = _random_body(rng)
        canonical = f"{used_prefix}{body}{check_characters(used_prefix, body, secret=secret)}"
        if canonical in seen:
            continue
        seen.add(canonical)
        minted.append(canonical)

    return minted
