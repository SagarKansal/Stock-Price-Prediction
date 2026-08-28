"""The storage contract shared by the SQLite and Google Sheets backends."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field, replace
from datetime import datetime, timezone

AVAILABLE = "AVAILABLE"
CLAIMED = "CLAIMED"
VOID = "VOID"

SMS_SENT = "SENT"
SMS_FAILED = "FAILED"
SMS_SKIPPED = "SKIPPED"
SMS_PENDING = "PENDING"


def utc_now_iso() -> str:
    """Timestamps are stored as UTC ISO-8601, to the second."""
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class Coupon:
    """One row: a printed code and, once claimed, who claimed it."""

    code: str
    prize_amount: int = 0
    status: str = AVAILABLE
    batch: str = ""
    mobile: str = ""
    name: str = ""
    state: str = ""
    district: str = ""
    claimed_at: str = ""
    sms_status: str = ""
    sms_reference: str = ""
    scan_count: int = 0
    first_scanned_at: str = ""
    qr_url: str = ""
    notes: str = ""

    @property
    def is_claimed(self) -> bool:
        return self.status == CLAIMED

    @property
    def is_void(self) -> bool:
        return self.status == VOID

    @property
    def is_winner(self) -> bool:
        return self.prize_amount > 0

    def as_dict(self) -> dict:
        return asdict(self)

    def with_claim(self, *, mobile: str, name: str, state: str, district: str,
                   claimed_at: str | None = None) -> "Coupon":
        return replace(
            self,
            status=CLAIMED,
            mobile=mobile,
            name=name,
            state=state,
            district=district,
            claimed_at=claimed_at or utc_now_iso(),
        )


@dataclass
class Stats:
    total: int = 0
    claimed: int = 0
    available: int = 0
    void: int = 0
    prize_pool: int = 0
    paid_out: int = 0
    winners_claimed: int = 0
    by_state: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict:
        return asdict(self)


class StoreError(RuntimeError):
    """The backing store could not be reached or refused a write."""


class CouponStore(ABC):
    """Where the coupon list lives.

    Implementations must be safe to call from Flask request threads.
    """

    @abstractmethod
    def get(self, code: str) -> Coupon | None:
        """Return the coupon for a canonical code, or ``None``."""

    @abstractmethod
    def add_batch(self, coupons: list[Coupon]) -> int:
        """Append newly minted coupons. Returns how many were written."""

    @abstractmethod
    def update(self, coupon: Coupon) -> None:
        """Persist every field of an existing coupon."""

    @abstractmethod
    def all_codes(self) -> list[str]:
        """Every canonical code known to the store."""

    @abstractmethod
    def iter_coupons(self):
        """Yield every coupon, for export and statistics."""

    def stats(self) -> Stats:
        """Aggregate the whole store. Overridden where a backend can do better."""
        result = Stats()
        for coupon in self.iter_coupons():
            result.total += 1
            result.prize_pool += coupon.prize_amount
            if coupon.status == CLAIMED:
                result.claimed += 1
                result.paid_out += coupon.prize_amount
                if coupon.prize_amount > 0:
                    result.winners_claimed += 1
                if coupon.state:
                    result.by_state[coupon.state] = result.by_state.get(coupon.state, 0) + 1
            elif coupon.status == VOID:
                result.void += 1
            else:
                result.available += 1
        return result

    def close(self) -> None:  # pragma: no cover - most backends need nothing
        """Release any resources held by the store."""
