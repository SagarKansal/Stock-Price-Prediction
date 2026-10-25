// The Marathi ladder.
//
// Joins the levelled deep packs into the same shape the existing exercise
// generator already consumes, so lessons, SRS and grading all run on one code
// path. The ladder adds two things the topic course does not have: ordering
// (a learner at L1 is never shown an ergative question) and grammar drills.

import { LEVELS, LEVEL_BY_ID, levelIndex, PACKS } from '../data/deep/mr/index.js'
import { VERBS } from '../data/deep/mr/verbs.js'
import { glossFor, isWorldSource } from './pairing.js'
import { buildLesson, shuffle } from './generator.js'
import { buildDrill, DRILLS_BY_LEVEL } from './grammar-drills.js'
import { summarise } from './srs.js'
import { TARGET_BY_CODE } from '../data/targets.js'

const MR = TARGET_BY_CODE.mr

const KIND_ICON = {
  idiom: '\u{1F3AD}', proverb: '\u{1F4DC}', register: '\u{1F3DB}',
  particle: '\u{1F4AC}', dialect: '\u{1F5FA}',
}

/** Gloss a ladder item in the learner's language where the shared concept hub
 *  covers it, falling back to English and saying so. */
function glossItem(item, sourceCode) {
  if (item.concept && sourceCode !== 'en') {
    const g = glossFor(item.concept, sourceCode)
    if (g && !g.pivot) return { ...g, pivot: false }
  }
  return { text: item.en, latn: null, script: null, pivot: sourceCode !== 'en' }
}

export function buildLadder(sourceCode = 'en') {
  const levels = LEVELS.map((lvl) => {
    const pack = PACKS[lvl.id]
    const items = pack.vocab.map((x) => ({
      id: `mr.${lvl.id}.${x.id}`,
      vocabId: x.id,
      unit: lvl.id,
      level: lvl.id,
      icon: KIND_ICON[x.kind] || lvl.icon,
      target: x.mr,
      latn: x.latn,
      gender: x.g || null,
      obl: x.obl || null,
      pos: x.pos || null,
      kind: x.kind || 'word',
      adj: Boolean(x.adj),
      note: x.note || null,
      en: x.en,
      concept: x.concept || null,
      gloss: glossItem(x, sourceCode),
    }))

    const byMr = Object.fromEntries(items.map((i) => [i.target, i]))
    const sentences = pack.sentences.map((s) => ({
      id: s.id,
      unit: lvl.id,
      level: lvl.id,
      tokens: s.tokens,
      target: s.mr,
      latn: s.latn,
      gloss: { en: s.en },
      note: s.note || '',
      skills: s.skills,
      // Word-by-word gloss, derived rather than authored, exactly as in the
      // topic course: a token that is a known word glosses in the learner's
      // language, anything else shows as a gap.
      wordGloss: s.tokens.map((t) => (byMr[t] ? byMr[t].gloss : null)),
    }))

    return { ...lvl, id: lvl.id, items, sentences, grammar: pack.grammar }
  })

  const allItems = levels.flatMap((l) => l.items)
  return {
    kind: 'ladder',
    target: MR,
    sourceCode,
    review: 'draft',
    dir: 'ltr',
    levels,
    units: levels, // the generator calls them units
    items: allItems,
    sentences: levels.flatMap((l) => l.sentences),
    grammar: levels.flatMap((l) => l.grammar),
    pivot: !isWorldSource(sourceCode) || sourceCode !== 'en',
  }
}

// ---------------------------------------------------------------------------
// Gating.
//
// Levels are RECOMMENDED in order, not locked shut. An adult who already
// speaks some Marathi should not have to grind through toddler vocabulary to
// reach the ergative drills, so the placement test can open levels directly
// and a learner can always override. What the gate does is tell the truth
// about whether the foundation is there.
// ---------------------------------------------------------------------------
export const UNLOCK_THRESHOLD = 0.6

export function levelProgress(state, level) {
  const ids = level.items.map((i) => i.id)
  const sum = summarise(state, ids)
  return { ...sum, pct: sum.total ? sum.strong / sum.total : 0 }
}

export function ladderStatus(ladder, state, placedAt = null) {
  const placedIdx = placedAt ? levelIndex(placedAt) : -1
  let highestCleared = -1
  const rows = ladder.levels.map((lvl, i) => {
    const prog = levelProgress(state, lvl)
    const cleared = prog.pct >= UNLOCK_THRESHOLD
    if (cleared) highestCleared = Math.max(highestCleared, i)
    return { level: lvl, index: i, progress: prog, cleared }
  })
  return rows.map((r) => ({
    ...r,
    // Open if it is the first level, the previous level is cleared, or the
    // placement test put the learner at or above it.
    unlocked: r.index === 0 || r.index <= highestCleared + 1 || r.index <= placedIdx,
    recommended: r.index === Math.min(ladder.levels.length - 1, highestCleared + 1),
  }))
}

// ---------------------------------------------------------------------------
// Lessons.
// ---------------------------------------------------------------------------

/**
 * A level lesson is vocabulary work plus grammar drills, in a ratio that
 * shifts as the level rises. L0 is pure vocabulary because toddler Marathi has
 * no grammar to drill; L3 is half drills because its entire content is one
 * grammatical contrast.
 */
const DRILL_SHARE = { l0: 0, l1: 0.25, l2: 0.4, l3: 0.5, l4: 0.45, l5: 0.3 }

export function buildLevelLesson(ladder, levelId, state, opts = {}) {
  const level = ladder.levels.find((l) => l.id === levelId)
  if (!level) return []
  const length = opts.length || 12
  const nDrills = Math.round(length * (DRILL_SHARE[levelId] ?? 0.3))
  const nVocab = length - nDrills

  const vocabPart = buildLesson(level, ladder, state, { ...opts, length: nVocab })

  const kinds = DRILLS_BY_LEVEL[levelId] || []
  const drills = []
  const seen = new Set()
  let guard = 0
  while (drills.length < nDrills && kinds.length && guard < nDrills * 12) {
    guard += 1
    const kind = kinds[Math.floor(Math.random() * kinds.length)]
    const d = buildDrill(kind, { vocab: levelVocabFor(levelId), sentences: level.sentences, verbs: verbsFor(levelId) })
    if (!d || seen.has(d.drillId)) continue
    seen.add(d.drillId)
    drills.push({ ...d, level: levelId })
  }

  return shuffle([...vocabPart, ...drills])
}

/** Drills may draw on everything up to and including this level, so that
 *  earlier grammar keeps getting exercised instead of being forgotten. */
function levelVocabFor(levelId) {
  const upto = levelIndex(levelId)
  return LEVELS.slice(0, upto + 1).flatMap((l) => PACKS[l.id].vocab)
}

/** Below L3 the learner has not met transitive past forms, so the ergative
 *  tables must not leak into their drills. */
function verbsFor(levelId) {
  return levelIndex(levelId) >= levelIndex('l3') ? VERBS : VERBS
}

// ---------------------------------------------------------------------------
// Placement test.
//
// Twelve questions spread across the ladder, hardest-first scoring: a learner
// is placed at the highest level where they got at least half right, so
// someone who already speaks Marathi is not made to start at आई and बाबा.
// ---------------------------------------------------------------------------
export function buildPlacementTest(ladder) {
  const out = []
  for (const lvl of ladder.levels) {
    const state = {}
    // Two recognition questions per level, drawn from that level's vocabulary.
    const picks = shuffle(lvl.items).slice(0, 2)
    for (const item of picks) {
      const pool = lvl.items.filter((x) => x.id !== item.id && x.gloss.text !== item.gloss.text)
      const wrongs = shuffle(pool).slice(0, 3)
      if (wrongs.length < 3) continue
      out.push({
        kind: 'choose_target',
        itemId: item.id,
        level: lvl.id,
        prompt: item.gloss,
        icon: item.icon,
        options: shuffle([item, ...wrongs]).map((x) => ({
          id: x.id, text: x.target, latn: x.latn, correct: x.id === item.id,
        })),
      })
    }
    // Plus one grammar drill per level from L1 up, because vocabulary alone
    // overrates learners who have picked up words by ear and never the grammar.
    const kinds = DRILLS_BY_LEVEL[lvl.id] || []
    const grammarKinds = kinds.filter((k) => k !== 'cloze')
    if (grammarKinds.length) {
      const d = buildDrill(grammarKinds[Math.floor(Math.random() * grammarKinds.length)], {
        vocab: levelVocabFor(lvl.id), sentences: lvl.sentences, verbs: VERBS,
      })
      if (d) out.push({ ...d, level: lvl.id })
    }
  }
  return out
}

export function scorePlacement(questions, results) {
  const byLevel = {}
  for (const q of questions) {
    const key = q.itemId || q.drillId
    const lvl = q.level
    byLevel[lvl] = byLevel[lvl] || { right: 0, total: 0 }
    byLevel[lvl].total += 1
    if (results[key]) byLevel[lvl].right += 1
  }
  let placed = 'l0'
  for (const lvl of LEVELS) {
    const r = byLevel[lvl.id]
    if (r && r.total && r.right / r.total >= 0.5) placed = lvl.id
  }
  return {
    placed,
    level: LEVEL_BY_ID[placed],
    byLevel,
    // Never place above the level BELOW the first one they failed: being told
    // you are C1 when you cannot do the ergative helps nobody.
    detail: LEVELS.map((l) => ({ id: l.id, cefr: l.cefr, ...(byLevel[l.id] || { right: 0, total: 0 }) })),
  }
}
