"""Command line operations: minting coupons, syncing, and day-to-day fixes.

    python -m coupon.cli generate --count 500 --batch DIWALI --prizes "5000x1,500x20"
    python -m coupon.cli stats
    python -m coupon.cli lookup DR-K7M2-9XQF-3A
    python -m coupon.cli sync-claims
"""

from __future__ import annotations

import argparse
import csv
import logging
import sys
from pathlib import Path

from . import prizes as prize_module
from .codes import format_for_print, generate as mint_codes
from .config import DEV_CODE_SECRET, get_settings
from .geo import states
from .qr import build_print_sheet, coupon_url, save_qr_png, write_codes_csv
from .service import CouponService
from .sms import build_provider
from .store import CLAIMED, Coupon, SQLiteStore, StoreError, build_store

logger = logging.getLogger("coupon.cli")


# -- wiring -----------------------------------------------------------------


def _build_service(settings) -> CouponService:
    store = build_store(settings)
    ledger = store if isinstance(store, SQLiteStore) else SQLiteStore(settings.ledger_path)
    return CouponService(
        settings=settings, store=store, ledger=ledger, sms_provider=build_provider(settings)
    )


def _confirm(question: str, assume_yes: bool) -> bool:
    if assume_yes:
        return True
    if not sys.stdin.isatty():
        print("Refusing to continue without --yes in a non-interactive shell.")
        return False
    return input(f"{question} [y/N] ").strip().lower() in {"y", "yes"}


# -- commands ---------------------------------------------------------------


def cmd_generate(args, settings) -> int:
    if settings.code_secret == DEV_CODE_SECRET and not args.allow_dev_secret:
        print(
            "COUPON_CODE_SECRET is still the development default.\n"
            "Codes minted with it can be forged by anyone with this repository, and\n"
            "changing the secret later invalidates every code already printed.\n"
            "Set a real secret first:\n\n"
            "    export COUPON_CODE_SECRET=\"$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')\"\n\n"
            "Pass --allow-dev-secret only for a throwaway test batch.",
            file=sys.stderr,
        )
        return 2

    if settings.public_base_url.startswith("http://localhost") and not args.allow_dev_secret:
        print(
            f"COUPON_PUBLIC_BASE_URL is {settings.public_base_url}, so every QR code\n"
            "would point at this machine. Set it to the public URL of the claim site\n"
            "before printing, or pass --allow-dev-secret for a test batch.",
            file=sys.stderr,
        )
        return 2

    try:
        tiers = prize_module.parse_plan(args.prizes or "")
        amounts = prize_module.allocate(
            args.count, tiers, default_amount=settings.default_prize_amount
        )
    except prize_module.PrizePlanError as exc:
        print(f"Prize plan error: {exc}", file=sys.stderr)
        return 2

    service = _build_service(settings)
    store, ledger = service.store, service.ledger

    print(f"Batch:    {args.batch or '(none)'}")
    print(f"Prefix:   {settings.code_prefix}")
    print(f"Store:    {settings.store_backend}")
    print(f"Base URL: {settings.public_base_url}")
    print("Prizes:")
    print(prize_module.describe(
        tiers, args.count,
        default_amount=settings.default_prize_amount,
        currency=settings.currency_symbol,
    ))

    if not _confirm(f"Mint {args.count} coupons?", args.yes):
        print("Aborted.")
        return 1

    print("Reading existing codes so the new batch cannot collide...")
    existing = set(ledger.all_codes())
    if store is not ledger:
        try:
            existing.update(store.all_codes())
        except StoreError as exc:
            print(f"Could not read the coupon store: {exc}", file=sys.stderr)
            return 3

    codes = mint_codes(
        args.count, prefix=settings.code_prefix, secret=settings.code_secret, exclude=existing
    )
    coupons = [
        Coupon(
            code=code,
            prize_amount=amount,
            batch=args.batch,
            qr_url=coupon_url(settings, code),
        )
        for code, amount in zip(codes, amounts)
    ]

    # The ledger first: it is what the site reads on every scan. A failure
    # writing to Sheets afterwards leaves a working campaign and a report to
    # catch up, not the other way round.
    ledger.add_batch(coupons)
    print(f"Wrote {len(coupons)} coupons to the local ledger ({settings.ledger_path}).")

    if store is not ledger:
        print("Appending to Google Sheets...")
        try:
            store.add_batch(coupons)
            print(f"Appended {len(coupons)} rows to worksheet {settings.google_worksheet!r}.")
        except StoreError as exc:
            print(f"Sheets append failed: {exc}\nRun 'sync-claims' once it is reachable.",
                  file=sys.stderr)
            for coupon in coupons:
                ledger.mark_synced(coupon.code, False)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = args.batch or "batch"

    csv_path = write_codes_csv(coupons, out_dir / f"{stem}-codes.csv", prefix=settings.code_prefix)
    print(f"CSV:  {csv_path}")

    if not args.no_pdf:
        pdf_path = build_print_sheet(
            coupons, out_dir / f"{stem}-print.pdf",
            settings=settings, columns=args.columns, rows=args.rows,
            show_prize=args.show_prize,
        )
        print(f"PDF:  {pdf_path}  ({args.columns}x{args.rows} per A4 page)")

    if args.qr_images:
        images_dir = out_dir / f"{stem}-qr"
        for coupon in coupons:
            save_qr_png(coupon.qr_url, images_dir / f"{coupon.code}.png")
        print(f"PNGs: {images_dir}/ ({len(coupons)} files)")

    print("\nDone. Keep COUPON_CODE_SECRET unchanged for the life of these coupons.")
    return 0


def cmd_stats(args, settings) -> int:
    service = _build_service(settings)
    source = service.store if args.remote else service.ledger
    stats = source.stats()
    currency = settings.currency_symbol

    print(f"Source:            {'coupon store' if args.remote else 'local ledger'}")
    print(f"Total coupons:     {stats.total:,}")
    print(f"  claimed:         {stats.claimed:,}")
    print(f"  available:       {stats.available:,}")
    print(f"  void:            {stats.void:,}")
    print(f"Prize pool:        {currency}{stats.prize_pool:,}")
    print(f"Paid out so far:   {currency}{stats.paid_out:,} "
          f"({stats.winners_claimed:,} winning coupons claimed)")

    if not args.remote:
        pending = len(service.ledger.unsynced())
        if pending:
            print(f"Unsynced claims:   {pending}  <- run 'sync-claims'")

    if stats.by_state:
        print("\nClaims by state:")
        for state, count in sorted(stats.by_state.items(), key=lambda kv: -kv[1])[:15]:
            print(f"  {state:<38} {count:>6,}")
    return 0


def cmd_lookup(args, settings) -> int:
    service = _build_service(settings)
    found = service.lookup(args.code)
    if found.coupon is None:
        print(f"{args.code}: {found.status}")
        return 1

    coupon = found.coupon
    print(f"Code:        {format_for_print(coupon.code, settings.code_prefix)}")
    print(f"Status:      {coupon.status}")
    print(f"Prize:       {settings.currency_symbol}{coupon.prize_amount:,}")
    print(f"Batch:       {coupon.batch or '-'}")
    print(f"Scans:       {coupon.scan_count} (first {coupon.first_scanned_at or '-'})")
    if coupon.status == CLAIMED:
        print(f"Name:        {coupon.name}")
        print(f"Mobile:      {coupon.mobile}")
        print(f"Location:    {coupon.district}, {coupon.state}")
        print(f"Claimed at:  {coupon.claimed_at}")
        print(f"SMS:         {coupon.sms_status} {coupon.sms_reference}")
    return 0


def cmd_sync_claims(args, settings) -> int:
    service = _build_service(settings)
    pushed, failed = service.sync_claims()
    print(f"Pushed {pushed} claim(s); {failed} still pending.")
    return 0 if failed == 0 else 3


def cmd_sync_codes(args, settings) -> int:
    service = _build_service(settings)
    if service.store is service.ledger:
        print("COUPON_STORE=sqlite: the ledger is the store, nothing to pull.")
        return 0
    pulled = service.sync_codes()
    print(f"Pulled {pulled} coupon(s) from the coupon store into the local ledger.")
    return 0


def cmd_resend_sms(args, settings) -> int:
    service = _build_service(settings)
    result = service.resend_sms(args.code)
    if result.ok:
        print(f"Sent. Reference: {result.reference}")
        return 0
    print(f"Failed: {result.error}", file=sys.stderr)
    return 3


def cmd_void(args, settings) -> int:
    service = _build_service(settings)
    if service.void(args.code, args.note):
        print(f"{args.code} is now VOID.")
        return 0
    print(f"Could not void {args.code} (unknown code?).", file=sys.stderr)
    return 1


def cmd_restore(args, settings) -> int:
    service = _build_service(settings)
    if service.restore(args.code):
        print(f"{args.code} is available again.")
        return 0
    print(f"Could not restore {args.code} (not voided?).", file=sys.stderr)
    return 1


def cmd_export(args, settings) -> int:
    service = _build_service(settings)
    source = service.store if args.remote else service.ledger
    path = Path(args.out)
    path.parent.mkdir(parents=True, exist_ok=True)

    fields = [
        "code", "prize_amount", "status", "mobile", "name", "state", "district",
        "claimed_at", "sms_status", "sms_reference", "scan_count",
        "first_scanned_at", "batch", "qr_url", "notes",
    ]
    written = 0
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for coupon in source.iter_coupons():
            if args.claimed_only and coupon.status != CLAIMED:
                continue
            writer.writerow({key: getattr(coupon, key) for key in fields})
            written += 1
    print(f"Exported {written} row(s) to {path}")
    return 0


def cmd_doctor(args, settings) -> int:
    print("Configuration check\n" + "-" * 60)
    print(f"Store backend:    {settings.store_backend}")
    print(f"Ledger:           {settings.ledger_path}")
    print(f"Public base URL:  {settings.public_base_url}")
    print(f"Code prefix:      {settings.code_prefix}")
    print(f"SMS provider:     {settings.sms_provider}")
    print(f"Known states:     {len(states())}")

    problems = settings.problems()
    if not problems:
        print("\nNo problems found.")
    else:
        print(f"\n{len(problems)} thing(s) to look at before going live:")
        for problem in problems:
            print(f"  - {problem}")

    print("\nReachability")
    try:
        service = _build_service(settings)
        total = len(service.ledger.all_codes())
        print(f"  ledger:  OK ({total:,} coupons)")
    except Exception as exc:
        print(f"  ledger:  FAILED - {exc}")
        return 3

    if settings.uses_sheets:
        try:
            remote = len(service.store.all_codes())
            print(f"  sheets:  OK ({remote:,} rows)")
        except Exception as exc:
            print(f"  sheets:  FAILED - {exc}")
            return 3
    return 0 if not problems else 1


def cmd_serve(args, settings) -> int:
    from .web import create_app

    app = create_app(settings=settings)
    print(f"Serving {settings.campaign_name} on http://{args.host}:{args.port}")
    print("This is the Flask development server -- use gunicorn in production "
          "(see docs/DEPLOYMENT.md).")
    app.run(host=args.host, port=args.port, debug=args.debug)
    return 0


# -- argument parsing -------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m coupon.cli",
        description="QR coupon lucky draw: generation and operations.",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="debug logging")
    sub = parser.add_subparsers(dest="command", required=True)

    gen = sub.add_parser("generate", help="mint a batch of coupons and build print files")
    gen.add_argument("--count", type=int, required=True, help="how many coupons to mint")
    gen.add_argument("--batch", default="", help="batch label recorded against each coupon")
    gen.add_argument("--prizes", default="",
                     help='prize plan, e.g. "5000x1,1000x10,500x50"')
    gen.add_argument("--out", default="out", help="directory for the CSV/PDF/PNG output")
    gen.add_argument("--columns", type=int, default=3, help="coupons per row on the PDF")
    gen.add_argument("--rows", type=int, default=4, help="rows of coupons per PDF page")
    gen.add_argument("--qr-images", action="store_true", help="also write one PNG per coupon")
    gen.add_argument("--no-pdf", action="store_true", help="skip the printable PDF")
    gen.add_argument("--show-prize", action="store_true",
                     help="print the prize on each coupon (proofing only, never for print)")
    gen.add_argument("--yes", action="store_true", help="do not ask for confirmation")
    gen.add_argument("--allow-dev-secret", action="store_true",
                     help="allow minting with the development secret or a localhost URL")
    gen.set_defaults(func=cmd_generate)

    stats = sub.add_parser("stats", help="campaign totals")
    stats.add_argument("--remote", action="store_true", help="read the coupon store, not the ledger")
    stats.set_defaults(func=cmd_stats)

    lookup = sub.add_parser("lookup", help="show one coupon")
    lookup.add_argument("code")
    lookup.set_defaults(func=cmd_lookup)

    sync_claims = sub.add_parser("sync-claims", help="push locally recorded claims to the store")
    sync_claims.set_defaults(func=cmd_sync_claims)

    sync_codes = sub.add_parser("sync-codes", help="pull the coupon list from the store")
    sync_codes.set_defaults(func=cmd_sync_codes)

    resend = sub.add_parser("resend-sms", help="re-send the prize SMS for a claimed coupon")
    resend.add_argument("code")
    resend.set_defaults(func=cmd_resend_sms)

    void = sub.add_parser("void", help="take a coupon out of circulation")
    void.add_argument("code")
    void.add_argument("--note", default="voided by operator")
    void.set_defaults(func=cmd_void)

    restore = sub.add_parser("restore", help="undo a void")
    restore.add_argument("code")
    restore.set_defaults(func=cmd_restore)

    export = sub.add_parser("export", help="write the coupon list to CSV")
    export.add_argument("--out", default="out/export.csv")
    export.add_argument("--claimed-only", action="store_true")
    export.add_argument("--remote", action="store_true")
    export.set_defaults(func=cmd_export)

    doctor = sub.add_parser("doctor", help="check configuration and connectivity")
    doctor.set_defaults(func=cmd_doctor)

    serve = sub.add_parser("serve", help="run the claim site (development server)")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=5000)
    serve.add_argument("--debug", action="store_true")
    serve.set_defaults(func=cmd_serve)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s %(name)s: %(message)s",
    )
    settings = get_settings()
    try:
        return args.func(args, settings)
    except KeyboardInterrupt:
        print("\nInterrupted.")
        return 130
    except StoreError as exc:
        print(f"Storage error: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
