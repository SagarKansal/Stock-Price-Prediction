"""The journey a participant actually takes, through real HTTP requests."""

from __future__ import annotations

from coupon.codes import format_for_print, generate, printed_form

GOOD_FORM = {
    "mobile": "9876543210",
    "name": "Priya Sharma",
    "state": "Karnataka",
    "district": "Bengaluru Urban",
}


def test_landing_page_offers_manual_entry(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Claim your prize" in response.data
    assert b'name="code"' in response.data


def test_scanning_a_coupon_shows_the_mobile_step(client, make_coupons):
    coupon = make_coupons(1)[0]
    response = client.get(f"/c/{coupon.code}")
    assert response.status_code == 200
    body = response.data.decode()
    assert 'id="mobile"' in body
    # Step two is present but locked until the number is entered.
    assert 'data-locked="true"' in body
    assert 'id="state"' in body
    assert "Karnataka" in body
    # The prize must never be revealed before the claim.
    assert "1,000" not in body


def test_scan_is_counted(client, make_coupons, service):
    coupon = make_coupons(1)[0]
    client.get(f"/c/{coupon.code}")
    client.get(f"/c/{coupon.code}")
    assert service.ledger.get(coupon.code).scan_count == 2


def test_check_mobile_unlocks_step_two(client, make_coupons):
    coupon = make_coupons(1)[0]
    response = client.post(f"/c/{coupon.code}/check-mobile", data={"mobile": "+91 98765 43210"})
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["ok"] is True
    assert payload["mobile"] == "9876543210"
    assert payload["masked"] == "98XXXXX210"


def test_check_mobile_rejects_a_bad_number(client, make_coupons):
    coupon = make_coupons(1)[0]
    response = client.post(f"/c/{coupon.code}/check-mobile", data={"mobile": "12345"})
    assert response.status_code == 400
    assert response.get_json()["ok"] is False


def test_full_claim_shows_the_prize_and_sends_the_sms(client, make_coupons, sms):
    coupon = make_coupons(1, amounts=[5000])[0]
    response = client.post(f"/c/{coupon.code}/claim", data=GOOD_FORM)

    assert response.status_code == 200
    body = response.data.decode()
    assert "Congratulations" in body
    assert "₹5,000" in body
    # Shown exactly as printed on the coupon, hyphens included.
    assert printed_form(coupon.code) in body
    assert "98XXXXX210" in body
    # The full mobile number never goes back to the browser.
    assert "9876543210" not in body

    assert len(sms.sent) == 1
    assert "5,000" in sms.sent[0][1]


def test_a_second_scan_shows_the_prize_is_already_claimed(client, make_coupons):
    coupon = make_coupons(1)[0]
    client.post(f"/c/{coupon.code}/claim", data=GOOD_FORM)

    response = client.get(f"/c/{coupon.code}")
    assert response.status_code == 200
    body = response.data.decode()
    assert "Prize already claimed" in body
    assert "Priya Sharma" in body
    assert "98XXXXX210" in body
    # No form to fill in a second time.
    assert 'id="claim-form"' not in body


def test_a_second_submission_is_refused(client, make_coupons, sms):
    coupon = make_coupons(1)[0]
    client.post(f"/c/{coupon.code}/claim", data=GOOD_FORM)

    second = client.post(f"/c/{coupon.code}/claim", data={
        **GOOD_FORM, "mobile": "9123456780", "name": "Someone Else",
    })
    assert second.status_code == 409
    assert "Prize already claimed" in second.data.decode()
    assert len(sms.sent) == 1


def test_check_mobile_stops_a_coupon_claimed_elsewhere(client, make_coupons):
    coupon = make_coupons(1)[0]
    client.post(f"/c/{coupon.code}/claim", data=GOOD_FORM)

    response = client.post(f"/c/{coupon.code}/check-mobile", data={"mobile": "9123456780"})
    assert response.status_code == 409
    assert response.get_json()["claimed"] is True


def test_an_invalid_code_is_a_404(client):
    response = client.get("/c/DR-0000-0000-00")
    assert response.status_code == 404
    assert b"Invalid coupon code" in response.data


def test_a_well_formed_but_unprinted_code_is_a_404(client):
    unprinted = generate(1)[0]
    response = client.get(f"/c/{unprinted}")
    assert response.status_code == 404
    assert b"not recognised" in response.data


def test_a_voided_coupon_is_gone(client, make_coupons, service):
    coupon = make_coupons(1)[0]
    service.void(coupon.code)
    response = client.get(f"/c/{coupon.code}")
    assert response.status_code == 410
    assert b"cancelled" in response.data


def test_form_errors_come_back_together_with_the_values(client, make_coupons):
    coupon = make_coupons(1)[0]
    response = client.post(f"/c/{coupon.code}/claim", data={
        "mobile": "123", "name": "", "state": "Atlantis", "district": "",
    })
    assert response.status_code == 400
    body = response.data.decode()
    assert "Enter the 10-digit mobile number." in body
    assert "Please enter your full name." in body
    assert "Please choose a state from the list." in body


def test_manual_entry_redirects_to_the_coupon(client, make_coupons):
    coupon = make_coupons(1)[0]
    printed = format_for_print(coupon.code, "DR")
    response = client.post("/enter", data={"code": printed.lower()})
    assert response.status_code == 302
    assert response.headers["Location"].endswith(f"/c/{coupon.code}")


def test_manual_entry_rejects_nonsense(client):
    response = client.post("/enter", data={"code": "hello world"})
    assert response.status_code == 400
    assert b"does not look right" in response.data


def test_health_endpoint(client):
    assert client.get("/healthz").get_json() == {"status": "ok"}


def test_admin_stats_needs_the_token(client, make_coupons):
    make_coupons(3, amounts=[1000, 0, 0])
    assert client.get("/admin/stats").status_code == 403
    assert client.get("/admin/stats?token=wrong").status_code == 403

    response = client.get("/admin/stats?token=admin-token-for-tests")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 3
    assert payload["available"] == 3
    assert payload["prize_pool"] == 1000


def test_admin_stats_is_hidden_when_no_token_is_configured(monkeypatch, settings, store, sms):
    from coupon.config import load_settings, reset_settings_cache
    from coupon.web import create_app

    monkeypatch.setenv("COUPON_ADMIN_TOKEN", "")
    reset_settings_cache()
    app = create_app(settings=load_settings(), store=store, ledger=store, sms_provider=sms)
    assert app.test_client().get("/admin/stats").status_code == 404


def test_rate_limiting_kicks_in(monkeypatch, settings, store, sms, make_coupons):
    from coupon.config import load_settings, reset_settings_cache
    from coupon.web import create_app

    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "3")
    reset_settings_cache()
    app = create_app(settings=load_settings(), store=store, ledger=store, sms_provider=sms)
    client = app.test_client()
    coupon = make_coupons(1)[0]

    codes = [
        client.post(f"/c/{coupon.code}/check-mobile", data={"mobile": "9876543210"}).status_code
        for _ in range(5)
    ]
    assert codes.count(429) >= 2


def test_unknown_page_is_a_friendly_404(client):
    response = client.get("/no-such-page")
    assert response.status_code == 404
    assert b"Page not found" in response.data
