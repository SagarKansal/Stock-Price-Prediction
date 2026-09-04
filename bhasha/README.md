# Bhasha

Learn any of ten major Indian languages, from any of twenty source languages.
Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu, Kannada, Malayalam and
Punjabi, taught from English, Spanish, French, German, Portuguese, Russian,
Arabic, Chinese, Japanese, Indonesian, and from each other.

That is 190 course pairs. Nobody authored 190 courses.

## The idea this app is actually built around

The naive way to build "Duolingo for Indian languages, from any language" is to
author a course per pair. India has 22 scheduled languages and there are on the
order of 100 plausible source languages, so that is roughly 2,200 courses. For
scale, Duolingo itself has around 40 usable courses after fourteen years, and
most of its non-English-source trees are thin. Authoring per pair does not
merely take long, it never finishes.

So content here is **keyed to language-neutral concept ids**, and course pairs
are generated:

```
concepts.js          water  →  { en: "water", es: "agua", ru: "вода", ... }
courses/hi.js        water  →  पानी   (pānī)
courses/ta.js        water  →  தண்ணீர் (taṇṇīr)
                                     ↓
engine/pairing.js    join on the concept id
                                     ↓
   Hindi for Spanish speakers,  Hindi for Tamil speakers,  Tamil for
   Russian speakers, ... all from the same twenty files
```

Adding a target language is **one file**. Adding a source language is **one
column**. The work is N + M, not N × M.

Two things fall out of this that are worth naming:

1. **Every Indian language is also a source language, for free.** Because
   `courses/ta.js` is keyed by the same concept ids as `concepts.js`, a Tamil
   speaker learning Hindi is just a different join. Tamil to Hindi, Bengali to
   Marathi, Malayalam to Punjabi: no new content, no new files. This is the
   pairing most learners in India actually want and the one no major app ships.

2. **Sentences do not need translating per source language.** Each sentence
   carries a token-to-concept alignment, so a word-by-word gloss renders in the
   learner's own language automatically. Only one natural translation is
   authored (English, as the pivot), and the app labels it when it is showing
   you the pivot rather than your language.

## The second idea: the script is not a preface

Duolingo's core mechanic assumes an alphabet. Nine of the ten scripts here are
**abugidas**: a consonant carries an inherent vowel, other vowels are attached
as signs (matras), and a bare consonant needs a virama to kill the inherent
vowel. A learner who never internalises that can complete two hundred lessons
and still not read a bus sign.

So **Script Lab** is a peer of the lessons, not a warm-up. It teaches
composition interactively (pick a consonant, pick a matra, watch the syllable
assemble) and it generates composition drills as first-class exercises inside
normal lessons. Urdu, the one abjad in the set, switches teaching mode: it
drills the four positional shapes of each letter instead, because that, not the
letter names, is what makes Nastaliq hard to read.

## Running it

```bash
npm install
npm run dev        # dev server
npm run build      # production build to dist/
npm test           # play every generated lesson in all 190 pairs and grade it
npm run validate   # structural checks on all content
npm run coverage   # which source languages are fully served
```

`npm test` is the one that matters. It generates 3,040 lessons across every
course pair, answers all 36,480 exercises correctly, and asserts the grader
agrees. It has already caught two bugs that a click-through would not: a stale
answer value leaking between exercises, and multiple-choice questions offering
the same word as both the right and a wrong answer (Hindi कल means "tomorrow"
AND "yesterday"; Spanish "mañana" glosses both "morning" and "tomorrow").

## Layout

```
src/
  data/
    concepts.js         113 concepts, glossed in 10 world languages. The hub.
    targets.js          the 10 learnable languages and their metadata
    ui.js               interface chrome per source language
    scripts/            9 writing systems: full vowel, consonant and sign inventories
    courses/            one file per Indian language, keyed by concept id
  engine/
    pairing.js          joins target + source into a course. The load-bearing file.
    generator.js        derives exercises from content; nobody authors questions
    grader.js           forgiving transliteration matching, strict script matching
    exercise-grading.js grading logic, kept out of JSX so it is testable
    srs.js              six-rung spaced repetition
    speech.js           TTS with honest voice detection
    progress.js         localStorage, wrapped so blocked storage cannot crash it
  components/           React UI
scripts/
  validate-content.mjs  content invariants
  selftest.mjs          engine playthrough
  coverage-report.mjs   source-language completeness
```

## Exercise types

All generated, none authored:

| Type | What it drills |
| --- | --- |
| `choose_target` | recognition, gloss to target |
| `choose_gloss` | recognition, target to gloss |
| `type` | production, accepts native script or transliteration |
| `transliterate` | reading, native script to Latin (rejects echoing the prompt) |
| `listen` | audio, hidden when the browser has no voice for the language |
| `wordbank` | sentence construction with real-word decoys |
| `script_compose` | abugida composition: consonant + matra = ? |
| `script_shape` | abjad positional forms: isolated, initial, medial, final |

## What this does not do, and why you should know

- **The content has not been reviewed by native speakers.** Every course pack
  is marked `review: 'draft'` and the app says so on screen. See `CONTENT.md`.
- **Tamil is taught in the written standard.** Spoken Tamil differs sharply.
  The course says so rather than pretending the gap does not exist.
- **Audio depends on the browser.** Most desktop browsers ship no voice for most
  of these languages. The app detects this and hides listening exercises instead
  of playing silence.
- **Punjabi tone cannot be taught here.** Punjabi distinguishes words by pitch
  and no transliteration can show that. The grammar notes say so plainly.
- **Interface chrome exists for the 10 world languages only.** Indian source
  languages fall back to English chrome, and the app tells you. The glosses you
  actually learn from are complete in all 20.

## Adding a language

To add an eleventh target language:

1. Add its script to `src/data/scripts/` if it is new.
2. Add a row to `src/data/targets.js`.
3. Copy `src/data/courses/hi.js`, replace the 113 lexicon entries and 16
   sentences, register it in `src/data/courses/index.js`.
4. Run `npm run validate && npm test`.

Nineteen new course pairs exist the moment step 3 lands. To add a source
language, add one column to every concept in `src/data/concepts.js` and,
optionally, a chrome object in `src/data/ui.js`.
