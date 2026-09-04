import { useState } from 'react'
import { getScript } from '../data/scripts/index.js'
import TargetText from './TargetText.jsx'

/**
 * The script trainer.
 *
 * Duolingo-style courses treat the alphabet as a preface. For Indic scripts
 * that is backwards: the abugida IS the hard part, and a learner who never
 * internalises consonant + matra composition can do a hundred lessons and
 * still not read a bus sign. This screen is therefore a peer of the lessons,
 * not a warm-up, and it teaches composition interactively rather than as a
 * chart to memorise.
 */
export default function ScriptLab({ scriptId, t, onBack, onDrill }) {
  const script = getScript(scriptId)
  const [tab, setTab] = useState('compose')
  const [cons, setCons] = useState(script.demoConsonant)
  const [vowel, setVowel] = useState(script.vowels.find((v) => v.matra) || script.vowels[0])

  if (!script) return null
  const isAbjad = script.type === 'abjad'
  const composed = isAbjad ? cons : cons + (vowel.matra || '')

  const groups = [...new Set(script.consonants.map((c) => c.group))]

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row">
        <button className="btn ghost" onClick={onBack}>{'←'} {t.backToMap}</button>
        <span className="spacer" />
        <button className="btn" onClick={onDrill}>Drill</button>
      </div>

      <div>
        <h1>{script.name}</h1>
        <p className="lede">
          {isAbjad
            ? t.abjadIntro
            : t.abugidaIntro
                .replace('{v}', script.inherentVowel)
                .replace('{k}', script.viramaName)}
        </p>
        {script.note ? (
          <div className="notice">
            {script.note}
            <div className="faint" style={{ marginTop: 4 }}>{t.scriptNoteLang}</div>
          </div>
        ) : null}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'compose' ? 'on' : ''}`} onClick={() => setTab('compose')}>
          {isAbjad ? t.shapesTitle : t.composeTitle}
        </button>
        <button className={`tab ${tab === 'consonants' ? 'on' : ''}`} onClick={() => setTab('consonants')}>{t.consonants}</button>
        <button className={`tab ${tab === 'vowels' ? 'on' : ''}`} onClick={() => setTab('vowels')}>{t.vowels}</button>
        <button className={`tab ${tab === 'signs' ? 'on' : ''}`} onClick={() => setTab('signs')}>{t.signs}</button>
        <button className={`tab ${tab === 'digits' ? 'on' : ''}`} onClick={() => setTab('digits')}>{t.digits}</button>
      </div>

      {tab === 'compose' ? (
        <div className="card">
          {isAbjad ? (
            <>
              <p className="muted" style={{ marginTop: 0 }}>
                Pick a letter and watch its four shapes. This, not the letter names, is what makes
                Nastaliq hard to read at first.
              </p>
              <div className="shapes" style={{ margin: '14px 0' }}>
                {['isolated', 'initial', 'medial', 'final'].map((k) => {
                  const ZWJ = '‍'
                  const forms = { isolated: cons, initial: cons + ZWJ, medial: ZWJ + cons + ZWJ, final: ZWJ + cons }
                  return (
                    <div className="cell" key={k}>
                      <div className="g"><TargetText text={forms[k]} script={scriptId} /></div>
                      <div className="l">{k}</div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <p className="muted" style={{ marginTop: 0 }}>{t.composeBody}</p>
              <div className="composer">
                <span className="slot filled"><TargetText text={cons} script={scriptId} /></span>
                <span className="op">+</span>
                <span className="slot filled">
                  <TargetText text={vowel.matra ? '◌' + vowel.matra : '—'} script={scriptId} />
                </span>
                <span className="op">=</span>
                <span className="slot filled out"><TargetText text={composed} script={scriptId} /></span>
              </div>
              <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
                <span className="pill hot">
                  {cons.replace(/./, (c) => c)} ={' '}
                  {(script.consonants.find((c) => c.char === cons) || {}).latn} + {vowel.latn} &rarr;{' '}
                  {((script.consonants.find((c) => c.char === cons) || {}).latn || '').replace(/a$/, '') + vowel.latn}
                </span>
              </div>
              <h3>{t.vowels}</h3>
              <div className="glyphgrid" style={{ marginBottom: 14 }}>
                {script.vowels.map((v) => (
                  <button
                    key={v.char}
                    className="glyph-cell"
                    onClick={() => setVowel(v)}
                    style={v.char === vowel.char ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : {}}
                  >
                    <span className="g"><TargetText text={v.matra ? '◌' + v.matra : v.char} script={scriptId} /></span>
                    <span className="r">{v.latn}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <h3>{t.consonants}</h3>
          <div className="glyphgrid">
            {script.consonants.map((c) => (
              <button
                key={c.char}
                className="glyph-cell"
                onClick={() => setCons(c.char)}
                style={c.char === cons ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : {}}
              >
                <span className="g"><TargetText text={c.char} script={scriptId} /></span>
                <span className="r">{c.latn}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'consonants' ? (
        <div className="stack">
          {groups.map((g) => (
            <div key={g}>
              <h3>{g}</h3>
              <div className="glyphgrid">
                {script.consonants.filter((c) => c.group === g).map((c) => (
                  <div className="glyph-cell" key={c.char}>
                    <span className="g"><TargetText text={c.char} script={scriptId} /></span>
                    <span className="r">{c.latn}</span>
                    <span className="ipa">/{c.ipa}/</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'vowels' ? (
        <div className="scrollx">
          <table className="matrix">
            <thead>
              <tr>
                <th>{isAbjad ? 'Sign' : 'Independent'}</th>
                <th>{isAbjad ? 'Name' : 'With ' + (script.consonants[0] || {}).char}</th>
                <th>{t.sound}</th>
                <th>IPA</th>
              </tr>
            </thead>
            <tbody>
              {script.vowels.map((v) => (
                <tr key={v.char + v.latn}>
                  <td><TargetText text={v.char} script={scriptId} /></td>
                  <td>
                    {isAbjad ? (v.name || '') : <TargetText text={script.demoConsonant + (v.matra || '')} script={scriptId} />}
                  </td>
                  <td>{v.latn}</td>
                  <td className="faint">/{v.ipa}/</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'signs' ? (
        <div className="stack">
          {script.signs.map((s) => (
            <div className="card" key={s.char + s.name}>
              <div className="row">
                <TargetText text={'◌' + s.char} script={scriptId} size="big" />
                <b>{s.name}</b>
              </div>
              <p className="muted" style={{ margin: '6px 0 0' }}>{s.note}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'digits' ? (
        <div className="glyphgrid">
          {script.digits.map((d, n) => (
            <div className="glyph-cell" key={d}>
              <span className="g"><TargetText text={d} script={scriptId} /></span>
              <span className="r">{n}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
