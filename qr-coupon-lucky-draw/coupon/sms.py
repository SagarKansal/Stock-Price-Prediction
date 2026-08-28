"""Sending the winning SMS.

Three providers ship here: MSG91 and Twilio for real traffic, and a console
provider that prints the message instead of sending it, which is what the
tests and local development use.

Every provider returns a :class:`SmsResult` rather than raising on a gateway
error. A failed SMS must never look like a failed claim -- by the time we get
here the prize is already the participant's, so the flow records the failure,
shows the amount on screen anyway, and leaves the message to be retried with
``python -m coupon.cli resend-sms``.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass

from .config import Settings
from .validation import to_e164

logger = logging.getLogger(__name__)


@dataclass
class SmsResult:
    ok: bool
    reference: str = ""
    error: str = ""
    provider: str = ""


def render_message(settings: Settings, *, name: str, code: str, amount: int,
                   mobile: str) -> str:
    """Fill the configured template. Non-winners get the consolation text."""
    template = settings.sms_template if amount > 0 else settings.sms_consolation_template
    try:
        return template.format(
            name=name,
            code=code,
            amount=f"{amount:,}",
            amount_plain=amount,
            mobile=mobile,
            currency=settings.currency_symbol,
            campaign=settings.campaign_name,
        )
    except KeyError as exc:
        logger.error("SMS template refers to unknown placeholder %s", exc)
        return (
            f"{settings.campaign_name}: coupon {code} is worth "
            f"{settings.currency_symbol}{amount:,}."
        )


class SmsProvider(ABC):
    name = "base"

    @abstractmethod
    def send(self, *, to: str, message: str) -> SmsResult:
        """Deliver ``message`` to a national mobile number."""


class ConsoleSmsProvider(SmsProvider):
    """Logs the message. The default, so nothing is sent by accident."""

    name = "console"

    def __init__(self, sink: list[tuple[str, str]] | None = None) -> None:
        # The tests pass a sink and assert on what would have gone out.
        self.sent: list[tuple[str, str]] = sink if sink is not None else []

    def send(self, *, to: str, message: str) -> SmsResult:
        self.sent.append((to, message))
        logger.info("[console-sms] to=%s message=%s", to, message)
        return SmsResult(ok=True, reference=f"console-{len(self.sent)}", provider=self.name)


class Msg91Provider(SmsProvider):
    """MSG91, the common choice for Indian transactional SMS.

    Indian regulation (TRAI DLT) requires transactional SMS to go out against
    a registered template and sender ID, so ``MSG91_TEMPLATE_ID`` and
    ``MSG91_SENDER_ID`` are not optional in production. When a template ID is
    configured we use the Flow API and pass the message as a variable; the
    registered template must therefore contain a matching ``##message##``
    style variable.
    """

    name = "msg91"
    FLOW_URL = "https://control.msg91.com/api/v5/flow/"
    SMS_URL = "https://control.msg91.com/api/v5/sms/"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def send(self, *, to: str, message: str) -> SmsResult:
        import requests

        national = to_e164(to, country=self.settings.mobile_country).lstrip("+")
        headers = {
            "authkey": self.settings.msg91_auth_key,
            "Content-Type": "application/json",
            "accept": "application/json",
        }

        if self.settings.msg91_template_id:
            payload = {
                "template_id": self.settings.msg91_template_id,
                "sender": self.settings.msg91_sender_id,
                "short_url": "0",
                "recipients": [{"mobiles": national, "message": message}],
            }
            url = self.FLOW_URL
        else:
            payload = {
                "sender": self.settings.msg91_sender_id,
                "route": self.settings.msg91_route,
                "country": "91",
                "sms": [{"message": message, "to": [national]}],
            }
            url = self.SMS_URL

        try:
            response = requests.post(
                url, json=payload, headers=headers,
                timeout=self.settings.sms_timeout_seconds,
            )
        except Exception as exc:
            logger.exception("MSG91 request failed")
            return SmsResult(ok=False, error=str(exc), provider=self.name)

        if response.status_code >= 400:
            return SmsResult(
                ok=False,
                error=f"HTTP {response.status_code}: {response.text[:200]}",
                provider=self.name,
            )

        reference = ""
        try:
            body = response.json()
            reference = str(body.get("request_id") or body.get("message") or "")
            if str(body.get("type", "")).lower() == "error":
                return SmsResult(
                    ok=False, error=str(body.get("message", "MSG91 error"))[:200],
                    provider=self.name,
                )
        except ValueError:
            reference = response.text[:80]

        return SmsResult(ok=True, reference=reference, provider=self.name)


class TwilioProvider(SmsProvider):
    """Twilio, over the plain REST API so the SDK is not a dependency."""

    name = "twilio"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def send(self, *, to: str, message: str) -> SmsResult:
        import requests

        url = (
            "https://api.twilio.com/2010-04-01/Accounts/"
            f"{self.settings.twilio_account_sid}/Messages.json"
        )
        data = {
            "To": to_e164(to, country=self.settings.mobile_country),
            "From": self.settings.twilio_from_number,
            "Body": message,
        }
        try:
            response = requests.post(
                url, data=data,
                auth=(self.settings.twilio_account_sid, self.settings.twilio_auth_token),
                timeout=self.settings.sms_timeout_seconds,
            )
        except Exception as exc:
            logger.exception("Twilio request failed")
            return SmsResult(ok=False, error=str(exc), provider=self.name)

        if response.status_code >= 400:
            return SmsResult(
                ok=False,
                error=f"HTTP {response.status_code}: {response.text[:200]}",
                provider=self.name,
            )
        try:
            reference = str(response.json().get("sid", ""))
        except ValueError:
            reference = ""
        return SmsResult(ok=True, reference=reference, provider=self.name)


def build_provider(settings: Settings) -> SmsProvider:
    """Return the provider named by ``SMS_PROVIDER``."""
    provider = settings.sms_provider
    if provider in {"console", "", "none", "log"}:
        return ConsoleSmsProvider()
    if provider == "msg91":
        return Msg91Provider(settings)
    if provider == "twilio":
        return TwilioProvider(settings)
    raise ValueError(
        f"unknown SMS_PROVIDER={provider!r}; expected 'console', 'msg91' or 'twilio'"
    )
