import { useState } from 'react'
import { TARGETS } from '../data/targets.js'
import { sourceOptions, coverageFor } from '../engine/pairing.js'
import { hasChrome, strings } from '../data/ui.js'
import TargetText from './TargetText.jsx'

export default function Setup({ source, target, onStart }) {
  const [src, setSrc] = useState(source || 'en')
  const [tgt, setTgt] = useState(target || null)
  const t = strings(src)
  const options = sourceOptions()
  const world = options.filter((o) => o.kind === 'world')
  const indian = options.filter((o) => o.kind === 'indian' && o.code !== tgt)
  const cov = coverageFor(src)

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div>
        <h1>{t.tagline}</h1>
        <p className="lede">
          Ten Indian languages, twenty source languages, {TARGETS.length * (options.length - 1)} course
          pairs. The pairs are generated from concept-keyed content, not authored one by one.
        </p>
      </div>

      <section>
        <h3>{t.iSpeak}</h3>
        <div className="stack" style={{ gap: 10 }}>
          <div>
            <div className="faint" style={{ marginBottom: 6 }}>{t.sourceWorld}</div>
            <div className="langgrid">
              {world.map((l) => (
                <button
                  key={l.code}
                  className={`langbtn ${src === l.code ? 'on' : ''}`}
                  onClick={() => setSrc(l.code)}
                >
                  <span className="nat" dir={l.dir}>{l.native}</span>
                  <b>{l.name}</b>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="faint" style={{ marginBottom: 6 }}>
              {t.sourceIndian} &mdash; {t.indianSourceNote}
            </div>
            <div className="langgrid">
              {indian.map((l) => (
                <button
                  key={l.code}
                  className={`langbtn ${src === l.code ? 'on' : ''}`}
                  onClick={() => setSrc(l.code)}
                >
                  <TargetText text={l.native} script={l.script} />
                  <b>{l.name}</b>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="faint" style={{ marginTop: 8 }}>
          {cov.pct}% {t.coverage} ({cov.have}/{cov.total})
          {hasChrome(src) ? '' : ' · interface falls back to English for this language'}
        </div>
      </section>

      <section>
        <h3>{t.iLearn}</h3>
        <div className="stack" style={{ gap: 8 }}>
          {TARGETS.filter((x) => x.code !== src).map((x) => (
            <button
              key={x.code}
              className={`targetcard ${tgt === x.code ? 'on' : ''}`}
              onClick={() => setTgt(x.code)}
            >
              <span className="glyph">
                <TargetText text={x.native} script={x.script} />
              </span>
              <span className="meta">
                <b>{x.name}</b>
                <span className="faint">
                  {x.speakersM}{t.million} {t.speakers} &middot; {x.family} &middot; {x.script}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {tgt ? (
        <div className="notice calm">
          <b>{TARGETS.find((x) => x.code === tgt).name}</b>
          {TARGETS.find((x) => x.code === tgt).typology}
        </div>
      ) : null}

      <button className="btn primary wide" disabled={!tgt} onClick={() => onStart(tgt, src)}>
        {t.start}
      </button>
    </div>
  )
}
