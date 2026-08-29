"""Shared fixtures.

Everything runs against an in-memory SQLite store and a fake SMS gateway, so
the suite needs no Google account, no network and no credentials.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

TEST_SECRET = "test-secret-do-not-use-in-production"


@pytest.fixture(autouse=True)
def test_environment(monkeypatch, tmp_path):
    """Pin the environment every module reads through ``get_settings()``."""
    from coupon.config import reset_settings_cache

    # The shipped defaults: five characters, no prefix, no checksum, no hyphens.
    monkeypatch.setenv("COUPON_CODE_LENGTH", "5")
    monkeypatch.setenv("COUPON_CODE_PREFIX", "")
    monkeypatch.setenv("COUPON_CODE_CHECK_CHARS", "0")
    monkeypatch.setenv("COUPON_CODE_GROUP_SIZE", "0")
    monkeypatch.setenv("COUPON_CODE_SECRET", TEST_SECRET)
    monkeypatch.setenv("COUPON_PUBLIC_BASE_URL", "https://draw.example.com")
    monkeypatch.setenv("COUPON_STORE", "sqlite")
    monkeypatch.setenv("COUPON_LEDGER_PATH", str(tmp_path / "ledger.db"))
    monkeypatch.setenv("SMS_PROVIDER", "console")
    monkeypatch.setenv("CAMPAIGN_NAME", "Test Draw")
    monkeypatch.setenv("FLASK_SECRET_KEY", "test-flask-secret")
    monkeypatch.setenv("COUPON_ADMIN_TOKEN", "admin-token-for-tests")
    monkeypatch.setenv("MOBILE_COUNTRY", "IN")
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "500")
    monkeypatch.setenv("DEFAULT_PRIZE_AMOUNT", "0")

    reset_settings_cache()
    yield
    reset_settings_cache()


@pytest.fixture
def settings():
    from coupon.config import get_settings

    return get_settings()


@pytest.fixture
def store():
    from coupon.store import SQLiteStore

    backing = SQLiteStore(":memory:")
    yield backing
    backing.close()


@pytest.fixture
def sms():
    from coupon.sms import ConsoleSmsProvider

    return ConsoleSmsProvider()


@pytest.fixture
def service(settings, store, sms):
    from coupon.service import CouponService

    return CouponService(settings=settings, store=store, ledger=store, sms_provider=sms)


@pytest.fixture
def make_coupons(settings, store):
    """Mint coupons straight into the store and return them."""
    from coupon.codes import generate
    from coupon.qr import coupon_url
    from coupon.store import Coupon

    def _make(count: int = 1, amounts: list[int] | None = None, batch: str = "TEST"):
        codes = generate(count, secret=settings.code_secret)
        values = amounts if amounts is not None else [1000] * count
        coupons = [
            Coupon(code=code, prize_amount=amount, batch=batch,
                   qr_url=coupon_url(settings, code))
            for code, amount in zip(codes, values)
        ]
        store.add_batch(coupons)
        return coupons

    return _make


@pytest.fixture
def app(settings, store, sms):
    from coupon.web import create_app

    application = create_app(settings=settings, store=store, ledger=store, sms_provider=sms)
    application.config.update(TESTING=True)
    return application


@pytest.fixture
def client(app):
    return app.test_client()
