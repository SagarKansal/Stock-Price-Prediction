# Deployment

The claim site is an ordinary WSGI app. What makes it slightly unusual is that
**one file on disk — the SQLite ledger — is the thing that stops a coupon being
claimed twice**. Everything below follows from protecting that file.

## Shape of the deployment

```
   phone ──HTTPS──►  nginx  ──►  gunicorn (3 workers)  ──►  ledger.db  (durable disk)
                                        │
                                        └──►  Google Sheets   (the report)
                                        └──►  MSG91 / Twilio  (the SMS)
```

Gunicorn workers are separate processes on **one host**, all opening the same
ledger file. SQLite in WAL mode serialises their writes, so the atomic claim
holds across workers. It does **not** hold across hosts — see
[Scaling past one host](#scaling-past-one-host).

## 1. Install

```bash
sudo useradd --system --home /var/lib/coupon --create-home coupon
sudo -u coupon git clone <your-repo> /opt/coupon
cd /opt/coupon/qr-coupon-lucky-draw
sudo -u coupon python3 -m venv .venv
sudo -u coupon .venv/bin/pip install -r requirements.txt
```

## 2. Configure

```bash
sudo install -d -o coupon -g coupon -m 750 /var/lib/coupon
sudo install -o coupon -g coupon -m 600 /dev/null /etc/coupon/coupon.env
sudoedit /etc/coupon/coupon.env      # start from .env.example
```

Generate the two secrets once:

```bash
python3 -c 'import secrets; print("COUPON_CODE_SECRET=" + secrets.token_urlsafe(32))'
python3 -c 'import secrets; print("FLASK_SECRET_KEY="   + secrets.token_urlsafe(32))'
```

Then check it:

```bash
sudo -u coupon env $(cat /etc/coupon/coupon.env | xargs) \
     /opt/coupon/qr-coupon-lucky-draw/.venv/bin/python -m coupon.cli doctor
```

## 3. systemd unit

`/etc/systemd/system/coupon.service`:

```ini
[Unit]
Description=QR coupon lucky draw
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=coupon
Group=coupon
WorkingDirectory=/opt/coupon/qr-coupon-lucky-draw
EnvironmentFile=/etc/coupon/coupon.env
ExecStart=/opt/coupon/qr-coupon-lucky-draw/.venv/bin/gunicorn \
    --workers 3 --threads 4 --timeout 30 \
    --bind 127.0.0.1:8000 \
    --access-logfile - --error-logfile - \
    run:app
Restart=always
RestartSec=3

# The ledger and the credentials are the only paths this needs to touch.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/coupon

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now coupon
```

Threads rather than extra workers keep the number of processes writing to the
ledger low while still absorbing the latency of an SMS gateway call.

## 4. nginx and TLS

```nginx
server {
    listen 443 ssl http2;
    server_name draw.example.com;

    ssl_certificate     /etc/letsencrypt/live/draw.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/draw.example.com/privkey.pem;

    # A coupon page is tiny; this is plenty and blunts code enumeration.
    limit_req_zone $binary_remote_addr zone=coupon:10m rate=30r/m;

    location / {
        limit_req zone=coupon burst=20 nodelay;
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        allow 203.0.113.0/24;      # your office
        deny all;
        proxy_pass http://127.0.0.1:8000;
    }
}

server {
    listen 80;
    server_name draw.example.com;
    return 301 https://$host$request_uri;
}
```

Set `TRUST_PROXY_HEADERS=true` **only** with a proxy like this in front. Without
one, a client can forge `X-Forwarded-For` and walk straight through the rate
limiter.

Keep the host short — it is printed on every coupon and typed by anyone whose
camera will not focus.

## 5. Back up the ledger

The ledger holds every claim since the last successful sync to Sheets. Losing
it means losing that record.

```bash
# /etc/cron.daily/coupon-backup
sqlite3 /var/lib/coupon/ledger.db ".backup '/var/backups/coupon-$(date +%F).db'"
find /var/backups -name 'coupon-*.db' -mtime +30 -delete
```

Use `.backup`, not `cp` — copying a live WAL database can capture a torn state.

Also worth a cron entry, to heal after any Sheets outage:

```bash
*/15 * * * * cd /opt/coupon/qr-coupon-lucky-draw && \
  .venv/bin/python -m coupon.cli sync-claims >/dev/null
```

## 6. Print run

Generate coupons **on a machine with the production secret and base URL**, or
the QR codes will point at the wrong host and the checksums will not match what
the server expects.

```bash
python -m coupon.cli generate --count 10000 --batch DIWALI \
       --prizes "50000x1,5000x10,1000x100,250x500" --out out
```

Then audit the batch before it goes anywhere near a printer:

```bash
python -m coupon.cli verify            # duplicates, checksums, QR URLs
python -m coupon.cli verify --remote   # the same, against the sheet
```

Both must exit 0. A duplicate code costs nothing to fix now and cannot be
fixed once the coupons are printed.

Before committing to a full print run:

1. Print **one** page of the PDF on the actual coupon stock.
2. Scan it with a real phone camera, in the light the coupons will be handled in.
3. Follow the whole flow through to the SMS.
4. Check the code in `out/*-codes.csv` matches what the phone opened.

Keep the QR at 20mm or larger on the finished coupon, keep a white quiet zone
around it, and do not print it over a background image. Error correction is set
to M, which survives about 15% damage — enough for a thumbprint or a fold.

## Monitoring

| Check | How |
| --- | --- |
| Liveness | `GET /healthz` |
| Claim rate, payout | `GET /admin/stats` with `X-Admin-Token`, or `cli stats` |
| Unsynced claims | `unsynced_claims` in `/admin/stats` — should sit at 0 |
| SMS failures | `grep 'SMS failed' ` in the journal; `cli export` and filter `sms_status=FAILED` |

`SMS Status = FAILED` rows are the ones that need a human: the prize is
recorded but the winner has not been told. Re-send with
`python -m coupon.cli resend-sms <code>`.

## Scaling past one host

The atomic claim is a SQLite transaction, so two hosts with two ledgers would
each happily hand out the same coupon.

If you need more than one host:

1. Implement `CouponStore` plus `try_claim` against Postgres — the same
   conditional `UPDATE ... WHERE status = 'AVAILABLE'` works unchanged, and
   `RETURNING` makes it a single statement.
2. Point every instance at it and move rate limiting into the proxy.

For most campaigns this is not needed. One modest host serves a scan-and-claim
that takes a few database operations and one HTTP call, and the traffic is
spread over however long it takes people to find their coupons.

## Data protection

The ledger and the sheet hold names and mobile numbers.

- Restrict who the sheet is shared with, and review it after the campaign.
- `data/` and `out/` are gitignored — keep it that way.
- Delete the ledger backups and the sheet once prizes are settled and any
  statutory retention period has passed.
- The site never echoes a full mobile number back to the browser, and sets
  `noindex` so claim pages stay out of search results.
