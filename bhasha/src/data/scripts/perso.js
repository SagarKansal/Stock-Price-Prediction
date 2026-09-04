// Urdu uses a Perso-Arabic ABJAD written in the Nastaliq style: right to left,
// short vowels normally not written, and every letter changing shape by
// position in the word. It is the one script in this app where the abugida
// model does not apply, so ScriptLab switches teaching mode for it.

export const nastaliq = {
  id: 'nastaliq',
  name: 'Perso-Arabic (Nastaliq)',
  type: 'abjad',
  dir: 'rtl',
  inherentVowel: null,
  virama: null,
  digits: ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'],
  demoConsonant: 'ب',
  // For an abjad the "vowels" are optional diacritics, not letters.
  vowels: [
    { char: 'َ', matra: 'َ', latn: 'a', ipa: 'ə', name: 'zabar' },
    { char: 'ِ', matra: 'ِ', latn: 'i', ipa: 'ɪ', name: 'zer' },
    { char: 'ُ', matra: 'ُ', latn: 'u', ipa: 'ʊ', name: 'pesh' },
    { char: 'ا', matra: 'ا', latn: 'ā', ipa: 'aː', name: 'alif (long a)' },
    { char: 'ی', matra: 'ی', latn: 'ī / e', ipa: 'iː', name: 'chhoti ye' },
    { char: 'و', matra: 'و', latn: 'ū / o', ipa: 'uː', name: 'vao' },
  ],
  consonants: [
    ['ا','alif','ʔ/aː','alif'],['ب','be','b','labial'],['پ','pe','p','labial'],['ت','te','t̪','dental'],['ٹ','ṭe','ʈ','retroflex'],
    ['ث','se','s','sibilant'],['ج','jim','dʒ','palatal'],['چ','che','tʃ','palatal'],['ح','baṛi he','h','guttural'],['خ','khe','x','guttural'],
    ['د','dal','d̪','dental'],['ڈ','ḍal','ɖ','retroflex'],['ذ','zal','z','sibilant'],['ر','re','r','approximant'],['ڑ','ṛe','ɽ','retroflex'],
    ['ز','ze','z','sibilant'],['ژ','zhe','ʒ','sibilant'],['س','sin','s','sibilant'],['ش','shin','ʃ','sibilant'],['ص','suad','s','sibilant'],
    ['ض','zuad','z','sibilant'],['ط','toe','t̪','dental'],['ظ','zoe','z','sibilant'],['ع','ain','ʔ','guttural'],['غ','ghain','ɣ','guttural'],
    ['ف','fe','f','labial'],['ق','qaf','q','guttural'],['ک','kaf','k','velar'],['گ','gaf','ɡ','velar'],['ل','lam','l','approximant'],
    ['م','mim','m','labial'],['ن','nun','n','dental'],['ں','nun ghunna','◌̃','dental'],['و','vao','ʋ/uː','approximant'],['ہ','chhoti he','ɦ','guttural'],
    ['ھ','do chashmi he','ʰ','guttural'],['ی','chhoti ye','j/iː','approximant'],['ے','baṛi ye','eː','approximant'],
  ].map(([char, latn, ipa, group]) => ({ char, latn, ipa, group })),
  signs: [
    { char: 'ْ', name: 'jazm / sukun', note: 'marks a consonant with no vowel after it' },
    { char: 'ّ', name: 'tashdid', note: 'doubles the consonant' },
    { char: 'ٓ', name: 'madd', note: 'lengthens alif: آ (ā) at the start of a word' },
    { char: 'ھ', name: 'do chashmi he', note: 'the aspiration marker: ب + ھ = بھ (bh). This is how Urdu writes Hindi aspirates.' },
  ],
  note: 'Urdu and Hindi are the same spoken language at the everyday level and diverge in formal vocabulary and script. If you already speak Hindi, an Urdu course is a reading course: nearly all the effort is in the 4 positional shapes each letter takes and in supplying the unwritten short vowels yourself.',
}

export const PERSO = { nastaliq }
