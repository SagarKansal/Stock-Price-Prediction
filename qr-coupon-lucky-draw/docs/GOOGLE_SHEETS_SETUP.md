# Google Sheets setup

The claim site talks to your sheet as a **service account** — a robot Google
account with its own key file. No OAuth consent screen, no browser login on the
server, and no dependency on one employee's Google account still existing next
year.

## 1. Create the project and service account

1. Open the [Google Cloud console](https://console.cloud.google.com/) and create
   a project (or pick an existing one).
2. **APIs & Services → Library**: enable both
   - **Google Sheets API**
   - **Google Drive API**
3. **APIs & Services → Credentials → Create credentials → Service account**.
   Name it something like `coupon-draw`. No roles are needed — access is granted
   by sharing the sheet, not by IAM.
4. Open the new service account → **Keys → Add key → Create new key → JSON**.
   A `.json` file downloads. This is a credential: treat it like a password.

## 2. Put the key somewhere the server can read it

```bash
sudo mkdir -p /etc/coupon
sudo mv ~/Downloads/coupon-draw-*.json /etc/coupon/service-account.json
sudo chown root:coupon /etc/coupon/service-account.json
sudo chmod 640 /etc/coupon/service-account.json
```

Never commit it. `.gitignore` already excludes `service-account*.json`,
`credentials*.json` and `.env`.

## 3. Create the sheet and share it

1. Create a new Google Sheet. Name the first worksheet **`Coupons`** (or set
   `GOOGLE_WORKSHEET` to whatever you call it).
2. Take the sheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/`**`1AbC…xyz`**`/edit`
3. Share the sheet with the service account's address — the `client_email`
   field in the JSON key, something like
   `coupon-draw@my-project.iam.gserviceaccount.com` — with **Editor** access.

Forgetting step 3 is the single most common failure. The symptom is a
`could not open Google Sheet` error from `doctor`, even though the ID is right.

You do not need to create the header row. The first connection writes it, and
rewrites it if it does not match.

## 4. Point the app at it

```bash
export COUPON_STORE=sheets
export GOOGLE_CREDENTIALS_FILE=/etc/coupon/service-account.json
export GOOGLE_SHEET_ID=1AbC…xyz
export GOOGLE_WORKSHEET=Coupons

python -m coupon.cli doctor
```

`doctor` prints `sheets: OK (0 rows)` when it can reach the worksheet.

## 5. Mint a batch

```bash
python -m coupon.cli generate --count 1000 --batch DIWALI \
       --prizes "50000x1,5000x10,1000x100" --out out
```

Coupons are written to the local ledger first and appended to the sheet second.
If the append fails, the campaign still works — the rows are flagged unsynced
and `python -m coupon.cli sync-claims` pushes them once Sheets is reachable.

## The columns

| Column | Written when | Notes |
| --- | --- | --- |
| Code | generation | The canonical code, no hyphens. This is the lookup key. |
| Printed Code | generation | The same code as printed on the coupon (`DR-5EMX-FC07-9J`). Search this column when a caller reads their code out. |
| Prize Amount | generation | Fixed at generation. Do not edit for a live campaign. |
| Status | generation, claim | `AVAILABLE`, `CLAIMED` or `VOID`. |
| Mobile, Name, State, District | claim | What the participant entered. |
| Claimed At (UTC) | claim | ISO-8601. |
| SMS Status / Reference | claim | `SENT` or `FAILED`, plus the gateway's ID. |
| Scan Count / First Scanned At | claim, sync | Counted in the ledger, pushed on claim. |
| Batch | generation | The `--batch` label. |
| QR URL | generation | Exactly what the QR image encodes. |
| Notes | void | Why a coupon was taken out of circulation. |

## Editing the sheet by hand

The sheet is a report as well as a store, so people will edit it. What is safe:

- **Safe.** Sorting and filtering; adding columns to the right of `Notes`;
  conditional formatting; formulas on another worksheet; formatting the prize
  column as currency (`₹1,000` is parsed back correctly).
- **Not safe.** Reordering or renaming the columns the app writes — the row
  layout is positional. Deleting rows for live codes. Editing `Status` or
  `Prize Amount` while the campaign is running: the ledger, not the sheet,
  decides who claimed what, and `sync-claims` will overwrite you.

To take a coupon out of circulation, use `python -m coupon.cli void <code>`
rather than editing the cell, so the ledger and the sheet agree.

## Duplicate codes

A spreadsheet has no unique constraint, so unlike the SQLite ledger the sheet
cannot enforce uniqueness for itself. `add_batch` therefore checks: it
force-refreshes the sheet's code list and refuses the whole batch if any code
is already there, or repeated within the batch.

That check is not atomic. Two operators running `generate` against the same
sheet at the same instant could both pass it and both append. In practice:

- **Generate from one machine.** There is no reason to do otherwise.
- **Run `python -m coupon.cli verify --remote` before every print run.** It
  audits the sheet for duplicate codes and duplicate QR URLs, and exits
  non-zero if it finds any.
- **Do not paste rows into the sheet by hand.** `verify --remote` will catch
  it, but only if you run it.

## Quota

The Sheets API allows roughly 60 read requests per minute per user. The app
stays well under it: reads come from a 45-second cache of the whole sheet, and
a claim costs one write. Scan counts are tallied locally and pushed with the
claim rather than on every page view.

A batch of more than ~500 coupons is appended in chunks. Rate-limit and 5xx
responses are retried with exponential backoff.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `could not open Google Sheet <id>` | The sheet is not shared with the service account's `client_email`, or the ID is wrong. |
| `service account file not found` | `GOOGLE_CREDENTIALS_FILE` path is wrong, or the server user cannot read it. |
| `403 … API has not been used` | The Sheets or Drive API is not enabled on the project. |
| Rows append but never update | Almost always a hand-reordered header row. Check row 1 against the table above. |
| `Unsynced claims: N` in `stats` | Sheets was unreachable during a claim. Run `sync-claims`. |
