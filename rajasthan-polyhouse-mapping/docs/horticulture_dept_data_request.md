# Parallel track: requesting subsidy-verification geo-tag data directly

Per the research in the main README, the strongest lead for real ground-truth locations
of protected cultivation structures is the Rajasthan Horticulture Department's own
subsidy-verification process: geo-tagged photos are recorded at final inspection before
DBT disbursement, for every polyhouse/shade-net-house structure that received a subsidy.
That's a dataset that already exists somewhere inside the department — it just isn't
public. Two ways to ask for it, in order of formality. **Both drafts below have
placeholders (`[...]`) — I did not fabricate a specific officer's name, department email,
or portal URL, since I couldn't verify current ones from this sandbox (gov.in domains are
blocked here — see main README section 2). Verify the addressee and submission channel
yourself before sending.**

## Option A — Informal data-sharing request (try this first)

Faster than RTI, no fee, and framed as collaboration rather than a legal demand. Best
addressed to the Horticulture Commissioner or Director, Directorate of Horticulture,
Government of Rajasthan — address: Pant Krishi Bhawan, Jaipur. One possible contact
surfaced by search (**third-party aggregator, not an official source — verify before
using**): Kailash Chand Meena, listed as Additional Director, phone 9799393562, via
indiacustomercare.com. Government postings change often; confirm this is still accurate
(e.g. by calling, or checking the department's current staff listing) before addressing
anything to that name specifically. Alternatively, a District Horticulture Officer for
Jaipur or Sikar if you want to pilot with one district first (matches this project's
pilot scope) — I did not find a verified name/number for either.

> Subject: Request for geo-tagged verification records — protected cultivation
> (polyhouse/shade-net house) subsidy scheme, for agricultural-planning research
>
> To,
> [Director of Horticulture / District Horticulture Officer, District],
> Directorate of Horticulture, Government of Rajasthan
>
> Respected Sir/Madam,
>
> I am writing to request access to the geo-tagged photograph and GPS coordinate records
> collected during the final inspection/verification stage of the protected cultivation
> subsidy scheme (polyhouse, shade-net house/nethouse structures) under the National
> Horticulture Mission and state horticulture schemes.
>
> I am building a geospatial inventory of protected cultivation infrastructure across
> Rajasthan [state your purpose — e.g. agri-input market planning, research, extension
> service targeting]. Records of subsidized structures already verified by your
> department would let me validate and cross-check a satellite-imagery-based detection
> pipeline I am developing, rather than duplicating work your department has already
> done during verification.
>
> Specifically, I would be grateful for:
> - District-wise (or state-wide, if available) list of sanctioned/verified protected
>   cultivation structures with GPS coordinates, structure type (polyhouse/shade-net
>   house), sanctioned area, and year of sanction, in whatever electronic format you
>   already maintain it (spreadsheet, GIS shapefile/geojson, or database export).
> - If full beneficiary-level data cannot be shared for privacy reasons, aggregated/
>   anonymized counts and locations (e.g. village-level centroid + count) would still be
>   valuable.
>
> I am happy to discuss scope, a formal data-sharing agreement, or a pilot limited to
> [Jaipur / Sikar district] first if that is easier to approve.
>
> Thank you for your consideration.
>
> [Your name]
> [Your contact details]
> [Date]

## Option B — Formal RTI application (Right to Information Act, 2005)

Use this if Option A goes unanswered, or if you want a legally-bound response timeline
(30 days under the RTI Act). Points to get right before filing:

- **Addressee**: the **Public Information Officer (PIO)** of the Directorate of
  Horticulture, Government of Rajasthan — look up the current PIO name/designation
  yourself (I could not verify this from here); addressing it to "The Public Information
  Officer, Directorate of Horticulture, Government of Rajasthan, Jaipur" without a name is
  also acceptable under the Act if you can't confirm one. The official RTI portal
  (see below) has a searchable department→PIO directory
  (`rti.rajasthan.gov.in/rptdepartmentoffcer/...`) — use that once logged in to get the
  current name rather than trusting a search-engine snippet.
- **Submission channel**: the official portal is **https://rti.rajasthan.gov.in** (I
  confirmed this URL via search, but could not open it myself — this environment blocks
  rajasthan.gov.in domains, see main README section 2). It requires SSO registration tied
  to your own mobile number/email, and lets you pay the RTI fee (₹10, per most current
  guides, but confirm on the portal — fees change) and track status online. Postal
  submission to the department address above is the fallback if you'd rather not use the
  portal.
- **Phrasing matters for RTI specifically**: public authorities can lawfully refuse a
  request that asks them to "create new information" by collating/analyzing existing
  records. Ask for data **"as maintained by the department"**, not a bespoke export —
  that's what the draft below does.

> To,
> The Public Information Officer,
> Directorate of Horticulture, Government of Rajasthan, Jaipur
>
> Subject: Application under Section 6(1) of the Right to Information Act, 2005
>
> Sir/Madam,
>
> Under the Right to Information Act, 2005, I request the following information as
> maintained by your department:
>
> 1. Copies of (or extracts from) the geo-tagged photograph/GPS coordinate records
>    collected during final inspection/verification of protected cultivation
>    (polyhouse and shade-net house) structures sanctioned under the National
>    Horticulture Mission / state horticulture subsidy schemes in Rajasthan, for the
>    period [specify, e.g. 2015 to present], in whatever electronic format such records
>    are currently maintained (spreadsheet/database/GIS export).
> 2. If item 1 cannot be provided in full, the district-wise count of sanctioned and
>    verified protected cultivation structures (polyhouse / shade-net house, separately)
>    for the same period.
>
> I enclose the application fee of ₹10 as required under the Act. [Or reference online
> payment if filing via the portal.]
>
> [Your name]
> [Your address]
> [Date]

## If both are refused or go unanswered

That's useful information too — it tells you the satellite pipeline (this repo) is the
only realistic path to a statewide inventory, and raises the bar on how much you'll want
to invest in Stage 4 validation before trusting its output.
