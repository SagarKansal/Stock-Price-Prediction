#!/usr/bin/env node
// Content validator. Run with: npm run validate
//
// Content bugs in a language app are worse than code bugs: a crash is obvious,
// a wrong word is memorised. These checks catch the errors an author actually
// makes - a missing concept, a sentence whose tokens do not reconstruct it, a
// word written in the wrong script, a transliteration with no vowels.

import { CONCEPTS, CONCEPT_BY_ID, SOURCE_LANGS, UNITS } from '../src/data/concepts.js'
import { COURSES } from '../src/data/courses/index.js'
import { TARGETS, TARGET_BY_CODE } from '../src/data/targets.js'
import { SCRIPTS } from '../src/data/scripts/index.js'
import { UI } from '../src/data/ui.js'

// Tokens that look like a lexicon entry but are doing something else in that
// sentence. Listing them here documents the ambiguity instead of hiding it.
const HOMOGRAPHS = {
  'pa-5/\u0A39\u0A3E\u0A02': 'the copula "am", homographic with \u0A39\u0A3E\u0A02 "yes"',
}

const problems = []
const warnings = []
const fail = (where, msg) => problems.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

// Unicode block per script, so a Tamil word pasted into the Telugu pack is caught.
const BLOCKS = {
  devanagari: /[ऀ-ॿ]/,
  bengali: /[ঀ-৿]/,
  gurmukhi: /[਀-੿]/,
  gujarati: /[઀-૿]/,
  telugu: /[ఀ-౿]/,
  kannada: /[ಀ-೿]/,
  malayalam: /[ഀ-ൿ]/,
  tamil: /[஀-௿]/,
  nastaliq: /[؀-ۿﭐ-﷿]/,
}
const OTHER_INDIC = /[ऀ-෿؀-ۿ]/

// ---- concepts ----
const conceptIds = new Set()
for (const c of CONCEPTS) {
  if (conceptIds.has(c.id)) fail('concepts', `duplicate id "${c.id}"`)
  conceptIds.add(c.id)
  if (!UNITS.some((u) => u.id === c.unit)) fail('concepts', `"${c.id}" has unknown unit "${c.unit}"`)
  for (const l of SOURCE_LANGS) {
    if (!c.gloss[l.code]) fail('concepts', `"${c.id}" missing ${l.code} gloss`)
  }
}

// ---- targets vs packs ----
for (const t of TARGETS) {
  if (!COURSES[t.code]) fail('targets', `"${t.code}" has no course pack`)
  if (!SCRIPTS[t.script]) fail('targets', `"${t.code}" names unknown script "${t.script}"`)
}
for (const code of Object.keys(COURSES)) {
  if (!TARGET_BY_CODE[code]) fail('courses', `pack "${code}" has no entry in targets.js`)
}

// ---- scripts ----
for (const [id, s] of Object.entries(SCRIPTS)) {
  if (!['abugida', 'abjad'].includes(s.type)) fail(`script ${id}`, `unknown type "${s.type}"`)
  if (s.digits.length !== 10) fail(`script ${id}`, `expected 10 digits, got ${s.digits.length}`)
  if (s.type === 'abugida') {
    if (!s.virama) fail(`script ${id}`, 'abugida with no virama')
    if (!s.vowels.some((v) => v.matra === '')) fail(`script ${id}`, 'no vowel marked as inherent (matra "")')
    if (!s.consonants.some((c) => c.char === s.demoConsonant)) {
      fail(`script ${id}`, `demoConsonant "${s.demoConsonant}" is not in the consonant list`)
    }
  }
  const seen = new Set()
  for (const c of s.consonants) {
    if (seen.has(c.char)) fail(`script ${id}`, `duplicate consonant "${c.char}"`)
    seen.add(c.char)
    if (BLOCKS[id] && !BLOCKS[id].test(c.char)) fail(`script ${id}`, `"${c.char}" is outside the ${id} Unicode block`)
  }
}

// ---- course packs ----
for (const [code, pack] of Object.entries(COURSES)) {
  const target = TARGET_BY_CODE[code]
  if (!target) continue
  const block = BLOCKS[target.script]
  const where = `course ${code}`

  if (pack.code !== code) fail(where, `pack declares code "${pack.code}"`)
  if (!['draft', 'native-reviewed'].includes(pack.review)) {
    fail(where, `review status must be "draft" or "native-reviewed", got "${pack.review}"`)
  }

  const lexIds = Object.keys(pack.lexicon)
  for (const id of lexIds) {
    if (!conceptIds.has(id)) fail(where, `lexicon has unknown concept "${id}"`)
    const e = pack.lexicon[id]
    if (!e.target || !e.latn) fail(where, `"${id}" missing target or transliteration`)
    if (block && !block.test(e.target)) fail(where, `"${id}" = "${e.target}" is not in the ${target.script} block`)
    if (block && OTHER_INDIC.test(e.target.replace(new RegExp(block.source, 'g'), ''))) {
      fail(where, `"${id}" = "${e.target}" mixes scripts`)
    }
    if (!/[aeiouāīūēōṛõãũôẽĩ]/i.test(e.latn)) warn(where, `"${id}" transliteration "${e.latn}" has no vowel`)
    if (/[ऀ-෿]/.test(e.latn)) fail(where, `"${id}" transliteration "${e.latn}" contains native script`)
  }
  for (const id of conceptIds) {
    if (!lexIds.includes(id)) fail(where, `missing concept "${id}"`)
  }

  const sentIds = new Set()
  for (const s of pack.sentences) {
    const w = `${where}/${s.id}`
    if (sentIds.has(s.id)) fail(w, 'duplicate sentence id')
    sentIds.add(s.id)
    if (!s.id.startsWith(`${code}-`)) fail(w, `sentence id should start with "${code}-"`)
    // The invariant that makes word-bank exercises safe to generate.
    if (s.tokens.join(' ') !== s.target) fail(w, 'tokens do not reconstruct the target string')
    if (s.tokens.length !== s.align.length) {
      fail(w, `align has ${s.align.length} entries for ${s.tokens.length} tokens`)
    }
    for (const a of s.align) {
      if (a !== null && !conceptIds.has(a)) fail(w, `align references unknown concept "${a}"`)
    }
    if (!s.gloss || !s.gloss.en) fail(w, 'missing English gloss (the required pivot)')
    if (!UNITS.some((u) => u.id === s.unit)) fail(w, `unknown unit "${s.unit}"`)
    if (block && !block.test(s.target)) fail(w, `target is not in the ${target.script} block`)
    if (s.tokens.some((tok) => !tok.trim())) fail(w, 'empty token')
    // A token that is a lexicon word should align to that concept, unless it
    // is a known homograph doing a different job in this sentence.
    s.tokens.forEach((tok, i) => {
      const match = lexIds.find((id) => pack.lexicon[id].target === tok)
      if (match && s.align[i] === null && !HOMOGRAPHS[`${s.id}/${tok}`]) {
        warn(w, `token "${tok}" is the lexicon word for "${match}" but is aligned to null`)
      }
    })
  }
  for (const g of pack.grammar) {
    if (!UNITS.some((u) => u.id === g.unit)) fail(where, `grammar note "${g.title}" has unknown unit "${g.unit}"`)
  }
}

// ---- ui ----
const uiKeys = Object.keys(UI.en)
for (const [code, obj] of Object.entries(UI)) {
  for (const k of uiKeys) if (!(k in obj)) fail(`ui ${code}`, `missing key "${k}"`)
  for (const k of Object.keys(obj)) if (!uiKeys.includes(k)) fail(`ui ${code}`, `unknown key "${k}"`)
}

// ---- report ----
const pairs = TARGETS.length * (SOURCE_LANGS.length + TARGETS.length - 1)
console.log(`concepts        ${CONCEPTS.length}`)
console.log(`source glosses  ${SOURCE_LANGS.length} world languages x ${CONCEPTS.length} = ${SOURCE_LANGS.length * CONCEPTS.length}`)
console.log(`course packs    ${Object.keys(COURSES).length}`)
console.log(`scripts         ${Object.keys(SCRIPTS).length}`)
console.log(`lexical entries ${Object.values(COURSES).reduce((n, p) => n + Object.keys(p.lexicon).length, 0)}`)
console.log(`sentences       ${Object.values(COURSES).reduce((n, p) => n + p.sentences.length, 0)}`)
console.log(`grammar notes   ${Object.values(COURSES).reduce((n, p) => n + p.grammar.length, 0)}`)
console.log(`generated pairs ${pairs}`)
console.log('')

if (warnings.length) {
  console.log(`${warnings.length} warning(s):`)
  for (const w of warnings) console.log('  ! ' + w)
  console.log('')
}
if (problems.length) {
  console.log(`${problems.length} problem(s):`)
  for (const p of problems) console.log('  x ' + p)
  process.exit(1)
}
console.log('content OK')
