// The Indian languages you can learn. Speaker counts are first-language
// speakers, rounded, from the 2011 Census of India and Ethnologue; they are
// here to order the catalogue, not to be quoted.
//
// `locale` is the BCP-47 tag handed to the browser speech synthesiser. Most
// desktop browsers ship no voice for most of these, which the audio layer
// detects and degrades around rather than pretending.

export const TARGETS = [
  {
    code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'devanagari', locale: 'hi-IN',
    family: 'Indo-Aryan', speakersM: 345, font: "'Noto Sans Devanagari'",
    typology: 'SOV, postpositions, two genders, three politeness levels (तू / तुम / आप).',
  },
  {
    code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'bengali', locale: 'bn-IN',
    family: 'Indo-Aryan', speakersM: 97, font: "'Noto Sans Bengali'",
    typology: 'SOV, no grammatical gender at all, rich verb agreement by politeness level.',
  },
  {
    code: 'mr', name: 'Marathi', native: 'मराठी', script: 'devanagari', locale: 'mr-IN',
    family: 'Indo-Aryan', speakersM: 83, font: "'Noto Sans Devanagari'",
    typology: 'SOV, three genders (m/f/neuter), inclusive vs exclusive "we".',
  },
  {
    code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'telugu', locale: 'te-IN',
    family: 'Dravidian', speakersM: 81, font: "'Noto Sans Telugu'",
    typology: 'SOV, agglutinative suffix chains, vowel-final words almost everywhere.',
  },
  {
    code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'tamil', locale: 'ta-IN',
    family: 'Dravidian', speakersM: 69, font: "'Noto Sans Tamil'",
    typology: 'SOV, agglutinative, strong diglossia: written Tamil differs sharply from spoken Tamil.',
  },
  {
    code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'gujarati', locale: 'gu-IN',
    family: 'Indo-Aryan', speakersM: 55, font: "'Noto Sans Gujarati'",
    typology: 'SOV, three genders, ergative alignment in the past tense.',
  },
  {
    code: 'ur', name: 'Urdu', native: 'اردو', script: 'nastaliq', locale: 'ur-IN', dir: 'rtl',
    family: 'Indo-Aryan', speakersM: 50, font: "'Noto Nastaliq Urdu'",
    typology: 'SOV, right-to-left abjad, grammatically near-identical to Hindi.',
  },
  {
    code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'kannada', locale: 'kn-IN',
    family: 'Dravidian', speakersM: 44, font: "'Noto Sans Kannada'",
    typology: 'SOV, agglutinative, three genders used only for animates.',
  },
  {
    code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'malayalam', locale: 'ml-IN',
    family: 'Dravidian', speakersM: 35, font: "'Noto Sans Malayalam'",
    typology: 'SOV, no verb agreement with the subject at all, heavy sandhi in writing.',
  },
  {
    code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'gurmukhi', locale: 'pa-IN',
    family: 'Indo-Aryan', speakersM: 33, font: "'Noto Sans Gurmukhi'",
    typology: 'SOV, two genders, and tonal: pitch distinguishes otherwise identical words.',
  },
]

export const TARGET_BY_CODE = Object.fromEntries(TARGETS.map((t) => [t.code, t]))
