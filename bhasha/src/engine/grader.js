// Answer checking.
//
// Transliteration has no single standard. A learner typing "paani", "pani",
// "pānī" or "paaNee" all mean the same word, and rejecting them teaches
// nothing except that the app is fussy. So Latin answers are normalised hard
// and then compared with a small edit-distance budget. Native-script answers
// are compared strictly after Unicode normalisation, because there the
// spelling IS the lesson.

const COMBINING = /[̀-ͯ]/g

// Digraph equivalences applied before diacritics are stripped, so that
// retroflex and sibilant distinctions collapse the way learners type them.
const PRE = [
  [/ṣ/g, 'sh'], [/ś/g, 'sh'], [/ḻ/g, 'zh'], [/ṅ/g, 'n'], [/ñ/g, 'n'],
  [/ṇ/g, 'n'], [/ṉ/g, 'n'], [/ṭ/g, 't'], [/ḍ/g, 'd'], [/ḷ/g, 'l'],
  [/ṟ/g, 'r'], [/ṛ/g, 'r'], [/ṁ/g, 'm'], [/ḥ/g, 'h'], [/r̥/g, 'ri'],
]

export function normaliseLatin(raw) {
  let s = String(raw || '').normalize('NFC').toLowerCase().trim()
  for (const [re, to] of PRE) s = s.replace(re, to)
  s = s.normalize('NFD').replace(COMBINING, '')
  s = s.replace(/sh/g, 's').replace(/ch/g, 'c').replace(/w/g, 'v')
  s = s.replace(/y(\b)/g, 'i$1')
  s = s.replace(/[^a-z0-9]/g, '')
  s = s.replace(/(.)\1+/g, '$1') // paani -> pani, satt -> sat
  return s
}

export function normaliseScript(raw) {
  return String(raw || '')
    .normalize('NFC')
    .replace(/[​-‍﻿]/g, '') // ZWJ / ZWNJ / BOM
    .replace(/\s+/g, ' ')
    .replace(/[।॥.?!,]/g, '')
    .trim()
}

export function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i]
    for (let j = 1; j <= b.length; j += 1) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = row
  }
  return prev[b.length]
}

const tolerance = (len) => (len <= 4 ? 1 : Math.min(2, Math.floor(len / 4)))

/**
 * Grade a free-text answer against a target word.
 * Accepts either the native script or any reasonable transliteration.
 * Returns { correct, exact, hint }.
 */
export function gradeText(input, { target, latn }) {
  const raw = String(input || '').trim()
  if (!raw) return { correct: false, exact: false, hint: 'empty' }

  if (normaliseScript(raw) === normaliseScript(target)) {
    return { correct: true, exact: true, hint: 'script' }
  }

  const got = normaliseLatin(raw)
  const want = normaliseLatin(latn)
  if (!got || !want) return { correct: false, exact: false, hint: 'none' }
  if (got === want) return { correct: true, exact: true, hint: 'latin' }

  const d = levenshtein(got, want)
  if (d <= tolerance(want.length)) {
    return { correct: true, exact: false, hint: 'close' }
  }
  return { correct: false, exact: false, hint: 'wrong' }
}

/** Grade a built sentence (word bank) against the expected token order. */
export function gradeTokens(picked, expected) {
  const a = picked.map(normaliseScript).join(' ')
  const b = expected.map(normaliseScript).join(' ')
  return { correct: a === b, exact: a === b }
}
