import { w, s, g } from './_helpers.js'

// Urdu is written right to left. Every `tokens` array below is in LOGICAL
// order (first spoken word first); the browser's bidi algorithm handles the
// visual reversal, so never pre-reverse these arrays.
export default {
  code: 'ur',
  review: 'draft',
  dir: 'rtl',
  lexicon: {
    hello: w('السلام علیکم','as-salāmu alaikum'), thanks: w('شکریہ','shukriya'), please: w('براہ کرم','barāh-e-karam'),
    sorry: w('معاف کیجیے','muāf kījiye'), yes: w('جی ہاں','jī hā̃'), no: w('نہیں','nahī̃'),
    goodbye: w('خدا حافظ','khudā hāfiz'), welcome: w('خوش آمدید','khush āmdīd'),
    how_are_you: w('آپ کیسے ہیں','āp kaise haĩ'),

    i: w('میں','maĩ'), you: w('تم','tum'), you_formal: w('آپ','āp'), he_she: w('وہ','vo'),
    we: w('ہم','ham'), they: w('وہ','vo'),
    man: w('آدمی','ādmī',{ g:'m' }), woman: w('عورت','aurat',{ g:'f' }), boy: w('لڑکا','laṛkā',{ g:'m' }),
    girl: w('لڑکی','laṛkī',{ g:'f' }), friend: w('دوست','dost',{ g:'m' }), mother: w('ماں','mā̃',{ g:'f' }),
    father: w('والد','vālid',{ g:'m' }), brother: w('بھائی','bhāī',{ g:'m' }), sister: w('بہن','bahan',{ g:'f' }),
    child: w('بچہ','baccā',{ g:'m' }), name: w('نام','nām',{ g:'m' }), teacher: w('استاد','ustād',{ g:'m' }),

    water: w('پانی','pānī',{ g:'m' }), tea: w('چائے','cāy',{ g:'f' }), milk: w('دودھ','dūdh',{ g:'m' }),
    rice: w('چاول','cāval',{ g:'m' }), bread: w('روٹی','roṭī',{ g:'f' }), food: w('کھانا','khānā',{ g:'m' }),
    salt: w('نمک','namak',{ g:'m' }), sugar: w('چینی','cīnī',{ g:'f' }), fruit: w('پھل','phal',{ g:'m' }),
    mango: w('آم','ām',{ g:'m' }), vegetable: w('سبزی','sabzī',{ g:'f' }), tasty: w('مزیدار','mazedār'),
    hungry: w('بھوکا','bhūkā'), thirsty: w('پیاسا','pyāsā'),

    one: w('ایک','ek'), two: w('دو','do'), three: w('تین','tīn'), four: w('چار','cār'), five: w('پانچ','pā̃c'),
    six: w('چھ','chhe'), seven: w('سات','sāt'), eight: w('آٹھ','āṭh'), nine: w('نو','nau'), ten: w('دس','das'),
    money: w('پیسہ','paisā',{ g:'m' }), price: w('قیمت','qīmat',{ g:'f' }), how_much: w('کتنا','kitnā'),

    house: w('گھر','ghar',{ g:'m' }), city: w('شہر','shahar',{ g:'m' }), village: w('گاؤں','gā̃v',{ g:'m' }),
    road: w('سڑک','saṛak',{ g:'f' }), station: w('اسٹیشن','isṭeshan',{ g:'m' }), market: w('بازار','bāzār',{ g:'m' }),
    shop: w('دکان','dukān',{ g:'f' }), school: w('اسکول','iskūl',{ g:'m' }), hospital: w('ہسپتال','haspatāl',{ g:'m' }),
    here: w('یہاں','yahā̃'), there: w('وہاں','vahā̃'), where: w('کہاں','kahā̃'),
    left: w('بائیں','bāyẽ'), right_dir: w('دائیں','dāyẽ'), straight: w('سیدھا','sīdhā'),

    today: w('آج','āj'), tomorrow: w('کل','kal',{ note:'also means yesterday' }),
    yesterday: w('کل','kal',{ note:'also means tomorrow' }), morning: w('صبح','subah',{ g:'f' }),
    evening: w('شام','shām',{ g:'f' }), night: w('رات','rāt',{ g:'f' }), now: w('اب','ab'),
    day: w('دن','din',{ g:'m' }), time: w('وقت','vaqt',{ g:'m' }), week: w('ہفتہ','hafta',{ g:'m' }),

    to_go: w('جانا','jānā'), to_come: w('آنا','ānā'), to_eat: w('کھانا','khānā'), to_drink: w('پینا','pīnā'),
    to_do: w('کرنا','karnā'), to_see: w('دیکھنا','dekhnā'), to_speak: w('بولنا','bolnā'), to_know: w('جاننا','jānnā'),
    to_want: w('چاہنا','cāhnā'), to_give: w('دینا','denā'), to_take: w('لینا','lenā'), to_sleep: w('سونا','sonā'),
    to_sit: w('بیٹھنا','baiṭhnā'), to_read: w('پڑھنا','paṛhnā'), to_work: w('کام کرنا','kām karnā'),
    to_learn: w('سیکھنا','sīkhnā'),

    good: w('اچھا','acchā'), bad: w('برا','burā'), big: w('بڑا','baṛā'), small: w('چھوٹا','chhoṭā'),
    hot: w('گرم','garam'), cold: w('ٹھنڈا','ṭhaṇḍā'), new: w('نیا','nayā'), old: w('پرانا','purānā'),
    beautiful: w('خوبصورت','khūbsūrat'), what: w('کیا','kyā'), who: w('کون','kaun'), why: w('کیوں','kyõ'),
    how: w('کیسے','kaise'), very: w('بہت','bahut'), more: w('زیادہ','zyādā'), and: w('اور','aur'),
    also: w('بھی','bhī'), not: w('نہیں','nahī̃'),
  },
  sentences: [
    s('ur-1',['یہ','کیا','ہے'],'ye kyā hai',[null,'what',null],'What is this?','greet','Identical grammar to Hindi यह क्या है, written the other way round.'),
    s('ur-2',['میرا','نام','راہول','ہے'],'merā nām rāhul hai',[null,'name',null,null],'My name is Rahul.','people','میرا agrees with the masculine نام.'),
    s('ur-3',['آپ','کیسے','ہیں'],'āp kaise haĩ',['you_formal','how',null],'How are you?','greet','آپ always takes plural verb forms.'),
    s('ur-4',['مجھے','پانی','چاہیے'],'mujhe pānī cāhiye',['i','water','to_want'],'I want water.','food','Dative subject: "to me water is wanted".'),
    s('ur-5',['میں','بازار','جا','رہا','ہوں'],'maĩ bāzār jā rahā hū̃',['i','market','to_go',null,null],'I am going to the market.','places','رہا ہوں is the present continuous, masculine.'),
    s('ur-6',['چائے','بہت','گرم','ہے'],'cāy bahut garam hai',['tea','very','hot',null],'The tea is very hot.','food','Adjective before noun, verb last, exactly as in Hindi.'),
    s('ur-7',['اسٹیشن','کہاں','ہے'],'isṭeshan kahā̃ hai',['station','where',null],'Where is the station?','places','Urdu adds a vowel before initial consonant clusters: station becomes اسٹیشن.'),
    s('ur-8',['اس','کی','قیمت','کتنی','ہے'],'is kī qīmat kitnī hai',[null,null,'price','how_much',null],'How much does this cost?','numbers','کی is feminine to agree with قیمت, and کتنی follows suit.'),
    s('ur-9',['مجھے','اردو','نہیں','آتی'],'mujhe urdū nahī̃ ātī',['i',null,'not',null],"I don't know Urdu.",'verbs','A language comes to you. آتی is feminine because اردو is feminine.'),
    s('ur-10',['وہ','میرا','دوست','ہے'],'vo merā dost hai',['he_she',null,'friend',null],'He is my friend.','people','وہ covers he, she and they.'),
    s('ur-11',['کھانا','بہت','مزیدار','ہے'],'khānā bahut mazedār hai',['food','very','tasty',null],'The food is very tasty.','food','مزیدار is a Persian-derived word where Hindi would use स्वादिष्ट from Sanskrit. This is where the two languages actually diverge.'),
    s('ur-12',['میں','کل','آؤں','گا'],'maĩ kal āū̃ gā',['i','tomorrow','to_come',null],'I will come tomorrow.','time','گا is written separately in Urdu but joined in Hindi (आऊँगा). Same word.'),
    s('ur-13',['آپ','کا','گھر','کہاں','ہے'],'āp kā ghar kahā̃ hai',['you_formal',null,'house','where',null],'Where is your house?','places','آپ کا is two words in Urdu, where Hindi writes आपका as one.'),
    s('ur-14',['مجھے','بھوک','لگی','ہے'],'mujhe bhūk lagī hai',['i','hungry',null,null],'I am hungry.','food','Hunger attaches to you, in the dative.'),
    s('ur-15',['براہ','کرم','آہستہ','بولیں'],'barāh-e-karam āhista bolẽ',['please',null,null,'to_speak'],'Please speak slowly.','verbs','بولیں is the آپ imperative.'),
    s('ur-16',['پھر','ملیں','گے'],'phir milẽ ge',[null,null,null],'See you again.','greet','The everyday goodbye. خدا حافظ is used for longer partings.'),
  ],
  grammar: [
    g('greet','Urdu and Hindi are one spoken language','At the everyday level the grammar is identical and most vocabulary is shared. They diverge in the script and in formal register: Urdu reaches for Persian and Arabic, Hindi for Sanskrit. If you speak Hindi, this course is a reading course, and vice versa.'),
    g('greet','Right to left, and short vowels are not written','کتاب is written k-t-a-b; the reader supplies "kitāb" from knowing the word. You cannot sound out an unknown word the way you can in Devanagari. Reading Urdu therefore lags speaking Urdu by a long way, and that is normal.'),
    g('people','Every letter has four shapes','Isolated, initial, medial and final. ب looks like بـ, ـبـ and ـب depending on position. This is the real work of learning the script, and ScriptLab drills the shapes rather than just the letter names.'),
    g('food','Aspiration is written with do chashmi he','ب + ھ = بھ (bh), گ + ھ = گھ (gh). One extra letter covers the whole aspirated series that Devanagari gives separate letters to.'),
    g('verbs','Dative subjects, exactly as in Hindi','مجھے for wanting, hunger, knowing a language. Nothing new here if you have done the Hindi course; the pattern transfers whole.'),
  ],
}
