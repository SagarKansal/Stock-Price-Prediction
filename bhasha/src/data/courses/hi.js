import { w, s, g } from './_helpers.js'

export default {
  code: 'hi',
  // Provenance is a first-class field. Nothing in this repo has been checked by
  // a native-speaker reviewer, and a language app that hides that fact is
  // worse than one with fewer languages. See CONTENT.md.
  review: 'draft',
  lexicon: {
    hello: w('नमस्ते','namaste'), thanks: w('धन्यवाद','dhanyavād'), please: w('कृपया','kṛpayā'),
    sorry: w('माफ़ कीजिए','māf kījie'), yes: w('हाँ','hā̃'), no: w('नहीं','nahī̃'),
    goodbye: w('अलविदा','alvidā'), welcome: w('स्वागत','svāgat'), how_are_you: w('आप कैसे हैं','āp kaise haĩ'),

    i: w('मैं','maĩ'), you: w('तुम','tum'), you_formal: w('आप','āp'), he_she: w('वह','vah'),
    we: w('हम','ham'), they: w('वे','ve'), man: w('आदमी','ādmī',{ g:'m' }), woman: w('औरत','aurat',{ g:'f' }),
    boy: w('लड़का','laṛkā',{ g:'m' }), girl: w('लड़की','laṛkī',{ g:'f' }), friend: w('दोस्त','dost',{ g:'m' }),
    mother: w('माँ','mā̃',{ g:'f' }), father: w('पिता','pitā',{ g:'m' }), brother: w('भाई','bhāī',{ g:'m' }),
    sister: w('बहन','bahan',{ g:'f' }), child: w('बच्चा','baccā',{ g:'m' }), name: w('नाम','nām',{ g:'m' }),
    teacher: w('शिक्षक','śikṣak',{ g:'m' }),

    water: w('पानी','pānī',{ g:'m' }), tea: w('चाय','cāy',{ g:'f' }), milk: w('दूध','dūdh',{ g:'m' }),
    rice: w('चावल','cāval',{ g:'m' }), bread: w('रोटी','roṭī',{ g:'f' }), food: w('खाना','khānā',{ g:'m' }),
    salt: w('नमक','namak',{ g:'m' }), sugar: w('चीनी','cīnī',{ g:'f' }), fruit: w('फल','phal',{ g:'m' }),
    mango: w('आम','ām',{ g:'m' }), vegetable: w('सब्ज़ी','sabzī',{ g:'f' }), tasty: w('स्वादिष्ट','svādiṣṭ'),
    hungry: w('भूखा','bhūkhā'), thirsty: w('प्यासा','pyāsā'),

    one: w('एक','ek'), two: w('दो','do'), three: w('तीन','tīn'), four: w('चार','cār'), five: w('पाँच','pā̃c'),
    six: w('छह','chah'), seven: w('सात','sāt'), eight: w('आठ','āṭh'), nine: w('नौ','nau'), ten: w('दस','das'),
    money: w('पैसा','paisā',{ g:'m' }), price: w('दाम','dām',{ g:'m' }), how_much: w('कितना','kitnā'),

    house: w('घर','ghar',{ g:'m' }), city: w('शहर','śahar',{ g:'m' }), village: w('गाँव','gā̃v',{ g:'m' }),
    road: w('सड़क','saṛak',{ g:'f' }), station: w('स्टेशन','sṭeśan',{ g:'m' }), market: w('बाज़ार','bāzār',{ g:'m' }),
    shop: w('दुकान','dukān',{ g:'f' }), school: w('स्कूल','skūl',{ g:'m' }), hospital: w('अस्पताल','aspatāl',{ g:'m' }),
    here: w('यहाँ','yahā̃'), there: w('वहाँ','vahā̃'), where: w('कहाँ','kahā̃'),
    left: w('बाएँ','bāẽ'), right_dir: w('दाएँ','dāẽ'), straight: w('सीधा','sīdhā'),

    today: w('आज','āj'), tomorrow: w('कल','kal',{ note:'also means yesterday' }),
    yesterday: w('कल','kal',{ note:'also means tomorrow' }), morning: w('सुबह','subah',{ g:'f' }),
    evening: w('शाम','śām',{ g:'f' }), night: w('रात','rāt',{ g:'f' }), now: w('अब','ab'),
    day: w('दिन','din',{ g:'m' }), time: w('समय','samay',{ g:'m' }), week: w('हफ़्ता','haftā',{ g:'m' }),

    to_go: w('जाना','jānā'), to_come: w('आना','ānā'), to_eat: w('खाना','khānā'), to_drink: w('पीना','pīnā'),
    to_do: w('करना','karnā'), to_see: w('देखना','dekhnā'), to_speak: w('बोलना','bolnā'), to_know: w('जानना','jānnā'),
    to_want: w('चाहना','cāhnā'), to_give: w('देना','denā'), to_take: w('लेना','lenā'), to_sleep: w('सोना','sonā'),
    to_sit: w('बैठना','baiṭhnā'), to_read: w('पढ़ना','paṛhnā'), to_work: w('काम करना','kām karnā'), to_learn: w('सीखना','sīkhnā'),

    good: w('अच्छा','acchā'), bad: w('बुरा','burā'), big: w('बड़ा','baṛā'), small: w('छोटा','choṭā'),
    hot: w('गरम','garam'), cold: w('ठंडा','ṭhaṇḍā'), new: w('नया','nayā'), old: w('पुराना','purānā'),
    beautiful: w('सुंदर','sundar'), what: w('क्या','kyā'), who: w('कौन','kaun'), why: w('क्यों','kyõ'),
    how: w('कैसे','kaise'), very: w('बहुत','bahut'), more: w('ज़्यादा','zyādā'), and: w('और','aur'),
    also: w('भी','bhī'), not: w('नहीं','nahī̃'),
  },
  sentences: [
    s('hi-1',['यह','क्या','है'],'yah kyā hai',[null,'what',null],'What is this?','greet','है (hai) is "is". Hindi has no word for "a" or "the".'),
    s('hi-2',['मेरा','नाम','राहुल','है'],'merā nām rāhul hai',[null,'name',null,null],'My name is Rahul.','people','मेरा agrees with नाम, which is masculine. For a feminine noun it becomes मेरी.'),
    s('hi-3',['आप','कैसे','हैं'],'āp kaise haĩ',['you_formal','how',null],'How are you?','greet','आप is the polite "you" and always takes plural verb forms, even for one person.'),
    s('hi-4',['मुझे','पानी','चाहिए'],'mujhe pānī cāhiye',['i','water','to_want'],'I want water.','food','Wanting uses the dative: literally "to-me water is-wanted". मैं becomes मुझे.'),
    s('hi-5',['मैं','बाज़ार','जा','रहा','हूँ'],'maĩ bāzār jā rahā hū̃',['i','market','to_go',null,null],'I am going to the market.','places','रहा हूँ is the present continuous. A woman says जा रही हूँ.'),
    s('hi-6',['चाय','बहुत','गरम','है'],'cāy bahut garam hai',['tea','very','hot',null],'The tea is very hot.','food','Adjective before noun, verb at the very end. That order almost never changes.'),
    s('hi-7',['स्टेशन','कहाँ','है'],'sṭeśan kahā̃ hai',['station','where',null],'Where is the station?','places','Question words sit right before the verb, not at the front like in English.'),
    s('hi-8',['यह','कितने','का','है'],'yah kitne kā hai',[null,'how_much',null,null],'How much is this?','numbers','का is a postposition: Hindi puts these AFTER the noun, never before.'),
    s('hi-9',['मुझे','हिंदी','नहीं','आती'],'mujhe hindī nahī̃ ātī',['i',null,'not',null],"I don't know Hindi.",'verbs','Knowing a language literally "comes to" you: मुझे हिंदी आती है.'),
    s('hi-10',['वह','मेरा','दोस्त','है'],'vah merā dost hai',['he_she',null,'friend',null],'He is my friend.','people','वह covers both "he" and "she". Gender shows up in the verb and adjectives instead.'),
    s('hi-11',['खाना','बहुत','स्वादिष्ट','है'],'khānā bahut svādiṣṭ hai',['food','very','tasty',null],'The food is very tasty.','food','खाना is both the noun "food" and the verb "to eat". Context does the work.'),
    s('hi-12',['मैं','कल','आऊँगा'],'maĩ kal āū̃gā',['i','tomorrow','to_come'],'I will come tomorrow.','time','कल means yesterday AND tomorrow. The verb tense tells you which.'),
    s('hi-13',['आपका','घर','कहाँ','है'],'āpkā ghar kahā̃ hai',[null,'house','where',null],'Where is your house?','places','आपका is the polite "your", agreeing with the masculine घर.'),
    s('hi-14',['मुझे','भूख','लगी','है'],'mujhe bhūkh lagī hai',['i','hungry',null,null],'I am hungry.','food','Hunger "attaches to" you in Hindi. Same pattern for thirst, cold, fear.'),
    s('hi-15',['कृपया','धीरे','बोलिए'],'kṛpayā dhīre boliye',['please',null,'to_speak'],'Please speak slowly.','verbs','बोलिए is the polite imperative, formed from the stem बोल.'),
    s('hi-16',['फिर','मिलेंगे'],'phir milenge',[null,null],'See you again.','greet','The everyday goodbye. अलविदा is dramatic and rarely used in speech.'),
  ],
  grammar: [
    g('greet','Word order is the first hurdle','Hindi is SOV: the verb goes last. "I eat rice" is "मैं चावल खाता हूँ" (I rice eat-am). Every sentence you build in this course drills that.'),
    g('people','Three levels of "you"','तू (intimate or rude), तुम (friendly), आप (respectful). Choosing wrong is the single most common way a foreign learner sounds off. When in doubt, use आप.'),
    g('food','Nouns have gender and it is not optional','Every noun is masculine or feminine, and adjectives and verbs bend to match. पानी is masculine, चाय is feminine. Learn the gender with the word, not later.'),
    g('places','Postpositions, not prepositions','English says "in the house", Hindi says "घर में" (house in). The marker always follows the noun, and the noun shifts to its oblique form before it.'),
    g('verbs','Dative subjects','A whole class of experiences (wanting, hunger, knowing a language, liking) do not use "I" as the subject. They use मुझे ("to me"). Fighting this pattern is why learners plateau.'),
  ],
}
