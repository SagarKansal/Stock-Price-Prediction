import { useState } from 'react'
import { ExerciseView, correctAnswerOf } from './exercises.jsx'
import { gradeExercise, emptyValue } from '../engine/exercise-grading.js'
import { scorePlacement } from '../engine/ladder.js'

/**
 * Placement test.
 *
 * Two recognition questions plus one grammar drill per level. The grammar
 * drills matter more than the vocabulary: plenty of people have absorbed a few
 * hundred Marathi words by ear and have never once produced a correct ergative
 * past. Placing them on vocabulary alone would drop them at B2 and strand them.
 */
export default function Placement({ ladder, questions, t, onDone, onCancel }) {
  const [i, setI] = useState(0)
  const [value, setValue] = useState(() => emptyValue(questions[0]))
  const [checked, setChecked] = useState(null)
  const [results, setResults] = useState({})

  const q = questions[i]
  if (!q) return null
  const key = q.itemId || q.drillId

  const advance = () => {
    if (i + 1 >= questions.length) {
      onDone(scorePlacement(questions, results))
    } else {
      setI(i + 1)
      setValue(emptyValue(questions[i + 1]))
      setChecked(null)
    }
  }

  const check = () => {
    const res = gradeExercise(q, value)
    setChecked(res)
    setResults((r) => ({ ...r, [key]: res.correct }))
  }

  const ready = Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim() : value !== null

  return (
    <div className="stack">
      <div className="row" style={{ gap: 12 }}>
        <button className="btn ghost" onClick={onCancel}>{'✕'}</button>
        <span className="progress"><i style={{ width: `${(i / questions.length) * 100}%` }} /></span>
        <span className="pill">{i + 1}/{questions.length}</span>
      </div>

      <div className="notice calm">
        <b>Placement test</b>
        Answer honestly and skip nothing. Guessing upwards places you above your level and makes
        every lesson after it frustrating.
      </div>

      <div className="card" style={{ minHeight: 300 }}>
        <ExerciseView
          ex={q}
          value={value}
          setValue={setValue}
          checked={Boolean(checked)}
          script="devanagari"
          glossScript={null}
          t={t}
          canSpeak={false}
          onSpeak={() => {}}
        />
        {checked ? (
          <div className={`verdict ${checked.correct ? 'good' : 'bad'}`}>
            <b>{checked.correct ? t.correct : t.wrong}</b>
            {!checked.correct ? (
              <div className="row" style={{ gap: 6 }}>
                <span className="faint">{t.answerWas}:</span>
                {correctAnswerOf(q, 'devanagari')}
              </div>
            ) : null}
            {q.explain ? <div className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>{q.explain}</div> : null}
          </div>
        ) : null}
      </div>

      <div className="footbar">
        {checked ? (
          <button className="btn primary wide" onClick={advance} autoFocus>{t.next}</button>
        ) : (
          <>
            <button className="btn ghost" onClick={() => { setChecked({ correct: false }); setResults((r) => ({ ...r, [key]: false })) }}>
              {t.skip}
            </button>
            <button className="btn primary" style={{ flex: 1 }} disabled={!ready} onClick={check}>{t.check}</button>
          </>
        )}
      </div>
    </div>
  )
}

export function PlacementResult({ result, onAccept }) {
  return (
    <div className="stack" style={{ gap: 18, paddingTop: 30 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>{result.level.icon}</div>
        <h1 style={{ margin: '8px 0 2px' }}>You are at {result.level.cefr}</h1>
        <p className="lede" style={{ margin: 0 }}>{result.level.en} &middot; {result.level.mr}</p>
      </div>

      <div className="notice">
        <b>The gate for this level</b>
        {result.level.gate}
      </div>

      <div className="scrollx">
        <table className="matrix">
          <thead><tr><th>Level</th><th>CEFR</th><th>Score</th></tr></thead>
          <tbody>
            {result.detail.map((d) => (
              <tr key={d.id}>
                <td>{d.id.toUpperCase()}</td>
                <td>{d.cefr}</td>
                <td className={d.total && d.right / d.total >= 0.5 ? '' : 'faint'}>
                  {d.right}/{d.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="faint" style={{ margin: 0 }}>
        Everything below this level stays open. Starting lower than your placement is a reasonable
        choice: the lower levels carry the gender and case habits that upper levels assume.
      </p>

      <button className="btn primary wide" onClick={onAccept}>Open the ladder</button>
    </div>
  )
}
