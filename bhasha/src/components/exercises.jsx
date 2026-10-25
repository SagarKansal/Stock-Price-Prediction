// Exercise renderers.
//
// Every exercise is a pure function of the generated exercise object plus a
// value the learner is building. Lesson.jsx owns the value and the Check
// button; these components only draw and collect. Adding a new exercise type
// means one renderer here and one line in gradeExercise.

import TargetText, { Word } from './TargetText.jsx'

// Re-exported so component consumers have one import; the logic itself lives
// in the engine, where it can be tested without a DOM.
export { gradeExercise, emptyValue } from '../engine/exercise-grading.js'

/** What the learner should have said, shown after a wrong answer. */
export function correctAnswerOf(ex, script) {
  switch (ex.kind) {
    case 'choose_target':
    case 'listen': {
      const o = ex.options.find((x) => x.correct)
      return <Word text={o.text} latn={o.latn} script={script} />
    }
    case 'choose_gloss': {
      const o = ex.options.find((x) => x.correct)
      return <span>{o.text}{o.latn ? <span className="latn"> {o.latn}</span> : null}</span>
    }
    case 'script_compose':
    case 'script_shape': {
      const o = ex.options.find((x) => x.correct)
      return <TargetText text={o.text} script={ex.scriptId} />
    }
    case 'type':
      return <Word text={ex.answer.target} latn={ex.answer.latn} script={script} />
    case 'transliterate':
      return <span className="latn" style={{ fontSize: '1.1em' }}>{ex.answer.latn}</span>
    case 'wordbank':
      return <Word text={ex.answer.join(' ')} latn={ex.latn} script={script} />
    case 'conjugate':
    case 'ergative_agree':
    case 'gender_agree':
    case 'case_mark':
    case 'oblique':
    case 'transform':
    case 'cloze':
      return <Word text={ex.answer.target} latn={ex.answer.latn} script={script} />
    // ---------------- Marathi ladder grammar drills ----------------

    case 'conjugate': {
      const frame = (
        <div className="drillframe">
          <span className="slotchip"><TargetText text={ex.slot.pron} script={script} /></span>
          <span className="op">+</span>
          <span className="slotchip"><TargetText text={ex.verb.inf} script={script} /><span className="latn"> {ex.verb.latn}</span></span>
          <span className="op">&rarr;</span>
          <span className="slotchip open">?</span>
        </div>
      )
      return (
        <div>
          <div className="qprompt">{ex.tenseLabel || 'Conjugate'} &middot; {ex.slot.en}</div>
          {frame}
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.verb.en} &middot; {ex.tenseEn || ex.tenseId}
          </div>
          {ex.mode === 'type' ? (
            <input
              className="field" autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false}
              placeholder={t.typeHere} value={value || ''} disabled={checked}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <Options {...{ ex, value, setValue, checked, script }} />
          )}
        </div>
      )
    }

    case 'ergative_agree':
      return (
        <div>
          <div className="qprompt">Past tense &middot; which form?</div>
          <div className="drillframe">
            <span className="slotchip"><TargetText text={ex.subject.mr} script={script} /></span>
            <span className="slotchip hot">
              <TargetText text={ex.object.mr} script={script} />
              {ex.object.latn ? <span className="latn"> {ex.object.latn}</span> : null}
            </span>
            <span className="slotchip open">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.subject.en} &middot; {ex.object.en} &middot; {ex.verb.en}
            <br />The highlighted word is the object. That is what decides the ending.
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'gender_agree':
      return (
        <div>
          <div className="qprompt">Which form of &ldquo;{ex.adjEn}&rdquo;?</div>
          <div className="drillframe">
            <span className="slotchip open">?</span>
            <span className="slotchip hot">
              <TargetText text={ex.noun.mr} script={script} />
              <span className="latn"> {ex.noun.latn}</span>
            </span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.noun.en} &middot; gender is hidden until you answer
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'case_mark':
      return (
        <div>
          <div className="qprompt">Form the {ex.target}</div>
          <div className="drillframe">
            <span className="slotchip">
              <TargetText text={ex.noun.mr} script={script} />
              <span className="latn"> {ex.noun.latn}</span>
            </span>
            <span className="op">&rarr;</span>
            <span className="slotchip"><TargetText text={ex.noun.obl + '-'} script={script} /></span>
            <span className="op">+</span>
            <span className="slotchip open">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>{ex.caseEn}</div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'oblique':
      return (
        <div>
          <div className="qprompt">What is the oblique stem?</div>
          <div className="drillframe">
            <span className="slotchip">
              <TargetText text={ex.noun.mr} script={script} size="big" />
            </span>
            <span className="op">&rarr;</span>
            <span className="slotchip open">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.noun.en} &middot; the form every case suffix attaches to
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'transform':
      return (
        <div>
          <div className="qprompt">Rewrite in the {ex.toTense}</div>
          <div className="drillframe">
            <span className="slotchip">
              <TargetText text={`${ex.from.pron} ${ex.from.form}`} script={script} />
              <span className="latn"> {ex.from.latn}</span>
            </span>
            <span className="op">&rarr;</span>
            <span className="slotchip open">?</span>
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'cloze':
      return (
        <div>
          <div className="qprompt">Fill the gap</div>
          <div style={{ fontSize: '1.3em', marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {ex.tokens.map((tok, i) =>
              tok === null ? (
                <span key={i} className="blank">
                  {checked ? <TargetText text={ex.answer.target} script={script} /> : '\u00A0\u00A0\u00A0'}
                </span>
              ) : (
                <TargetText key={i} text={tok} script={script} />
              ),
            )}
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>{ex.prompt}</div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    default:
      return null
  }
}

function Options({ ex, value, setValue, checked, script, glossScript }) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      {ex.options.map((o, i) => {
        const isTargetSide = ex.kind !== 'choose_gloss'
        let cls = 'opt'
        if (checked && o.correct) cls += ' right'
        else if (checked && value === o.id) cls += ' wrongpick'
        else if (value === o.id) cls += ' sel'
        return (
          <button key={o.id + i} className={cls} disabled={checked} onClick={() => setValue(o.id)}>
            <span className="num">{i + 1}</span>
            {isTargetSide ? (
              <Word text={o.text} latn={o.latn} script={ex.scriptId || script} />
            ) : (
              <span>
                {glossScript ? <TargetText text={o.text} script={glossScript} /> : o.text}
                {o.latn ? <span className="latn"> {o.latn}</span> : null}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** A gloss, which may itself be in an Indian script if the source is one. */
function Gloss({ gloss, script, size = 'big' }) {
  if (!gloss) return null
  return (
    <span>
      {gloss.script ? (
        <Word text={gloss.text} latn={gloss.latn} script={gloss.script} size={size} />
      ) : (
        <span style={{ fontSize: size === 'big' ? '1.5em' : '1em', fontWeight: 600 }}>{gloss.text}</span>
      )}
      {gloss.pivot ? <span className="faint"> · en</span> : null}
    </span>
  )
}

export function ExerciseView({ ex, value, setValue, checked, script, glossScript, t, onSpeak, canSpeak }) {
  switch (ex.kind) {
    case 'choose_target':
      return (
        <div>
          <div className="qprompt">{t.iLearn}</div>
          <div className="row" style={{ marginBottom: 18, gap: 12 }}>
            <span style={{ fontSize: 34 }}>{ex.icon}</span>
            <Gloss gloss={ex.prompt} />
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'choose_gloss':
      return (
        <div>
          <div className="qprompt">{t.iSpeak}</div>
          <div style={{ marginBottom: 18 }}>
            <Word text={ex.prompt.text} latn={ex.prompt.latn} script={script} size="big" />
          </div>
          <Options {...{ ex, value, setValue, checked, script, glossScript }} />
        </div>
      )

    case 'listen':
      return (
        <div>
          <div className="qprompt">{t.listenPrompt}</div>
          <div className="row" style={{ marginBottom: 18, gap: 14 }}>
            <button className="speaker" onClick={() => onSpeak(ex.speak)} disabled={!canSpeak}>
              {'\u{1F50A}'}
            </button>
            <button className="btn ghost" onClick={() => onSpeak(ex.speak)} disabled={!canSpeak}>
              {t.playAgain}
            </button>
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'type':
      return (
        <div>
          <div className="qprompt">{t.typePrompt}</div>
          <div className="row" style={{ marginBottom: 16, gap: 12 }}>
            <span style={{ fontSize: 34 }}>{ex.icon}</span>
            <Gloss gloss={ex.prompt} />
          </div>
          <input
            className="field"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t.typeHere}
            value={value || ''}
            disabled={checked}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="faint" style={{ marginTop: 6 }}>{t.typeHint}</div>
        </div>
      )

    case 'transliterate':
      return (
        <div>
          <div className="qprompt">{t.translitPrompt}</div>
          <div style={{ marginBottom: 16 }}>
            <TargetText text={ex.prompt.text} script={script} size="huge" />
          </div>
          <input
            className="field"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="a b c"
            value={value || ''}
            disabled={checked}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      )

    case 'wordbank': {
      const picked = Array.isArray(value) ? value : []
      const usedCount = {}
      for (const p of picked) usedCount[p] = (usedCount[p] || 0) + 1
      const seen = {}
      return (
        <div>
          <div className="qprompt">{t.buildPrompt}</div>
          <div style={{ fontSize: '1.35em', fontWeight: 600, marginBottom: 4 }}>
            {ex.prompt}
            {ex.promptIsPivot ? <span className="faint" style={{ fontWeight: 400 }}> · {t.pivotNote}</span> : null}
          </div>
          <div className="faint" style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ex.wordGloss.map((g, k) => (
              <span key={k}>
                {g && g.script ? <TargetText text={g.text} script={g.script} /> : (g ? g.text : '·')}
                {k < ex.wordGloss.length - 1 ? <span style={{ opacity: .45 }}> /</span> : null}
              </span>
            ))}
          </div>
          <div className="answerline" dir={script === 'nastaliq' ? 'rtl' : 'ltr'}>
            {picked.map((tok, i) => (
              <button
                key={tok + i}
                className="chip"
                disabled={checked}
                onClick={() => setValue(picked.filter((_, j) => j !== i))}
              >
                <TargetText text={tok} script={script} />
              </button>
            ))}
          </div>
          <div className="bank">
            {ex.bank.map((tok, i) => {
              seen[tok] = (seen[tok] || 0) + 1
              const used = seen[tok] <= (usedCount[tok] || 0)
              return (
                <button
                  key={tok + i}
                  className={`chip ${used ? 'used' : ''}`}
                  disabled={checked || used}
                  onClick={() => setValue([...picked, tok])}
                >
                  <TargetText text={tok} script={script} />
                </button>
              )
            })}
          </div>
          {picked.length ? (
            <button className="btn ghost" style={{ marginTop: 10 }} disabled={checked} onClick={() => setValue([])}>
              {t.clear}
            </button>
          ) : null}
        </div>
      )
    }

    case 'script_compose':
      return (
        <div>
          <div className="qprompt">{t.whichSyllable} <b>{ex.syllable}</b>?</div>
          <div className="composer">
            <span className="slot filled"><TargetText text={ex.consonant.char} script={ex.scriptId} /></span>
            <span className="op">+</span>
            <span className="slot filled"><TargetText text={'◌' + ex.vowel.matra} script={ex.scriptId} /></span>
            <span className="op">=</span>
            <span className="slot">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.consonant.latn} ({ex.consonant.ipa}) + {ex.vowel.latn}
          </div>
          <Options {...{ ex, value, setValue, checked, script: ex.scriptId }} />
        </div>
      )

    case 'script_shape':
      return (
        <div>
          <div className="qprompt">{t.whichLetter}</div>
          <div className="shapes" style={{ marginBottom: 16 }}>
            <div className="cell"><div className="g"><TargetText text={ex.forms.isolated} script={ex.scriptId} /></div><div className="l">isolated</div></div>
            <div className="cell"><div className="g"><TargetText text={ex.forms.initial} script={ex.scriptId} /></div><div className="l">initial</div></div>
            <div className="cell"><div className="g"><TargetText text={ex.forms.medial} script={ex.scriptId} /></div><div className="l">medial</div></div>
            <div className="cell"><div className="g"><TargetText text={ex.forms.final} script={ex.scriptId} /></div><div className="l">final</div></div>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {ex.options.map((o, i) => {
              let cls = 'opt'
              if (checked && o.correct) cls += ' right'
              else if (checked && value === o.id) cls += ' wrongpick'
              else if (value === o.id) cls += ' sel'
              return (
                <button key={o.id + i} className={cls} disabled={checked} onClick={() => setValue(o.id)}>
                  <span className="num">{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{o.text}</span>
                </button>
              )
            })}
          </div>
        </div>
      )

    // ---------------- Marathi ladder grammar drills ----------------

    case 'conjugate': {
      const frame = (
        <div className="drillframe">
          <span className="slotchip"><TargetText text={ex.slot.pron} script={script} /></span>
          <span className="op">+</span>
          <span className="slotchip"><TargetText text={ex.verb.inf} script={script} /><span className="latn"> {ex.verb.latn}</span></span>
          <span className="op">&rarr;</span>
          <span className="slotchip open">?</span>
        </div>
      )
      return (
        <div>
          <div className="qprompt">{ex.tenseLabel || 'Conjugate'} &middot; {ex.slot.en}</div>
          {frame}
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.verb.en} &middot; {ex.tenseEn || ex.tenseId}
          </div>
          {ex.mode === 'type' ? (
            <input
              className="field" autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false}
              placeholder={t.typeHere} value={value || ''} disabled={checked}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <Options {...{ ex, value, setValue, checked, script }} />
          )}
        </div>
      )
    }

    case 'ergative_agree':
      return (
        <div>
          <div className="qprompt">Past tense &middot; which form?</div>
          <div className="drillframe">
            <span className="slotchip"><TargetText text={ex.subject.mr} script={script} /></span>
            <span className="slotchip hot">
              <TargetText text={ex.object.mr} script={script} />
              {ex.object.latn ? <span className="latn"> {ex.object.latn}</span> : null}
            </span>
            <span className="slotchip open">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.subject.en} &middot; {ex.object.en} &middot; {ex.verb.en}
            <br />The highlighted word is the object. That is what decides the ending.
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'gender_agree':
      return (
        <div>
          <div className="qprompt">Which form of &ldquo;{ex.adjEn}&rdquo;?</div>
          <div className="drillframe">
            <span className="slotchip open">?</span>
            <span className="slotchip hot">
              <TargetText text={ex.noun.mr} script={script} />
              <span className="latn"> {ex.noun.latn}</span>
            </span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.noun.en} &middot; gender is hidden until you answer
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'case_mark':
      return (
        <div>
          <div className="qprompt">Form the {ex.target}</div>
          <div className="drillframe">
            <span className="slotchip">
              <TargetText text={ex.noun.mr} script={script} />
              <span className="latn"> {ex.noun.latn}</span>
            </span>
            <span className="op">&rarr;</span>
            <span className="slotchip"><TargetText text={ex.noun.obl + '-'} script={script} /></span>
            <span className="op">+</span>
            <span className="slotchip open">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>{ex.caseEn}</div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'oblique':
      return (
        <div>
          <div className="qprompt">What is the oblique stem?</div>
          <div className="drillframe">
            <span className="slotchip">
              <TargetText text={ex.noun.mr} script={script} size="big" />
            </span>
            <span className="op">&rarr;</span>
            <span className="slotchip open">?</span>
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>
            {ex.noun.en} &middot; the form every case suffix attaches to
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'transform':
      return (
        <div>
          <div className="qprompt">Rewrite in the {ex.toTense}</div>
          <div className="drillframe">
            <span className="slotchip">
              <TargetText text={`${ex.from.pron} ${ex.from.form}`} script={script} />
              <span className="latn"> {ex.from.latn}</span>
            </span>
            <span className="op">&rarr;</span>
            <span className="slotchip open">?</span>
          </div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    case 'cloze':
      return (
        <div>
          <div className="qprompt">Fill the gap</div>
          <div style={{ fontSize: '1.3em', marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {ex.tokens.map((tok, i) =>
              tok === null ? (
                <span key={i} className="blank">
                  {checked ? <TargetText text={ex.answer.target} script={script} /> : '\u00A0\u00A0\u00A0'}
                </span>
              ) : (
                <TargetText key={i} text={tok} script={script} />
              ),
            )}
          </div>
          <div className="faint" style={{ marginBottom: 14 }}>{ex.prompt}</div>
          <Options {...{ ex, value, setValue, checked, script }} />
        </div>
      )

    default:
      return null
  }
}
