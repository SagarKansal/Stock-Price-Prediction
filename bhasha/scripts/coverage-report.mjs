#!/usr/bin/env node
// Which source languages are fully served, and which fall back to English.
// Run with: npm run coverage

import { sourceOptions, coverageFor } from '../src/engine/pairing.js'
import { hasChrome } from '../src/data/ui.js'
import { TARGETS } from '../src/data/targets.js'

const rows = sourceOptions().map((s) => ({
  code: s.code,
  name: s.name,
  kind: s.kind,
  ...coverageFor(s.code),
  chrome: hasChrome(s.code),
}))

const pad = (s, n) => String(s).padEnd(n)
console.log(pad('code', 6) + pad('language', 20) + pad('kind', 9) + pad('glosses', 12) + 'interface')
console.log('-'.repeat(60))
for (const r of rows) {
  console.log(
    pad(r.code, 6) + pad(r.name, 20) + pad(r.kind, 9) +
    pad(`${r.have}/${r.total} (${r.pct}%)`, 12) +
    (r.chrome ? 'translated' : 'English fallback'),
  )
}
console.log('')
const full = rows.filter((r) => r.pct === 100).length
console.log(`${full}/${rows.length} source languages have complete gloss coverage.`)
console.log(`${rows.filter((r) => r.chrome).length}/${rows.length} have translated interface chrome.`)
console.log(`${TARGETS.length} targets x ${rows.length - 1} sources = ${TARGETS.length * (rows.length - 1)} course pairs.`)
