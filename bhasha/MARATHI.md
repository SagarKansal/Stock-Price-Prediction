# The Marathi ladder

Pre-A1 to C1, in six levels. This is the deep track: one language, taught in
order, with the grammar drilled explicitly rather than hoped for.

It sits alongside the topic course, which still works for all ten languages
from all twenty source languages. Opening Marathi defaults to the ladder; the
topic course is one tap away.

## Why a second content channel at all

The shared packs in `src/data/courses/` are keyed to concept ids so any Indian
language can be learned from any source language. That buys breadth and it is
the right structure for breadth.

It cannot buy depth. There is no Tamil or Russian equivalent of "the Marathi
ergative past", so levelled grammar content cannot live in the concept hub
without dragging nine other languages along. So `src/data/deep/mr/` is a
separate channel: Marathi-specific, ordered by level, English-glossed, with a
`concept` link on any word that also exists in the hub so that a Russian or
Tamil speaker still gets their own gloss for it.

The honest cost: roughly a third of the ladder vocabulary has no concept link
and falls back to English. The app labels that rather than hiding it.

## The six levels, and what actually gates each one

A level is not "forty more words". Each one names the single thing that blocks
progress out of it, because for Marathi those things are specific and nameable.

| | CEFR | Level | The gate |
| --- | --- | --- | --- |
| L0 | Pre-A1 | बाळभाषा Toddler | 40 core words and the नको / हवं pair |
| L1 | A1 | पहिले शब्द First words | **Three-gender agreement**: मोठा / मोठी / मोठं |
| L2 | A2 | रोजचं मराठी Everyday | **The oblique stem**: घर → घरा- → घरात, घराला, घरातून |
| L3 | B1 | भूतकाळाची भिंत The past-tense wall | **Ergative alignment**: रामाने पुस्तक वाचलं |
| L4 | B2 | बारकावे Nuance | Causative pairs and the participle system |
| L5 | C1 | शैली Register and idiom | Choosing register deliberately; reading idiom whole |

### L0 is a real toddler level, not a phrasebook

The topic course opens with नमस्कार and धन्यवाद. That is tourist Marathi. A
two-year-old in a Marathi household never says either. They say आई, बाबा, पाणी,
नको, दे, आणखी, बाऊ. L0 is that vocabulary, in the bare imperative, in one- and
two-word utterances, with no tenses at all. Several entries (बाऊ, खाऊ, शू) are
child register and are marked as such, because an adult using them to another
adult sounds ridiculous.

### L3 is why the ladder exists

In the perfective past with a transitive verb, Marathi marks the subject with
-ने and makes the verb agree with the **object**:

```
तो आंबा खातो      he eats a mango      present: verb agrees with तो
त्याने आंबा खाल्ला  he ate a mango       past: -ने on the subject, verb matches आंबा (m)
त्याने पोळी खाल्ली  he ate a chapati     same man, feminine object → खाल्ली
त्याने जेवण खाल्लं   he ate a meal        neuter object → खाल्लं
```

Nothing in English, Spanish, French or German prepares you for this, and Hindi
applies it slightly differently so even Hindi speakers transfer wrong instincts.
Learners who are never made to drill it produce fluent, confident, permanently
wrong Marathi. L3 drills nothing else for half of every lesson.

## Grammar drills are generated, not authored

`src/data/deep/mr/verbs.js` holds 450 verb forms across 19 verbs. From those
tables, `src/engine/grammar-drills.js` generates:

| Drill | What it drills |
| --- | --- |
| `conjugate` | person and gender endings, in four tenses, choose or type |
| `ergative_agree` | object agreement in the transitive past |
| `gender_agree` | the -आ / -ई / -ं adjective ending against a noun's gender |
| `case_mark` | which suffix, attached to the oblique stem |
| `oblique` | the oblique stem itself, drilled on its own |
| `transform` | rewrite a verb form into another tense |
| `cloze` | fill a gap in a real sentence from the level |

Two rules make these teach rather than decorate:

1. **Distractors come from the same paradigm.** A conjugation question whose
   wrong answers are random words is solved by picking the only verb-shaped
   option. Its wrong answers are the other five forms of the same verb.
2. **Drills are gated by level.** `DRILLS_BY_LEVEL` means a learner at A1 is
   never shown an ergative question. Failing a construction you have not met
   teaches nothing except that the app is unfair. The self-test enforces this
   on generated lessons, not just on the config table.

Transitive verbs also carry `VERB_OBJECTS`, a plausible object per agreement
slot. Without it the drill pairs a random verb with a generic sample noun and
produces grammatically perfect nonsense like "I sold work".

## Gating and placement

Levels are **recommended** in order, not locked shut. A level opens when the
previous one is 60% solid, or when the placement test opens it directly.

The placement test is two recognition questions plus one grammar drill per
level. The grammar drills carry the weight: plenty of people have absorbed a
few hundred Marathi words by ear and have never once produced a correct
ergative past. Placing them on vocabulary alone would drop them at B2 and
strand them. It stays reachable from the ladder forever, not just on first run.

## Running the Marathi-specific checks

```bash
npm run validate      # structure, including the ladder and every verb table
npm run test:ladder   # plays every level in four source languages
npm test              # both suites
```

`npm run test:ladder` plays 72 lessons across six levels, three stages of
learner progress and four source languages, answers all 864 exercises
correctly, and asserts the grader agrees. It additionally enforces:

- no ergative drill appears below B1, checked on generated lessons
- L0 offers no grammar drills at all
- the `adj` flag is only ever set on a regular -आ adjective with no gender
- a perfect placement reaches C1 and an empty one lands at Pre-A1
- no drill generator returns null over 150 attempts

## What this does not teach

- **Spoken register.** The course teaches प्रमाण मराठी, standard Marathi, which
  is based on the Pune variety and is nobody's home dialect outside Pune. L5
  names the main regional varieties but cannot drill them.
- **Tone, pitch and rhythm.** No transliteration can carry these, and the
  browser ships no Marathi voice on most desktops.
- **Script.** Marathi uses Devanagari, which the existing Script Lab covers.
  The ladder assumes you can read it or are learning it in parallel.
- **Accuracy guarantees.** Every pack is `review: 'draft'`. No native speaker
  has checked this. See `CONTENT.md`; the sentences are the highest-risk part
  and are where a reviewer should start.
