"""HTTP routes for the claim site."""

from __future__ import annotations

import json
import logging

from flask import (
    Blueprint,
    abort,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)

from ..geo import districts_by_state, states
from ..service import ALREADY_CLAIMED, INVALID, OK, UNKNOWN, VOIDED, CouponService
from ..codes import printed_form
from ..validation import (
    ValidationError,
    FormErrors,
    display_mobile,
    mask_mobile,
    normalize_mobile,
    validate_participant,
)

logger = logging.getLogger(__name__)

bp = Blueprint("claim", __name__)


def service() -> CouponService:
    return current_app.config["SERVICE"]


def settings():
    return current_app.config["SETTINGS"]


def client_key() -> str:
    return request.remote_addr or "unknown"


def _rate_limited(limiter_name: str) -> bool:
    return not current_app.config[limiter_name].allow(client_key())


@bp.app_context_processor
def inject_globals() -> dict:
    conf = settings()
    return {
        "campaign_name": conf.campaign_name,
        "support_phone": conf.support_phone,
        "currency": conf.currency_symbol,
    }


def _money(amount: int) -> str:
    return f"{settings().currency_symbol}{amount:,}"


def _printed(coupon) -> str:
    """The code as printed on the coupon -- authored codes exactly as written."""
    if coupon is None:
        return ""
    return coupon.printed_code or printed_form(
        coupon.code, prefix=settings().code_prefix
    )


def _claimant_mobile(coupon) -> str:
    """How much of the claimant's number the already-claimed page reveals."""
    return display_mobile(coupon.mobile, settings().claimed_mobile_display)


# -- entry points -----------------------------------------------------------


@bp.get("/")
def index():
    """Landing page, with manual entry for a coupon whose QR will not scan."""
    return render_template("index.html", error=None, code="")


@bp.post("/enter")
def enter_code():
    """Accept a hand-typed code and send the visitor to its claim page."""
    if _rate_limited("WRITE_LIMITER"):
        return render_template("index.html", error="Too many tries. Please wait a minute.",
                               code=""), 429

    raw = (request.form.get("code") or "").strip()
    canonical = service().canonical(raw)
    if canonical is None:
        return render_template(
            "index.html",
            error="That code does not look right. Please check it and try again.",
            code=raw[:32],
        ), 400
    return redirect(url_for("claim.coupon_page", code=canonical))


@bp.get("/c/<code>")
def coupon_page(code: str):
    """What a scan lands on."""
    if _rate_limited("READ_LIMITER"):
        return render_template("message.html", tone="warn", title="Please slow down",
                               body="Too many requests from this device. "
                                    "Wait a minute and scan again."), 429

    found = service().lookup(code, count_scan=True)
    conf = settings()

    if found.status == INVALID:
        return render_template(
            "message.html",
            tone="error",
            title="Invalid coupon code",
            body="We could not read this coupon code. Please check the code printed "
                 "on your coupon and enter it below.",
            show_manual_entry=True,
        ), 404

    if found.status == UNKNOWN:
        return render_template(
            "message.html",
            tone="error",
            title="Coupon not recognised",
            body="This code is not part of the current draw. If you believe this is "
                 "a mistake, please contact our helpline.",
            show_manual_entry=True,
        ), 404

    if found.status == VOIDED:
        return render_template(
            "message.html",
            tone="error",
            title="Coupon not valid",
            body="This coupon has been cancelled and cannot be used.",
        ), 410

    if found.status == ALREADY_CLAIMED:
        return render_template("claimed.html", coupon=found.coupon,
                               claimant_mobile=_claimant_mobile(found.coupon),
                               printed_code=_printed(found.coupon),
                               amount_text=_money(found.coupon.prize_amount)), 200

    return render_template(
        "claim.html",
        code=found.coupon.code,
        printed_code=_printed(found.coupon),
        states=states(),
        districts_json=json.dumps(districts_by_state(), ensure_ascii=False),
        errors=FormErrors(),
        values={},
        mobile_country=conf.mobile_country,
    )


# -- the two-step form ------------------------------------------------------


@bp.post("/c/<code>/check-mobile")
def check_mobile(code: str):
    """Step one: validate the mobile number and unlock the rest of the form.

    Called by the page's JavaScript. It also re-checks that the coupon is
    still claimable, so a code claimed on another phone thirty seconds ago
    stops the form here rather than after the visitor has typed everything.
    """
    if _rate_limited("WRITE_LIMITER"):
        return jsonify(ok=False, error="Too many tries. Please wait a minute."), 429

    found = service().lookup(code)
    if found.status == ALREADY_CLAIMED:
        return jsonify(ok=False, claimed=True,
                       error="This coupon has already been claimed.",
                       redirect=url_for("claim.coupon_page", code=code)), 409
    if found.status != OK:
        return jsonify(ok=False, error="This coupon is not valid.",
                       redirect=url_for("claim.coupon_page", code=code)), 404

    try:
        mobile = normalize_mobile(request.form.get("mobile", ""),
                                  country=settings().mobile_country)
    except ValidationError as exc:
        return jsonify(ok=False, error=exc.message), 400

    return jsonify(ok=True, mobile=mobile, masked=mask_mobile(mobile))


@bp.post("/c/<code>/claim")
def submit_claim(code: str):
    """Step two: record the claim and send the SMS."""
    if _rate_limited("WRITE_LIMITER"):
        return render_template("message.html", tone="warn", title="Please slow down",
                               body="Too many submissions from this device. "
                                    "Wait a minute and try again."), 429

    conf = settings()
    svc = service()
    submitted = {key: (request.form.get(key) or "").strip()
                 for key in ("mobile", "name", "state", "district")}

    participant, errors = validate_participant(submitted, country=conf.mobile_country)
    if participant is None:
        return render_template(
            "claim.html",
            code=code,
            printed_code=_printed(svc.lookup(code).coupon) or code,
            states=states(),
            districts_json=json.dumps(districts_by_state(), ensure_ascii=False),
            errors=errors,
            values=submitted,
            mobile_country=conf.mobile_country,
        ), 400

    result = svc.claim(code, participant)

    if result.status == OK and result.coupon is not None:
        sms_ok = result.sms is not None and result.sms.ok
        if not sms_ok:
            logger.error(
                "claim %s recorded but SMS failed: %s",
                result.coupon.code, result.sms.error if result.sms else "no result",
            )
        return render_template(
            "success.html",
            coupon=result.coupon,
            amount_text=_money(result.coupon.prize_amount),
            printed_code=_printed(result.coupon),
            # Their own number, which they typed a moment ago -- no masking.
            claimant_mobile=result.coupon.mobile,
            sms_ok=sms_ok,
            is_winner=result.coupon.is_winner,
        )

    if result.status == ALREADY_CLAIMED and result.coupon is not None:
        # Somebody else finished the same coupon while this form was open.
        return render_template("claimed.html", coupon=result.coupon,
                               claimant_mobile=_claimant_mobile(result.coupon),
                               printed_code=_printed(result.coupon),
                               amount_text=_money(result.coupon.prize_amount)), 409

    if result.status == VOIDED:
        return render_template("message.html", tone="error", title="Coupon not valid",
                               body="This coupon has been cancelled and cannot be used."), 410

    return render_template("message.html", tone="error", title="Coupon not recognised",
                           body="We could not find this coupon in the current draw.",
                           show_manual_entry=True), 404


# -- operations -------------------------------------------------------------


@bp.get("/healthz")
def healthz():
    return jsonify(status="ok")


@bp.get("/admin/stats")
def admin_stats():
    """Live campaign numbers. Guarded by a shared token, off when unset."""
    token = settings().admin_token
    if not token:
        abort(404)
    supplied = request.headers.get("X-Admin-Token") or request.args.get("token", "")
    # Compare in constant time; a token is a password.
    import hmac

    if not hmac.compare_digest(supplied, token):
        abort(403)

    svc = service()
    stats = svc.ledger.stats()
    pending = len(svc.ledger.unsynced())
    return jsonify(**stats.as_dict(), unsynced_claims=pending)


@bp.app_errorhandler(404)
def not_found(_error):
    return render_template("message.html", tone="error", title="Page not found",
                           body="The page you were looking for does not exist.",
                           show_manual_entry=True), 404


@bp.app_errorhandler(500)
def server_error(_error):  # pragma: no cover - exercised only on a real crash
    logger.exception("unhandled error")
    return render_template(
        "message.html", tone="error", title="Something went wrong",
        body="Please try again in a moment. If it keeps happening, contact our helpline.",
    ), 500
