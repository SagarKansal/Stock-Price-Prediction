// Helpers for the deep Marathi ladder.
//
// The shared course packs (../../courses/*.js) are keyed to concept ids so that
// any Indian language can be learned from any source language. That buys
// breadth. It cannot buy DEPTH: there is no Tamil or Russian equivalent of
// "the Marathi ergative past", so levelled grammar content cannot live in the
// concept hub without dragging nine other languages along.
//
// So this is a second content channel. It is Marathi-specific, English-glossed,
// and ordered by level rather than by topic. Where a word also exists in the
// shared hub it carries a `concept` id, and the pairing layer then glosses it
// in the learner's own language; everything else falls back to English and the
// UI says so.

/**
 * Vocabulary entry.
 * @param id      stable slug, unique across the whole ladder
 * @param mr      Marathi, in Devanagari
 * @param latn    transliteration
 * @param en      English gloss
 * @param extra   { g: 'm'|'f'|'n', pos, concept, note, obl }
 *                `obl` is the oblique stem, which is what case suffixes attach
 *                to. Marathi learners need it from day one and dictionaries
 *                almost never print it.
 */
export const v = (id, mr, latn, en, extra = {}) => ({ id, mr, latn, en, ...extra })

/**
 * Sentence. `tokens` must join with single spaces to the full sentence, which
 * is what makes word-bank exercises safe to generate.
 * @param skills  grammar points this sentence demonstrates, used to pick
 *                sentences that drill a specific wall
 */
export const s = (id, tokens, latn, en, extra = {}) => ({
  id,
  tokens,
  mr: tokens.join(' '),
  latn,
  en,
  skills: extra.skills || [],
  ...extra,
})

/** Grammar lesson. `examples` are shown as a table under the explanation. */
export const g = (id, title, body, examples = [], extra = {}) => ({ id, title, body, examples, ...extra })

/** One example row inside a grammar lesson. */
export const ex = (mr, latn, en, note = '') => ({ mr, latn, en, note })

/**
 * A paradigm: one grammatical form of one word, used to generate conjugation
 * and agreement drills rather than hand-writing them.
 * @param key   e.g. '1sg.m', '3sg.n', 'erg.3sg'
 */
export const p = (key, mr, latn, en = '') => ({ key, mr, latn, en })
