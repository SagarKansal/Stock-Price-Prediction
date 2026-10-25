import { useState } from 'react'
import { ladderStatus, levelProgress } from '../engine/ladder.js'
import { summarise } from '../engine/srs.js'
import TargetText from './TargetText.jsx'

/**
 * The Marathi ladder, Pre-A1 to C1.
 *
 * Levels are shown in order with their gate stated plainly, because for
 * Marathi the thing that blocks progress is specific and nameable: gender
 * agreement at A1, the oblique stem at A2, ergative alignment at B1. A learner
 * who knows what the wall is can aim at it.
 *
 * Locked levels are visible, not hidden. Hiding them makes the course feel
 * endless; showing them with their gate makes the path legible.
 */
export default function Ladder({ ladder, state, placedAt, onStart, onPlacement, onGrammar }) {
  const [open, setOpen] = useState(null)
  const rows = ladderStatus(ladder, state.items, placedAt)
  const overall = summarise(state.items, ladder.items.map((i) => i.id))
  const reached = rows.filter((r) => r.cleared).length

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div>
        <h1 style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <TargetText text="मराठी" script="devanagari" />
          <span>Marathi ladder</span>
        </h1>
        <p className="lede">
          Six levels from what a two-year-old says to idiom and register, mapped to CEFR. Each level
          names the one thing that actually gates progress out of it.
        </p>
      </div>

      <div className="statgrid">
        <div className="stat"><b>{reached}/6</b><span>levels cleared</span></div>
        <div className="stat"><b>{overall.started}</b><span>words started</span></div>
        <div className="stat"><b>{overall.strong}</b><span>words strong</span></div>
        <div className="stat"><b>{overall.due}</b><span>due</span></div>
      </div>

      {/* The placement test stays reachable forever. Hiding it after the first
          lesson stranded anyone who only realised later that they were starting
          far below their actual level. */}
      {overall.started === 0 ? (
        <div className="notice">
          <b>Already speak some Marathi?</b>
          Take the placement test instead of starting at आई and बाबा. Questions spread across all six
          levels, including the grammar drills that vocabulary alone will not catch.
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={onPlacement}>Take the placement test</button>
          </div>
        </div>
      ) : (
        <div className="row">
          <button className="btn ghost" onClick={onPlacement}>Re-take the placement test</button>
          {placedAt ? <span className="faint">placed at {placedAt.toUpperCase()}</span> : null}
        </div>
      )}

      <div className="stack" style={{ gap: 9 }}>
        {rows.map((r) => {
          const lvl = r.level
          const pct = Math.round(r.progress.pct * 100)
          const isOpen = open === lvl.id
          return (
            <div key={lvl.id}>
              <button
                className={`rung ${r.recommended ? 'rec' : ''}`}
                disabled={!r.unlocked}
                onClick={() => setOpen(isOpen ? null : lvl.id)}
              >
                <span className="icon">{r.unlocked ? lvl.icon : '\u{1F512}'}</span>
                <span className="body">
                  <span className="top">
                    <span className="cefr">{lvl.cefr}</span>
                    <b>{lvl.en}</b>
                    <TargetText text={lvl.mr} script="devanagari" />
                    {r.cleared ? <span className="pill">cleared</span> : null}
                    {r.recommended && !r.cleared ? <span className="pill hot">start here</span> : null}
                  </span>
                  <span className="faint">{lvl.blurb}</span>
                  <span className={`bar ${pct >= 60 ? 'ok' : ''}`}><i style={{ width: `${pct}%` }} /></span>
                  <span className="faint">
                    {r.progress.strong}/{r.progress.total} words solid
                    {r.progress.due ? ` · ${r.progress.due} due` : ''}
                  </span>
                </span>
              </button>

              {isOpen && r.unlocked ? (
                <div className="card" style={{ marginTop: 6 }}>
                  <div className="gate">
                    <b>The gate</b>
                    {lvl.gate}
                    <div className="muted" style={{ marginTop: 5 }}>{lvl.unlocks}</div>
                  </div>

                  <h3 style={{ marginTop: 14 }}>Grammar in this level</h3>
                  <div className="stack" style={{ gap: 6 }}>
                    {ladder.levels.find((l) => l.id === lvl.id).grammar.map((g) => (
                      <button key={g.id} className="opt" onClick={() => onGrammar(lvl.id, g.id)}>
                        <span style={{ fontWeight: 600 }}>{g.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className="row" style={{ marginTop: 14 }}>
                    <button className="btn primary" style={{ flex: 1 }} onClick={() => onStart(lvl.id)}>
                      Start {lvl.cefr} lesson
                    </button>
                  </div>
                </div>
              ) : null}

              {isOpen && !r.unlocked ? (
                <div className="card" style={{ marginTop: 6 }}>
                  <div className="gate">
                    <b>Locked</b>
                    Clear {Math.round(0.6 * 100)}% of the previous level first, or take the placement test.
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="notice calm">
        <b>What the CEFR labels mean here</b>
        They are a claim about what you can do, not about how many lessons you finished. C1 means you
        choose register deliberately and read idiom without decoding it. If you can do that, the label
        is earned; if you cannot, more vocabulary will not fix it.
      </div>
    </div>
  )
}

/** A single grammar lesson, opened from a rung. */
export function GrammarLesson({ ladder, levelId, grammarId, onBack }) {
  const level = ladder.levels.find((l) => l.id === levelId)
  const g = level.grammar.find((x) => x.id === grammarId)
  if (!g) return null
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row">
        <button className="btn ghost" onClick={onBack}>{'←'} Back</button>
        <span className="cefr">{level.cefr}</span>
      </div>
      <h1 style={{ margin: 0 }}>{g.title}</h1>
      <p className="lede" style={{ margin: 0 }}>{g.body}</p>
      {g.examples.length ? (
        <div className="scrollx">
          <table className="matrix">
            <thead>
              <tr><th>Marathi</th><th>Transliteration</th><th>Meaning</th><th>Note</th></tr>
            </thead>
            <tbody>
              {g.examples.map((e, i) => (
                <tr key={i}>
                  <td><TargetText text={e.mr} script="devanagari" /></td>
                  <td className="latn">{e.latn}</td>
                  <td>{e.en}</td>
                  <td className="faint">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
