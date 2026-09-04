// Brahmic script inventories.
//
// Every script here is an ABUGIDA: a consonant letter carries an inherent
// vowel (usually "a"). To write any other vowel you attach a dependent sign
// (a matra) to the consonant; to write a bare consonant you kill the inherent
// vowel with a virama. That single rule is the thing English-speaking learners
// get wrong for months, so ScriptLab teaches it as composition, not as a
// flashcard alphabet.
//
// vowel   tuple: [independent, matra, latin, ipa]   (matra '' = inherent)
// cons    tuple: [letter, latin, ipa, articulation group]

const V = (rows) => rows.map(([char, matra, latn, ipa]) => ({ char, matra, latn, ipa }))
const C = (rows) => rows.map(([char, latn, ipa, group]) => ({ char, latn, ipa, group }))
const S = (rows) => rows.map(([char, name, note]) => ({ char, name, note }))

export const devanagari = {
  id: 'devanagari',
  name: 'Devanagari',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '्',
  viramaName: 'halant',
  digits: ['०','१','२','३','४','५','६','७','८','९'],
  demoConsonant: 'क',
  vowels: V([
    ['अ','','a','ə'], ['आ','ा','ā','aː'], ['इ','ि','i','ɪ'], ['ई','ी','ī','iː'],
    ['उ','ु','u','ʊ'], ['ऊ','ू','ū','uː'], ['ऋ','ृ','ṛ','ri'],
    ['ए','े','e','eː'], ['ऐ','ै','ai','ɛː'], ['ओ','ो','o','oː'], ['औ','ौ','au','ɔː'],
  ]),
  consonants: C([
    ['क','ka','k','velar'],['ख','kha','kʰ','velar'],['ग','ga','ɡ','velar'],['घ','gha','ɡʱ','velar'],['ङ','ṅa','ŋ','velar'],
    ['च','ca','tʃ','palatal'],['छ','cha','tʃʰ','palatal'],['ज','ja','dʒ','palatal'],['झ','jha','dʒʱ','palatal'],['ञ','ña','ɲ','palatal'],
    ['ट','ṭa','ʈ','retroflex'],['ठ','ṭha','ʈʰ','retroflex'],['ड','ḍa','ɖ','retroflex'],['ढ','ḍha','ɖʱ','retroflex'],['ण','ṇa','ɳ','retroflex'],
    ['त','ta','t̪','dental'],['थ','tha','t̪ʰ','dental'],['द','da','d̪','dental'],['ध','dha','d̪ʱ','dental'],['न','na','n','dental'],
    ['प','pa','p','labial'],['फ','pha','pʰ','labial'],['ब','ba','b','labial'],['भ','bha','bʱ','labial'],['म','ma','m','labial'],
    ['य','ya','j','approximant'],['र','ra','r','approximant'],['ल','la','l','approximant'],['व','va','ʋ','approximant'],
    ['श','śa','ʃ','sibilant'],['ष','ṣa','ʂ','sibilant'],['स','sa','s','sibilant'],['ह','ha','ɦ','sibilant'],
    ['क़','qa','q','borrowed'],['ख़','ḵẖa','x','borrowed'],['ग़','ġa','ɣ','borrowed'],['ज़','za','z','borrowed'],
    ['ड़','ṛa','ɽ','borrowed'],['ढ़','ṛha','ɽʱ','borrowed'],['फ़','fa','f','borrowed'],
  ]),
  signs: S([
    ['ं','anusvāra','nasalises the preceding vowel, or stands for the nasal of the following consonant group'],
    ['ँ','candrabindu','pure vowel nasalisation: हाँ (hā̃, yes)'],
    ['ः','visarga','a light breath after the vowel, mostly in Sanskrit loans'],
    ['्','halant / virāma','kills the inherent a: क + ् = क् (bare k)'],
  ]),
}

export const bengali = {
  id: 'bengali',
  name: 'Bengali-Assamese',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'o',
  virama: '্',
  viramaName: 'hôsonto',
  digits: ['০','১','২','৩','৪','৫','৬','৭','৮','৯'],
  demoConsonant: 'ক',
  vowels: V([
    ['অ','','ô','ɔ'], ['আ','া','a','a'], ['ই','ি','i','i'], ['ঈ','ী','ī','i'],
    ['উ','ু','u','u'], ['ঊ','ূ','ū','u'], ['ঋ','ৃ','ri','ri'],
    ['এ','ে','e','e'], ['ঐ','ৈ','oi','oi'], ['ও','ো','o','o'], ['ঔ','ৌ','ou','ou'],
  ]),
  consonants: C([
    ['ক','ka','k','velar'],['খ','kha','kʰ','velar'],['গ','ga','ɡ','velar'],['ঘ','gha','ɡʱ','velar'],['ঙ','ṅa','ŋ','velar'],
    ['চ','ca','tʃ','palatal'],['ছ','cha','tʃʰ','palatal'],['জ','ja','dʒ','palatal'],['ঝ','jha','dʒʱ','palatal'],['ঞ','ña','n','palatal'],
    ['ট','ṭa','ʈ','retroflex'],['ঠ','ṭha','ʈʰ','retroflex'],['ড','ḍa','ɖ','retroflex'],['ঢ','ḍha','ɖʱ','retroflex'],['ণ','ṇa','n','retroflex'],
    ['ত','ta','t̪','dental'],['থ','tha','t̪ʰ','dental'],['দ','da','d̪','dental'],['ধ','dha','d̪ʱ','dental'],['ন','na','n','dental'],
    ['প','pa','p','labial'],['ফ','pha','pʰ','labial'],['ব','ba','b','labial'],['ভ','bha','bʱ','labial'],['ম','ma','m','labial'],
    ['য','ja','dʒ','approximant'],['র','ra','r','approximant'],['ল','la','l','approximant'],
    ['শ','śa','ʃ','sibilant'],['ষ','ṣa','ʃ','sibilant'],['স','sa','s','sibilant'],['হ','ha','ɦ','sibilant'],
    ['ড়','ṛa','ɽ','borrowed'],['ঢ়','ṛha','ɽʱ','borrowed'],['য়','ya','j','borrowed'],
  ]),
  signs: S([
    ['ং','onusshôr','final nasal -ng: বাংলা (Bangla)'],
    ['ঁ','chôndrobindu','vowel nasalisation'],
    ['্','hôsonto','kills the inherent vowel'],
  ]),
  note: 'Three letters (শ ষ স) are all pronounced /ʃ/ in standard Bengali, and the inherent vowel is ô, not a. Do not carry Devanagari habits across.',
}

export const tamil = {
  id: 'tamil',
  name: 'Tamil',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '்',
  viramaName: 'puḷḷi',
  digits: ['௦','௧','௨','௩','௪','௫','௬','௭','௮','௯'],
  demoConsonant: 'க',
  vowels: V([
    ['அ','','a','ʌ'], ['ஆ','ா','ā','aː'], ['இ','ி','i','i'], ['ஈ','ீ','ī','iː'],
    ['உ','ு','u','u'], ['ஊ','ூ','ū','uː'],
    ['எ','ெ','e','e'], ['ஏ','ே','ē','eː'], ['ஐ','ை','ai','ai'],
    ['ஒ','ொ','o','o'], ['ஓ','ோ','ō','oː'], ['ஔ','ௌ','au','au'],
  ]),
  consonants: C([
    ['க','ka','k','velar'],['ங','ṅa','ŋ','velar'],
    ['ச','ca','s','palatal'],['ஞ','ña','ɲ','palatal'],
    ['ட','ṭa','ʈ','retroflex'],['ண','ṇa','ɳ','retroflex'],
    ['த','ta','t̪','dental'],['ந','na','n̪','dental'],
    ['ப','pa','p','labial'],['ம','ma','m','labial'],
    ['ய','ya','j','approximant'],['ர','ra','ɾ','approximant'],['ல','la','l','approximant'],['வ','va','ʋ','approximant'],
    ['ழ','ḻa','ɻ','approximant'],['ள','ḷa','ɭ','approximant'],['ற','ṟa','r','approximant'],['ன','ṉa','n','approximant'],
    ['ஜ','ja','dʒ','grantha'],['ஷ','ṣa','ʂ','grantha'],['ஸ','sa','s','grantha'],['ஹ','ha','h','grantha'],['ஶ','śa','ʃ','grantha'],
  ]),
  signs: S([
    ['்','puḷḷi','kills the inherent a: க + ் = க் (bare k)'],
    ['ஃ','āytam','rare aspirate sign, mostly in loanwords'],
  ]),
  note: 'Tamil has ONE letter per place of articulation: க covers k, g, h and x depending on position. Voicing and aspiration are predictable from position, not written. That is why the alphabet is small and the reading rules matter more than in Devanagari.',
}

export const telugu = {
  id: 'telugu',
  name: 'Telugu',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '్',
  viramaName: 'pollu',
  digits: ['౦','౧','౨','౩','౪','౫','౬','౭','౮','౯'],
  demoConsonant: 'క',
  vowels: V([
    ['అ','','a','a'], ['ఆ','ా','ā','aː'], ['ఇ','ి','i','i'], ['ఈ','ీ','ī','iː'],
    ['ఉ','ు','u','u'], ['ఊ','ూ','ū','uː'], ['ఋ','ృ','ṛ','ru'],
    ['ఎ','ె','e','e'], ['ఏ','ే','ē','eː'], ['ఐ','ై','ai','ai'],
    ['ఒ','ొ','o','o'], ['ఓ','ో','ō','oː'], ['ఔ','ౌ','au','au'],
  ]),
  consonants: C([
    ['క','ka','k','velar'],['ఖ','kha','kʰ','velar'],['గ','ga','ɡ','velar'],['ఘ','gha','ɡʱ','velar'],['ఙ','ṅa','ŋ','velar'],
    ['చ','ca','tʃ','palatal'],['ఛ','cha','tʃʰ','palatal'],['జ','ja','dʒ','palatal'],['ఝ','jha','dʒʱ','palatal'],['ఞ','ña','ɲ','palatal'],
    ['ట','ṭa','ʈ','retroflex'],['ఠ','ṭha','ʈʰ','retroflex'],['డ','ḍa','ɖ','retroflex'],['ఢ','ḍha','ɖʱ','retroflex'],['ణ','ṇa','ɳ','retroflex'],
    ['త','ta','t̪','dental'],['థ','tha','t̪ʰ','dental'],['ద','da','d̪','dental'],['ధ','dha','d̪ʱ','dental'],['న','na','n','dental'],
    ['ప','pa','p','labial'],['ఫ','pha','pʰ','labial'],['బ','ba','b','labial'],['భ','bha','bʱ','labial'],['మ','ma','m','labial'],
    ['య','ya','j','approximant'],['ర','ra','ɾ','approximant'],['ల','la','l','approximant'],['వ','va','ʋ','approximant'],['ళ','ḷa','ɭ','approximant'],
    ['శ','śa','ʃ','sibilant'],['ష','ṣa','ʂ','sibilant'],['స','sa','s','sibilant'],['హ','ha','h','sibilant'],
  ]),
  signs: S([
    ['ం','sunna','final nasal'],
    ['ః','visarga','breath release'],
    ['్','pollu','kills the inherent a'],
  ]),
}

export const kannada = {
  id: 'kannada',
  name: 'Kannada',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '್',
  viramaName: 'halanta',
  digits: ['೦','೧','೨','೩','೪','೫','೬','೭','೮','೯'],
  demoConsonant: 'ಕ',
  vowels: V([
    ['ಅ','','a','a'], ['ಆ','ಾ','ā','aː'], ['ಇ','ಿ','i','i'], ['ಈ','ೀ','ī','iː'],
    ['ಉ','ು','u','u'], ['ಊ','ೂ','ū','uː'], ['ಋ','ೃ','ṛ','ru'],
    ['ಎ','ೆ','e','e'], ['ಏ','ೇ','ē','eː'], ['ಐ','ೈ','ai','ai'],
    ['ಒ','ೊ','o','o'], ['ಓ','ೋ','ō','oː'], ['ಔ','ೌ','au','au'],
  ]),
  consonants: C([
    ['ಕ','ka','k','velar'],['ಖ','kha','kʰ','velar'],['ಗ','ga','ɡ','velar'],['ಘ','gha','ɡʱ','velar'],['ಙ','ṅa','ŋ','velar'],
    ['ಚ','ca','tʃ','palatal'],['ಛ','cha','tʃʰ','palatal'],['ಜ','ja','dʒ','palatal'],['ಝ','jha','dʒʱ','palatal'],['ಞ','ña','ɲ','palatal'],
    ['ಟ','ṭa','ʈ','retroflex'],['ಠ','ṭha','ʈʰ','retroflex'],['ಡ','ḍa','ɖ','retroflex'],['ಢ','ḍha','ɖʱ','retroflex'],['ಣ','ṇa','ɳ','retroflex'],
    ['ತ','ta','t̪','dental'],['ಥ','tha','t̪ʰ','dental'],['ದ','da','d̪','dental'],['ಧ','dha','d̪ʱ','dental'],['ನ','na','n','dental'],
    ['ಪ','pa','p','labial'],['ಫ','pha','pʰ','labial'],['ಬ','ba','b','labial'],['ಭ','bha','bʱ','labial'],['ಮ','ma','m','labial'],
    ['ಯ','ya','j','approximant'],['ರ','ra','ɾ','approximant'],['ಲ','la','l','approximant'],['ವ','va','ʋ','approximant'],['ಳ','ḷa','ɭ','approximant'],
    ['ಶ','śa','ʃ','sibilant'],['ಷ','ṣa','ʂ','sibilant'],['ಸ','sa','s','sibilant'],['ಹ','ha','h','sibilant'],
  ]),
  signs: S([
    ['ಂ','anusvara','final nasal'],
    ['ಃ','visarga','breath release'],
    ['್','halanta','kills the inherent a'],
  ]),
}

export const malayalam = {
  id: 'malayalam',
  name: 'Malayalam',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '്',
  viramaName: 'candrakkala',
  digits: ['൦','൧','൨','൩','൪','൫','൬','൭','൮','൯'],
  demoConsonant: 'ക',
  vowels: V([
    ['അ','','a','a'], ['ആ','ാ','ā','aː'], ['ഇ','ി','i','i'], ['ഈ','ീ','ī','iː'],
    ['ഉ','ു','u','u'], ['ഊ','ൂ','ū','uː'], ['ഋ','ൃ','ṛ','ru'],
    ['എ','െ','e','e'], ['ഏ','േ','ē','eː'], ['ഐ','ൈ','ai','ai'],
    ['ഒ','ൊ','o','o'], ['ഓ','ോ','ō','oː'], ['ഔ','ൗ','au','au'],
  ]),
  consonants: C([
    ['ക','ka','k','velar'],['ഖ','kha','kʰ','velar'],['ഗ','ga','ɡ','velar'],['ഘ','gha','ɡʱ','velar'],['ങ','ṅa','ŋ','velar'],
    ['ച','ca','tʃ','palatal'],['ഛ','cha','tʃʰ','palatal'],['ജ','ja','dʒ','palatal'],['ഝ','jha','dʒʱ','palatal'],['ഞ','ña','ɲ','palatal'],
    ['ട','ṭa','ʈ','retroflex'],['ഠ','ṭha','ʈʰ','retroflex'],['ഡ','ḍa','ɖ','retroflex'],['ഢ','ḍha','ɖʱ','retroflex'],['ണ','ṇa','ɳ','retroflex'],
    ['ത','ta','t̪','dental'],['ഥ','tha','t̪ʰ','dental'],['ദ','da','d̪','dental'],['ധ','dha','d̪ʱ','dental'],['ന','na','n','dental'],
    ['പ','pa','p','labial'],['ഫ','pha','pʰ','labial'],['ബ','ba','b','labial'],['ഭ','bha','bʱ','labial'],['മ','ma','m','labial'],
    ['യ','ya','j','approximant'],['ര','ra','ɾ','approximant'],['ല','la','l','approximant'],['വ','va','ʋ','approximant'],
    ['ള','ḷa','ɭ','approximant'],['ഴ','ḻa','ɻ','approximant'],['റ','ṟa','r','approximant'],
    ['ശ','śa','ʃ','sibilant'],['ഷ','ṣa','ʂ','sibilant'],['സ','sa','s','sibilant'],['ഹ','ha','h','sibilant'],
  ]),
  signs: S([
    ['ം','anusvaram','final -m'],
    ['ഃ','visargam','breath release'],
    ['്','candrakkala','kills the inherent a; also writes the half-u sound'],
  ]),
  note: 'Malayalam keeps the full Sanskrit consonant set AND the Dravidian extras (ള ഴ റ). It has the largest letter inventory of the ten, so budget extra time in Script Lab before starting lessons.',
}

export const gujarati = {
  id: 'gujarati',
  name: 'Gujarati',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '્',
  viramaName: 'halant',
  digits: ['૦','૧','૨','૩','૪','૫','૬','૭','૮','૯'],
  demoConsonant: 'ક',
  vowels: V([
    ['અ','','a','ə'], ['આ','ા','ā','aː'], ['ઇ','િ','i','i'], ['ઈ','ી','ī','iː'],
    ['ઉ','ુ','u','u'], ['ઊ','ૂ','ū','uː'], ['ઋ','ૃ','ṛ','ru'],
    ['એ','ે','e','e'], ['ઐ','ૈ','ai','əi'], ['ઓ','ો','o','o'], ['ઔ','ૌ','au','əu'],
  ]),
  consonants: C([
    ['ક','ka','k','velar'],['ખ','kha','kʰ','velar'],['ગ','ga','ɡ','velar'],['ઘ','gha','ɡʱ','velar'],['ઙ','ṅa','ŋ','velar'],
    ['ચ','ca','tʃ','palatal'],['છ','cha','tʃʰ','palatal'],['જ','ja','dʒ','palatal'],['ઝ','jha','dʒʱ','palatal'],['ઞ','ña','ɲ','palatal'],
    ['ટ','ṭa','ʈ','retroflex'],['ઠ','ṭha','ʈʰ','retroflex'],['ડ','ḍa','ɖ','retroflex'],['ઢ','ḍha','ɖʱ','retroflex'],['ણ','ṇa','ɳ','retroflex'],
    ['ત','ta','t̪','dental'],['થ','tha','t̪ʰ','dental'],['દ','da','d̪','dental'],['ધ','dha','d̪ʱ','dental'],['ન','na','n','dental'],
    ['પ','pa','p','labial'],['ફ','pha','pʰ','labial'],['બ','ba','b','labial'],['ભ','bha','bʱ','labial'],['મ','ma','m','labial'],
    ['ય','ya','j','approximant'],['ર','ra','ɾ','approximant'],['લ','la','l','approximant'],['વ','va','ʋ','approximant'],['ળ','ḷa','ɭ','approximant'],
    ['શ','śa','ʃ','sibilant'],['ષ','ṣa','ʂ','sibilant'],['સ','sa','s','sibilant'],['હ','ha','ɦ','sibilant'],
  ]),
  signs: S([
    ['ં','anusvar','nasalisation'],
    ['ઃ','visarg','breath release'],
    ['્','halant','kills the inherent a'],
  ]),
  note: 'Gujarati is Devanagari minus the top bar (shirorekha). If you already read Hindi, this script takes about an hour.',
}

export const gurmukhi = {
  id: 'gurmukhi',
  name: 'Gurmukhi',
  type: 'abugida',
  dir: 'ltr',
  inherentVowel: 'a',
  virama: '੍',
  viramaName: 'halant',
  digits: ['੦','੧','੨','੩','੪','੫','੬','੭','੮','੯'],
  demoConsonant: 'ਕ',
  vowels: V([
    ['ਅ','','a','ə'], ['ਆ','ਾ','ā','aː'], ['ਇ','ਿ','i','ɪ'], ['ਈ','ੀ','ī','iː'],
    ['ਉ','ੁ','u','ʊ'], ['ਊ','ੂ','ū','uː'],
    ['ਏ','ੇ','e','eː'], ['ਐ','ੈ','ai','ɛː'], ['ਓ','ੋ','o','oː'], ['ਔ','ੌ','au','ɔː'],
  ]),
  consonants: C([
    ['ਕ','ka','k','velar'],['ਖ','kha','kʰ','velar'],['ਗ','ga','ɡ','velar'],['ਘ','gha','kə̀','velar'],['ਙ','ṅa','ŋ','velar'],
    ['ਚ','ca','tʃ','palatal'],['ਛ','cha','tʃʰ','palatal'],['ਜ','ja','dʒ','palatal'],['ਝ','jha','tʃə̀','palatal'],['ਞ','ña','ɲ','palatal'],
    ['ਟ','ṭa','ʈ','retroflex'],['ਠ','ṭha','ʈʰ','retroflex'],['ਡ','ḍa','ɖ','retroflex'],['ਢ','ḍha','ʈə̀','retroflex'],['ਣ','ṇa','ɳ','retroflex'],
    ['ਤ','ta','t̪','dental'],['ਥ','tha','t̪ʰ','dental'],['ਦ','da','d̪','dental'],['ਧ','dha','t̪ə̀','dental'],['ਨ','na','n','dental'],
    ['ਪ','pa','p','labial'],['ਫ','pha','pʰ','labial'],['ਬ','ba','b','labial'],['ਭ','bha','pə̀','labial'],['ਮ','ma','m','labial'],
    ['ਯ','ya','j','approximant'],['ਰ','ra','ɾ','approximant'],['ਲ','la','l','approximant'],['ਵ','va','ʋ','approximant'],['ੜ','ṛa','ɽ','approximant'],
    ['ਸ','sa','s','sibilant'],['ਹ','ha','ɦ','sibilant'],['ਸ਼','sha','ʃ','borrowed'],['ਜ਼','za','z','borrowed'],['ਫ਼','fa','f','borrowed'],['ਖ਼','kha','x','borrowed'],['ਗ਼','ġa','ɣ','borrowed'],
  ]),
  signs: S([
    ['ੰ','ṭippi','nasalisation'],
    ['ਂ','bindi','nasalisation with long vowels'],
    ['ੱ','addak','doubles the following consonant'],
    ['੍','halant','kills the inherent a (rare in modern Punjabi)'],
  ]),
  note: 'Punjabi is TONAL. The letters written gh jh dh dh bh do not carry breathy voice the way Hindi does; they trigger a low tone on the syllable instead. Two words identical in letters can differ only in tone.',
}

export const BRAHMIC = { devanagari, bengali, tamil, telugu, kannada, malayalam, gujarati, gurmukhi }
