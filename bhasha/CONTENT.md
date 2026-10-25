# Content provenance

## Status: draft, unreviewed

Every course pack in `src/data/courses/` carries `review: 'draft'`. That is not
boilerplate hedging. It means exactly what it says: **no native speaker has
checked this vocabulary**, and you should not treat it as authoritative.

This matters more for a language app than for most software. A crash announces
itself. A wrong word gets memorised, repeated in front of a native speaker, and
corrected socially rather than technically. Shipping unreviewed content silently
is the actual failure mode of most small language apps, so this repository makes
the status a required field that the validator enforces, and the app displays it
on the course map.

## What is more and less likely to be wrong

Roughly ordered by risk:

- **Lowest risk: numbers, pronouns, kinship terms, core nouns.** These are
  stable, high-frequency, and consistent across sources.
- **Medium risk: transliteration.** There is no single standard. This repo uses
  a broadly ISO-15919-flavoured scheme, applied by hand, so it will be
  inconsistent in places. The grader is deliberately forgiving to compensate.
- **Medium risk: verb citation forms.** Dravidian packs list the infinitive or
  verbal noun; Indo-Aryan packs list the -nā / -ṇe / -vũ infinitive. Which form
  a dictionary "should" list is itself contested.
- **Higher risk: register and idiom.** Whether a greeting is what people
  actually say, whether a formal word has been chosen where a colloquial one is
  normal (Marathi स्थानक vs स्टेशन is flagged in the pack itself), whether a
  sentence sounds natural rather than merely grammatical.
- **Highest risk: the sentences.** Sixteen per language, hand-written. Grammar
  errors here are plausible and are the thing a reviewer should look at first.

## Known deliberate simplifications

These are choices, not errors, and each is surfaced in the app's grammar notes:

| Language | Simplification |
| --- | --- |
| Tamil | Written standard only. Spoken Tamil is a separate register and is not taught. |
| Bengali | Indian standard (জল for water). Bangladeshi usage differs and is noted inline. |
| Punjabi | Gurmukhi only. Shahmukhi, used in Pakistani Punjab, is not covered. Tone is described but cannot be drilled without audio. |
| Urdu | Indian Urdu vocabulary. Short vowels are unwritten, as in real Urdu, so reading lags speaking by design. |
| Hindi/Urdu | Presented as separate courses because the scripts differ, though the spoken languages largely do not. |
| All | Kinship terms give the elder-sibling word where languages distinguish elder from younger, with the younger form in a note. |

## Structural guarantees the validator enforces

`npm run validate` will fail the build on any of these:

- A course pack missing any of the 113 concepts.
- A word written in the wrong Unicode block (a Tamil word in the Telugu pack).
- A transliteration containing native-script characters.
- A sentence whose tokens do not reconstruct its target string, which would
  break word-bank exercises.
- A token-to-concept alignment of the wrong length, or referencing an unknown
  concept.
- A sentence with no English gloss (the pivot is mandatory).
- A `review` field that is not `draft` or `native-reviewed`.
- An abugida script with no virama or no inherent vowel.
- A UI string set with a missing or unknown key.

It also warns about transliterations with no vowel and about tokens that match a
lexicon word but are aligned to `null`. Known-good exceptions are listed
explicitly in the validator with a reason, rather than suppressed.

## The Marathi ladder specifically

`src/data/deep/mr/` carries 382 words, 110 sentences and 450 verb forms that
nobody has checked. Three parts deserve a reviewer's attention before anything
else:

1. **The verb tables** (`verbs.js`). A wrong form there propagates into every
   generated conjugation drill, so one error becomes hundreds of wrong
   questions. The ergative past tables are the highest stakes.
2. **The L5 idioms and proverbs.** Idiom meanings are easy to get subtly wrong
   and the literal glosses are my own reconstruction.
3. **The oblique stems** (`obl` fields). These are the forms dictionaries do not
   print, which is exactly why they are hard to verify and easy to get wrong.

One thing is deliberately omitted rather than guessed: the drills show **no
transliteration for oblique stems or case-marked forms**. रस्ता is "rastā" but
रस्त्यातून is "rastyātūn", not "rastātūn", and the romanised oblique is not
stored. Deriving it by concatenation would print a falsehood. Showing nothing
is the honest option until someone adds the field properly.

## How to review a language

If you speak one of these languages, the highest-value thing you can do is:

1. Open `src/data/courses/<code>.js`.
2. Read the 16 sentences first. Fix anything that is wrong or unnatural, keeping
   `tokens.join(' ') === target`.
3. Skim the lexicon for register problems: words that are technically right but
   that nobody says.
4. Check the transliterations against how you would actually romanise.
5. Change `review: 'draft'` to `review: 'native-reviewed'` and add your name.
6. Run `npm run validate && npm test`.

A single reviewed language is worth more than three more unreviewed ones.
