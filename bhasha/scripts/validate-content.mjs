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
import { LEVELS as MR_LEVELS, PACKS as MR_PACKS, VERBS as MR_VERBS } from '../src/data/deep/mr/index.js'
import { PRONOUN_SLOTS, FUTURE_SLOTS, OBJECT_SLOTS, VERB_OBJECTS } from '../src/data/deep/mr/verbs.js'

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

// ---- the Marathi deep ladder ----
{
  const DEV = /[\u0900-\u097F]/
  const seenIds = new Set()
  const levelIds = new Set(MR_LEVELS.map((l) => l.id))

  for (const l of MR_LEVELS) {
    if (!MR_PACKS[l.id]) fail('mr ladder', `level "${l.id}" has no content pack`)
    for (const k of ['cefr', 'mr', 'en', 'blurb', 'gate', 'unlocks']) {
      if (!l[k]) fail('mr ladder', `level "${l.id}" is missing ${k}`)
    }
  }
  for (const vid of Object.keys(VERB_OBJECTS)) {
    if (!MR_VERBS.some((v) => v.id === vid && v.type === 'transitive')) {
      fail('mr verbs', `VERB_OBJECTS has an entry for "${vid}", which is not a transitive verb`)
    }
  }
  for (const id of Object.keys(MR_PACKS)) {
    if (!levelIds.has(id)) fail('mr ladder', `pack "${id}" has no entry in levels.js`)
  }

  for (const [lid, pack] of Object.entries(MR_PACKS)) {
    const w = `mr/${lid}`
    const vocabMr = new Set()

    for (const x of pack.vocab) {
      if (seenIds.has(x.id)) fail(w, `duplicate vocab id "${x.id}" across the ladder`)
      seenIds.add(x.id)
      vocabMr.add(x.mr)

      if (!x.mr || !x.latn || !x.en) fail(w, `"${x.id}" missing mr, latn or en`)
      if (!DEV.test(x.mr)) fail(w, `"${x.id}" = "${x.mr}" contains no Devanagari`)
      if (DEV.test(x.latn)) fail(w, `"${x.id}" transliteration "${x.latn}" contains Devanagari`)
      if (x.g && !['m', 'f', 'n'].includes(x.g)) fail(w, `"${x.id}" has gender "${x.g}"`)

      // The adjective flag drives generated inflection, so a wrong one
      // produces a non-word in a drill. Guard it hard.
      if (x.adj) {
        if (!x.mr.endsWith('\u093E')) fail(w, `"${x.id}" is marked adj but does not end in -\u0906`)
        if (x.g) fail(w, `"${x.id}" is marked adj but also has a gender`)
        if (x.pos) fail(w, `"${x.id}" is marked adj but also has a part of speech`)
      }
      if (x.obl) {
        if (!DEV.test(x.obl)) fail(w, `"${x.id}" oblique "${x.obl}" is not Devanagari`)
        if (!x.g) warn(w, `"${x.id}" has an oblique stem but no gender`)
      }
    }

    for (const s of pack.sentences) {
      const sw = `${w}/${s.id}`
      if (!s.id.startsWith(`mr-${lid}-`)) fail(sw, `id should start with "mr-${lid}-"`)
      if (s.tokens.join(' ') !== s.mr) fail(sw, 'tokens do not reconstruct the sentence')
      if (!s.en) fail(sw, 'missing English gloss')
      if (!s.latn) fail(sw, 'missing transliteration')
      if (!DEV.test(s.mr)) fail(sw, 'sentence contains no Devanagari')
      if (s.tokens.some((t) => !t.trim())) fail(sw, 'empty token')
      if (!Array.isArray(s.skills)) fail(sw, 'skills must be an array')
    }

    for (const g of pack.grammar) {
      const gw = `${w}/${g.id}`
      if (!g.title || !g.body) fail(gw, 'grammar note missing title or body')
      for (const e of g.examples || []) {
        if (!e.mr || !e.latn || !e.en) fail(gw, `example "${e.mr || '?'}" missing a field`)
        if (DEV.test(e.latn)) fail(gw, `example transliteration "${e.latn}" contains Devanagari`)
      }
    }
  }

  // Verb paradigms: a missing slot silently removes a drill question.
  const subjectKeys = PRONOUN_SLOTS.map((s) => s.key)
  const objectKeys = OBJECT_SLOTS.map((s) => s.key)
  for (const v of MR_VERBS) {
    const w = `mr verbs/${v.id}`
    if (!['transitive', 'intransitive'].includes(v.type)) fail(w, `unknown type "${v.type}"`)
    const expect = { present: subjectKeys, future: FUTURE_SLOTS }
    expect[v.type === 'transitive' ? 'pastErg' : 'past'] = v.type === 'transitive' ? objectKeys : subjectKeys
    for (const [tense, keys] of Object.entries(expect)) {
      const tbl = v.forms[tense]
      if (!tbl) { fail(w, `missing the ${tense} table`); continue }
      for (const k of keys) {
        const f = tbl[k]
        if (!f) { fail(w, `${tense} is missing slot "${k}"`); continue }
        if (!DEV.test(f.mr)) fail(w, `${tense}.${k} = "${f.mr}" is not Devanagari`)
        if (!f.latn || DEV.test(f.latn)) fail(w, `${tense}.${k} has a bad transliteration "${f.latn}"`)
      }
      for (const k of Object.keys(tbl)) {
        if (!keys.includes(k)) fail(w, `${tense} has unexpected slot "${k}"`)
      }
    }
    if (v.type === 'intransitive' && v.forms.pastErg) fail(w, 'intransitive verb carries an ergative table')
    if (v.type === 'transitive' && v.forms.past) fail(w, 'transitive verb carries a subject-agreement past table')

    // Every transitive verb needs a plausible object per agreement slot, or
    // the ergative drill falls back to generic nouns and generates sentences
    // like "I sold work".
    if (v.type === 'transitive') {
      const objs = VERB_OBJECTS[v.id]
      if (!objs) { fail(w, 'transitive verb has no VERB_OBJECTS entry'); continue }
      for (const k of objectKeys) {
        const o = objs[k]
        if (!o) { fail(w, `VERB_OBJECTS missing slot "${k}"`); continue }
        if (!o.mr || !o.latn || !o.en) fail(w, `VERB_OBJECTS.${k} missing a field`)
        if (!DEV.test(o.mr)) fail(w, `VERB_OBJECTS.${k} = "${o.mr}" is not Devanagari`)
        if (DEV.test(o.latn)) fail(w, `VERB_OBJECTS.${k} transliteration contains Devanagari`)
      }
    }
  }
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
console.log(`mr ladder       ${MR_LEVELS.length} levels, ${Object.values(MR_PACKS).reduce((n, p) => n + p.vocab.length, 0)} words, ` +
  `${Object.values(MR_PACKS).reduce((n, p) => n + p.sentences.length, 0)} sentences, ` +
  `${Object.values(MR_PACKS).reduce((n, p) => n + p.grammar.length, 0)} grammar lessons`)
console.log(`mr verb forms   ${MR_VERBS.reduce((n, v) => n + Object.values(v.forms).reduce((m, t) => m + Object.keys(t).length, 0), 0)} across ${MR_VERBS.length} verbs`)
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
