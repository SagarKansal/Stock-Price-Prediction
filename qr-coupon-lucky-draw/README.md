# QR Coupon Lucky Draw

A complete system for running a printed-coupon prize draw.

Every coupon carries a unique alphanumeric code and a QR code. A participant
scans the QR, enters their mobile number, then their name, state and district,
and immediately receives an SMS telling them the prize assigned to that
coupon. Every code and every claim is a row in a Google Sheet. Scanning a
coupon a second time shows that the prize has already been claimed.

```
  mint codes  ──►  print PDF  ──►  scan  ──►  mobile  ──►  name/state/district
       │                                                        │
       ▼                                                        ▼
  Google Sheet  ◄──────────── claim recorded ──────────►  SMS with the prize
```

## What is in the box

| | |
| --- | --- |
| **Unique codes** | 40 bits of randomness plus an HMAC checksum, in an alphabet with no `I`, `L`, `O` or `U` so nothing is misread. |
| **Print-ready artwork** | An A4 PDF, 12 coupons a page with cut guides, plus one PNG per coupon and a CSV for the printer. |
| **Claim site** | A two-step mobile-first form. No framework, no web fonts, works without JavaScript. |
| **Prize assignment** | Decided when coupons are printed, from a prize plan you specify. The payout total is fixed and auditable before a single coupon leaves the building. |
| **SMS** | MSG91 and Twilio built in, plus a console provider for development. |
| **Google Sheets** | One row per code: the prize, the claimant's details, the SMS status. |
| **One prize per coupon** | Guaranteed by a transactional local ledger, not by Google Sheets. |
| **Operations** | CLI for stats, lookup, export, re-sending an SMS, voiding a misprint, and re-syncing after an outage. |

## Quick start

```bash
cd qr-coupon-lucky-draw
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

# Everything local: SQLite instead of Sheets, SMS printed to the console.
export COUPON_CODE_SECRET="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
export COUPON_STORE=sqlite
export CAMPAIGN_NAME="Festive Lucky Draw"

python -m coupon.cli generate --count 25 --batch DEMO \
       --prizes "5000x1,1000x2,250x5" --out out --yes --allow-dev-secret

python -m coupon.cli serve
```

Open `out/DEMO-print.pdf` to see the coupons, then visit the URL from
`out/DEMO-codes.csv` — with `COUPON_PUBLIC_BASE_URL` unset that is
`http://localhost:5000/c/<code>`. The SMS appears in the server log.

Run the tests with `pytest` (114 tests, no network or credentials needed).

## How a coupon code is built

```
DR - 5EMX - FC07 - 9J
│      │       │     │
│      └───────┘     └── 2 check characters: HMAC(secret, prefix+body)
│          │
│          └─────────── 8 random characters (40 bits, ~1.1e12 codes)
└────────────────────── campaign prefix
```

The alphabet is Crockford base32 — `0123456789ABCDEFGHJKMNPQRSTVWXYZ` — with
`I`, `L`, `O` and `U` removed. The first three are the characters people misread
as `1`, `1` and `0`; `U` is dropped so a random code cannot spell something
unfortunate. Input is folded before parsing, so `dr-o1il-0000` and
`DR011 10000` reach the server as the same code.

The check characters make a mistyped or invented code cheap to reject: it fails
the HMAC locally and never costs a Google Sheets read. They are not the security
boundary — that is the coupon list itself, which an attacker would have to hit
by guessing one code in ~11 billion.

> **`COUPON_CODE_SECRET` is permanent.** It fixes the checksum of every code you
> print. Change it and every printed coupon stops validating. Generate it once,
> put it in your secret store, and keep it for the life of the campaign.

## How prizes are decided

Prizes are allocated when coupons are **printed**, not when they are claimed:

```bash
python -m coupon.cli generate --count 10000 --batch DIWALI \
       --prizes "50000x1,5000x10,1000x100,250x500"
```

That mints 10,000 coupons and shuffles 611 prizes across them with
`secrets.SystemRandom`; the remaining 9,389 get `DEFAULT_PRIZE_AMOUNT` (0 by
default, which still sends a "better luck next time" SMS). The generator prints
the exact payout before it commits, and refuses a plan that awards more prizes
than the batch has coupons.

Deciding up front means the payout is capped and known, the draw is auditable
after the fact — the sheet proves what each code was always worth — and the
claim path contains no randomness at all.

Nothing on the printed coupon reveals its prize. `--show-prize` exists only for
proofing an internal copy and must never be used for a real print run.

## One prize per coupon

Google Sheets has no transactions: two people scanning the same coupon at the
same moment could both be told they won. So Sheets is **not** the lock.

A local SQLite ledger is. A claim flips the coupon to `CLAIMED` with a single
conditional update:

```sql
UPDATE coupons SET status = 'CLAIMED', ... WHERE code = ? AND status = 'AVAILABLE'
```

Exactly one caller sees a changed row; everyone else gets "already claimed" and
no SMS. `tests/test_service.py` fires twelve concurrent claims at one coupon
through real SQLite locking and asserts one winner and one SMS.

The order of a claim is deliberate:

1. **Reserve** in the ledger. Only the winner of that race continues.
2. **Send the SMS.** Sending first would text two people about one coupon.
3. **Mirror to Google Sheets.** If Sheets is down the claim still stands, the
   row is flagged unsynced, and `sync-claims` pushes it later.

The cost is a claim whose SMS failed: the prize is recorded but no message
went out. The success page shows the amount anyway and `resend-sms` retries.
That is recoverable; a double-paid prize is not.

> The ledger must live on durable disk that survives a restart —
> `COUPON_LEDGER_PATH` on a mounted volume, not a container's ephemeral
> filesystem. Losing it means losing the record of who claimed what since the
> last sync.

## The claim form

Step two stays hidden until the mobile number is entered and checked, exactly
as specified. Without JavaScript nothing is hidden and the whole form posts in
one go — the server validates every field either way.

- **Mobile** — accepts `+91 98765 43210`, `098765-43210`, `9876543210`; stores
  `9876543210`. Rejects numbers not starting 6-9 and obvious junk like
  `8888888888`.
- **Name** — any script, so `सागर कंसल` is as valid as `S. K. Rao`. Validated by
  Unicode category rather than `\w`, because Indic vowel signs are combining
  marks that `\w` does not match.
- **State** — a closed dropdown of all 36 states and union territories.
- **District** — suggestions narrow to the chosen state, but the field stays
  open. Districts get created and renamed often; a stale list must never block
  a real person from claiming a real prize.

The full mobile number is never echoed back to the browser — screens show
`98XXXXX210`.

## The Google Sheet

One row per code. Columns to the right of the code fill in as it is claimed:

| Code | Prize Amount | Status | Mobile | Name | State | District | Claimed At (UTC) | SMS Status | SMS Reference | Scan Count | First Scanned At | Batch | QR URL | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DR5EMXFC079J | 5000 | CLAIMED | 9876543210 | Priya Sharma | Karnataka | Bengaluru Urban | 2026-08-28T14:54:17+00:00 | SENT | ref-1 | 3 | 2026-08-28T14:53:56+00:00 | DIWALI | https://… | |
| DR9N3GC8G7Y1 | 0 | AVAILABLE | | | | | | | | 0 | | DIWALI | https://… | |

Reads are cached for 45 seconds, and writes happen once per claim, so a
campaign stays well inside Google's ~60-reads-per-minute quota.

See [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md) for the service
account setup.

## Commands

```bash
python -m coupon.cli generate --count N --batch LABEL --prizes "5000x1,500x20"
python -m coupon.cli serve                  # development server
python -m coupon.cli doctor                 # check config and connectivity
python -m coupon.cli stats                  # totals, payout, claims by state
python -m coupon.cli lookup DR-5EMX-FC07-9J
python -m coupon.cli export --out claims.csv --claimed-only
python -m coupon.cli resend-sms DR-5EMX-FC07-9J
python -m coupon.cli void DR-5EMX-FC07-9J --note "misprinted sheet"
python -m coupon.cli restore DR-5EMX-FC07-9J
python -m coupon.cli sync-claims            # push claims Sheets has not taken
python -m coupon.cli sync-codes             # pull the code list into the ledger
```

`generate` refuses to run with the development secret or a `localhost` base URL
unless you pass `--allow-dev-secret`, because both mistakes are invisible until
the coupons are already printed.

## Configuration

Copy `.env.example` to `.env` and fill it in. The settings that matter most:

| Variable | Purpose |
| --- | --- |
| `COUPON_CODE_SECRET` | Fixes every code's checksum. Set once, never change. |
| `COUPON_PUBLIC_BASE_URL` | Baked into every QR image at generation time. |
| `COUPON_LEDGER_PATH` | The claim ledger. Must be durable disk. |
| `COUPON_STORE` | `sheets` or `sqlite`. |
| `GOOGLE_SHEET_ID`, `GOOGLE_CREDENTIALS_FILE` | Sheets backend. |
| `SMS_PROVIDER` | `msg91`, `twilio` or `console`. |
| `SMS_TEMPLATE` | Placeholders: `{name} {code} {amount} {mobile} {currency} {campaign}`. |
| `DEFAULT_PRIZE_AMOUNT` | Amount for coupons outside every prize tier. |
| `COUPON_ADMIN_TOKEN` | Enables `GET /admin/stats`. Unset keeps it a 404. |
| `RATE_LIMIT_PER_MINUTE` | Per-IP limit on form posts. |

`python -m coupon.cli doctor` reports anything still on a development default.

## Routes

| Route | Purpose |
| --- | --- |
| `GET /` | Landing page with manual code entry, for a QR that will not scan. |
| `GET /c/<code>` | What a scan lands on: the form, or the already-claimed page. |
| `POST /c/<code>/check-mobile` | Validates the number and unlocks step two. |
| `POST /c/<code>/claim` | Records the claim and sends the SMS. |
| `GET /healthz` | Liveness probe. |
| `GET /admin/stats` | Campaign totals, behind `COUPON_ADMIN_TOKEN`. |

## Layout

```
coupon/
  codes.py        code generation, checksums, normalisation
  prizes.py       prize plans and allocation
  qr.py           QR images, print PDF, CSV
  validation.py   mobile/name/state/district rules
  geo.py          states and districts
  service.py      the claim flow, used by both the web app and the CLI
  sms.py          MSG91, Twilio, console
  store/          base contract, SQLite ledger, Google Sheets
  web/            Flask app, routes, templates, CSS/JS
  cli.py          generate, sync, stats, lookup, export, void
tests/            114 tests, no network or credentials required
docs/             Google Sheets setup, deployment
```

## Before going live

- [ ] `COUPON_CODE_SECRET` generated, stored in a secret manager, and backed up.
- [ ] `COUPON_PUBLIC_BASE_URL` is the real HTTPS URL — check it in the CSV before printing.
- [ ] `COUPON_LEDGER_PATH` on durable disk, with backups.
- [ ] Scan a proof coupon with a real phone camera before the full print run.
- [ ] SMS sender ID and DLT template registered (India) and one live message tested.
- [ ] `TRUST_PROXY_HEADERS=true` only behind a reverse proxy you control.
- [ ] `python -m coupon.cli doctor` reports no problems.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the server setup.

## Known limits

- **Rate limiting is per process.** Behind several instances, put a real
  limiter in the proxy.
- **The ledger is single-host.** The atomic claim is a SQLite transaction, so
  running several instances against separate ledgers would break the guarantee.
  For multi-instance, point the ledger at Postgres by implementing the same
  conditional-update contract in `store/`.
- **The district list will age.** It ships as a JSON file precisely so it can
  be replaced, and unlisted districts are accepted anyway.
- **Participant data is personal data.** The ledger holds names and mobile
  numbers; `data/` and `out/` are gitignored. Keep the sheet's sharing tight
  and delete both when the campaign is settled.
