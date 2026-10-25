// Verb paradigms.
//
// These exist so grammar drills can be GENERATED rather than hand-written.
// One table yields conjugation questions in every tense, for every person, in
// both genders, plus the ergative object-agreement drills that L3 turns on.
// Writing those by hand would be thousands of questions and would go stale the
// moment a form was corrected.
//
// Each form is stored as "देवनागरी|transliteration" to keep the tables readable.

export const PRONOUN_SLOTS = [
  { key: '1sg.m', pron: 'मी', pronLatn: 'mī', en: 'I (m)' },
  { key: '1sg.f', pron: 'मी', pronLatn: 'mī', en: 'I (f)' },
  { key: '2sg.m', pron: 'तू', pronLatn: 'tū', en: 'you (m, intimate)' },
  { key: '2sg.f', pron: 'तू', pronLatn: 'tū', en: 'you (f, intimate)' },
  { key: '3sg.m', pron: 'तो', pronLatn: 'to', en: 'he' },
  { key: '3sg.f', pron: 'ती', pronLatn: 'tī', en: 'she' },
  { key: '3sg.n', pron: 'ते', pronLatn: 'te', en: 'it' },
  { key: '1pl', pron: 'आम्ही', pronLatn: 'āmhī', en: 'we' },
  { key: '2pl', pron: 'तुम्ही', pronLatn: 'tumhī', en: 'you (polite/plural)' },
  { key: '3pl', pron: 'ते', pronLatn: 'te', en: 'they' },
]

export const FUTURE_SLOTS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']
export const FUTURE_PRONOUNS = {
  '1sg': ['मी', 'mī', 'I'], '2sg': ['तू', 'tū', 'you'], '3sg': ['तो', 'to', 'he/she'],
  '1pl': ['आम्ही', 'āmhī', 'we'], '2pl': ['तुम्ही', 'tumhī', 'you (polite)'], '3pl': ['ते', 'te', 'they'],
}

// Object-agreement slots for the ergative past. The verb tracks the OBJECT's
// gender and number here, which is the whole point of L3.
export const OBJECT_SLOTS = [
  { key: 'obj.m', en: 'masculine singular object', sample: 'आंबा', sampleEn: 'mango' },
  { key: 'obj.f', en: 'feminine singular object', sample: 'पोळी', sampleEn: 'chapati' },
  { key: 'obj.n', en: 'neuter singular object', sample: 'काम', sampleEn: 'work' },
  { key: 'obj.mpl', en: 'masculine plural object', sample: 'आंबे', sampleEn: 'mangoes' },
  { key: 'obj.fpl', en: 'feminine plural object', sample: 'पोळ्या', sampleEn: 'chapatis' },
  { key: 'obj.npl', en: 'neuter plural object', sample: 'कामं', sampleEn: 'tasks' },
]

// Person markers stacked AFTER object agreement in the ergative past:
// तू काम केलंस, तुम्ही काम केलंत.
export const ERG_PERSON_SUFFIX = { '2sg': 'स', '2pl': 'त' }

const PRES = ['1sg.m', '1sg.f', '2sg.m', '2sg.f', '3sg.m', '3sg.f', '3sg.n', '1pl', '2pl', '3pl']
const OBJ = ['obj.m', 'obj.f', 'obj.n', 'obj.mpl', 'obj.fpl', 'obj.npl']

const zip = (keys, vals) =>
  Object.fromEntries(keys.map((k, i) => {
    const [mr, latn] = String(vals[i]).split('|')
    return [k, { mr, latn }]
  }))

/** Intransitive verb: the past agrees with the SUBJECT. */
const iv = (id, inf, infLatn, en, present, past, future) => ({
  id, inf, infLatn, en, type: 'intransitive',
  forms: { present: zip(PRES, present), past: zip(PRES, past), future: zip(FUTURE_SLOTS, future) },
})

/** Transitive verb: the past agrees with the OBJECT, and the subject takes -ने. */
const tv = (id, inf, infLatn, en, present, pastErg, future) => ({
  id, inf, infLatn, en, type: 'transitive',
  forms: { present: zip(PRES, present), pastErg: zip(OBJ, pastErg), future: zip(FUTURE_SLOTS, future) },
})

export const VERBS = [
  // ---------- intransitive ----------
  iv('jane', 'जाणे', 'jāṇe', 'to go',
    ['जातो|jāto', 'जाते|jāte', 'जातोस|jātos', 'जातेस|jātes', 'जातो|jāto', 'जाते|jāte', 'जातं|jātã', 'जातो|jāto', 'जाता|jātā', 'जातात|jātāt'],
    ['गेलो|gelo', 'गेले|gele', 'गेलास|gelās', 'गेलीस|gelīs', 'गेला|gelā', 'गेली|gelī', 'गेलं|gelã', 'गेलो|gelo', 'गेलात|gelāt', 'गेले|gele'],
    ['जाईन|jāīn', 'जाशील|jāśīl', 'जाईल|jāīl', 'जाऊ|jāū', 'जाल|jāl', 'जातील|jātīl']),

  iv('yene', 'येणे', 'yeṇe', 'to come',
    ['येतो|yeto', 'येते|yete', 'येतोस|yetos', 'येतेस|yetes', 'येतो|yeto', 'येते|yete', 'येतं|yetã', 'येतो|yeto', 'येता|yetā', 'येतात|yetāt'],
    ['आलो|ālo', 'आले|āle', 'आलास|ālās', 'आलीस|ālīs', 'आला|ālā', 'आली|ālī', 'आलं|ālã', 'आलो|ālo', 'आलात|ālāt', 'आले|āle'],
    ['येईन|yeīn', 'येशील|yeśīl', 'येईल|yeīl', 'येऊ|yeū', 'याल|yāl', 'येतील|yetīl']),

  iv('basne', 'बसणे', 'basaṇe', 'to sit',
    ['बसतो|basto', 'बसते|baste', 'बसतोस|bastos', 'बसतेस|bastes', 'बसतो|basto', 'बसते|baste', 'बसतं|bastã', 'बसतो|basto', 'बसता|bastā', 'बसतात|bastāt'],
    ['बसलो|baslo', 'बसले|basle', 'बसलास|baslās', 'बसलीस|baslīs', 'बसला|baslā', 'बसली|baslī', 'बसलं|baslã', 'बसलो|baslo', 'बसलात|baslāt', 'बसले|basle'],
    ['बसेन|basen', 'बसशील|basśīl', 'बसेल|basel', 'बसू|basū', 'बसाल|basāl', 'बसतील|bastīl']),

  iv('uthne', 'उठणे', 'uṭhaṇe', 'to get up',
    ['उठतो|uṭhto', 'उठते|uṭhte', 'उठतोस|uṭhtos', 'उठतेस|uṭhtes', 'उठतो|uṭhto', 'उठते|uṭhte', 'उठतं|uṭhtã', 'उठतो|uṭhto', 'उठता|uṭhtā', 'उठतात|uṭhtāt'],
    ['उठलो|uṭhlo', 'उठले|uṭhle', 'उठलास|uṭhlās', 'उठलीस|uṭhlīs', 'उठला|uṭhlā', 'उठली|uṭhlī', 'उठलं|uṭhlã', 'उठलो|uṭhlo', 'उठलात|uṭhlāt', 'उठले|uṭhle'],
    ['उठेन|uṭhen', 'उठशील|uṭhśīl', 'उठेल|uṭhel', 'उठू|uṭhū', 'उठाल|uṭhāl', 'उठतील|uṭhtīl']),

  iv('nighne', 'निघणे', 'nighṇe', 'to set off',
    ['निघतो|nighto', 'निघते|nighte', 'निघतोस|nightos', 'निघतेस|nightes', 'निघतो|nighto', 'निघते|nighte', 'निघतं|nightã', 'निघतो|nighto', 'निघता|nightā', 'निघतात|nightāt'],
    ['निघालो|nighālo', 'निघाले|nighāle', 'निघालास|nighālās', 'निघालीस|nighālīs', 'निघाला|nighālā', 'निघाली|nighālī', 'निघालं|nighālã', 'निघालो|nighālo', 'निघालात|nighālāt', 'निघाले|nighāle'],
    ['निघेन|nighen', 'निघशील|nighśīl', 'निघेल|nighel', 'निघू|nighū', 'निघाल|nighāl', 'निघतील|nightīl']),

  iv('pohochne', 'पोहोचणे', 'pohocṇe', 'to arrive',
    ['पोहोचतो|pohocto', 'पोहोचते|pohocte', 'पोहोचतोस|pohoctos', 'पोहोचतेस|pohoctes', 'पोहोचतो|pohocto', 'पोहोचते|pohocte', 'पोहोचतं|pohoctã', 'पोहोचतो|pohocto', 'पोहोचता|pohoctā', 'पोहोचतात|pohoctāt'],
    ['पोहोचलो|pohoclo', 'पोहोचले|pohocle', 'पोहोचलास|pohoclās', 'पोहोचलीस|pohoclīs', 'पोहोचला|pohoclā', 'पोहोचली|pohoclī', 'पोहोचलं|pohoclã', 'पोहोचलो|pohoclo', 'पोहोचलात|pohoclāt', 'पोहोचले|pohocle'],
    ['पोहोचेन|pohocen', 'पोहोचशील|pohocśīl', 'पोहोचेल|pohocel', 'पोहोचू|pohocū', 'पोहोचाल|pohocāl', 'पोहोचतील|pohoctīl']),

  iv('hasne', 'हसणे', 'hasaṇe', 'to laugh',
    ['हसतो|hasto', 'हसते|haste', 'हसतोस|hastos', 'हसतेस|hastes', 'हसतो|hasto', 'हसते|haste', 'हसतं|hastã', 'हसतो|hasto', 'हसता|hastā', 'हसतात|hastāt'],
    ['हसलो|haslo', 'हसले|hasle', 'हसलास|haslās', 'हसलीस|haslīs', 'हसला|haslā', 'हसली|haslī', 'हसलं|haslã', 'हसलो|haslo', 'हसलात|haslāt', 'हसले|hasle'],
    ['हसेन|hasen', 'हसशील|hasśīl', 'हसेल|hasel', 'हसू|hasū', 'हसाल|hasāl', 'हसतील|hastīl']),

  iv('jhopne', 'झोपणे', 'jhopaṇe', 'to sleep',
    ['झोपतो|jhopto', 'झोपते|jhopte', 'झोपतोस|jhoptos', 'झोपतेस|jhoptes', 'झोपतो|jhopto', 'झोपते|jhopte', 'झोपतं|jhoptã', 'झोपतो|jhopto', 'झोपता|jhoptā', 'झोपतात|jhoptāt'],
    ['झोपलो|jhoplo', 'झोपले|jhople', 'झोपलास|jhoplās', 'झोपलीस|jhoplīs', 'झोपला|jhoplā', 'झोपली|jhoplī', 'झोपलं|jhoplã', 'झोपलो|jhoplo', 'झोपलात|jhoplāt', 'झोपले|jhople'],
    ['झोपेन|jhopen', 'झोपशील|jhopśīl', 'झोपेल|jhopel', 'झोपू|jhopū', 'झोपाल|jhopāl', 'झोपतील|jhoptīl']),

  // ---------- transitive: past agrees with the OBJECT ----------
  tv('karne', 'करणे', 'karaṇe', 'to do',
    ['करतो|karto', 'करते|karte', 'करतोस|kartos', 'करतेस|kartes', 'करतो|karto', 'करते|karte', 'करतं|kartã', 'करतो|karto', 'करता|kartā', 'करतात|kartāt'],
    ['केला|kelā', 'केली|kelī', 'केलं|kelã', 'केले|kele', 'केल्या|kelyā', 'केली|kelī'],
    ['करीन|karīn', 'करशील|karśīl', 'करेल|karel', 'करू|karū', 'कराल|karāl', 'करतील|kartīl']),

  tv('khane', 'खाणे', 'khāṇe', 'to eat',
    ['खातो|khāto', 'खाते|khāte', 'खातोस|khātos', 'खातेस|khātes', 'खातो|khāto', 'खाते|khāte', 'खातं|khātã', 'खातो|khāto', 'खाता|khātā', 'खातात|khātāt'],
    ['खाल्ला|khāllā', 'खाल्ली|khāllī', 'खाल्लं|khāllã', 'खाल्ले|khālle', 'खाल्ल्या|khāllyā', 'खाल्ली|khāllī'],
    ['खाईन|khāīn', 'खाशील|khāśīl', 'खाईल|khāīl', 'खाऊ|khāū', 'खाल|khāl', 'खातील|khātīl']),

  tv('pine', 'पिणे', 'piṇe', 'to drink',
    ['पितो|pito', 'पिते|pite', 'पितोस|pitos', 'पितेस|pites', 'पितो|pito', 'पिते|pite', 'पितं|pitã', 'पितो|pito', 'पिता|pitā', 'पितात|pitāt'],
    ['प्याला|pyālā', 'प्याली|pyālī', 'प्यालं|pyālã', 'प्याले|pyāle', 'प्याल्या|pyālyā', 'प्याली|pyālī'],
    ['पिईन|piīn', 'पिशील|piśīl', 'पिईल|piīl', 'पिऊ|piū', 'प्याल|pyāl', 'पितील|pitīl']),

  tv('baghne', 'बघणे', 'baghṇe', 'to see',
    ['बघतो|baghto', 'बघते|baghte', 'बघतोस|baghtos', 'बघतेस|baghtes', 'बघतो|baghto', 'बघते|baghte', 'बघतं|baghtã', 'बघतो|baghto', 'बघता|baghtā', 'बघतात|baghtāt'],
    ['बघितला|baghitlā', 'बघितली|baghitlī', 'बघितलं|baghitlã', 'बघितले|baghitle', 'बघितल्या|baghitlyā', 'बघितली|baghitlī'],
    ['बघेन|baghen', 'बघशील|baghśīl', 'बघेल|baghel', 'बघू|baghū', 'बघाल|baghāl', 'बघतील|baghtīl']),

  tv('vachne', 'वाचणे', 'vācṇe', 'to read',
    ['वाचतो|vācto', 'वाचते|vācte', 'वाचतोस|vāctos', 'वाचतेस|vāctes', 'वाचतो|vācto', 'वाचते|vācte', 'वाचतं|vāctã', 'वाचतो|vācto', 'वाचता|vāctā', 'वाचतात|vāctāt'],
    ['वाचला|vāclā', 'वाचली|vāclī', 'वाचलं|vāclã', 'वाचले|vācle', 'वाचल्या|vāclyā', 'वाचली|vāclī'],
    ['वाचेन|vācen', 'वाचशील|vācśīl', 'वाचेल|vācel', 'वाचू|vācū', 'वाचाल|vācāl', 'वाचतील|vāctīl']),

  tv('lihine', 'लिहिणे', 'lihiṇe', 'to write',
    ['लिहितो|lihito', 'लिहिते|lihite', 'लिहितोस|lihitos', 'लिहितेस|lihites', 'लिहितो|lihito', 'लिहिते|lihite', 'लिहितं|lihitã', 'लिहितो|lihito', 'लिहिता|lihitā', 'लिहितात|lihitāt'],
    ['लिहिला|lihilā', 'लिहिली|lihilī', 'लिहिलं|lihilã', 'लिहिले|lihile', 'लिहिल्या|lihilyā', 'लिहिली|lihilī'],
    ['लिहीन|lihīn', 'लिहिशील|lihiśīl', 'लिहील|lihīl', 'लिहू|lihū', 'लिहाल|lihāl', 'लिहितील|lihitīl']),

  tv('dene', 'देणे', 'deṇe', 'to give',
    ['देतो|deto', 'देते|dete', 'देतोस|detos', 'देतेस|detes', 'देतो|deto', 'देते|dete', 'देतं|detã', 'देतो|deto', 'देता|detā', 'देतात|detāt'],
    ['दिला|dilā', 'दिली|dilī', 'दिलं|dilã', 'दिले|dile', 'दिल्या|dilyā', 'दिली|dilī'],
    ['देईन|deīn', 'देशील|deśīl', 'देईल|deīl', 'देऊ|deū', 'द्याल|dyāl', 'देतील|detīl']),

  tv('ghene', 'घेणे', 'gheṇe', 'to take',
    ['घेतो|gheto', 'घेते|ghete', 'घेतोस|ghetos', 'घेतेस|ghetes', 'घेतो|gheto', 'घेते|ghete', 'घेतं|ghetã', 'घेतो|gheto', 'घेता|ghetā', 'घेतात|ghetāt'],
    ['घेतला|ghetlā', 'घेतली|ghetlī', 'घेतलं|ghetlã', 'घेतले|ghetle', 'घेतल्या|ghetlyā', 'घेतली|ghetlī'],
    ['घेईन|gheīn', 'घेशील|gheśīl', 'घेईल|gheīl', 'घेऊ|gheū', 'घ्याल|ghyāl', 'घेतील|ghetīl']),

  tv('sangne', 'सांगणे', 'sāṅgṇe', 'to tell',
    ['सांगतो|sāṅgto', 'सांगते|sāṅgte', 'सांगतोस|sāṅgtos', 'सांगतेस|sāṅgtes', 'सांगतो|sāṅgto', 'सांगते|sāṅgte', 'सांगतं|sāṅgtã', 'सांगतो|sāṅgto', 'सांगता|sāṅgtā', 'सांगतात|sāṅgtāt'],
    ['सांगितला|sāṅgitlā', 'सांगितली|sāṅgitlī', 'सांगितलं|sāṅgitlã', 'सांगितले|sāṅgitle', 'सांगितल्या|sāṅgitlyā', 'सांगितली|sāṅgitlī'],
    ['सांगेन|sāṅgen', 'सांगशील|sāṅgśīl', 'सांगेल|sāṅgel', 'सांगू|sāṅgū', 'सांगाल|sāṅgāl', 'सांगतील|sāṅgtīl']),

  tv('aikne', 'ऐकणे', 'aikaṇe', 'to hear',
    ['ऐकतो|aikto', 'ऐकते|aikte', 'ऐकतोस|aiktos', 'ऐकतेस|aiktes', 'ऐकतो|aikto', 'ऐकते|aikte', 'ऐकतं|aiktã', 'ऐकतो|aikto', 'ऐकता|aiktā', 'ऐकतात|aiktāt'],
    ['ऐकला|aiklā', 'ऐकली|aiklī', 'ऐकलं|aiklã', 'ऐकले|aikle', 'ऐकल्या|aiklyā', 'ऐकली|aiklī'],
    ['ऐकेन|aiken', 'ऐकशील|aikśīl', 'ऐकेल|aikel', 'ऐकू|aikū', 'ऐकाल|aikāl', 'ऐकतील|aiktīl']),

  tv('vikne', 'विकणे', 'vikṇe', 'to sell',
    ['विकतो|vikto', 'विकते|vikte', 'विकतोस|viktos', 'विकतेस|viktes', 'विकतो|vikto', 'विकते|vikte', 'विकतं|viktã', 'विकतो|vikto', 'विकता|viktā', 'विकतात|viktāt'],
    ['विकला|viklā', 'विकली|viklī', 'विकलं|viklã', 'विकले|vikle', 'विकल्या|viklyā', 'विकली|viklī'],
    ['विकेन|viken', 'विकशील|vikśīl', 'विकेल|vikel', 'विकू|vikū', 'विकाल|vikāl', 'विकतील|viktīl']),
]

export const TENSES = [
  { id: 'present', en: 'present habitual', mr: 'वर्तमानकाळ', slots: 'subject', minLevel: 'l1' },
  { id: 'past', en: 'past (intransitive)', mr: 'भूतकाळ', slots: 'subject', minLevel: 'l2' },
  { id: 'future', en: 'future', mr: 'भविष्यकाळ', slots: 'future', minLevel: 'l2' },
  { id: 'pastErg', en: 'past (ergative)', mr: 'भूतकाळ (कर्मणी)', slots: 'object', minLevel: 'l3' },
]

// Plausible objects per transitive verb, one per agreement slot.
//
// Without this the ergative drill pairs a random verb with a generic sample
// noun and produces sentences like "I sold work" or "she drank a chapati".
// The grammar would still be right, but a native speaker reads it as a slot
// machine rather than as language, and the learner has to look past the
// nonsense to find the lesson.
const O = (m, f, n, mpl, fpl, npl) => ({
  'obj.m': m, 'obj.f': f, 'obj.n': n, 'obj.mpl': mpl, 'obj.fpl': fpl, 'obj.npl': npl,
})
const w = (mr, latn, en) => ({ mr, latn, en })

export const VERB_OBJECTS = {
  karne: O(w('अभ्यास', 'abhyās', 'study'), w('मदत', 'madat', 'help'), w('काम', 'kām', 'work'),
           w('प्रश्न', 'praśna', 'questions'), w('गोष्टी', 'goṣṭī', 'things'), w('कामं', 'kāmã', 'tasks')),
  khane: O(w('आंबा', 'āmbā', 'a mango'), w('पोळी', 'poḷī', 'a chapati'), w('जेवण', 'jevaṇ', 'a meal'),
           w('आंबे', 'āmbe', 'mangoes'), w('पोळ्या', 'poḷyā', 'chapatis'), w('फळं', 'phaḷã', 'fruits')),
  pine: O(w('चहा', 'cahā', 'tea'), w('कॉफी', 'kŏphī', 'coffee'), w('दूध', 'dūdh', 'milk'),
          w('चहा', 'cahā', 'teas'), w('कॉफ्या', 'kŏphyā', 'coffees'), w('पेयं', 'peyã', 'drinks')),
  baghne: O(w('चित्रपट', 'citrapaṭ', 'a film'), w('गाडी', 'gāḍī', 'a car'), w('घर', 'ghar', 'a house'),
            w('चित्रपट', 'citrapaṭ', 'films'), w('गाड्या', 'gāḍyā', 'cars'), w('घरं', 'gharã', 'houses')),
  vachne: O(w('लेख', 'lekh', 'an article'), w('बातमी', 'bātmī', 'a news item'), w('पुस्तक', 'pustak', 'a book'),
            w('लेख', 'lekh', 'articles'), w('बातम्या', 'bātmyā', 'news items'), w('पुस्तकं', 'pustakã', 'books')),
  lihine: O(w('लेख', 'lekh', 'an article'), w('गोष्ट', 'goṣṭ', 'a story'), w('पत्र', 'patra', 'a letter'),
            w('लेख', 'lekh', 'articles'), w('गोष्टी', 'goṣṭī', 'stories'), w('पत्रं', 'patrã', 'letters')),
  dene: O(w('सल्ला', 'sallā', 'advice'), w('मदत', 'madat', 'help'), w('उत्तर', 'uttar', 'an answer'),
          w('पैसे', 'paise', 'money'), w('गोष्टी', 'goṣṭī', 'things'), w('उत्तरं', 'uttarã', 'answers')),
  ghene: O(w('चहा', 'cahā', 'tea'), w('गाडी', 'gāḍī', 'a car'), w('तिकीट', 'tikīṭ', 'a ticket'),
           w('आंबे', 'āmbe', 'mangoes'), w('गाड्या', 'gāḍyā', 'cars'), w('तिकिटं', 'tikiṭã', 'tickets')),
  sangne: O(w('विचार', 'vicār', 'a thought'), w('गोष्ट', 'goṣṭ', 'a story'), w('उत्तर', 'uttar', 'an answer'),
            w('विचार', 'vicār', 'thoughts'), w('गोष्टी', 'goṣṭī', 'stories'), w('उत्तरं', 'uttarã', 'answers')),
  aikne: O(w('आवाज', 'āvāj', 'a sound'), w('बातमी', 'bātmī', 'the news'), w('गाणं', 'gāṇã', 'a song'),
           w('आवाज', 'āvāj', 'sounds'), w('बातम्या', 'bātmyā', 'the news'), w('गाणी', 'gāṇī', 'songs')),
  vikne: O(w('आंबा', 'āmbā', 'a mango'), w('गाडी', 'gāḍī', 'a car'), w('घर', 'ghar', 'a house'),
           w('आंबे', 'āmbe', 'mangoes'), w('गाड्या', 'gāḍyā', 'cars'), w('घरं', 'gharã', 'houses')),
}

export const VERB_BY_ID = Object.fromEntries(VERBS.map((v) => [v.id, v]))
