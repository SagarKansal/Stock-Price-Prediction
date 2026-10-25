import { v, s, g, ex } from './_h.js'

// A2. Case marking, the oblique stem, and the past/future/continuous tenses.
//
// This is where a Hindi speaker's free ride ends. Hindi writes घर में as two
// words; Marathi fuses it into घरात, and the noun changes shape first. Every
// noun below carries its oblique stem, because that is the form the suffixes
// actually attach to and dictionaries almost never print it.

export default {
  id: 'l2',
  vocab: [
    // --- places, with oblique stems ---
    v('shala', 'शाळा', 'śāḷā', 'school', { g: 'f', obl: 'शाळे', concept: 'school', note: 'feminine -आ nouns take an -ए oblique: शाळेत, शाळेला' }),
    v('dukan', 'दुकान', 'dukān', 'shop', { g: 'n', obl: 'दुकाना', concept: 'shop' }),
    v('bajar', 'बाजार', 'bājār', 'market', { g: 'm', obl: 'बाजारा', concept: 'market' }),
    v('ophis', 'ऑफिस', 'ŏphis', 'office', { g: 'n', obl: 'ऑफिसा' }),
    v('rasta', 'रस्ता', 'rastā', 'road', { g: 'm', obl: 'रस्त्या', concept: 'road', note: 'masculine -आ nouns take a -या oblique' }),
    v('gav', 'गाव', 'gāv', 'village, hometown', { g: 'n', obl: 'गावा', concept: 'village' }),
    v('shahar', 'शहर', 'śahar', 'city', { g: 'n', obl: 'शहरा', concept: 'city' }),
    v('deul', 'देऊळ', 'deūḷ', 'temple', { g: 'n', obl: 'देवळा' }),
    v('banka', 'बँक', 'bãk', 'bank', { g: 'f', obl: 'बँके' }),
    v('mitra', 'मित्र', 'mitra', 'friend', { g: 'm', obl: 'मित्रा', concept: 'friend' }),

    // --- getting around ---
    v('bas_v', 'बस', 'bas', 'bus', { g: 'f', obl: 'बस' }),
    v('relve', 'रेल्वे', 'relve', 'train, railway', { g: 'f' }),
    v('riksha', 'रिक्षा', 'rikṣā', 'auto-rickshaw', { g: 'f', obl: 'रिक्षे' }),
    v('viman', 'विमान', 'vimān', 'aeroplane', { g: 'n', obl: 'विमाना' }),
    v('tikit', 'तिकीट', 'tikīṭ', 'ticket', { g: 'n', obl: 'तिकिटा' }),

    // --- money ---
    v('paise', 'पैसे', 'paise', 'money', { g: 'm', concept: 'money', note: 'plural in form, like English "funds"' }),
    v('rupaya', 'रुपया', 'rupayā', 'rupee', { g: 'm', obl: 'रुपया' }),
    v('svast', 'स्वस्त', 'svast', 'cheap' ),
    v('mahag', 'महाग', 'mahāg', 'expensive' ),
    v('kimmat', 'किंमत', 'kimmat', 'price', { g: 'f', obl: 'किमती', concept: 'price' }),

    // --- time ---
    v('tas', 'तास', 'tās', 'hour', { g: 'm', obl: 'तासा' }),
    v('minit', 'मिनिट', 'miniṭ', 'minute', { g: 'n', obl: 'मिनिटा' }),
    v('divas', 'दिवस', 'divas', 'day', { g: 'm', obl: 'दिवसा', concept: 'day' }),
    v('athavda', 'आठवडा', 'āṭhavaḍā', 'week', { g: 'm', obl: 'आठवड्या', concept: 'week' }),
    v('mahina', 'महिना', 'mahinā', 'month', { g: 'm', obl: 'महिन्या' }),
    v('varsha', 'वर्ष', 'varṣa', 'year', { g: 'n', obl: 'वर्षा' }),
    v('vel', 'वेळ', 'veḷ', 'time', { g: 'f', obl: 'वेळे', concept: 'time' }),
    v('atta', 'आत्ता', 'āttā', 'right now', { concept: 'now' }),
    v('nantar', 'नंतर', 'nantar', 'after, later' ),
    v('aadhi', 'आधी', 'ādhī', 'before, earlier' ),
    v('ushir', 'उशीर', 'uśīr', 'lateness, delay', { g: 'm', obl: 'उशिरा' }),
    v('dupar', 'दुपार', 'dupār', 'afternoon', { g: 'f', obl: 'दुपारी' }),
    v('sandhyakal', 'संध्याकाळ', 'sandhyākāḷ', 'evening', { g: 'f', obl: 'संध्याकाळी', concept: 'evening' }),

    // --- days of the week ---
    v('somvar', 'सोमवार', 'somvār', 'Monday', { g: 'm' }),
    v('mangalvar', 'मंगळवार', 'maṅgaḷvār', 'Tuesday', { g: 'm' }),
    v('budhvar', 'बुधवार', 'budhvār', 'Wednesday', { g: 'm' }),
    v('guruvar', 'गुरुवार', 'guruvār', 'Thursday', { g: 'm' }),
    v('shukravar', 'शुक्रवार', 'śukravār', 'Friday', { g: 'm' }),
    v('shanivar', 'शनिवार', 'śanivār', 'Saturday', { g: 'm' }),
    v('ravivar', 'रविवार', 'ravivār', 'Sunday', { g: 'm' }),

    // --- weather and seasons ---
    v('paus', 'पाऊस', 'pāūs', 'rain', { g: 'm', obl: 'पावसा' }),
    v('un', 'ऊन', 'ūn', 'sunshine, heat', { g: 'n', obl: 'उन्हा' }),
    v('vara', 'वारा', 'vārā', 'wind', { g: 'm', obl: 'वाऱ्या' }),
    v('dhag', 'ढग', 'ḍhag', 'cloud', { g: 'm', obl: 'ढगा' }),
    v('thandi', 'थंडी', 'thaṇḍī', 'cold weather', { g: 'f' }),
    v('unhala', 'उन्हाळा', 'unhāḷā', 'summer', { g: 'm', obl: 'उन्हाळ्या' }),
    v('pavsala', 'पावसाळा', 'pāvsāḷā', 'monsoon', { g: 'm', obl: 'पावसाळ्या' }),
    v('hivala', 'हिवाळा', 'hivāḷā', 'winter', { g: 'm', obl: 'हिवाळ्या' }),

    // --- position words, which follow the oblique like suffixes do ---
    v('samor', 'समोर', 'samor', 'in front of' ),
    v('mage', 'मागे', 'māge', 'behind' ),
    v('javal', 'जवळ', 'javaḷ', 'near' ),
    v('khali', 'खाली', 'khālī', 'below, down' ),
    v('var_p', 'वर', 'var', 'on, above' ),
    v('aat', 'आत', 'āt', 'inside' ),
    v('baher_p', 'बाहेर', 'bāher', 'outside' ),
    v('madhye', 'मध्ये', 'madhye', 'in, among', { note: 'the long form of -त; ऑफिसमध्ये = ऑफिसात' }),
    v('shejari', 'शेजारी', 'śejārī', 'next to' ),

    // --- verbs ---
    v('v_rahne', 'राहणे', 'rāhṇe', 'to live, to stay', { pos: 'verb' }),
    v('v_kam', 'काम करणे', 'kām karaṇe', 'to work', { pos: 'verb', concept: 'to_work' }),
    v('v_sangne', 'सांगणे', 'sāṅgṇe', 'to tell, to say', { pos: 'verb' }),
    v('v_vicharne', 'विचारणे', 'vicārṇe', 'to ask', { pos: 'verb' }),
    v('v_bhetne', 'भेटणे', 'bheṭṇe', 'to meet', { pos: 'verb' }),
    v('v_nighne', 'निघणे', 'nighṇe', 'to set off, to leave', { pos: 'verb' }),
    v('v_pohochne', 'पोहोचणे', 'pohocṇe', 'to arrive', { pos: 'verb' }),
    v('v_milne', 'मिळणे', 'miḷṇe', 'to be obtained, to get', { pos: 'verb', note: 'dative frame: मला मिळालं = I got it' }),
    v('v_lagne', 'लागणे', 'lāgṇe', 'to be needed, to attach', { pos: 'verb', note: 'the verb behind भूक लागली and उशीर लागला' }),
    v('v_samajne', 'समजणे', 'samajṇe', 'to understand', { pos: 'verb', note: 'dative frame: मला समजतं' }),
    v('v_kharedi', 'खरेदी करणे', 'kharedī karaṇe', 'to shop, to buy', { pos: 'verb' }),
    v('v_jevan', 'जेवण', 'jevaṇ', 'a meal, food', { g: 'n', obl: 'जेवणा', concept: 'food' }),
  ],

  sentences: [
    s('mr-l2-1', ['मी', 'घरात', 'आहे'], 'mī gharāt āhe', 'I am in the house.', { skills: ['locative'], note: 'घर → घरा- → घरात. Hindi writes this as two words (घर में); Marathi fuses it into one.' }),
    s('mr-l2-2', ['तो', 'शाळेत', 'जातो'], 'to śāḷet jāto', 'He goes to school.', { skills: ['locative', 'oblique'], note: 'शाळा → शाळे- → शाळेत. Feminine -आ nouns shift to -ए before any suffix.' }),
    s('mr-l2-3', ['हे', 'पुस्तक', 'मुलाचं', 'आहे'], 'he pustak mulācã āhe', "This book is the boy's.", { skills: ['genitive'], note: 'मुलाचं is neuter to agree with पुस्तक, the thing POSSESSED, not with the boy.' }),
    s('mr-l2-4', ['मी', 'उद्या', 'पुण्याला', 'जाईन'], 'mī udyā puṇyālā jāīn', 'I will go to Pune tomorrow.', { skills: ['future', 'dative'], note: 'पुणे → पुण्या- → पुण्याला. -ला marks a destination as well as a recipient.' }),
    s('mr-l2-5', ['ती', 'काल', 'आली'], 'tī kāl ālī', 'She came yesterday.', { skills: ['past-intrans'], note: 'आली is feminine because the subject is. With intransitive verbs the past agrees with the subject; at L3 that changes.' }),
    s('mr-l2-6', ['मी', 'घरातून', 'निघालो'], 'mī gharātūn nighālo', 'I left the house.', { skills: ['ablative', 'past-intrans'], note: '-तून means "out of". निघालो is masculine; a woman says निघाले.' }),
    s('mr-l2-7', ['आम्ही', 'बसने', 'गेलो'], 'āmhī basne gelo', 'We went by bus.', { skills: ['instrumental', 'past-intrans'], note: '-ने marks the means. The same ending becomes the ergative marker at L3, which is not a coincidence.' }),
    s('mr-l2-8', ['तो', 'माझ्या', 'मित्राशी', 'बोलतो'], 'to mājhyā mitrāśī bolto', 'He talks with my friend.', { skills: ['sociative'], note: '-शी means "with" in the sense of interacting. Note माझ्या, the oblique form of माझा.' }),
    s('mr-l2-9', ['पुस्तक', 'टेबलावर', 'आहे'], 'pustak ṭebalāvar āhe', 'The book is on the table.', { skills: ['locative'], note: 'टेबल → टेबला- → टेबलावर.' }),
    s('mr-l2-10', ['मी', 'जेवण', 'करत', 'आहे'], 'mī jevaṇ karat āhe', 'I am making food.', { skills: ['continuous'], note: 'stem + त + आहे. The continuous does NOT mark gender, which makes it a relief after the present habitual.' }),
    s('mr-l2-11', ['आज', 'पाऊस', 'पडत', 'आहे'], 'āj pāūs paḍat āhe', 'It is raining today.', { skills: ['continuous'], note: 'Rain "falls" in Marathi, as in most Indian languages.' }),
    s('mr-l2-12', ['दुकान', 'घराजवळ', 'आहे'], 'dukān gharājavaḷ āhe', 'The shop is near the house.', { skills: ['position'], note: 'Position words attach to the oblique just like case suffixes: घरा + जवळ.' }),
    s('mr-l2-13', ['मला', 'उशीर', 'झाला'], 'malā uśīr jhālā', 'I am late.', { skills: ['experiencer', 'past'], note: 'Literally "lateness happened to me". झाला is masculine to agree with उशीर.' }),
    s('mr-l2-14', ['तुम्ही', 'कुठे', 'राहता'], 'tumhī kuṭhe rāhtā', 'Where do you live?', { skills: ['present', 'polite'] }),
    s('mr-l2-15', ['हे', 'खूप', 'महाग', 'आहे'], 'he khūp mahāg āhe', 'This is very expensive.', { skills: ['copula'] }),
    s('mr-l2-16', ['मी', 'दोन', 'वर्षं', 'इथे', 'आहे'], 'mī don varṣã ithe āhe', 'I have been here two years.', { skills: ['plural'], note: 'वर्ष → वर्षं in the plural. Neuter nouns pluralise with -ं.' }),
    s('mr-l2-17', ['उद्या', 'सोमवार', 'आहे'], 'udyā somvār āhe', 'Tomorrow is Monday.', { skills: ['copula'] }),
    s('mr-l2-18', ['तो', 'ऑफिसमध्ये', 'काम', 'करतो'], 'to ŏphismadhye kām karto', 'He works in the office.', { skills: ['locative'], note: '-मध्ये is the long form of -त and is preferred with borrowed words, where -त sounds odd.' }),
    s('mr-l2-19', ['मला', 'मराठी', 'समजतं'], 'malā marāṭhī samajtã', 'I understand Marathi.', { skills: ['experiencer'], note: 'Understanding uses the dative frame, like liking and knowing.' }),
    s('mr-l2-20', ['आम्ही', 'संध्याकाळी', 'भेटू'], 'āmhī sandhyākāḷī bheṭū', 'We will meet in the evening.', { skills: ['future', 'temporal'], note: 'संध्याकाळ → संध्याकाळी. The oblique alone, with no suffix, marks "at that time".' }),
  ],

  grammar: [
    g('l2-g1', 'THE GATE: the oblique stem comes before every suffix',
      'A Marathi noun has two shapes. The direct form is what you look up in a dictionary. The oblique form is what every case suffix and position word attaches to, and it is almost never printed anywhere. Learn both together from now on or you will build hundreds of words you cannot use in a sentence.',
      [
        ex('घर → घरा-', 'ghar → gharā-', 'house', 'neuter consonant-final: add -आ'),
        ex('पुस्तक → पुस्तका-', 'pustak → pustakā-', 'book', 'same pattern'),
        ex('मुलगा → मुलग्या-', 'mulgā → mulgyā-', 'boy', 'masculine -आ: becomes -या'),
        ex('रस्ता → रस्त्या-', 'rastā → rastyā-', 'road', 'same pattern'),
        ex('मुलगी → मुली-', 'mulgī → mulī-', 'girl', 'feminine -ई: shortens'),
        ex('शाळा → शाळे-', 'śāḷā → śāḷe-', 'school', 'feminine -आ: becomes -ए'),
      ]),
    g('l2-g2', 'The case suffixes',
      'Seven endings cover almost everything English does with prepositions. They all attach to the oblique stem. The genitive -चा is special: it agrees in gender with the thing possessed, not the possessor, which catches everyone out.',
      [
        ex('घराला', 'gharālā', 'to the house', '-ला: recipient or destination'),
        ex('घरात', 'gharāt', 'in the house', '-त: location'),
        ex('घरावर', 'gharāvar', 'on the house', '-वर: on top of'),
        ex('घरातून', 'gharātūn', 'out of the house', '-तून: motion out of'),
        ex('घराहून', 'gharāhūn', 'from the house', '-हून: origin or comparison'),
        ex('घराने', 'gharāne', 'by means of the house', '-ने: instrument'),
        ex('घराशी', 'gharāśī', 'with the house', '-शी: association'),
        ex('घराचा / घराची / घराचं', 'gharācā / gharācī / gharācã', 'of the house', '-चा: agrees with what is possessed'),
      ]),
    g('l2-g3', 'Past tense, intransitive: the verb agrees with the subject',
      'For verbs with no object (जाणे, येणे, बसणे, निघणे) the past behaves the way you expect: it agrees with whoever did it. Enjoy this while it lasts. At L3 transitive verbs stop doing this and the whole alignment flips.',
      [
        ex('मी गेलो / गेले', 'mī gelo / gele', 'I went (m / f)'),
        ex('तू गेलास / गेलीस', 'tū gelās / gelīs', 'you went (m / f)'),
        ex('तो गेला', 'to gelā', 'he went'),
        ex('ती गेली', 'tī gelī', 'she went'),
        ex('ते गेलं', 'te gelã', 'it went'),
        ex('आम्ही गेलो', 'āmhī gelo', 'we went'),
        ex('तुम्ही गेलात', 'tumhī gelāt', 'you went (polite)'),
        ex('ते गेले', 'te gele', 'they went'),
      ]),
    g('l2-g4', 'Future tense, and the one tense that ignores gender',
      'The future marks person but not gender, and so does the present continuous. Both are a rest from the present habitual, where a man and a woman say different things to describe the same action.',
      [
        ex('मी जाईन', 'mī jāīn', 'I will go', 'same for a man or a woman'),
        ex('तू जाशील', 'tū jāśīl', 'you will go'),
        ex('तो / ती जाईल', 'to / tī jāīl', 'he / she will go'),
        ex('आम्ही जाऊ', 'āmhī jāū', 'we will go'),
        ex('तुम्ही जाल', 'tumhī jāl', 'you will go (polite)'),
        ex('ते जातील', 'te jātīl', 'they will go'),
        ex('मी जात आहे', 'mī jāt āhe', 'I am going', 'continuous: stem + त + असणे'),
      ]),
    g('l2-g5', 'The bare oblique means "at that time"',
      'With time words, the oblique form on its own, with no suffix at all, does the work of English "in" or "on". This is compact and extremely common, and learners who do not notice it keep adding a redundant -त.',
      [
        ex('सकाळी', 'sakāḷī', 'in the morning', 'from सकाळ'),
        ex('दुपारी', 'dupārī', 'in the afternoon', 'from दुपार'),
        ex('संध्याकाळी', 'sandhyākāḷī', 'in the evening', 'from संध्याकाळ'),
        ex('रात्री', 'rātrī', 'at night', 'from रात्र'),
        ex('सोमवारी', 'somvārī', 'on Monday', 'from सोमवार'),
      ]),
  ],
}
