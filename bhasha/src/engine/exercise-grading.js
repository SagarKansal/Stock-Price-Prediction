// Grading, kept out of the JSX so it is testable in plain Node and reusable by
// any other front end. Renderers draw; this decides.

import { gradeText, gradeTokens } from './grader.js'

export function gradeExercise(ex, value) {
  switch (ex.kind) {
    case 'choose_target':
    case 'choose_gloss':
    case 'listen':
    case 'script_compose':
    case 'script_shape':
    // Grammar drills from the Marathi ladder. All option-based, except
    // `conjugate` in type mode, which falls through to free-text grading.
    case 'ergative_agree':
    case 'gender_agree':
    case 'case_mark':
    case 'oblique':
    case 'transform':
    case 'cloze': {
      const picked = ex.options.find((o) => o.id === value)
      return { correct: Boolean(picked && picked.correct) }
    }
    case 'conjugate': {
      if (ex.mode === 'type') return gradeText(value, ex.answer)
      const picked = ex.options.find((o) => o.id === value)
      return { correct: Boolean(picked && picked.correct) }
    }
    case 'type':
      return gradeText(value, ex.answer)
    case 'transliterate': {
      const r = gradeText(value, ex.answer)
      // Echoing the prompt back in its own script proves nothing here.
      return r.hint === 'script' ? { correct: false, hint: 'script' } : r
    }
    case 'wordbank':
      return gradeTokens(Array.isArray(value) ? value : [], ex.answer)
    default:
      return { correct: false }
  }
}

/** The neutral starting value for an exercise, by kind. */
export function emptyValue(ex) {
  if (ex.kind === 'wordbank') return []
  if (ex.kind === 'type' || ex.kind === 'transliterate') return ''
  if (ex.kind === 'conjugate' && ex.mode === 'type') return ''
  return null
}
