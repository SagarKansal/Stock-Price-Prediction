"""Configuration, read once from the environment.

Every knob has a default that works for local development, so ``flask run``
succeeds on a fresh checkout with no setup. The two settings that *must* be
overridden before printing real coupons are ``COUPON_CODE_SECRET`` and
``COUPON_PUBLIC_BASE_URL`` -- the first because it fixes the checksum of every
code you print, the second because it is baked into the QR image.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_ROOT.parent

DEV_CODE_SECRET = "dev-only-insecure-secret-change-me"


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _env_bool(name: str, default: bool = False) -> bool:
    raw = _env(name).lower()
    if not raw:
        return default
    return raw in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = _env(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer, got {raw!r}") from exc


@dataclass(frozen=True)
class Settings:
    # --- codes -----------------------------------------------------------
    code_prefix: str = "DR"
    code_secret: str = DEV_CODE_SECRET
    # Accept coupon codes that were written into the sheet by hand rather than
    # minted here. With this on, the checksum stops being a gate and becomes
    # only a fast path: a code that fails it is still looked up in the list.
    accept_external_codes: bool = False

    # --- public URLs -----------------------------------------------------
    # The QR image encodes f"{public_base_url}/c/{code}".
    public_base_url: str = "http://localhost:5000"

    # --- storage ---------------------------------------------------------
    # "sheets" keeps the coupon list in Google Sheets; "sqlite" keeps
    # everything local, which is what the tests and a laptop demo use.
    store_backend: str = "sqlite"
    ledger_path: Path = field(default_factory=lambda: PROJECT_ROOT / "data" / "ledger.db")
    google_credentials_file: str = ""
    google_sheet_id: str = ""
    google_worksheet: str = "Coupons"

    # --- SMS -------------------------------------------------------------
    sms_provider: str = "console"          # console | msg91 | twilio
    sms_template: str = (
        "Congratulations {name}! Coupon {code} has won you Rs.{amount}. "
        "Our team will contact you on {mobile} to hand over your prize."
    )
    sms_consolation_template: str = (
        "Thank you {name}! Coupon {code} did not win a cash prize this time. "
        "Better luck next time."
    )
    msg91_auth_key: str = ""
    msg91_sender_id: str = ""
    msg91_template_id: str = ""
    msg91_route: str = "4"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""
    sms_timeout_seconds: int = 15

    # --- draw ------------------------------------------------------------
    # Amount written against codes not covered by an explicit prize plan.
    # 0 means "no cash prize", which still gets a (consolation) SMS.
    default_prize_amount: int = 0
    currency_symbol: str = "₹"

    # --- web -------------------------------------------------------------
    flask_secret_key: str = "dev-only-flask-secret"
    admin_token: str = ""
    campaign_name: str = "Lucky Draw"
    support_phone: str = ""
    mobile_country: str = "IN"             # IN enforces a 10-digit [6-9] number
    # What the already-claimed page reveals about who claimed the coupon:
    # "full" shows the number, "masked" shows 98XXXXX210, "hidden" shows none.
    claimed_mobile_display: str = "full"
    rate_limit_per_minute: int = 12
    trust_proxy_headers: bool = False

    @property
    def uses_sheets(self) -> bool:
        return self.store_backend == "sheets"

    def problems(self) -> list[str]:
        """Return the configuration mistakes that matter in production."""
        issues: list[str] = []
        if self.code_secret == DEV_CODE_SECRET:
            issues.append(
                "COUPON_CODE_SECRET is still the development default -- codes "
                "printed with it can be forged by anyone reading this repo."
            )
        if self.flask_secret_key == "dev-only-flask-secret":
            issues.append("FLASK_SECRET_KEY is still the development default.")
        if self.public_base_url.startswith("http://localhost"):
            issues.append(
                "COUPON_PUBLIC_BASE_URL still points at localhost -- QR codes "
                "generated now would only work on this machine."
            )
        if self.uses_sheets and not self.google_sheet_id:
            issues.append("COUPON_STORE=sheets but GOOGLE_SHEET_ID is unset.")
        if self.uses_sheets and not self.google_credentials_file:
            issues.append("COUPON_STORE=sheets but GOOGLE_CREDENTIALS_FILE is unset.")
        if self.sms_provider == "msg91" and not self.msg91_auth_key:
            issues.append("SMS_PROVIDER=msg91 but MSG91_AUTH_KEY is unset.")
        if self.sms_provider == "twilio" and not (
            self.twilio_account_sid and self.twilio_auth_token and self.twilio_from_number
        ):
            issues.append("SMS_PROVIDER=twilio but the Twilio credentials are incomplete.")
        if not self.admin_token:
            issues.append("COUPON_ADMIN_TOKEN is unset -- /admin endpoints stay disabled.")
        return issues


def load_settings() -> Settings:
    """Build a :class:`Settings` from the current environment."""
    ledger = _env("COUPON_LEDGER_PATH")
    return Settings(
        code_prefix=(_env("COUPON_CODE_PREFIX", "DR") or "DR").upper(),
        code_secret=_env("COUPON_CODE_SECRET", DEV_CODE_SECRET) or DEV_CODE_SECRET,
        accept_external_codes=_env_bool("COUPON_ACCEPT_EXTERNAL_CODES", False),
        public_base_url=_env("COUPON_PUBLIC_BASE_URL", "http://localhost:5000").rstrip("/"),
        store_backend=(_env("COUPON_STORE", "sqlite") or "sqlite").lower(),
        ledger_path=Path(ledger) if ledger else PROJECT_ROOT / "data" / "ledger.db",
        google_credentials_file=_env("GOOGLE_CREDENTIALS_FILE"),
        google_sheet_id=_env("GOOGLE_SHEET_ID"),
        google_worksheet=_env("GOOGLE_WORKSHEET", "Coupons") or "Coupons",
        sms_provider=(_env("SMS_PROVIDER", "console") or "console").lower(),
        sms_template=_env("SMS_TEMPLATE") or Settings.sms_template,
        sms_consolation_template=(
            _env("SMS_CONSOLATION_TEMPLATE") or Settings.sms_consolation_template
        ),
        msg91_auth_key=_env("MSG91_AUTH_KEY"),
        msg91_sender_id=_env("MSG91_SENDER_ID"),
        msg91_template_id=_env("MSG91_TEMPLATE_ID"),
        msg91_route=_env("MSG91_ROUTE", "4") or "4",
        twilio_account_sid=_env("TWILIO_ACCOUNT_SID"),
        twilio_auth_token=_env("TWILIO_AUTH_TOKEN"),
        twilio_from_number=_env("TWILIO_FROM_NUMBER"),
        sms_timeout_seconds=_env_int("SMS_TIMEOUT_SECONDS", 15),
        default_prize_amount=_env_int("DEFAULT_PRIZE_AMOUNT", 0),
        currency_symbol=_env("CURRENCY_SYMBOL", "₹") or "₹",
        flask_secret_key=_env("FLASK_SECRET_KEY", "dev-only-flask-secret") or "dev-only-flask-secret",
        admin_token=_env("COUPON_ADMIN_TOKEN"),
        campaign_name=_env("CAMPAIGN_NAME", "Lucky Draw") or "Lucky Draw",
        support_phone=_env("SUPPORT_PHONE"),
        mobile_country=(_env("MOBILE_COUNTRY", "IN") or "IN").upper(),
        claimed_mobile_display=(_env("CLAIMED_MOBILE_DISPLAY", "full") or "full").lower(),
        rate_limit_per_minute=_env_int("RATE_LIMIT_PER_MINUTE", 12),
        trust_proxy_headers=_env_bool("TRUST_PROXY_HEADERS", False),
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings for the life of the process."""
    return load_settings()


def reset_settings_cache() -> None:
    """Drop the cache. Used by the tests when they patch the environment."""
    get_settings.cache_clear()
