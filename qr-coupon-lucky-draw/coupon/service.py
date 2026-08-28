"""The claim flow, independent of how it is triggered.

The web layer and the CLI both go through :class:`CouponService`, so the rules
about who may claim what live in exactly one place.

The ordering inside :meth:`CouponService.claim` is deliberate:

1. **Reserve first.** The SQLite ledger flips the coupon to ``CLAIMED`` with a
   conditional update. Everything after this point runs only for the one
   request that won that race.
2. **Then send the SMS.** Sending before reserving would text two people about
   the same coupon under a double scan.
3. **Then mirror to Google Sheets.** Sheets is the report, not the lock. If it
   is unreachable the claim still stands, the row is flagged unsynced, and
   ``cli.py sync-claims`` pushes it later.

The cost of that ordering is a claim whose SMS fails: the participant has won
and the ledger says so, but no message went out. That is recoverable
(``cli.py resend-sms``) in a way that a double-paid prize is not.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from .codes import InvalidCode, parse
from .config import Settings
from .sms import SmsProvider, SmsResult, render_message
from .store import (
    AVAILABLE,
    CLAIMED,
    SMS_FAILED,
    SMS_SENT,
    VOID,
    Coupon,
    CouponStore,
    SQLiteStore,
    StoreError,
)
from .validation import Participant

logger = logging.getLogger(__name__)

# Outcomes of looking a code up.
INVALID = "INVALID"          # not a code this system ever printed
UNKNOWN = "UNKNOWN"          # well-formed, but not in the coupon list
OK = "OK"                    # available to claim
ALREADY_CLAIMED = "ALREADY_CLAIMED"
VOIDED = "VOIDED"


@dataclass
class LookupResult:
    status: str
    coupon: Coupon | None = None
    code: str = ""

    @property
    def claimable(self) -> bool:
        return self.status == OK


@dataclass
class ClaimResult:
    status: str
    coupon: Coupon | None = None
    sms: SmsResult | None = None
    sheet_synced: bool = True

    @property
    def ok(self) -> bool:
        return self.status == OK


class CouponService:
    """Coordinates the ledger, the coupon store and the SMS gateway."""

    def __init__(self, *, settings: Settings, store: CouponStore, ledger: SQLiteStore,
                 sms_provider: SmsProvider) -> None:
        self.settings = settings
        self.store = store
        self.ledger = ledger
        self.sms = sms_provider

    @property
    def _mirrors_to_store(self) -> bool:
        """True when the store is a separate system that needs mirroring."""
        return self.store is not self.ledger

    # -- lookup -------------------------------------------------------------

    def canonical(self, raw_code: str) -> str | None:
        """Return the canonical code for user input, or ``None`` if malformed."""
        try:
            return parse(
                raw_code, prefix=self.settings.code_prefix, secret=self.settings.code_secret
            ).canonical
        except InvalidCode:
            return None

    def lookup(self, raw_code: str, *, count_scan: bool = False) -> LookupResult:
        """Resolve a scanned or typed code to its current state."""
        code = self.canonical(raw_code)
        if code is None:
            return LookupResult(status=INVALID)

        coupon = self.ledger.get(code)
        if coupon is None and self._mirrors_to_store:
            # The ledger is a cache of the printed list; a fresh deployment
            # may not have pulled this batch yet.
            try:
                remote = self.store.get(code)
            except StoreError:
                logger.exception("could not reach the coupon store for %s", code)
                remote = None
            if remote is not None:
                self.ledger.upsert(remote)
                coupon = self.ledger.get(code)

        if coupon is None:
            return LookupResult(status=UNKNOWN, code=code)

        if count_scan:
            self.ledger.record_scan(code)
            coupon = self.ledger.get(code) or coupon

        if coupon.status == VOID:
            return LookupResult(status=VOIDED, coupon=coupon, code=code)
        if coupon.status == CLAIMED:
            return LookupResult(status=ALREADY_CLAIMED, coupon=coupon, code=code)
        return LookupResult(status=OK, coupon=coupon, code=code)

    # -- claim --------------------------------------------------------------

    def claim(self, raw_code: str, participant: Participant) -> ClaimResult:
        """Register a claim and text the participant their prize."""
        found = self.lookup(raw_code)
        if found.status != OK or found.coupon is None:
            return ClaimResult(status=found.status, coupon=found.coupon)

        code = found.coupon.code
        claimed = self.ledger.try_claim(
            code,
            mobile=participant.mobile,
            name=participant.name,
            state=participant.state,
            district=participant.district,
        )
        if claimed is None:
            # Lost the race, or the coupon was voided in between. Report the
            # state it actually ended in.
            current = self.lookup(code)
            return ClaimResult(
                status=current.status if current.status != OK else ALREADY_CLAIMED,
                coupon=current.coupon,
            )

        sms_result = self._send_prize_sms(claimed)
        self.ledger.set_sms_result(
            code, SMS_SENT if sms_result.ok else SMS_FAILED, sms_result.reference
        )
        claimed = self.ledger.get(code) or claimed

        synced = self._mirror(claimed)
        return ClaimResult(status=OK, coupon=claimed, sms=sms_result, sheet_synced=synced)

    def _send_prize_sms(self, coupon: Coupon) -> SmsResult:
        message = render_message(
            self.settings,
            name=coupon.name,
            code=coupon.code,
            amount=coupon.prize_amount,
            mobile=coupon.mobile,
        )
        try:
            return self.sms.send(to=coupon.mobile, message=message)
        except Exception as exc:  # a broken gateway must not lose the claim
            logger.exception("SMS provider raised for %s", coupon.code)
            return SmsResult(ok=False, error=str(exc), provider=self.sms.name)

    def _mirror(self, coupon: Coupon) -> bool:
        """Write the claim through to the coupon store. Never raises."""
        if not self._mirrors_to_store:
            self.ledger.mark_synced(coupon.code, True)
            return True
        try:
            self.store.update(coupon)
        except Exception:
            logger.exception(
                "could not mirror %s to the coupon store; run 'cli.py sync-claims'",
                coupon.code,
            )
            self.ledger.mark_synced(coupon.code, False)
            return False
        self.ledger.mark_synced(coupon.code, True)
        return True

    # -- operations ---------------------------------------------------------

    def sync_claims(self) -> tuple[int, int]:
        """Push every locally recorded claim the store has not accepted.

        Returns ``(pushed, failed)``.
        """
        pending = self.ledger.unsynced()
        if not self._mirrors_to_store:
            for coupon in pending:
                self.ledger.mark_synced(coupon.code, True)
            return len(pending), 0

        pushed = failed = 0
        for coupon in pending:
            if self._mirror(coupon):
                pushed += 1
            else:
                failed += 1
        return pushed, failed

    def sync_codes(self) -> int:
        """Pull the coupon list from the store into the local ledger."""
        if not self._mirrors_to_store:
            return 0
        pulled = 0
        for coupon in self.store.iter_coupons():
            existing = self.ledger.get(coupon.code)
            # Never let a sheet read undo a local claim that has not synced yet.
            if existing is not None and existing.status == CLAIMED and coupon.status != CLAIMED:
                continue
            self.ledger.upsert(coupon)
            pulled += 1
        return pulled

    def resend_sms(self, raw_code: str) -> SmsResult:
        """Re-send the prize SMS for an already claimed coupon."""
        found = self.lookup(raw_code)
        if found.coupon is None:
            return SmsResult(ok=False, error=f"unknown code: {raw_code}")
        if found.coupon.status != CLAIMED:
            return SmsResult(ok=False, error="coupon has not been claimed yet")

        result = self._send_prize_sms(found.coupon)
        self.ledger.set_sms_result(
            found.coupon.code, SMS_SENT if result.ok else SMS_FAILED, result.reference
        )
        refreshed = self.ledger.get(found.coupon.code)
        if refreshed is not None:
            self._mirror(refreshed)
        return result

    def void(self, raw_code: str, note: str = "voided by operator") -> bool:
        """Take a coupon out of circulation -- a misprint, or a known fraud."""
        code = self.canonical(raw_code)
        if code is None:
            return False
        if not self.ledger.set_status(code, VOID, note):
            return False
        refreshed = self.ledger.get(code)
        if refreshed is not None:
            self._mirror(refreshed)
        return True

    def restore(self, raw_code: str) -> bool:
        """Undo :meth:`void`, putting the coupon back on offer."""
        code = self.canonical(raw_code)
        if code is None:
            return False
        coupon = self.ledger.get(code)
        if coupon is None or coupon.status != VOID:
            return False
        if not self.ledger.set_status(code, AVAILABLE, ""):
            return False
        refreshed = self.ledger.get(code)
        if refreshed is not None:
            self._mirror(refreshed)
        return True
