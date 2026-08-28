"""Turning a prize plan into a per-coupon allocation.

Prizes are decided when coupons are *printed*, not when they are claimed. The
amount is written against the code in the sheet up front, which means the draw
is auditable (you can prove afterwards what each code was always worth), the
payout total is fixed and known, and a claim needs no random number generator
in the request path.

A plan is written as ``amount x count`` pairs::

    5000x1,1000x10,500x50,100x200

which is one prize of 5000, ten of 1000, fifty of 500 and two hundred of 100.
Any coupons left over in the batch get :attr:`Settings.default_prize_amount`.
"""

from __future__ import annotations

import re
import secrets
from dataclasses import dataclass

_TIER_RE = re.compile(r"^\s*(\d+)\s*[xX*]\s*(\d+)\s*$")


class PrizePlanError(ValueError):
    """Raised for a prize plan that cannot be honoured."""


@dataclass(frozen=True)
class PrizeTier:
    amount: int
    count: int


def parse_plan(plan: str) -> list[PrizeTier]:
    """Parse ``"5000x1,1000x10"`` into tiers, largest amount first."""
    if not plan or not plan.strip():
        return []

    tiers: list[PrizeTier] = []
    for chunk in plan.split(","):
        if not chunk.strip():
            continue
        match = _TIER_RE.match(chunk)
        if not match:
            raise PrizePlanError(
                f"could not read prize tier {chunk.strip()!r} -- expected 'amount x count', "
                "for example '1000x25'"
            )
        amount, count = int(match.group(1)), int(match.group(2))
        if count < 1:
            raise PrizePlanError(f"tier {chunk.strip()!r} must award at least one coupon")
        tiers.append(PrizeTier(amount=amount, count=count))

    # Merge duplicate amounts so "100x5,100x5" behaves like "100x10".
    merged: dict[int, int] = {}
    for tier in tiers:
        merged[tier.amount] = merged.get(tier.amount, 0) + tier.count
    return [PrizeTier(amount=a, count=c) for a, c in sorted(merged.items(), reverse=True)]


def plan_size(tiers: list[PrizeTier]) -> int:
    return sum(tier.count for tier in tiers)


def plan_value(tiers: list[PrizeTier]) -> int:
    return sum(tier.amount * tier.count for tier in tiers)


def allocate(total: int, tiers: list[PrizeTier], *, default_amount: int = 0) -> list[int]:
    """Return ``total`` prize amounts in random order.

    The result is a shuffled list: element *i* is the amount for the *i*-th
    coupon in the batch. Shuffling uses :class:`secrets.SystemRandom`, so the
    mapping is not reproducible from a seed -- nobody, including whoever runs
    the generator, can predict which printed coupon holds the top prize.
    """
    if total < 1:
        raise ValueError("total must be positive")

    awarded = plan_size(tiers)
    if awarded > total:
        raise PrizePlanError(
            f"the prize plan awards {awarded} prizes but the batch is only {total} "
            "coupons -- reduce the plan or increase --count"
        )

    amounts: list[int] = []
    for tier in tiers:
        amounts.extend([tier.amount] * tier.count)
    amounts.extend([default_amount] * (total - awarded))

    secrets.SystemRandom().shuffle(amounts)
    return amounts


def describe(tiers: list[PrizeTier], total: int, *, default_amount: int = 0,
             currency: str = "₹") -> str:
    """A human-readable summary, printed before a batch is committed."""
    if not tiers:
        return f"No prize tiers: all {total} coupons are worth {currency}{default_amount}."

    lines = [f"{tier.count} x {currency}{tier.amount:,}" for tier in tiers]
    leftover = total - plan_size(tiers)
    if leftover:
        lines.append(f"{leftover} x {currency}{default_amount:,} (no tier)")
    return (
        "\n".join(f"  {line}" for line in lines)
        + f"\n  ----\n  {total} coupons, {currency}{plan_value(tiers) + leftover * default_amount:,} total payout"
    )
