"""Flask application factory for the participant-facing claim site."""

from __future__ import annotations

import logging

from flask import Flask

from ..config import Settings, get_settings
from ..sms import SmsProvider, build_provider
from ..store import CouponStore, SQLiteStore, build_store
from ..service import CouponService
from .ratelimit import RateLimiter

logger = logging.getLogger(__name__)


def create_app(
    *,
    settings: Settings | None = None,
    store: CouponStore | None = None,
    ledger: SQLiteStore | None = None,
    sms_provider: SmsProvider | None = None,
) -> Flask:
    """Build the app.

    Every collaborator can be injected, which is what lets the tests run the
    real request flow against an in-memory database and a fake SMS gateway.
    """
    settings = settings or get_settings()

    app = Flask(__name__)
    app.config["SETTINGS"] = settings
    app.secret_key = settings.flask_secret_key
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=settings.public_base_url.startswith("https://"),
        MAX_CONTENT_LENGTH=64 * 1024,
        JSON_SORT_KEYS=False,
    )

    # The ledger is always SQLite: it is what makes a claim atomic. When the
    # store backend is also SQLite the two are the same object, and no
    # mirroring happens.
    resolved_store = store if store is not None else build_store(settings)
    if ledger is not None:
        resolved_ledger = ledger
    elif isinstance(resolved_store, SQLiteStore):
        resolved_ledger = resolved_store
    else:
        resolved_ledger = SQLiteStore(settings.ledger_path)

    app.config["SERVICE"] = CouponService(
        settings=settings,
        store=resolved_store,
        ledger=resolved_ledger,
        sms_provider=sms_provider if sms_provider is not None else build_provider(settings),
    )
    app.config["WRITE_LIMITER"] = RateLimiter(settings.rate_limit_per_minute)
    app.config["READ_LIMITER"] = RateLimiter(max(settings.rate_limit_per_minute * 4, 20))

    if settings.trust_proxy_headers:
        from werkzeug.middleware.proxy_fix import ProxyFix

        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    from .routes import bp

    app.register_blueprint(bp)

    for problem in settings.problems():
        logger.warning("config: %s", problem)

    return app
