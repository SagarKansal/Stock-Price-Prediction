# Brand Asset Studio

A small React app that turns a reusable **brand kit** (colors, fonts, logo,
messaging) into a full set of on-brand social and marketing graphics —
generated live in the browser and exported as PNGs.

Define your brand once on the left, and every asset on the right updates
instantly. Download assets one at a time or grab everything as a single ZIP.

The app has three tabs, all sharing the same brand kit panel:

- **Templates** — the 8 ready-made asset sizes below.
- **Redesign Studio** — upload an existing/old creative and generate a new
  on-brand version at the *same dimensions*, so it can drop in as a
  replacement. Pick from four layout styles (a sensible one is suggested from
  the image's aspect ratio); compare before/after side by side; download the
  result.
- **Brand Gallery** — a reference board for documenting your guidelines
  through examples. Upload old/new creative pairs with a note on what changed
  and why, and extract a color palette directly from a "new" example image to
  apply to the brand kit with one click (a simple canvas-based dominant-color
  extraction — no external service required). Gallery entries live in memory
  for the session; they aren't persisted.

## Generated assets

| Asset | Size |
| --- | --- |
| Instagram Post | 1080 × 1080 |
| Instagram / Facebook Story | 1080 × 1920 |
| Open Graph / Link Preview | 1200 × 630 |
| X (Twitter) Header | 1500 × 500 |
| LinkedIn Banner | 1584 × 396 |
| Facebook Cover | 820 × 312 |
| YouTube Thumbnail | 1280 × 720 |
| Business Card | 1050 × 600 |

## Brand kit inputs

- Brand name & tagline
- Primary / secondary / accent colors
- Heading & body fonts (curated Google Fonts, loaded on demand)
- Logo upload (falls back to an auto-generated monogram badge)
- Headline, subheadline, and call-to-action text reused across every asset

Your brand kit is saved to `localStorage`, so it persists across reloads.

## How it works

Each asset size maps to one of four shared layout components
(`src/components/layouts/`) that lay out the brand's colors, fonts, and copy
at the template's true pixel dimensions. Every template previews at a scaled
size for the UI but is captured via
[`html-to-image`](https://github.com/bubkoo/html-to-image) at full resolution
for export, and [`jszip`](https://github.com/Stuk/jszip) bundles everything
into one download for the "Download all" button.

Redesign Studio reuses the same four layouts at arbitrary (rather than fixed)
dimensions, matched to whatever image is uploaded. Note that redesigns are a
deterministic re-skin — brand colors/fonts/logo/copy applied to a template
matching the old creative's size — not a generative-AI repaint of the
original artwork; that would need a hosted image-generation API and backend,
which this client-only app doesn't have.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
```
