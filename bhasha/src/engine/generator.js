// Exercise generation.
//
// Exercises are DERIVED from the course pack, never authored. One lexicon
// entry yields a recognition drill, a production drill, a typing drill, a
// listening drill and a script drill; one aligned sentence yields a word bank
// and a translation. That is the second half of the N+M bargain: content
// authors write words, not question banks.

import { getScript } from '../data/scripts/index.js'
import { selectStudy } from './srs.js'

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const sample = (arr, n) => shuffle(arr).slice(0, n)

/**
 * Distractors are drawn from the same unit first. Picking them at random
 * across the whole course makes every question trivially easy, because the
 * wrong answers are obviously from another topic.
 *
 * The option set must be pairwise distinct on BOTH the target and the gloss,
 * not merely distinct from the answer. Two collisions are real in this content
 * and neither is exotic:
 *   - Hindi \u0915\u0932, Punjabi \u0915\u0306\u0932\u0651\u0939 and Urdu \u06a9\u0644 each mean "tomorrow" AND
 *     "yesterday", so the target side can repeat.
 *   - Spanish "ma\u00f1ana" glosses both "morning" and "tomorrow", so the gloss
 *     side can repeat for a source language that has its own homograph.
 * Either one produces a question with two identical options, one marked right
 * and one marked wrong: unanswerable, and exactly the sort of defect a learner
 * blames on themselves.
 */
function distractorsFor(item, pool, n = 3) {
  const seenTarget = new Set([item.target])
  const seenGloss = new Set([item.gloss.text])
  const picked = []

  const consider = (candidates) => {
    for (const x of candidates) {
      if (picked.length >= n) return
      if (x.id === item.id) continue
      if (seenTarget.has(x.target) || seenGloss.has(x.gloss.text)) continue
      seenTarget.add(x.target)
      seenGloss.add(x.gloss.text)
      picked.push(x)
    }
  }

  consider(shuffle(pool.filter((x) => x.unit === item.unit)))
  consider(shuffle(pool.filter((x) => x.unit !== item.unit)))
  return picked
}

const chooseTarget = (item, pool) => ({
  kind: 'choose_target',
  itemId: item.id,
  prompt: item.gloss,
  icon: item.icon,
  options: shuffle([item, ...distractorsFor(item, pool)]).map((x) => ({
    id: x.id,
    text: x.target,
    latn: x.latn,
    correct: x.id === item.id,
  })),
})

const chooseGloss = (item, pool) => ({
  kind: 'choose_gloss',
  itemId: item.id,
  prompt: { text: item.target, latn: item.latn },
  options: shuffle([item, ...distractorsFor(item, pool)]).map((x) => ({
    id: x.id,
    text: x.gloss.text,
    latn: x.gloss.latn,
    correct: x.id === item.id,
  })),
})

const listen = (item, pool) => ({
  kind: 'listen',
  itemId: item.id,
  speak: item.target,
  options: shuffle([item, ...distractorsFor(item, pool)]).map((x) => ({
    id: x.id,
    text: x.target,
    latn: x.latn,
    correct: x.id === item.id,
  })),
})

const typeIt = (item, direction) => ({
  kind: 'type',
  itemId: item.id,
  direction,
  prompt: direction === 'to_target' ? item.gloss : { text: item.target, latn: null },
  icon: item.icon,
  answer: { target: item.target, latn: item.latn },
})

const wordbank = (sentence, course) => {
  // Decoys are real words from the course, so the bank cannot be solved by
  // elimination on plausibility alone.
  const decoys = sample(
    course.items.filter((i) => !sentence.tokens.includes(i.target)),
    Math.min(3, Math.max(2, Math.floor(sentence.tokens.length / 2))),
  ).map((i) => i.target)
  return {
    kind: 'wordbank',
    sentenceId: sentence.id,
    prompt: sentence.gloss.en,
    // Only one natural translation is authored per sentence, in English. For a
    // non-English speaker that is a pivot, and the UI labels it as one rather
    // than quietly serving a third language.
    promptIsPivot: course.sourceCode !== 'en',
    wordGloss: sentence.wordGloss,
    tokens: sentence.tokens,
    latn: sentence.latn,
    note: sentence.note,
    bank: shuffle([...sentence.tokens, ...decoys]),
    answer: sentence.tokens,
  }
}

const ZWJ = '‍'
export const positionalForms = (ch) => ({
  isolated: ch,
  initial: ch + ZWJ,
  medial: ZWJ + ch + ZWJ,
  final: ZWJ + ch,
})

/**
 * Script drills. For an abugida the interesting question is composition
 * (consonant + which sign = this syllable?); for an abjad it is positional
 * shape. Same exercise slot, different question, decided by script type.
 */
function scriptExercise(script) {
  if (script.type === 'abjad') {
    const letter = sample(script.consonants, 1)[0]
    const wrong = sample(script.consonants.filter((c) => c.char !== letter.char), 3)
    return {
      kind: 'script_shape',
      scriptId: script.id,
      letter,
      forms: positionalForms(letter.char),
      options: shuffle([letter, ...wrong]).map((c) => ({
        id: c.char,
        text: c.latn,
        correct: c.char === letter.char,
      })),
    }
  }

  const withMatra = script.vowels.filter((v) => v.matra)
  const vowel = sample(withMatra, 1)[0]
  const cons = sample(script.consonants.filter((c) => c.group !== 'borrowed'), 1)[0]
  const answer = cons.char + vowel.matra
  const wrongVowels = sample(withMatra.filter((v) => v.matra !== vowel.matra), 3)
  return {
    kind: 'script_compose',
    scriptId: script.id,
    consonant: cons,
    vowel,
    answer,
    syllable: cons.latn.replace(/a$/, '') + vowel.latn,
    options: shuffle([
      { id: answer, text: answer, correct: true },
      ...wrongVowels.map((v) => ({ id: cons.char + v.matra, text: cons.char + v.matra, correct: false })),
    ]),
  }
}

const transliterate = (item) => ({
  kind: 'transliterate',
  itemId: item.id,
  prompt: { text: item.target, latn: null },
  answer: { target: item.target, latn: item.latn },
})

/**
 * Build a lesson for one unit.
 *
 * @param unit      a unit from buildCourse()
 * @param course    the joined course
 * @param state     srs state keyed by concept id
 * @param opts      { length, audio } - audio false drops listening drills when
 *                  the browser has no voice for the language, rather than
 *                  serving silent questions
 */
export function buildLesson(unit, course, state, opts = {}) {
  const length = opts.length || 12
  const audio = opts.audio !== false
  const script = getScript(course.target.script)

  const pool = course.items
  const ids = unit.items.map((i) => i.id)
  const studyIds = selectStudy(state, ids, Math.max(4, Math.ceil(length * 0.7)))
  const study = studyIds.map((id) => unit.items.find((i) => i.id === id)).filter(Boolean)
  const roster = study.length ? study : sample(unit.items, Math.min(6, unit.items.length))

  const exercises = []

  // Introduce anything genuinely new with recognition before demanding recall.
  for (const item of roster) {
    const seen = state[item.id]
    if (!seen) {
      exercises.push(chooseTarget(item, pool))
    } else if (seen.rung <= 2) {
      exercises.push(Math.random() < 0.5 ? chooseTarget(item, pool) : chooseGloss(item, pool))
    } else if (audio && Math.random() < 0.35) {
      exercises.push(listen(item, pool))
    } else if (Math.random() < 0.5) {
      exercises.push(typeIt(item, 'to_target'))
    } else {
      exercises.push(transliterate(item))
    }
  }

  if (unit.sentences.length) {
    for (const sent of sample(unit.sentences, Math.min(3, unit.sentences.length))) {
      exercises.push(wordbank(sent, course))
    }
  }

  if (script) exercises.push(scriptExercise(script))

  // Top up with mixed recall if the unit is small.
  while (exercises.length < length && roster.length) {
    const item = sample(roster, 1)[0]
    exercises.push(chooseGloss(item, pool))
  }

  return shuffle(exercises).slice(0, length)
}

/** A standalone script drill session, independent of any lesson. */
export function buildScriptDrill(scriptId, count = 10) {
  const script = getScript(scriptId)
  if (!script) return []
  return Array.from({ length: count }, () => scriptExercise(script))
}
