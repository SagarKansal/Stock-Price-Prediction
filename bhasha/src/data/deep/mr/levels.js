// The ladder.
//
// Six rungs, mapped to CEFR so the claim "advanced" means something checkable
// rather than meaning "lesson 40". Each rung names the ONE thing that actually
// gates progress out of it, because for Marathi those gates are specific and
// well known, and a learner who does not clear them does not advance no matter
// how many words they add.

export const LEVELS = [
  {
    id: 'l0',
    cefr: 'Pre-A1',
    mr: 'बाळभाषा',
    latn: 'bāḷbhāṣā',
    en: 'Toddler',
    icon: '\u{1F476}',
    blurb: 'What a Marathi two-year-old actually says. Single words and two-word utterances, no grammar at all.',
    gate: 'Recognise and produce 40 core words and the नको / हवं want-and-refuse pair.',
    unlocks: 'Nothing to clear. This is the floor.',
  },
  {
    id: 'l1',
    cefr: 'A1',
    mr: 'पहिले शब्द',
    latn: 'pahile śabda',
    en: 'First words',
    icon: '\u{1F331}',
    blurb: 'Present tense, the verb "to be", numbers, question words, and the gender endings that run through everything else.',
    gate: 'The three-gender adjective ending: मोठा / मोठी / मोठं.',
    unlocks: 'Gender agreement. Get this wrong and every later level compounds the error.',
  },
  {
    id: 'l2',
    cefr: 'A2',
    mr: 'रोजचं मराठी',
    latn: 'rojcã marāṭhī',
    en: 'Everyday Marathi',
    icon: '\u{1F3E0}',
    blurb: 'Case suffixes, the oblique stem, past and future tense, continuous aspect. The point where Marathi stops resembling Hindi.',
    gate: 'The oblique stem plus case suffix: घर → घरा- → घरात, घराला, घरातून.',
    unlocks: 'Case marking. Marathi fuses what Hindi writes as separate words.',
  },
  {
    id: 'l3',
    cefr: 'B1',
    mr: 'भूतकाळाची भिंत',
    latn: 'bhūtkāḷācī bhint',
    en: 'The past-tense wall',
    icon: '\u{1F9F1}',
    blurb: 'The ergative past, compound verbs, conjunct verbs, and relative-correlative clauses.',
    gate: 'Ergative alignment: रामाने पुस्तक वाचलं, where the verb agrees with the OBJECT.',
    unlocks: 'The single feature that separates learners who sound native from learners who do not. Nearly every non-native speaker of Marathi gets this wrong permanently.',
  },
  {
    id: 'l4',
    cefr: 'B2',
    mr: 'बारकावे',
    latn: 'bārkāve',
    en: 'Nuance',
    icon: '\u{1F3AD}',
    blurb: 'Aspect, participles, causatives, modals, and reported speech. Saying the same thing five ways and knowing which one fits.',
    gate: 'Causative pairs and the participle system: शिकणे / शिकवणे, करणारा / केलेला / करताना / करून.',
    unlocks: 'Expressive range. Below this you can be understood; above it you can be precise.',
  },
  {
    id: 'l5',
    cefr: 'C1',
    mr: 'शैली',
    latn: 'śailī',
    en: 'Register and idiom',
    icon: '\u{1F3DB}',
    blurb: 'Sanskritised formal versus everyday speech, idioms, proverbs, and the regional varieties nobody teaches.',
    gate: 'Choosing register deliberately, and reading idiom without decoding it word by word.',
    unlocks: 'The difference between correct Marathi and Marathi that sounds like a person rather than a textbook.',
  },
]

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]))
export const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id)
