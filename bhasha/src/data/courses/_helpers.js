// Course-pack helpers.
//
// A course pack is ONE Indian language, keyed by the concept ids in
// ../concepts.js. It contains no source-language text of its own beyond an
// English sentence gloss, because source-language rendering is the pairing
// layer's job (engine/pairing.js), not the pack's.

// Lexicon entry: [native script, latin transliteration, optional meta]
export const w = (target, latn, meta = {}) => ({ target, latn, ...meta })

/**
 * Sentence entry.
 * @param id      stable id, prefixed with the language code
 * @param tokens  the target-script words, in order
 * @param latn    full transliteration of the sentence
 * @param align   concept id (or null) for each token, SAME LENGTH as tokens.
 *                This is what lets a Russian or Tamil speaker get a
 *                word-by-word gloss without anyone authoring a Russian or
 *                Tamil version of the sentence.
 * @param en      natural English translation (the pivot; always required)
 * @param unit    which unit this sentence belongs to
 * @param note    optional grammar aside shown after the learner answers
 */
export const s = (id, tokens, latn, align, en, unit, note = '') => ({
  id,
  tokens,
  target: tokens.join(' '),
  latn,
  align,
  gloss: { en },
  unit,
  note,
})

// Grammar note attached to a unit; shown on the course map and after lessons.
export const g = (unit, title, body) => ({ unit, title, body })
