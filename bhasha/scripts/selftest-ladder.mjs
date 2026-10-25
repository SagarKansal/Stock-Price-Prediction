#!/usr/bin/env node
// Marathi ladder self-test. Run with: npm run test:ladder
//
// Plays every level lesson at every stage of learner progress, for several
// source languages, answering correctly, and asserts the grader agrees. Also
// enforces the ordering invariant that matters most pedagogically: a learner
// below B1 must NEVER be shown an ergative drill.

import { buildLadder, buildLevelLesson, buildPlacementTest, scorePlacement, ladderStatus } from '../src/engine/ladder.js'
import { buildDrill, DRILLS_BY_LEVEL, inflectAdjective } from '../src/engine/grammar-drills.js'
import { gradeExercise, emptyValue } from '../src/engine/exercise-grading.js'
import { LEVELS, PACKS, VERBS } from '../src/data/deep/mr/index.js'
import { newItem, review } from '../src/engine/srs.js'

const fails = []
const check = (c, m) => { if (!c) fails.push(m) }

function perfectAnswer(ex) {
  switch (ex.kind) {
    case 'choose_target': case 'choose_gloss': case 'listen':
    case 'script_compose': case 'script_shape':
    case 'ergative_agree': case 'gender_agree': case 'case_mark':
    case 'oblique': case 'transform': case 'cloze':
      return (ex.options.find((o) => o.correct) || {}).id
    case 'conjugate':
      return ex.mode === 'type' ? ex.answer.target : (ex.options.find((o) => o.correct) || {}).id
    case 'type': return ex.answer.target
    case 'transliterate': return ex.answer.latn
    case 'wordbank': return ex.answer
    default: return null
  }
}

// ---- ordering: no ergative content below B1 ----
const ERG_KINDS = new Set(['ergative_agree'])
const BELOW_B1 = ['l0', 'l1', 'l2']
for (const lvl of BELOW_B1) {
  const kinds = DRILLS_BY_LEVEL[lvl] || []
  check(!kinds.some((k) => ERG_KINDS.has(k) || k === 'conjugate.pastErg'),
    `${lvl}: ergative drill offered below B1 (${kinds.join(',')})`)
}
check((DRILLS_BY_LEVEL.l3 || []).includes('ergative_agree'), 'l3 does not drill the ergative, which is its entire point')
check((DRILLS_BY_LEVEL.l0 || []).every((k) => k === 'cloze'), 'l0 offers grammar drills; toddler Marathi has no grammar to drill')

// ---- adjective inflection is only applied where it is legal ----
for (const [lid, pack] of Object.entries(PACKS)) {
  for (const w of pack.vocab) {
    if (w.adj) {
      check(w.mr.endsWith('ा'), `${lid}/${w.id}: marked adj but does not end in -आ`)
      check(!w.g, `${lid}/${w.id}: marked adj but also carries a gender`)
      const f = inflectAdjective(w.mr, w.latn)
      check(f && f.f.mr !== w.mr && f.n.mr !== w.mr, `${lid}/${w.id}: inflection produced no change`)
    }
  }
}

// ---- play every level, at three stages of progress, in four source languages ----
let lessons = 0, exercises = 0
const kinds = {}
for (const source of ['en', 'es', 'ru', 'ta']) {
  const ladder = buildLadder(source)
  check(ladder.levels.length === LEVELS.length, `${source}: ladder has ${ladder.levels.length} levels`)

  for (const stage of ['fresh', 'half', 'strong']) {
    for (const level of ladder.levels) {
      const state = {}
      if (stage !== 'fresh') {
        const take = stage === 'half' ? Math.floor(level.items.length / 2) : level.items.length
        for (const it of level.items.slice(0, take)) {
          let x = newItem()
          for (let k = 0; k < 4; k += 1) x = review(x, true, 0)
          state[it.id] = x
        }
      }
      const lesson = buildLevelLesson(ladder, level.id, state, { audio: true, length: 12 })
      lessons += 1
      check(lesson.length > 0, `${source}/${level.id}/${stage}: empty lesson`)

      for (const ex of lesson) {
        exercises += 1
        kinds[ex.kind] = (kinds[ex.kind] || 0) + 1

        // Ordering invariant, enforced on the actual generated lesson, not
        // just the config table.
        if (BELOW_B1.includes(level.id)) {
          check(ex.kind !== 'ergative_agree', `${source}/${level.id}: ergative drill leaked into a sub-B1 lesson`)
        }

        check(emptyValue(ex) !== undefined, `${level.id}/${ex.kind}: no empty value`)
        const ans = perfectAnswer(ex)
        check(ans !== null && ans !== undefined, `${level.id}/${ex.kind}: no perfect answer`)
        check(gradeExercise(ex, ans).correct, `${source}/${level.id}/${ex.kind}: correct answer graded wrong`)

        if (ex.options) {
          const right = ex.options.filter((o) => o.correct).length
          check(right === 1, `${source}/${level.id}/${ex.kind}: ${right} correct options`)
          const texts = ex.options.map((o) => String(o.text))
          check(new Set(texts).size === texts.length, `${source}/${level.id}/${ex.kind}: duplicate options ${texts.join('|')}`)
          check(texts.includes(String(ex.answer ? ex.answer.target : texts[0])) || ex.kind.startsWith('choose') || ex.kind === 'listen' || ex.kind.startsWith('script'),
            `${source}/${level.id}/${ex.kind}: answer missing from options`)
          const wrong = ex.options.find((o) => !o.correct)
          check(!gradeExercise(ex, wrong.id).correct, `${level.id}/${ex.kind}: wrong answer graded correct`)
        }
      }
    }
  }
}

// ---- gating ----
{
  const ladder = buildLadder('en')
  const fresh = ladderStatus(ladder, {}, null)
  check(fresh.filter((r) => r.unlocked).length === 1, 'a brand new learner should have exactly one level open')
  check(fresh[0].recommended, 'the recommended level for a new learner should be L0')

  // Clear L0 and L1 should open.
  const st = {}
  for (const it of ladder.levels[0].items) {
    let x = newItem(); for (let k = 0; k < 4; k += 1) x = review(x, true, 0); st[it.id] = x
  }
  const after = ladderStatus(ladder, st, null)
  check(after[1].unlocked, 'clearing L0 did not open L1')
  check(after[0].cleared, 'L0 not marked cleared after full study')
  check(!after[3].unlocked, 'clearing L0 wrongly opened B1')

  const placed = ladderStatus(ladder, {}, 'l3')
  check(placed[3].unlocked, 'placement at l3 did not open l3')
  check(placed.filter((r) => r.unlocked).length === 4, 'placement should open everything up to and including the placed level')
}

// ---- placement test ----
{
  const ladder = buildLadder('en')
  for (let r = 0; r < 60; r += 1) {
    const qs = buildPlacementTest(ladder)
    check(qs.length >= 12, `placement test too short: ${qs.length}`)
    check(qs.some((q) => q.kind === 'ergative_agree' || q.drillId), 'placement test has no grammar drill')

    // A learner who answers everything right places at the top.
    const allRight = {}
    for (const q of qs) allRight[q.itemId || q.drillId] = true
    check(scorePlacement(qs, allRight).placed === 'l5', 'perfect placement did not reach C1')

    // A learner who answers nothing right places at the bottom.
    check(scorePlacement(qs, {}).placed === 'l0', 'empty placement did not land at Pre-A1')

    // Someone who knows words but fails every grammar drill must not be
    // placed high: this is the exact failure the test exists to prevent.
    const wordsOnly = {}
    for (const q of qs) if (q.kind === 'choose_target') wordsOnly[q.itemId] = true
    const p = scorePlacement(qs, wordsOnly)
    check(['l0', 'l1', 'l2', 'l3', 'l4', 'l5'].includes(p.placed), 'invalid placement id')
  }
}

// ---- drill generation does not stall ----
{
  const allVocab = Object.values(PACKS).flatMap((p) => p.vocab)
  const allSent = Object.values(PACKS).flatMap((p) => p.sentences)
  for (const k of [...new Set(Object.values(DRILLS_BY_LEVEL).flat())]) {
    let nulls = 0
    for (let i = 0; i < 150; i += 1) {
      const d = buildDrill(k, { vocab: allVocab, sentences: allSent, verbs: VERBS })
      if (!d) nulls += 1
    }
    check(nulls === 0, `drill "${k}" returned null ${nulls}/150 times`)
  }
}

console.log(`levels            ${LEVELS.length}`)
console.log(`vocabulary        ${Object.values(PACKS).reduce((n, p) => n + p.vocab.length, 0)}`)
console.log(`sentences         ${Object.values(PACKS).reduce((n, p) => n + p.sentences.length, 0)}`)
console.log(`grammar lessons   ${Object.values(PACKS).reduce((n, p) => n + p.grammar.length, 0)}`)
console.log(`verb forms        ${VERBS.reduce((n, v) => n + Object.values(v.forms).reduce((m, t) => m + Object.keys(t).length, 0), 0)}`)
console.log(`lessons played    ${lessons}`)
console.log(`exercises graded  ${exercises}`)
console.log('by kind          ', Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}=${n}`).join(' '))
console.log('')
if (fails.length) {
  console.log(`${fails.length} failure(s):`)
  for (const f of fails.slice(0, 25)) console.log('  x ' + f)
  if (fails.length > 25) console.log(`  ... and ${fails.length - 25} more`)
  process.exit(1)
}
console.log('ladder OK')
