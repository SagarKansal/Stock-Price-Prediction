"""Storage backends for the coupon list."""

from __future__ import annotations

from ..config import Settings
from .base import (
    AVAILABLE,
    CLAIMED,
    SMS_FAILED,
    SMS_PENDING,
    SMS_SENT,
    SMS_SKIPPED,
    VOID,
    Coupon,
    CouponStore,
    Stats,
    StoreError,
    utc_now_iso,
)
from .sqlite import SQLiteStore

__all__ = [
    "AVAILABLE", "CLAIMED", "VOID",
    "SMS_SENT", "SMS_FAILED", "SMS_SKIPPED", "SMS_PENDING",
    "Coupon", "CouponStore", "Stats", "StoreError", "SQLiteStore",
    "utc_now_iso", "build_store",
]


def build_store(settings: Settings) -> CouponStore:
    """Return the store named by ``COUPON_STORE``."""
    if settings.store_backend == "sqlite":
        return SQLiteStore(settings.ledger_path)

    if settings.store_backend == "sheets":
        from .sheets import GoogleSheetsStore

        if not settings.google_sheet_id:
            raise StoreError("COUPON_STORE=sheets requires GOOGLE_SHEET_ID")
        if not settings.google_credentials_file:
            raise StoreError("COUPON_STORE=sheets requires GOOGLE_CREDENTIALS_FILE")
        return GoogleSheetsStore(
            credentials_file=settings.google_credentials_file,
            sheet_id=settings.google_sheet_id,
            worksheet_name=settings.google_worksheet,
        )

    raise StoreError(
        f"unknown COUPON_STORE={settings.store_backend!r}; expected 'sqlite' or 'sheets'"
    )
