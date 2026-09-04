import { useEffect, useMemo, useState } from 'react'
import { ExerciseView, correctAnswerOf } from './exercises.jsx'
import { gradeExercise, emptyValue } from '../engine/exercise-grading.js'
import { review } from '../engine/srs.js'
import { speak as ttsSpeak } from '../engine/speech.js'
import TargetText from './TargetText.jsx'

export default function Lesson({ course, exercises, t, glossScript, canSpeak, onFinish, onExit }) {
  const [i, setI] = useState(0)
  const [value, setValue] = useState(() => emptyValue(exercises[0]))
  const [checked, setChecked] = useState(null)
  const [results, setResults] = useState({})
  const [right, setRight] = useState(0)

  const ex = exercises[i]
  const script = course.target.script

  // The value must be reset in the SAME commit that advances the index. Doing
  // it in an effect renders the next exercise once with the previous
  // exercise's value, which crashes any renderer whose value has a different
  // shape (a string arriving where the word bank expects an array).
  const goTo = (n) => {
    setI(n)
    setValue(emptyValue(exercises[n]))
    setChecked(null)
  }

  // Auto-play listening prompts so the learner is not hunting for a button.
  useEffect(() => {
    if (ex && ex.kind === 'listen' && canSpeak) ttsSpeak(ex.speak, course.target.locale)
  }, [ex, canSpeak, course.target.locale])

  const ready = useMemo(() => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }, [value])

  const doCheck = () => {
    const res = gradeExercise(ex, value)
    setChecked(res)
    if (res.correct) setRight((n) => n + 1)
    const key = ex.itemId || ex.sentenceId
    if (key) setResults((r) => ({ ...r, [key]: (r[key] !== false) && res.correct }))
  }

  const doNext = () => {
    if (i + 1 >= exercises.length) {
      onFinish({ results, right, total: exercises.length })
    } else {
      goTo(i + 1)
    }
  }

  const onKey = (e) => {
    if (e.key !== 'Enter') return
    if (checked) doNext()
    else if (ready) doCheck()
  }

  if (!ex) return null

  return (
    <div className="stack" onKeyDown={onKey}>
      <div className="row" style={{ gap: 12 }}>
        <button className="btn ghost" onClick={onExit} aria-label={t.backToMap}>{'✕'}</button>
        <span className="progress"><i style={{ width: `${(i / exercises.length) * 100}%` }} /></span>
        <span className="pill">{i + 1}/{exercises.length}</span>
      </div>

      <div className="card" style={{ minHeight: 320 }}>
        <ExerciseView
          ex={ex}
          value={value}
          setValue={setValue}
          checked={Boolean(checked)}
          script={script}
          glossScript={glossScript}
          t={t}
          canSpeak={canSpeak}
          onSpeak={(text) => ttsSpeak(text, course.target.locale)}
        />

        {checked ? (
          <div className={`verdict ${checked.correct ? 'good' : 'bad'}`}>
            <b>{checked.correct ? t.correct : t.wrong}</b>
            {!checked.correct ? (
              <div className="row" style={{ gap: 6 }}>
                <span className="faint">{t.answerWas}:</span>
                {correctAnswerOf(ex, script)}
              </div>
            ) : null}
            {checked.correct && checked.exact === false ? (
              <div className="faint">Accepted as a spelling variant.</div>
            ) : null}
            {ex.kind === 'wordbank' && ex.note ? (
              <div style={{ marginTop: 8, fontSize: 13.5 }}>
                <TargetText text={ex.answer.join(' ')} script={script} />
                <div className="latn">{ex.latn}</div>
                <div className="muted" style={{ marginTop: 4 }}>{ex.note}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="footbar">
        {checked ? (
          <button className="btn primary wide" onClick={doNext} autoFocus>{t.next}</button>
        ) : (
          <>
            <button className="btn ghost" onClick={() => { setChecked({ correct: false, skipped: true }); }}>
              {t.skip}
            </button>
            <button className="btn primary" style={{ flex: 1 }} disabled={!ready} onClick={doCheck}>
              {t.check}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/** Fold a finished lesson's results into the SRS state. */
export function applyResults(itemState, results, now = Date.now()) {
  const next = { ...itemState }
  for (const [id, ok] of Object.entries(results)) {
    next[id] = review(next[id], ok, now)
  }
  return next
}
