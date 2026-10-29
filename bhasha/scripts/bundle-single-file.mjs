#!/usr/bin/env node
// Bundle the built app into single self-contained HTML files.
// Run with: npm run bundle   (after npm run build)
//
// Two outputs, because they have different hosts:
//
//   dist/bhasha-standalone.html  a complete document. Open it from disk, email
//                                it, drop it on any static host. No server, no
//                                build step, no dependencies.
//
//   dist/bhasha-artifact.html    the same page without <!doctype>, <html>,
//                                <head> or <body>, because the Claude artifact
//                                host supplies those and rejects duplicates.
//
// Fonts stay as a remote @import rather than being inlined: the nine Noto
// Indic families are several megabytes, and every target script already has a
// system-font fallback chain (see components/TargetText.jsx) for the offline
// case.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const assets = readdirSync(join(DIST, 'assets'))
const jsFile = assets.find((f) => f.endsWith('.js'))
const cssFile = assets.find((f) => f.endsWith('.css'))
if (!jsFile || !cssFile) {
  console.error('No built assets found. Run `npm run build` first.')
  process.exit(1)
}

const js = readFileSync(join(DIST, 'assets', jsFile), 'utf8')
const css = readFileSync(join(DIST, 'assets', cssFile), 'utf8')
const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf8')

// Pull the Google Fonts href straight out of the built index so the font list
// cannot drift away from the one index.html actually requests.
const fontHref = (indexHtml.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/) || [])[1]
if (!fontHref) {
  console.error('Could not find the Google Fonts link in dist/index.html.')
  process.exit(1)
}

// A `</script>` inside a string literal would close the inline script tag and
// break the page. Minifiers do emit these.
const safeJs = js.replace(/<\/script/gi, '<\\/script')

const TITLE = 'Bhasha'
const DESC =
  'Learn ten Indian languages from twenty source languages, plus a Pre-A1 to C1 Marathi ladder.'

const head = `<title>${TITLE}</title>
<meta name="description" content="${DESC}" />
<style>
@import url('${fontHref}');
${css}
</style>`

const body = `<div id="root"></div>
<script type="module">
${safeJs}
</script>`

writeFileSync(
  join(DIST, 'bhasha-artifact.html'),
  `${head}\n${body}\n`,
  'utf8',
)

writeFileSync(
  join(DIST, 'bhasha-standalone.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
${head}
<style>body{margin:0}</style>
</head>
<body>
${body}
</body>
</html>
`,
  'utf8',
)

const kb = (s) => `${(Buffer.byteLength(s, 'utf8') / 1024).toFixed(0)} kB`
console.log(`css            ${kb(css)}`)
console.log(`js             ${kb(js)}`)
console.log(`standalone     dist/bhasha-standalone.html`)
console.log(`artifact body  dist/bhasha-artifact.html`)
