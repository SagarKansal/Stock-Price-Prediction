"""QR images and the print-ready PDF that goes to the coupon printer."""

from __future__ import annotations

import csv
from pathlib import Path

from .codes import format_for_print, printed_form
from .config import Settings
from .store import Coupon

# Error correction M survives roughly 15% damage, which is the right trade for
# a paper coupon: enough to read through a thumbprint or a fold, without
# inflating the module count the way H would.
_ERROR_CORRECTION = "M"


class CouponArtworkError(ValueError):
    """A coupon could not be rendered because its QR and its text disagree."""


def coupon_url(settings: Settings, code: str) -> str:
    """The URL encoded in the QR image for ``code``."""
    return f"{settings.public_base_url}/c/{code}"


def code_from_url(url: str) -> str:
    """Pull the coupon code back out of a QR payload."""
    return (url or "").rstrip("/").rsplit("/", 1)[-1].strip().upper()


def qr_payload(coupon: Coupon, settings: Settings) -> str:
    """The URL to encode for ``coupon``, derived from the code it will print.

    The QR and the human-readable code beneath it are the same identifier, and
    this is what makes that structural rather than a coincidence: both come
    from ``coupon.code``. A stored ``qr_url`` is honoured -- a campaign may
    legitimately have moved host between generating and reprinting -- but only
    once it is confirmed to carry the very code that will be printed. If it
    does not, the coupon is not rendered at all: a coupon whose QR opens
    someone else's prize is worse than a coupon that was never printed.
    """
    expected = coupon_url(settings, coupon.code)
    if not coupon.qr_url:
        return expected

    embedded = code_from_url(coupon.qr_url)
    if embedded != coupon.code:
        raise CouponArtworkError(
            f"coupon {coupon.code} would print a QR code for {embedded or '(no code)'} "
            f"-- its stored QR URL is {coupon.qr_url!r}. Re-run 'cli.py verify' "
            "and regenerate the batch rather than printing this."
        )
    return coupon.qr_url


def make_qr_image(url: str, *, box_size: int = 10, border: int = 2):
    """Render ``url`` as a QR code and return a PIL image."""
    import qrcode
    from qrcode.constants import ERROR_CORRECT_M

    qr = qrcode.QRCode(
        version=None,                 # smallest version that fits
        error_correction=ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGB")


def save_qr_png(url: str, path: Path, *, box_size: int = 10, border: int = 2) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    make_qr_image(url, box_size=box_size, border=border).save(path, format="PNG")
    return path


def write_codes_csv(coupons: list[Coupon], path: Path, *, prefix: str) -> Path:
    """A CSV of the batch, for the printer and for your own records."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["code", "printed_code", "prize_amount", "batch", "qr_url"])
        for coupon in coupons:
            writer.writerow([
                coupon.code,
                coupon.printed_code or format_for_print(coupon.code, prefix),
                coupon.prize_amount,
                coupon.batch,
                coupon.qr_url,
            ])
    return path


def build_print_sheet(
    coupons: list[Coupon],
    path: Path,
    *,
    settings: Settings,
    columns: int = 3,
    rows: int = 4,
    show_prize: bool = False,
) -> Path:
    """Lay the batch out as a printable PDF, ``columns x rows`` per A4 page.

    ``show_prize`` is off by default and should stay off for anything that
    gets printed -- a coupon that reveals its own prize before it is scanned
    defeats the draw. It exists for proofing an internal copy.
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas as pdf_canvas

    path.parent.mkdir(parents=True, exist_ok=True)
    page_width, page_height = A4
    margin = 10 * mm
    cell_width = (page_width - 2 * margin) / columns
    cell_height = (page_height - 2 * margin) / rows
    per_page = columns * rows

    pdf = pdf_canvas.Canvas(str(path), pagesize=A4)
    pdf.setTitle(f"{settings.campaign_name} coupons")

    # The QR bitmap is identical in size for every coupon, so render once per
    # coupon at a fixed box size and let reportlab scale it into the cell.
    qr_side = min(cell_width, cell_height) * 0.55

    for index, coupon in enumerate(coupons):
        position = index % per_page
        if index and position == 0:
            pdf.showPage()

        column = position % columns
        row = position // columns
        cell_x = margin + column * cell_width
        cell_y = page_height - margin - (row + 1) * cell_height

        # Cut guide.
        pdf.setDash(1, 2)
        pdf.setStrokeColorRGB(0.75, 0.75, 0.75)
        pdf.rect(cell_x, cell_y, cell_width, cell_height, stroke=1, fill=0)
        pdf.setDash()

        centre_x = cell_x + cell_width / 2

        pdf.setFillColorRGB(0.1, 0.1, 0.1)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawCentredString(
            centre_x, cell_y + cell_height - 7 * mm, settings.campaign_name.upper()[:34]
        )

        # Same source of truth as the text drawn below: coupon.code.
        image = ImageReader(make_qr_image(qr_payload(coupon, settings), box_size=8, border=1))
        pdf.drawImage(
            image,
            centre_x - qr_side / 2,
            cell_y + cell_height - 11 * mm - qr_side,
            width=qr_side,
            height=qr_side,
            preserveAspectRatio=True,
            mask="auto",
        )

        text_y = cell_y + cell_height - 15 * mm - qr_side
        pdf.setFont("Courier-Bold", 11)
        # An operator-authored code prints exactly as it was written; a minted
        # one prints in its hyphenated groups.
        pdf.drawCentredString(
            centre_x, text_y,
            coupon.printed_code or printed_form(coupon.code, prefix=settings.code_prefix),
        )

        pdf.setFont("Helvetica", 6.5)
        pdf.setFillColorRGB(0.35, 0.35, 0.35)
        pdf.drawCentredString(centre_x, text_y - 4.5 * mm, "Scan the QR code to claim your prize")
        host = settings.public_base_url.split("//")[-1]
        pdf.drawCentredString(centre_x, text_y - 8 * mm, f"or visit {host}")
        if settings.support_phone:
            pdf.drawCentredString(
                centre_x, text_y - 11.5 * mm, f"Helpline {settings.support_phone}"
            )

        if show_prize:
            pdf.setFont("Helvetica-Bold", 8)
            pdf.setFillColorRGB(0.7, 0.1, 0.1)
            pdf.drawCentredString(
                centre_x, cell_y + 3 * mm,
                f"PROOF ONLY {settings.currency_symbol}{coupon.prize_amount:,}",
            )

    pdf.showPage()
    pdf.save()
    return path
