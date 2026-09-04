#!/usr/bin/env node
// Engine self-test: play every generated lesson to completion, answering
// correctly, and assert the grader agrees. Run with: npm test
//
// This catches the class of bug a browser smoke test misses - a generator that
// emits an exercise the grader cannot mark, or a distractor accidentally equal
// to the answer - across all 190 course pairs rather than the one a human
// happens to click through.

import { buildCourse, sourceOptions } from '../src/engine/pairing.js'
import { buildLesson, buildScriptDrill } from '../src/engine/generator.js'
import { gradeExercise, emptyValue } from '../src/engine/exercise-grading.js'
import { review, newItem, selectStudy } from '../src/engine/srs.js'
import { normaliseLatin, gradeText } from '../src/engine/grader.js'
import { TARGETS } from '../src/data/targets.js'

const fails = []
const check = (cond, msg) => { if (!cond) fails.push(msg) }

/** The answer a perfect learner would give. */
function perfectAnswer(ex) {
  switch (ex.kind) {
    case 'choose_target':
    case 'choose_gloss':
    case 'listen':
    case 'script_compose':
    case 'script_shape':
      return (ex.options.find((o) => o.correct) || {}).id
    case 'type':
      return ex.answer.target
    case 'transliterate':
      return ex.answer.latn
    case 'wordbank':
      return ex.answer
    default:
      return null
  }
}

let lessons = 0
let exercises = 0
const kinds = {}

const sources = sourceOptions().map((s) => s.code)
for (const target of TARGETS.map((t) => t.code)) {
  for (const source of sources) {
    if (source === target) continue
    const course = buildCourse(target, source)
    check(course.units.length > 0, `${target}<-${source}: no units`)

    // Fresh learner, then a partly-learned one, so both branches of the
    // generator (introduce vs recall) are exercised.
    for (const stage of ['fresh', 'learned']) {
      const state = {}
      if (stage === 'learned') {
        for (const it of course.items) {
          let x = newItem()
          for (let k = 0; k < 4; k += 1) x = review(x, true, 0)
          state[it.id] = x
        }
      }
      for (const unit of course.units) {
        const lesson = buildLesson(unit, course, state, { audio: true })
        lessons += 1
        check(lesson.length > 0, `${target}<-${source}/${unit.id}: empty lesson`)
        for (const ex of lesson) {
          exercises += 1
          kinds[ex.kind] = (kinds[ex.kind] || 0) + 1

          // Every exercise must have a well-defined empty value and a
          // well-defined right answer.
          check(emptyValue(ex) !== undefined, `${target}/${ex.kind}: no empty value`)
          const ans = perfectAnswer(ex)
          check(ans !== null && ans !== undefined, `${target}/${ex.kind}: no perfect answer`)

          const good = gradeExercise(ex, ans)
          check(good.correct, `${target}<-${source}/${unit.id}/${ex.kind}: correct answer graded wrong`)

          if (ex.options) {
            const rights = ex.options.filter((o) => o.correct).length
            check(rights === 1, `${target}<-${source}/${ex.kind}: ${rights} correct options`)
            const texts = ex.options.map((o) => String(o.text))
            check(new Set(texts).size === texts.length, `${target}<-${source}/${ex.kind}: duplicate option text ${texts.join('|')}`)
            const wrong = ex.options.find((o) => !o.correct)
            check(!gradeExercise(ex, wrong.id).correct, `${target}/${ex.kind}: wrong answer graded correct`)
          }
          if (ex.kind === 'wordbank') {
            check(ex.bank.length >= ex.answer.length, `${target}: word bank smaller than the answer`)
            for (const tok of ex.answer) {
              check(ex.bank.includes(tok), `${target}/${ex.sentenceId}: answer token "${tok}" missing from the bank`)
            }
            check(!gradeExercise(ex, [...ex.answer].reverse().concat('x')).correct, `${target}: scrambled word bank graded correct`)
          }
          if (ex.kind === 'transliterate') {
            // Echoing the prompt back in its own script must not pass.
            check(!gradeExercise(ex, ex.prompt.text).correct, `${target}: script echo accepted as transliteration`)
          }
        }
      }
    }
  }
}

// Script drills for every script in use.
for (const t of TARGETS) {
  const drill = buildScriptDrill(t.script, 12)
  check(drill.length === 12, `${t.script}: drill returned ${drill.length}`)
  for (const ex of drill) {
    check(gradeExercise(ex, perfectAnswer(ex)).correct, `${t.script}: drill answer graded wrong`)
  }
}

// Grader tolerances that learners actually rely on.
const g = [
  ['paani', 'pānī', true], ['pani', 'pānī', true], ['PĀNĪ', 'pānī', true],
  ['chai', 'cāy', true], ['namaste', 'namaste', true], ['dhanyavad', 'dhanyavād', true],
  ['banana', 'pānī', false], ['x', 'pānī', false], ['', 'pānī', false],
]
for (const [input, want, expect] of g) {
  const got = gradeText(input, { target: 'अ', latn: want }).correct
  check(got === expect, `grader: "${input}" vs "${want}" expected ${expect}, got ${got}`)
}
check(normaliseLatin('ṭhaṇḍā') === normaliseLatin('thanda'), 'grader: retroflex normalisation')
check(selectStudy({}, ['a', 'b', 'c'], 2).length === 2, 'srs: selectStudy ignores the limit')

console.log(`course pairs played  ${TARGETS.length * (sources.length - 1)}`)
console.log(`lessons generated    ${lessons}`)
console.log(`exercises graded     ${exercises}`)
console.log('by kind             ', Object.entries(kinds).map(([k, n]) => `${k}=${n}`).join(' '))
console.log('')
if (fails.length) {
  console.log(`${fails.length} failure(s):`)
  for (const f of fails.slice(0, 25)) console.log('  x ' + f)
  if (fails.length > 25) console.log(`  ... and ${fails.length - 25} more`)
  process.exit(1)
}
console.log('engine OK')
