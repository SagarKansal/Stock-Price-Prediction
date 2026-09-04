import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildCourse, isWorldSource, sourceName } from './engine/pairing.js'
import { buildLesson, buildScriptDrill } from './engine/generator.js'
import { selectStudy } from './engine/srs.js'
import { hasVoice, onVoicesReady } from './engine/speech.js'
import { load, save, pairKey, courseState, bumpStreak } from './engine/progress.js'
import { strings, hasChrome } from './data/ui.js'
import { TARGET_BY_CODE } from './data/targets.js'
import Setup from './components/Setup.jsx'
import CourseMap from './components/CourseMap.jsx'
import Lesson, { applyResults } from './components/Lesson.jsx'
import ScriptLab from './components/ScriptLab.jsx'
import TargetText from './components/TargetText.jsx'

export default function App() {
  const [store, setStore] = useState(load)
  const [screen, setScreen] = useState(() => (load().settings.target ? 'map' : 'setup'))
  const [lesson, setLesson] = useState(null)
  const [summary, setSummary] = useState(null)
  const [voices, setVoices] = useState(0)

  const { source, target } = store.settings

  useEffect(() => onVoicesReady(() => setVoices((n) => n + 1)), [])
  useEffect(() => { save(store) }, [store])

  const course = useMemo(
    () => (target ? buildCourse(target, source) : null),
    [target, source],
  )
  const t = strings(source)
  const cstate = courseState(store, target, source)
  const glossScript = isWorldSource(source) ? null : (TARGET_BY_CODE[source] || {}).script
  const canSpeak = course ? hasVoice(course.target.locale) : false
  // `voices` is read so the memo re-evaluates once the browser populates its
  // voice list, which happens asynchronously on most engines.
  void voices

  const update = useCallback((fn) => {
    setStore((prev) => {
      const key = pairKey(prev.settings.target, prev.settings.source)
      const cur = prev.courses[key] || { items: {}, xp: 0, streak: 0, lastDay: null, lessons: 0 }
      return { ...prev, courses: { ...prev.courses, [key]: fn(cur) } }
    })
  }, [])

  const start = (tgt, src) => {
    setStore((prev) => ({ ...prev, settings: { ...prev.settings, target: tgt, source: src } }))
    setScreen('map')
  }

  const startUnit = (unitId) => {
    const unit = course.units.find((u) => u.id === unitId)
    setLesson({ title: unitId, exercises: buildLesson(unit, course, cstate.items, { audio: canSpeak }) })
    setScreen('lesson')
  }

  const startReview = () => {
    const ids = selectStudy(cstate.items, course.items.map((i) => i.id), 12)
    const units = [...new Set(ids.map((id) => course.items.find((i) => i.id === id).unit))]
    const exercises = units
      .flatMap((u) => buildLesson(course.units.find((x) => x.id === u), course, cstate.items, { audio: canSpeak, length: 6 }))
      .slice(0, 12)
    setLesson({ title: t.reviewDue, exercises })
    setScreen('lesson')
  }

  const startDrill = () => {
    setLesson({ title: t.scriptLab, exercises: buildScriptDrill(course.target.script, 10) })
    setScreen('lesson')
  }

  const finish = ({ results, right, total }) => {
    update((c) => bumpStreak({
      ...c,
      items: applyResults(c.items, results),
      xp: c.xp + right * 10,
      lessons: c.lessons + 1,
    }))
    setSummary({ right, total })
    setScreen('done')
  }

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">
          <span className="devlogo">भाषा</span>
          <span>{t.app}</span>
          <small>{course ? `${course.target.name} ← ${sourceName(source)}` : ''}</small>
        </span>
        <span className="spacer" />
        {course && screen !== 'setup' ? (
          <>
            {cstate.streak ? <span className="pill hot">{'\u{1F525}'} {cstate.streak}</span> : null}
            <span className="pill">{cstate.xp} {t.xp}</span>
            <button className="btn ghost" onClick={() => setScreen('setup')}>{t.change}</button>
          </>
        ) : null}
      </header>

      {screen === 'setup' ? (
        <Setup source={source} target={target} onStart={start} />
      ) : null}

      {screen === 'map' && course ? (
        <>
          {!hasChrome(source) ? (
            <div className="notice calm" style={{ marginBottom: 12 }}>
              Interface text is not translated into {sourceName(source)} yet, so it falls back to
              English. The vocabulary glosses you learn from are fully in {sourceName(source)}.
            </div>
          ) : null}
          {!canSpeak ? (
            <div className="notice calm" style={{ marginBottom: 12 }}>
              <b>{t.noVoiceTitle}</b>{t.noVoiceBody}
            </div>
          ) : null}
          <CourseMap
            course={course}
            t={t}
            state={cstate}
            onUnit={startUnit}
            onScript={() => setScreen('script')}
            onReview={startReview}
          />
        </>
      ) : null}

      {screen === 'lesson' && lesson ? (
        <Lesson
          course={course}
          exercises={lesson.exercises}
          t={t}
          glossScript={glossScript}
          canSpeak={canSpeak}
          onFinish={finish}
          onExit={() => setScreen('map')}
        />
      ) : null}

      {screen === 'script' && course ? (
        <ScriptLab
          scriptId={course.target.script}
          t={t}
          onBack={() => setScreen('map')}
          onDrill={startDrill}
        />
      ) : null}

      {screen === 'done' && summary ? (
        <div className="stack" style={{ gap: 18, paddingTop: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>{summary.right === summary.total ? '\u{1F31F}' : '\u{2705}'}</div>
          <h1 style={{ margin: 0 }}>{t.lessonDone}</h1>
          <p className="lede" style={{ margin: 0 }}>
            {summary.right} / {summary.total} &middot; +{summary.right * 10} {t.xp}
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <TargetText text={course.target.native} script={course.target.script} size="big" />
          </div>
          <button className="btn primary wide" onClick={() => setScreen('map')}>{t.next}</button>
        </div>
      ) : null}
    </div>
  )
}
