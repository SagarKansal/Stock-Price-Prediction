"""The claim rules: one prize per coupon, no matter how it is scanned."""

from __future__ import annotations

import threading


from coupon.service import ALREADY_CLAIMED, INVALID, OK, UNKNOWN, VOIDED
from coupon.store import CLAIMED, SMS_FAILED, SMS_SENT, SQLiteStore
from coupon.validation import Participant


def a_participant(**overrides) -> Participant:
    data = {
        "mobile": "9876543210",
        "name": "Priya Sharma",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
    }
    data.update(overrides)
    return Participant(**data)


def test_lookup_finds_an_available_coupon(service, make_coupons):
    coupon = make_coupons(1)[0]
    found = service.lookup(coupon.code)
    assert found.status == OK
    assert found.coupon.prize_amount == 1000


def test_lookup_rejects_a_malformed_code(service):
    assert service.lookup("NOT-A-CODE").status == INVALID


def test_lookup_reports_a_well_formed_code_that_was_never_printed(service):
    from coupon.codes import generate

    unprinted = generate(1)[0]
    assert service.lookup(unprinted).status == UNKNOWN


def test_a_claim_records_details_and_sends_one_sms(service, make_coupons, sms):
    coupon = make_coupons(1, amounts=[5000])[0]
    result = service.claim(coupon.code, a_participant())

    assert result.ok
    assert result.coupon.status == CLAIMED
    assert result.coupon.prize_amount == 5000
    assert result.coupon.name == "Priya Sharma"
    assert result.coupon.state == "Karnataka"
    assert result.coupon.district == "Bengaluru Urban"
    assert result.coupon.sms_status == SMS_SENT

    assert len(sms.sent) == 1
    to, message = sms.sent[0]
    assert to == "9876543210"
    assert "5,000" in message
    # The SMS must quote the code the way the coupon prints it, so the winner
    # can hold phone and coupon side by side and read the same string.
    from coupon.codes import printed_form

    assert printed_form(coupon.code) in message
    # Five characters, no hyphens: the SMS quotes the coupon verbatim.
    assert printed_form(coupon.code) == coupon.code
    assert len(coupon.code) == 5


def test_a_second_claim_is_refused_and_sends_no_sms(service, make_coupons, sms):
    coupon = make_coupons(1)[0]
    assert service.claim(coupon.code, a_participant()).ok

    second = service.claim(coupon.code, a_participant(mobile="9123456780", name="Someone Else"))
    assert second.status == ALREADY_CLAIMED
    # The original winner's details survive the second attempt.
    assert second.coupon.name == "Priya Sharma"
    assert second.coupon.mobile == "9876543210"
    assert len(sms.sent) == 1


def test_rescanning_a_claimed_coupon_reports_the_claim(service, make_coupons):
    coupon = make_coupons(1)[0]
    service.claim(coupon.code, a_participant())
    found = service.lookup(coupon.code)
    assert found.status == ALREADY_CLAIMED
    assert found.coupon.name == "Priya Sharma"


def test_a_non_winning_coupon_still_completes(service, make_coupons, sms):
    coupon = make_coupons(1, amounts=[0])[0]
    result = service.claim(coupon.code, a_participant())
    assert result.ok
    assert result.coupon.prize_amount == 0
    assert "Better luck" in sms.sent[0][1]


def test_scans_are_counted(service, make_coupons):
    coupon = make_coupons(1)[0]
    for _ in range(3):
        service.lookup(coupon.code, count_scan=True)
    assert service.ledger.get(coupon.code).scan_count == 3
    assert service.ledger.get(coupon.code).first_scanned_at


def test_voided_coupons_cannot_be_claimed(service, make_coupons, sms):
    coupon = make_coupons(1)[0]
    assert service.void(coupon.code, "misprint")

    assert service.lookup(coupon.code).status == VOIDED
    assert service.claim(coupon.code, a_participant()).status == VOIDED
    assert sms.sent == []

    assert service.restore(coupon.code)
    assert service.claim(coupon.code, a_participant()).ok


def test_a_failed_sms_does_not_lose_the_claim(settings, store, make_coupons):
    from coupon.service import CouponService
    from coupon.sms import SmsProvider

    class BrokenGateway(SmsProvider):
        name = "broken"

        def send(self, *, to, message):
            raise RuntimeError("gateway on fire")

    service = CouponService(
        settings=settings, store=store, ledger=store, sms_provider=BrokenGateway()
    )
    coupon = make_coupons(1, amounts=[2500])[0]

    result = service.claim(coupon.code, a_participant())
    assert result.ok                       # the prize is still theirs
    assert result.sms.ok is False
    assert store.get(coupon.code).status == CLAIMED
    assert store.get(coupon.code).sms_status == SMS_FAILED


def test_resend_sms_reaches_the_winner_again(service, make_coupons, sms):
    coupon = make_coupons(1)[0]
    service.claim(coupon.code, a_participant())
    assert service.resend_sms(coupon.code).ok
    assert len(sms.sent) == 2


def test_resend_refuses_an_unclaimed_coupon(service, make_coupons):
    coupon = make_coupons(1)[0]
    assert service.resend_sms(coupon.code).ok is False


def test_simultaneous_claims_produce_exactly_one_winner(settings, tmp_path, sms):
    """The race a lucky draw actually faces: one coupon, many phones."""
    from coupon.codes import generate
    from coupon.service import CouponService
    from coupon.store import Coupon

    # A file-backed store, so the threads contend through real SQLite locking.
    backing = SQLiteStore(tmp_path / "race.db")
    code = generate(1)[0]
    backing.add_batch([Coupon(code=code, prize_amount=10000)])

    service = CouponService(
        settings=settings, store=backing, ledger=backing, sms_provider=sms
    )

    outcomes: list[str] = []
    lock = threading.Lock()
    start = threading.Barrier(12)

    def attempt(index: int) -> None:
        start.wait()
        result = service.claim(code, a_participant(mobile=f"98765432{index:02d}"))
        with lock:
            outcomes.append(result.status)

    threads = [threading.Thread(target=attempt, args=(i,)) for i in range(12)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert outcomes.count(OK) == 1, outcomes
    assert outcomes.count(ALREADY_CLAIMED) == 11
    assert len(sms.sent) == 1
    backing.close()


def test_claims_are_flagged_for_sync_when_the_sheet_is_unreachable(settings, tmp_path, sms,
                                                                   make_coupons):
    """A Sheets outage must not stop the draw."""
    from coupon.codes import generate
    from coupon.service import CouponService
    from coupon.store import Coupon, CouponStore, StoreError

    class DeadSheet(CouponStore):
        def __init__(self, inner):
            self.inner = inner
            self.online = False

        def get(self, code):
            return self.inner.get(code)

        def all_codes(self):
            return self.inner.all_codes()

        def iter_coupons(self):
            return self.inner.iter_coupons()

        def add_batch(self, coupons):
            return self.inner.add_batch(coupons)

        def update(self, coupon):
            if not self.online:
                raise StoreError("sheets unreachable")
            self.inner.update(coupon)

    ledger = SQLiteStore(tmp_path / "ledger.db")
    remote = DeadSheet(SQLiteStore(tmp_path / "remote.db"))

    code = generate(1)[0]
    coupon = Coupon(code=code, prize_amount=750)
    ledger.add_batch([coupon])
    remote.add_batch([coupon])

    service = CouponService(settings=settings, store=remote, ledger=ledger, sms_provider=sms)

    result = service.claim(code, a_participant())
    assert result.ok
    assert result.sheet_synced is False
    assert len(ledger.unsynced()) == 1
    assert remote.get(code).status != CLAIMED     # the sheet is still behind

    remote.online = True
    pushed, failed = service.sync_claims()
    assert (pushed, failed) == (1, 0)
    assert remote.get(code).status == CLAIMED
    assert ledger.unsynced() == []

    ledger.close()
    remote.inner.close()
