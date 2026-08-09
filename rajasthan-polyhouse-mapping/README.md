# Satellite Mapping of Protected Cultivation Structures — Rajasthan

Status as of this commit: **research + pipeline scaffolding only, no detections have been
run yet.** Nothing in `data/outputs/` should be treated as real output. Decisions made so
far: GEE noncommercial tier confirmed (section 4a), Stage 2 execution deliberately on hold
until Stage 1 has real output (section 4b), and a parallel outreach track to the
Horticulture Department is in progress (section 1 /
[`docs/horticulture_dept_data_request.md`](docs/horticulture_dept_data_request.md)).
Next concrete step is on you: complete GEE registration (section 4a) and hand me the
project ID/credentials so Stage 1 can actually run on Jaipur/Sikar.

## 1. Does this mapping already exist? (researched, not exhaustive)

I could not get a definitive yes/no, for two reasons: search-engine results only go so
far, and **this Claude Code remote-execution container's network egress policy blocks
`*.nrsc.gov.in`, `bhuvan.nrsc.gov.in`, and `evaluation.rajasthan.gov.in`** (confirmed by
direct fetch attempts, not inferred) — so I could not browse Bhuvan's thematic layer
catalog or the Rajasthan evaluation-department page myself. Everything below is from
search-result snippets, not a firsthand look at those portals. **You (or a future session
without this restriction) should check these two directly before trusting a "no dataset
exists" conclusion:**
- Bhuvan thematic layers: https://bhuvan-app1.nrsc.gov.in/thematic/
- NRSC agriculture applications: https://www.nrsc.gov.in/nrscnew/Agr_Apps.php

What the search evidence does show:

| Source | Finding |
|---|---|
| **ISRO Bhuvan** | Has general agriculture/LULC thematic layers (crop maps, disaster, hydrology). No search result surfaced a dedicated "protected cultivation" / "polyhouse" layer. Inconclusive — needs a direct portal check I couldn't do. |
| **RSAC / SRSAC Rajasthan (Jodhpur)** | Real, active center; does natural-resource mapping (watersheds, forests, wastelands) for state departments. No publication or dataset specifically about polyhouse/greenhouse mapping turned up. |
| **Rajasthan Horticulture Dept. / NHM subsidy scheme** | **Strong lead, not a dataset in hand.** Geo-tagged photo verification is a *mandatory* step before subsidy disbursement (DBT) for polyhouses/shade-net houses — "the department conducts a final inspection, uploads geo-tagged photos, and the subsidy amount is directly credited." This means geo-tagged records of subsidized structures very likely exist inside the department's internal system. No public export/API/download was found. This is the one lead worth a direct ask to the Horticulture Department or via an RTI/data-sharing request, since it would cover every *subsidized* structure (not unsubsidized ones) with much higher confidence than anything a vision model will produce. |
| **Raj Kisan Sathi portal** (rajkisan.rajasthan.gov.in) | Application/tracking portal for the subsidy above, login via Jan Aadhaar. No public open-data API or bulk export found. Related portals worth checking directly: Jan Soochna Portal (scheme transparency) and the "Sewadwaar" API gateway — neither confirmed to expose structure-level geolocation, just flagged as unexplored. |
| **NABARD / NHM GIS studies** | Found a general NABARD horticulture policy paper and confirmation that NHM funds protected cultivation in Rajasthan (44.9 lakh sqm under greenhouses, 6.76 lakh sqm under shade-net houses, statewide, per one source) — no dataset with individual structure locations. |

**Bottom line:** no ready-to-use public dataset surfaced. The most promising path to
*real* ground truth remains the Horticulture Department's subsidy-verification geo-tags —
worth pursuing as an actual outreach/request, separate from and probably higher-value than
building a computer-vision pipeline from scratch, since it would only need validation, not
detection. **Decision: pursuing both in parallel.** Draft outreach letter (informal
data-sharing request) and a fallback formal RTI application are in
[`docs/horticulture_dept_data_request.md`](docs/horticulture_dept_data_request.md) — both
have placeholders for the addressee/portal since I couldn't verify current details of
gov.in sites from this sandbox. Read that file, fill in your details, and send whichever
you're comfortable with; report back what comes of it since it changes how much the CV
pipeline below needs to carry on its own.

## 2. Environment constraint found while building this (important)

This pipeline was scaffolded inside a Claude Code **remote execution container**, whose
network egress is allow-listed rather than open. I tested reachability directly:

| Host | Reachable from this container? |
|---|---|
| `earthengine.googleapis.com`, `storage.googleapis.com`, `accounts.google.com`, `oauth2.googleapis.com` | **Yes** — plain HTTPS connections succeeded |
| `code.earthengine.google.com` (the GEE web code editor) | **No** — blocked |
| `services.arcgisonline.com` (ESRI World Imagery tiles) | **No** — blocked |
| `overpass-api.de`, `nominatim.openstreetmap.org`, `gadm.org`, `www.naturalearthdata.com`, `download.geofabrik.de` | **No** — blocked |
| `raw.githubusercontent.com`, `api.github.com` | **Yes** |
| `*.nrsc.gov.in`, `rajasthan.gov.in` subdomains | **No** — blocked |

Practical effect: **Stage 1 (Earth Engine) is technically reachable from this container
once authenticated**, but **Stage 2 (ESRI tile fetching) is not reachable at all from
here**, regardless of licensing status. If you want to actually execute Stage 2 (or
re-verify Stage 1 with a live pull) you'll need to either run this repo on your own
machine / a CI runner / a differently-configured environment, or ask for this
container's egress policy to be widened for those specific hosts. I haven't assumed
that's possible — flagging it rather than working around it.

Stage 0 (admin boundaries) **is** done and committed — I found a reachable, if unofficial,
source (see below) and ran it for real.

## 3. What's actually been done vs. what's blocked

**Done, for real, in this commit:**
- `src/stage0_boundaries.py` — fetches India district boundaries (GADM-derived, via
  https://github.com/geohacker/india, since GADM's own site and OSM/Natural Earth were
  unreachable), filters to Rajasthan, writes `data/boundaries/rajasthan_state.geojson`,
  `rajasthan_districts.geojson` (32 districts), and per-pilot-district files for Jaipur
  (~10,841 sq km) and Sikar (~7,415 sq km). This ran successfully and the output files are
  committed.
- Full Stage 1–5 code (`src/stage1_coarse_screening.py` through `src/stage5_export.py`,
  `src/pipeline.py`), written and internally consistent, but **not executed** — see
  blockers below. Read each file's module docstring; they explain the method and what
  they need to actually run.

**Blocked, needs one of the items in section 4 before it can run:**
- Stage 1 (Sentinel-2 coarse screening): needs a registered GEE Cloud project + auth.
- Stage 2 (high-res verification): needs ESRI licensing confirmation, and needs to run
  somewhere that can reach `services.arcgisonline.com` (not this container, currently).
- Stage 2's optional vision-classification step: needs an `ANTHROPIC_API_KEY` and, more
  importantly, 5–10 labeled example crops (polyhouse / nethouse / neither) that don't
  exist yet — I did not fabricate placeholder examples, since bad few-shot examples would
  actively hurt classification quality.

**Known data gap, not blocked on you, just not solved:** tehsil-level boundaries. The
free boundary source used for Stage 0 only goes to district level (ADM2). Bhuvan / Survey
of India would have tehsil boundaries but weren't reachable from here. `stage3_dedup_geocode.py`
leaves the `tehsil` output column empty until that source is wired in.

## 4. What I need from you before Stage 1/2 can run for real

**a) Google Earth Engine signup** (needed for Stage 1) — **you've confirmed noncommercial
tier applies (research/education/nonprofit/government use).** That should keep Stage 1
free, with the caveat that Google is the one who decides at registration time whether
your project actually qualifies — if they push back and assign commercial tier instead,
flag that back to me since it changes the cost picture in section 5.
1. You need a Google account, and a Google Cloud project registered for Earth Engine
   access — GEE no longer allows unregistered personal-account access.
2. Register at https://code.earthengine.google.com/register (or through Cloud Console),
   selecting the noncommercial/unpaid usage path and whatever eligibility category fits
   (research, education, nonprofit, or government use).
3. Once you have a project ID, either run `earthengine authenticate` interactively
   yourself and hand me the resulting credentials path, or create a service-account key
   with Earth Engine access and share *only* the key file path/contents through a secure
   channel (not pasted in plain chat) — I'll wire it into `config.yaml`'s `gee.project`
   field either way.

**b) ESRI World Imagery licensing** (needed for Stage 2) — **on hold per your call above.**
Once Stage 1 is producing real candidate zones and you're ready to revisit Stage 2, check
https://www.esri.com/en-us/legal/terms/full-master-agreement for bulk automated tile
access, and plan to run Stage 2 somewhere that isn't this sandbox (see section 2 — it's
network-blocked here regardless of licensing).

**c) Anthropic API key** (optional, only for the vision-classification sub-step of Stage
2) — only needed once you also have labeled example crops to few-shot from. Not urgent
until classical CV is producing a candidate list worth refining.

## 5. Cost / time estimate for scaling beyond the pilot

Rough order-of-magnitude, **not a quote** — real numbers depend on GEE's current pricing
and how noisy Stage 1's candidate rate turns out to be once tuned against real data:

- **Stage 1, statewide (342,000+ sq km):** Sentinel-2 compositing over that area at GEE's
  server-side scale is well within what the free/noncommercial compute tier is designed
  for — this is the kind of job GEE exists for. Main cost is iteration time (running it
  repeatedly while tuning thresholds), not money, assuming noncommercial eligibility.
- **Stage 2, one pilot district (Jaipur or Sikar, ~7,000–11,000 sq km):** at zoom 19,
  covering just the Stage-1-flagged candidate zones (which should be a small single-digit
  percentage of district area if Stage 1's thresholds are reasonable) is realistically
  thousands to tens of thousands of tiles — plausible to run in well under an hour of
  wall-clock time with the rate limit in `config.yaml`, from an environment that can
  reach ESRI's servers.
- **Stage 2, full state:** scaling that pilot number by roughly 40x (32 districts) is the
  naive estimate, but it's not linear in practice — larger, flatter, more agricultural
  districts will have denser candidate clusters than desert districts. **I'd want the
  pilot district's actual candidate-zone count in hand before giving you a real statewide
  number** — right now this is a guess, not a plan.
- **Vision-model classification cost** scales with confirmed-candidate count after
  classical CV, which should be far smaller than raw tile count — cheap in comparison,
  but again unknown until Stage 1/2 produce real numbers.

I'd rather come back with real Stage 1 output from the pilot district and give you an
actual number than commit to a statewide estimate now.

## 6. How to run this once unblocked

```bash
cd rajasthan-polyhouse-mapping
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Stage 0 already run and committed — rerun only if you need to refresh boundaries:
python src/pipeline.py boundaries

# Fill in config.yaml: gee.project, and flip stage2_hires_verification.vision_model.enabled
# once you have example crops and ANTHROPIC_API_KEY set.

python src/pipeline.py run jaipur
# or run stages individually, e.g.:
python src/stage1_coarse_screening.py jaipur
```

Outputs land in `data/outputs/`: `<district>_detections.csv` (the primary deliverable, per
the schema below), `.geojson`, `.kml`, `<district>_map.html` (interactive folium map), and
`<district>_summary.md`.

CSV schema: `id, latitude, longitude, district, tehsil, estimated_area_sqm, structure_type,
confidence, imagery_date, imagery_source, detection_method`

## 7. Validation caveat (per the original brief, worth repeating here)

Nothing this pipeline produces should be presented as ground truth without Stage 4
validation. Solar farms, large sheds, and other bright rectangular rooftops will produce
false positives on the spectral/CV signature alone — that's expected, not a bug to chase
out of Stage 1/2. Stage 4 (`stage4_validation.py`) either matches against reference points
you supply or draws a random review sample for manual eyeballing; treat whichever you run
as required, not optional, before reporting any count.

## Repo layout

```
rajasthan-polyhouse-mapping/
├── config.yaml                    # pilot district list, thresholds, GEE project ID
├── requirements.txt
├── data/
│   ├── boundaries/                # Stage 0 output (committed, already generated)
│   └── outputs/                   # Stage 1-5 outputs (gitignored — regenerate, don't commit)
└── src/
    ├── stage0_boundaries.py
    ├── stage1_coarse_screening.py
    ├── stage2_hires_verification.py
    ├── stage3_dedup_geocode.py
    ├── stage4_validation.py
    ├── stage5_export.py
    └── pipeline.py                 # CLI orchestrator
```
