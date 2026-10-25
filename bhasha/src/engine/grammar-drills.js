// Grammar drill generation for the Marathi ladder.
//
// The design rule here is that DISTRACTORS MUST COME FROM THE SAME PARADIGM.
// A conjugation question whose wrong answers are random words teaches nothing:
// the learner picks the only verb-shaped option and moves on. A conjugation
// question whose wrong answers are the other five forms of the same verb is
// the actual skill. Every generator below pulls its distractors from the
// nearest confusable set.

import { VERBS, VERB_BY_ID, VERB_OBJECTS, PRONOUN_SLOTS, FUTURE_PRONOUNS, OBJECT_SLOTS, ERG_PERSON_SUFFIX } from '../data/deep/mr/verbs.js'
import { shuffle } from './generator.js'

const sample = (arr, n) => shuffle(arr).slice(0, n)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const opts = (correct, wrongs, extra = {}) =>
  shuffle([
    { id: correct.mr, text: correct.mr, latn: correct.latn, correct: true, ...extra },
    ...wrongs.map((w) => ({ id: w.mr, text: w.mr, latn: w.latn, correct: false })),
  ])

/** Drop duplicate surface forms, which are common in Marathi paradigms
 *  (मी जातो and तो जातो are identical) and would make a question unanswerable. */
const distinctFrom = (answer, pool, n) => {
  const seen = new Set([answer.mr])
  const out = []
  for (const f of shuffle(pool)) {
    if (seen.has(f.mr)) continue
    seen.add(f.mr)
    out.push(f)
    if (out.length >= n) break
  }
  return out
}

// ---------------------------------------------------------------------------
// Conjugation: "मी + जाणे, present → ?"
// ---------------------------------------------------------------------------
export function conjugationDrill(verbs, tenseId, mode = 'choose') {
  const usable = verbs.filter((v) => v.forms[tenseId])
  if (!usable.length) return null
  const verb = pick(usable)
  const table = verb.forms[tenseId]
  const keys = Object.keys(table)
  const key = pick(keys)
  const answer = table[key]

  const slot =
    tenseId === 'future'
      ? { key, pron: FUTURE_PRONOUNS[key][0], pronLatn: FUTURE_PRONOUNS[key][1], en: FUTURE_PRONOUNS[key][2] }
      : PRONOUN_SLOTS.find((s) => s.key === key)
  if (!slot) return null

  const wrongs = distinctFrom(answer, keys.filter((k) => k !== key).map((k) => table[k]), 3)
  if (wrongs.length < 3) return null

  const base = {
    kind: 'conjugate',
    drillId: `conj.${verb.id}.${tenseId}.${key}`,
    skill: `conjugation.${tenseId}`,
    verb: { inf: verb.inf, latn: verb.infLatn, en: verb.en },
    tenseId,
    slot,
    answer: { target: answer.mr, latn: answer.latn },
  }
  return mode === 'type' ? { ...base, mode: 'type' } : { ...base, mode: 'choose', options: opts(answer, wrongs) }
}

// ---------------------------------------------------------------------------
// The ergative drill. The question is deliberately framed so the learner must
// look at the OBJECT, because that is the entire lesson of L3.
// ---------------------------------------------------------------------------
const ERG_SUBJECTS = [
  { mr: 'त्याने', latn: 'tyāne', en: 'he', person: '3sg' },
  { mr: 'तिने', latn: 'tine', en: 'she', person: '3sg' },
  { mr: 'त्यांनी', latn: 'tyānnī', en: 'they', person: '3pl' },
  { mr: 'रामाने', latn: 'rāmāne', en: 'Ram', person: '3sg' },
  { mr: 'मी', latn: 'mī', en: 'I', person: '1sg' },
  { mr: 'आम्ही', latn: 'āmhī', en: 'we', person: '1pl' },
]

export function ergativeDrill(verbs) {
  const trans = verbs.filter((v) => v.type === 'transitive' && v.forms.pastErg)
  if (!trans.length) return null
  const verb = pick(trans)
  const table = verb.forms.pastErg
  const objSlot = pick(OBJECT_SLOTS.filter((o) => table[o.key]))
  const answer = table[objSlot.key]
  const subject = pick(ERG_SUBJECTS)
  // Use an object this verb can plausibly take. The generic sample nouns on
  // OBJECT_SLOTS produce grammatically valid nonsense ("I sold work").
  const vo = (VERB_OBJECTS[verb.id] || {})[objSlot.key]

  const wrongs = distinctFrom(
    answer,
    OBJECT_SLOTS.filter((o) => o.key !== objSlot.key && table[o.key]).map((o) => table[o.key]),
    3,
  )
  if (wrongs.length < 3) return null

  return {
    kind: 'ergative_agree',
    drillId: `erg.${verb.id}.${objSlot.key}`,
    skill: 'ergative',
    verb: { inf: verb.inf, latn: verb.infLatn, en: verb.en },
    subject,
    object: {
      mr: vo ? vo.mr : objSlot.sample,
      latn: vo ? vo.latn : '',
      en: vo ? vo.en : objSlot.sampleEn,
      gloss: objSlot.en,
    },
    answer: { target: answer.mr, latn: answer.latn },
    options: opts(answer, wrongs),
    explain: `The verb agrees with ${vo ? vo.mr : objSlot.sample} (${objSlot.en}), not with ${subject.mr}.`,
  }
}

// ---------------------------------------------------------------------------
// Gender agreement: "____ मुलगी" with मोठा / मोठी / मोठं.
// ---------------------------------------------------------------------------
const ADJ_LATN = { m: 'ā', f: 'ī', n: 'ã' }

/** Marathi -आ adjectives inflect by swapping the final vowel. */
export function inflectAdjective(mr, latn) {
  if (!mr.endsWith('ा')) return null // consonant-final adjectives never change
  const base = mr.slice(0, -1)
  const lbase = latn.replace(/ā$/, '')
  return {
    m: { mr, latn },
    f: { mr: base + 'ी', latn: lbase + ADJ_LATN.f },
    n: { mr: base + 'ं', latn: lbase + ADJ_LATN.n },
  }
}

export function genderAgreementDrill(vocab) {
  // `adj` is an explicit flag in the data, not inferred. Inferring it from
  // "ends in ा" swept up nouns (पावसाळा is monsoon, not an adjective) and the
  // irregular कसा, whose feminine is कशी rather than कसी. A drill that
  // generates a non-word is worse than one that never fires.
  const adjs = vocab.filter((x) => x.adj && inflectAdjective(x.mr, x.latn))
  const nouns = vocab.filter((x) => x.g && ['m', 'f', 'n'].includes(x.g))
  if (!adjs.length || !nouns.length) return null

  const adj = pick(adjs)
  const noun = pick(nouns)
  const forms = inflectAdjective(adj.mr, adj.latn)
  const answer = forms[noun.g]
  const wrongs = ['m', 'f', 'n'].filter((k) => k !== noun.g).map((k) => forms[k])

  return {
    kind: 'gender_agree',
    drillId: `agree.${adj.id}.${noun.id}`,
    skill: 'gender-agreement',
    noun: { mr: noun.mr, latn: noun.latn, en: noun.en, g: noun.g },
    adjEn: adj.en,
    answer: { target: answer.mr, latn: answer.latn },
    options: opts(answer, wrongs),
    explain: `${noun.mr} is ${{ m: 'masculine', f: 'feminine', n: 'neuter' }[noun.g]}, so the adjective takes ${{ m: '-आ', f: '-ई', n: '-ं' }[noun.g]}.`,
  }
}

// ---------------------------------------------------------------------------
// Case marking and the oblique stem.
// ---------------------------------------------------------------------------
// Framed by grammatical function rather than by an English phrase. Pairing a
// random case with a random noun and glossing it produced lines like "by means
// of the hour": correct Marathi, absurd English, and a distraction from the
// point of the drill, which is where the suffix attaches.
const CASES = [
  { suffix: 'ला', latn: 'lā', name: 'dative', en: 'to / for' },
  { suffix: 'त', latn: 't', name: 'locative', en: 'in' },
  { suffix: 'वर', latn: 'var', name: 'locative', en: 'on' },
  { suffix: 'तून', latn: 'tūn', name: 'ablative', en: 'out of' },
  { suffix: 'ने', latn: 'ne', name: 'instrumental', en: 'by means of' },
  { suffix: 'शी', latn: 'śī', name: 'sociative', en: 'with' },
]

export function caseDrill(vocab) {
  const nouns = vocab.filter((x) => x.obl)
  if (nouns.length < 2) return null
  const noun = pick(nouns)
  const c = pick(CASES)
  // No transliteration here, deliberately. The oblique stem's romanisation is
  // not stored, and deriving it by concatenation produces falsehoods:
  // रस्ता is "rastā" but रस्त्यातून is "rastyātūn", not "rastātūn". Showing
  // nothing is honest; showing a wrong romanisation in a language app is not.
  const answer = { mr: noun.obl + c.suffix, latn: '' }
  const wrongs = sample(CASES.filter((x) => x.suffix !== c.suffix), 3).map((x) => ({
    mr: noun.obl + x.suffix,
    latn: '',
  }))
  if (wrongs.length < 3) return null

  return {
    kind: 'case_mark',
    drillId: `case.${noun.id}.${c.suffix}`,
    skill: 'case-marking',
    noun: { mr: noun.mr, latn: noun.latn, en: noun.en, obl: noun.obl },
    target: `${c.name} (-${c.suffix})`,
    caseEn: `${c.name}: ${c.en}`,
    answer: { target: answer.mr, latn: answer.latn },
    options: opts(answer, wrongs),
    explain: `${noun.mr} → oblique ${noun.obl}- → ${answer.mr}. The suffix never attaches to the dictionary form.`,
  }
}

/** Oblique-stem recall, drilled on its own because it gates everything else. */
export function obliqueDrill(vocab) {
  const nouns = vocab.filter((x) => x.obl && x.obl !== x.mr)
  if (nouns.length < 4) return null
  const noun = pick(nouns)
  const answer = { mr: noun.obl, latn: '' }
  // Distractors are other real oblique stems, so the shape of the answer
  // cannot be guessed from its ending alone.
  const wrongs = distinctFrom(
    answer,
    nouns.filter((n) => n.id !== noun.id).map((n) => ({ mr: n.obl, latn: '' })),
    3,
  )
  if (wrongs.length < 3) return null
  return {
    kind: 'oblique',
    drillId: `obl.${noun.id}`,
    skill: 'oblique-stem',
    noun: { mr: noun.mr, latn: noun.latn, en: noun.en, g: noun.g },
    answer: { target: answer.mr, latn: '' },
    options: opts(answer, wrongs),
    explain: `Every case suffix attaches to ${noun.obl}-, never to ${noun.mr}.`,
  }
}

// ---------------------------------------------------------------------------
// Transform: rewrite a verb form into another tense or person.
// ---------------------------------------------------------------------------
export function transformDrill(verbs) {
  const usable = verbs.filter((v) => v.forms.present && v.forms[v.type === 'transitive' ? 'future' : 'past'])
  if (!usable.length) return null
  const verb = pick(usable)
  const toTense = verb.type === 'transitive' ? 'future' : 'past'

  const fromKey = pick(['1sg.m', '1sg.f', '3sg.m', '3sg.f', '3pl'])
  const from = verb.forms.present[fromKey]
  if (!from) return null

  const toKey = toTense === 'future' ? ({ '1sg.m': '1sg', '1sg.f': '1sg', '3sg.m': '3sg', '3sg.f': '3sg', '3pl': '3pl' })[fromKey] : fromKey
  const table = verb.forms[toTense]
  const answer = table[toKey]
  if (!answer) return null

  const wrongs = distinctFrom(answer, Object.values(table), 3)
  if (wrongs.length < 3) return null

  const slot = PRONOUN_SLOTS.find((s) => s.key === fromKey)
  return {
    kind: 'transform',
    drillId: `tr.${verb.id}.${fromKey}.${toTense}`,
    skill: `transform.${toTense}`,
    from: { pron: slot.pron, form: from.mr, latn: from.latn },
    toTense: toTense === 'future' ? 'future' : 'past',
    answer: { target: answer.mr, latn: answer.latn },
    options: opts(answer, wrongs),
  }
}

// ---------------------------------------------------------------------------
// Cloze: blank one token of a real sentence from the level.
// ---------------------------------------------------------------------------
export function clozeDrill(sentences, vocab) {
  const usable = sentences.filter((s) => s.tokens.length >= 3)
  if (!usable.length || vocab.length < 6) return null
  const sent = pick(usable)
  const idx = Math.floor(Math.random() * sent.tokens.length)
  const answer = { mr: sent.tokens[idx], latn: '' }

  // Prefer decoys of a similar length from the same level, so the blank cannot
  // be solved by eyeballing how wide it is.
  const bank = vocab.map((x) => ({ mr: x.mr, latn: x.latn })).filter((x) => !sent.tokens.includes(x.mr))
  const near = bank.filter((x) => Math.abs(x.mr.length - answer.mr.length) <= 2)
  const wrongs = distinctFrom(answer, near.length >= 3 ? near : bank, 3)
  if (wrongs.length < 3) return null

  return {
    kind: 'cloze',
    drillId: `cloze.${sent.id}.${idx}`,
    skill: 'cloze',
    sentenceId: sent.id,
    tokens: sent.tokens.map((t, i) => (i === idx ? null : t)),
    blankAt: idx,
    prompt: sent.en,
    latn: sent.latn,
    note: sent.note,
    answer: { target: answer.mr, latn: '' },
    options: opts(answer, wrongs),
  }
}

// ---------------------------------------------------------------------------
// Which drills a level is allowed to use. A learner at L1 must never be shown
// an ergative question: they have not met the construction, and failing it
// teaches nothing except that the app is unfair.
// ---------------------------------------------------------------------------
export const DRILLS_BY_LEVEL = {
  l0: ['cloze'],
  l1: ['conjugate.present', 'gender_agree', 'cloze'],
  l2: ['conjugate.present', 'conjugate.past', 'conjugate.future', 'gender_agree', 'case_mark', 'oblique', 'transform', 'cloze'],
  l3: ['ergative_agree', 'conjugate.pastErg', 'conjugate.past', 'case_mark', 'oblique', 'transform', 'cloze'],
  l4: ['ergative_agree', 'conjugate.future', 'conjugate.pastErg', 'transform', 'case_mark', 'cloze'],
  l5: ['ergative_agree', 'conjugate.pastErg', 'cloze'],
}

export function buildDrill(kind, { vocab, sentences, verbs = VERBS }) {
  switch (kind) {
    case 'conjugate.present': return conjugationDrill(verbs, 'present', Math.random() < 0.3 ? 'type' : 'choose')
    case 'conjugate.past': return conjugationDrill(verbs.filter((v) => v.type === 'intransitive'), 'past')
    case 'conjugate.future': return conjugationDrill(verbs, 'future')
    // The ergative past is keyed by OBJECT, not by a pronoun slot, so the
    // generic conjugation generator cannot frame it. Route it to the drill
    // that can, rather than returning null and wasting the question slot.
    case 'conjugate.pastErg': return ergativeDrill(verbs.filter((v) => v.type === 'transitive'))
    case 'ergative_agree': return ergativeDrill(verbs)
    case 'gender_agree': return genderAgreementDrill(vocab)
    case 'case_mark': return caseDrill(vocab)
    case 'oblique': return obliqueDrill(vocab)
    case 'transform': return transformDrill(verbs)
    case 'cloze': return clozeDrill(sentences, vocab)
    default: return null
  }
}
