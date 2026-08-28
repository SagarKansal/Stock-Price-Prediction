"""The prize plan decides the payout before a single coupon is printed."""

from __future__ import annotations

import pytest

from coupon.prizes import PrizePlanError, allocate, describe, parse_plan, plan_size, plan_value


def test_parse_a_simple_plan():
    tiers = parse_plan("5000x1,1000x10,500x50")
    assert [(t.amount, t.count) for t in tiers] == [(5000, 1), (1000, 10), (500, 50)]


def test_duplicate_amounts_are_merged():
    tiers = parse_plan("100x5,100x7")
    assert [(t.amount, t.count) for t in tiers] == [(100, 12)]


def test_whitespace_and_capital_x_are_tolerated():
    assert parse_plan(" 250 X 4 , 100x2 ") == parse_plan("250x4,100x2")


def test_empty_plan_is_allowed():
    assert parse_plan("") == []
    assert parse_plan("   ") == []


@pytest.mark.parametrize("bad", ["5000", "5000x", "x10", "abc", "5000*0"])
def test_malformed_plans_are_rejected(bad):
    with pytest.raises(PrizePlanError):
        parse_plan(bad)


def test_allocation_covers_the_whole_batch():
    tiers = parse_plan("5000x1,1000x10,500x50")
    amounts = allocate(1000, tiers, default_amount=0)
    assert len(amounts) == 1000
    assert sorted(amounts, reverse=True)[:12] == [5000] + [1000] * 10 + [500]
    assert amounts.count(0) == 1000 - 61


def test_payout_total_matches_the_plan():
    tiers = parse_plan("5000x1,1000x10,500x50")
    amounts = allocate(500, tiers, default_amount=25)
    expected = plan_value(tiers) + (500 - plan_size(tiers)) * 25
    assert sum(amounts) == expected


def test_a_plan_larger_than_the_batch_is_refused():
    tiers = parse_plan("1000x50")
    with pytest.raises(PrizePlanError):
        allocate(20, tiers)


def test_allocation_is_shuffled():
    # A sorted allocation would mean the top prizes land on the first coupons
    # printed, which is exactly what must not happen.
    tiers = parse_plan("1000x100")
    amounts = allocate(1000, tiers)
    assert amounts[:100] != [1000] * 100


def test_describe_mentions_every_tier():
    text = describe(parse_plan("5000x1,500x20"), 100, default_amount=0, currency="₹")
    assert "₹5,000" in text and "₹500" in text and "100 coupons" in text
