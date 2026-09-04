import { summarise, dueCount, newCount } from '../engine/srs.js'
import { strings } from '../data/ui.js'
import TargetText from './TargetText.jsx'

export default function CourseMap({ course, t, state, onUnit, onScript, onReview }) {
  const ids = course.items.map((i) => i.id)
  const sum = summarise(state.items, ids)
  const fresh = newCount(state.items, ids)
  const s = strings(course.sourceCode)

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div>
        <h1 style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <TargetText text={course.target.native} script={course.target.script} />
          <span>{course.target.name}</span>
        </h1>
        <p className="lede">{course.target.typology}</p>
      </div>

      <div className="statgrid">
        <div className="stat"><b>{state.streak || 0}</b><span>{s.streak}</span></div>
        <div className="stat"><b>{state.xp || 0}</b><span>{s.xp}</span></div>
        <div className="stat"><b>{sum.started}</b><span>{s.started}</span></div>
        <div className="stat"><b>{sum.strong}</b><span>{s.strong}</span></div>
      </div>

      {course.review === 'draft' ? (
        <div className="notice">
          <b>{s.draftTitle}</b>
          {s.draftBody}
        </div>
      ) : null}

      {course.register ? (
        <div className="notice calm">
          <b>Register: {course.register}</b>
          Spoken {course.target.name} differs from what this course teaches. See the grammar notes.
        </div>
      ) : null}

      <div className="row">
        <button className="btn" onClick={onScript}>{s.scriptLab}</button>
        <button className="btn" disabled={sum.due === 0} onClick={onReview}>
          {s.reviewDue}{sum.due ? ` (${sum.due})` : ''}
        </button>
        {fresh ? <span className="pill">{fresh} new</span> : null}
        {sum.due === 0 && sum.started > 0 ? <span className="faint">{s.allCaughtUp}</span> : null}
      </div>

      <section className="stack" style={{ gap: 8 }}>
        <h3>{s.lessons}</h3>
        {course.units.map((u) => {
          const uids = u.items.map((i) => i.id)
          const us = summarise(state.items, uids)
          const pct = Math.round((us.strong / Math.max(1, us.total)) * 100)
          const due = dueCount(state.items, uids)
          return (
            <button key={u.id} className="unit" onClick={() => onUnit(u.id)}>
              <span className="icon">{u.icon}</span>
              <span className="body">
                <b>{u.id}</b>
                <span className="faint">
                  {us.started}/{us.total} {s.words}
                  {u.sentences.length
                    ? ` · ${u.sentences.length} ${u.sentences.length === 1 ? 'sentence' : 'sentences'}`
                    : ''}
                  {due ? ` · ${due} ${s.due}` : ''}
                </span>
                <span className={`bar ${pct === 100 ? 'ok' : ''}`}><i style={{ width: `${pct}%` }} /></span>
              </span>
            </button>
          )
        })}
      </section>

      <section>
        <h3>{s.grammar}</h3>
        {course.grammar.map((g, i) => (
          <div className="grammar" key={i}>
            <b>{g.title}</b>
            <p>{g.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
