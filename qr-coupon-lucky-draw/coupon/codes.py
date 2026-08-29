"""Generation, formatting and verification of coupon codes.

A code is a short string from an unambiguous alphabet, for example ``K7M2X``.
Its shape is configuration, not a constant:

``COUPON_CODE_LENGTH``
    Total characters. Default 5.
``COUPON_CODE_PREFIX``
    A fixed campaign prefix, counted within the length. Default empty.
``COUPON_CODE_CHECK_CHARS``
    Trailing characters derived from an HMAC of the rest and a server-side
    secret. Default 0.
``COUPON_CODE_GROUP_SIZE``
    Hyphen grouping when the code is printed. Default 0, meaning no hyphens.

**Every character spent on a prefix or a checksum costs a factor of 32 in the
number of codes that can exist.** At the default length of 5 that trade is
usually not worth making: the whole space is 32^5 = 33,554,432, and a single
check character would cut it to about a million. The checksum only buys the
ability to reject a typo without looking in the coupon list; the entropy buys
resistance to somebody guessing a live coupon. On a short code, the entropy
matters more, which is why the default spends all five characters on it.

With no checksum, the coupon list is the only thing that decides whether a
code is real, so :func:`parse` degrades to a shape-and-alphabet check and the
lookup always reaches the store. Rate limiting is then the defence that
matters -- see ``RATE_LIMIT_PER_MINUTE`` and the nginx limit in the deployment
guide.
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
ALPHABET_SIZE = len(ALPHABET)

# Characters a human is likely to type instead of the intended one.
_CONFUSABLES = str.maketrans({"I": "1", "L": "1", "O": "0"})

MAX_LENGTH = 32
_PREFIX_RE = re.compile(r"^[A-Z0-9]{0,8}$")

# A code somebody typed into a spreadsheet can be any shape, but it still has
# to survive being printed, scanned and read back.
_EXTERNAL_MAX = 32


class InvalidCode(ValueError):
    """Raised when a string cannot be a coupon code issued by this system."""


class CodeFormatError(ValueError):
    """Raised when the configured code shape is impossible."""


@dataclass(frozen=True)
class CodeFormat:
    """The shape of every code in a campaign."""

    length: int = 5
    prefix: str = ""
    check_chars: int = 0
    group_size: int = 0

    def __post_init__(self) -> None:
        if not 3 <= self.length <= MAX_LENGTH:
            raise CodeFormatError(
                f"COUPON_CODE_LENGTH must be between 3 and {MAX_LENGTH}, got {self.length}"
            )
        if not _PREFIX_RE.match(self.prefix):
            raise CodeFormatError("COUPON_CODE_PREFIX must be 0-8 characters, A-Z or 0-9")
        if any(ch not in _ALPHABET_INDEX for ch in self.prefix):
            raise CodeFormatError(
                f"COUPON_CODE_PREFIX may only use these characters: {ALPHABET}"
            )
        if self.check_chars < 0:
            raise CodeFormatError("COUPON_CODE_CHECK_CHARS cannot be negative")
        if self.body_length < 1:
            raise CodeFormatError(
                f"a {self.length}-character code with a {len(self.prefix)}-character prefix "
                f"and {self.check_chars} check character(s) leaves no room for randomness"
            )

    @property
    def body_length(self) -> int:
        """Characters of actual randomness."""
        return self.length - len(self.prefix) - self.check_chars

    @property
    def space(self) -> int:
        """How many distinct codes this format can ever produce."""
        return ALPHABET_SIZE ** self.body_length

    def describe(self) -> str:
        parts = [f"{self.length} characters"]
        if self.prefix:
            parts.append(f"prefix {self.prefix!r}")
        parts.append(f"{self.body_length} random")
        parts.append(f"{self.check_chars} check" if self.check_chars else "no checksum")
        parts.append("no hyphens" if not self.group_size else f"grouped by {self.group_size}")
        return ", ".join(parts) + f" -> {self.space:,} possible codes"


def format_from_settings(settings=None) -> CodeFormat:
    """Build the :class:`CodeFormat` described by the environment."""
    if settings is None:
        from .config import get_settings

        settings = get_settings()
    return CodeFormat(
        length=settings.code_length,
        prefix=settings.code_prefix,
        check_chars=settings.code_check_chars,
        group_size=settings.code_group_size,
    )


@dataclass(frozen=True)
class ParsedCode:
    """A code that passed structural and checksum validation."""

    prefix: str
    body: str
    check: str = ""

    @property
    def canonical(self) -> str:
        return f"{self.prefix}{self.body}{self.check}"

    @property
    def display(self) -> str:
        return printed_form(self.canonical)


def check_characters(prefix: str, body: str, count: int, *, secret: str | None = None) -> str:
    """Return ``count`` check characters for ``prefix`` + ``body``."""
    if count <= 0:
        return ""
    from .config import get_settings

    key = (secret if secret is not None else get_settings().code_secret).encode("utf-8")
    digest = hmac.new(key, f"{prefix}{body}".encode("utf-8"), sha256).digest()
    return "".join(ALPHABET[digest[i] % ALPHABET_SIZE] for i in range(count))


def normalize(raw: str) -> str:
    """Fold user input towards the canonical form of a minted code.

    Upper-cases, drops separators and whitespace, and rewrites the characters
    people habitually mistype (``I``/``L`` for ``1``, ``O`` for ``0``). Safe
    only for codes minted from :data:`ALPHABET`, which contains none of those
    letters -- see :func:`normalize_external` for codes written by hand.
    """
    if raw is None:
        return ""
    collapsed = re.sub(r"[^A-Za-z0-9]", "", str(raw)).upper()
    return collapsed.translate(_CONFUSABLES)


def normalize_external(raw: str) -> str:
    """Fold an operator-authored code, WITHOUT the confusable rewriting.

    :func:`normalize` maps O to 0 and L to 1, which is right for codes minted
    from our alphabet -- it never contains those letters, so any sighting is a
    misread. It is destructive for a code somebody wrote themselves:
    ``GOLD01`` would become ``G01D01``. Sheet-authored codes therefore get case
    folding and separator stripping only, and must match exactly.
    """
    return re.sub(r"[^A-Za-z0-9]", "", str(raw or "")).upper()


def is_plausible_external(raw: str) -> bool:
    """True if ``raw`` could be a coupon code somebody authored."""
    folded = normalize_external(raw)
    return 3 <= len(folded) <= _EXTERNAL_MAX


def format_for_print(canonical: str, *, group_size: int = 0) -> str:
    """Render a code for printing, hyphenating every ``group_size`` characters.

    ``group_size=0`` -- the default -- returns the code unchanged. A five
    character code needs no help being read.
    """
    if group_size <= 0 or len(canonical) <= group_size:
        return canonical
    return "-".join(
        canonical[i:i + group_size] for i in range(0, len(canonical), group_size)
    )


def printed_form(canonical: str, *, fmt: CodeFormat | None = None) -> str:
    """The code exactly as it appears on the coupon.

    This is the string a participant reads off the paper, so it is also the
    string every screen and every SMS shows them.
    """
    resolved = fmt if fmt is not None else format_from_settings()
    return format_for_print(canonical, group_size=resolved.group_size)


def parse(raw: str, *, fmt: CodeFormat | None = None, secret: str | None = None) -> ParsedCode:
    """Validate ``raw`` and return its parsed form.

    Raises :class:`InvalidCode` if the string is the wrong length, carries the
    wrong prefix, uses characters we never print, or -- when the format has
    check characters -- fails its checksum.
    """
    resolved = fmt if fmt is not None else format_from_settings()
    candidate = normalize(raw)

    if not candidate:
        raise InvalidCode("empty code")
    if len(candidate) != resolved.length:
        raise InvalidCode(
            f"code must be {resolved.length} characters, got {len(candidate)}"
        )
    if resolved.prefix and not candidate.startswith(resolved.prefix):
        raise InvalidCode("unrecognised code prefix")
    if any(ch not in _ALPHABET_INDEX for ch in candidate):
        raise InvalidCode("code contains characters we never print")

    start = len(resolved.prefix)
    body = candidate[start:start + resolved.body_length]
    check = candidate[start + resolved.body_length:]

    if resolved.check_chars:
        expected = check_characters(
            resolved.prefix, body, resolved.check_chars, secret=secret
        )
        # Constant-time to avoid leaking the checksum a character at a time.
        if not hmac.compare_digest(check, expected):
            raise InvalidCode("code failed its checksum")

    return ParsedCode(prefix=resolved.prefix, body=body, check=check)


def is_valid(raw: str, *, fmt: CodeFormat | None = None, secret: str | None = None) -> bool:
    """``True`` when :func:`parse` would succeed."""
    try:
        parse(raw, fmt=fmt, secret=secret)
    except (InvalidCode, CodeFormatError):
        return False
    return True


def generate(count: int, *, fmt: CodeFormat | None = None, secret: str | None = None,
             exclude: set[str] | None = None) -> list[str]:
    """Return ``count`` distinct canonical codes.

    ``exclude`` should hold the canonical codes already issued, so successive
    print runs cannot collide.
    """
    resolved = fmt if fmt is not None else format_from_settings()
    if count < 1:
        raise ValueError("count must be positive")

    seen = set(exclude or ())
    space = resolved.space
    if count + len(seen) > space:
        raise CodeFormatError(
            f"cannot mint {count:,} more codes: the format allows only {space:,} in total "
            f"and {len(seen):,} are already issued. Increase COUPON_CODE_LENGTH."
        )

    rng = secrets.SystemRandom()
    minted: list[str] = []

    # Retrying on collision makes uniqueness a guarantee rather than a
    # probability. The budget scales with how full the space already is,
    # because near-full spaces need many more attempts per fresh code.
    attempts = 0
    occupancy = (count + len(seen)) / space
    budget = int(count * (20 + 200 * occupancy)) + 1000
    while len(minted) < count:
        attempts += 1
        if attempts > budget:
            raise CodeFormatError(
                f"gave up after {attempts:,} attempts minting {count:,} codes -- the code "
                f"space for this format ({space:,}) is too crowded. Increase "
                "COUPON_CODE_LENGTH or use a new prefix."
            )
        body = "".join(rng.choice(ALPHABET) for _ in range(resolved.body_length))
        canonical = (
            resolved.prefix + body
            + check_characters(resolved.prefix, body, resolved.check_chars, secret=secret)
        )
        if canonical in seen:
            continue
        seen.add(canonical)
        minted.append(canonical)

    return minted


def guess_odds(issued: int, fmt: CodeFormat | None = None) -> float:
    """Probability that one blind guess lands on a live coupon.

    Surfaced by ``generate`` and ``doctor`` so the length of the code can be
    judged against the size of the campaign rather than assumed safe.
    """
    resolved = fmt if fmt is not None else format_from_settings()
    if resolved.space <= 0:
        return 1.0
    return min(1.0, issued / resolved.space)
