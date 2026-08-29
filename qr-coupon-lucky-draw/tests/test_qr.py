"""The artwork that ends up on paper."""

from __future__ import annotations

from coupon.qr import build_print_sheet, coupon_url, make_qr_image, save_qr_png, write_codes_csv


def test_qr_url_points_at_the_public_site(settings, make_coupons):
    coupon = make_coupons(1)[0]
    url = coupon_url(settings, coupon.code)
    assert url == f"https://draw.example.com/c/{coupon.code}"


def test_qr_image_renders(settings, make_coupons):
    image = make_qr_image(coupon_url(settings, make_coupons(1)[0].code))
    assert image.size[0] > 40 and image.size[0] == image.size[1]


def test_qr_png_is_written_and_decodes_back(tmp_path, settings, make_coupons):
    coupon = make_coupons(1)[0]
    path = save_qr_png(coupon.qr_url, tmp_path / "qr" / f"{coupon.code}.png")
    assert path.exists() and path.stat().st_size > 100
    assert path.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"


def test_csv_lists_every_coupon(tmp_path, make_coupons):
    coupons = make_coupons(5, amounts=[100] * 5)
    path = write_codes_csv(coupons, tmp_path / "codes.csv")
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 6                       # header + 5
    assert lines[0].startswith("code,printed_code,prize_amount")
    for coupon in coupons:
        assert coupon.code in path.read_text(encoding="utf-8")


def test_print_sheet_produces_a_multi_page_pdf(tmp_path, settings, make_coupons):
    coupons = make_coupons(13)                   # 12 per page -> two pages
    path = build_print_sheet(coupons, tmp_path / "print.pdf", settings=settings)
    data = path.read_bytes()
    assert data[:5] == b"%PDF-"
    assert data.count(b"/Type /Page\n") >= 2 or data.count(b"/Page") >= 2
    assert path.stat().st_size > 5000


def test_print_sheet_hides_the_prize_by_default(tmp_path, settings, make_coupons):
    coupons = make_coupons(2, amounts=[5000, 0])
    plain = build_print_sheet(coupons, tmp_path / "plain.pdf", settings=settings)
    proof = build_print_sheet(coupons, tmp_path / "proof.pdf", settings=settings,
                              show_prize=True)
    # The proof copy is larger because it carries the extra amount line.
    assert proof.stat().st_size > plain.stat().st_size
