// Language-neutral concept hub.
//
// This file is the hinge of the whole content architecture. A concept is an id
// like `water` with no language attached. Every course pack (src/data/courses/*)
// maps concept ids -> target-language words. Every source language supplies a
// gloss for the same ids here.
//
// Result: adding one target language adds one file; adding one source language
// adds one column. Course *pairs* are generated, never authored. N + M, not N x M.
//
// SOURCE_LANGS below are the world languages glossed here. Indian languages are
// additionally usable as source languages for free, because their course packs
// are already keyed by these same ids (see engine/pairing.js).

export const UNITS = [
  { id: 'greet',    order: 1, icon: '\u{1F44B}' },
  { id: 'people',   order: 2, icon: '\u{1F468}‍\u{1F469}‍\u{1F466}' },
  { id: 'food',     order: 3, icon: '\u{1F35B}' },
  { id: 'numbers',  order: 4, icon: '\u{1F522}' },
  { id: 'places',   order: 5, icon: '\u{1F5FA}' },
  { id: 'time',     order: 6, icon: '\u{1F553}' },
  { id: 'verbs',    order: 7, icon: '\u{1F3C3}' },
  { id: 'describe', order: 8, icon: '\u{1F3A8}' },
]

// World languages with authored glosses. `dir` marks right-to-left scripts.
export const SOURCE_LANGS = [
  { code: 'en', name: 'English',    native: 'English',    dir: 'ltr' },
  { code: 'es', name: 'Spanish',    native: 'Español',  dir: 'ltr' },
  { code: 'fr', name: 'French',     native: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German',     native: 'Deutsch',    dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Russian',    native: 'Русский', dir: 'ltr' },
  { code: 'ar', name: 'Arabic',     native: 'العربية', dir: 'rtl' },
  { code: 'zh', name: 'Chinese',    native: '中文',  dir: 'ltr' },
  { code: 'ja', name: 'Japanese',   native: '日本語', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr' },
]

const c = (id, unit, icon, g) => ({ id, unit, icon, gloss: g })

export const CONCEPTS = [
  // ---- greetings & courtesy ----
  c('hello','greet','\u{1F44B}',{en:'hello',es:'hola',fr:'bonjour',de:'hallo',pt:'olá',ru:'привет',ar:'مرحبا',zh:'你好',ja:'こんにちは',id:'halo'}),
  c('thanks','greet','\u{1F64F}',{en:'thank you',es:'gracias',fr:'merci',de:'danke',pt:'obrigado',ru:'спасибо',ar:'شكرا',zh:'谢谢',ja:'ありがとう',id:'terima kasih'}),
  c('please','greet','\u{1F91D}',{en:'please',es:'por favor',fr:"s'il vous plaît",de:'bitte',pt:'por favor',ru:'пожалуйста',ar:'من فضلك',zh:'请',ja:'お願いします',id:'tolong'}),
  c('sorry','greet','\u{1F605}',{en:'sorry',es:'perdón',fr:'pardon',de:'Entschuldigung',pt:'desculpe',ru:'извините',ar:'آسف',zh:'对不起',ja:'ごめんなさい',id:'maaf'}),
  c('yes','greet','✅',{en:'yes',es:'sí',fr:'oui',de:'ja',pt:'sim',ru:'да',ar:'نعم',zh:'是',ja:'はい',id:'ya'}),
  c('no','greet','❌',{en:'no',es:'no',fr:'non',de:'nein',pt:'não',ru:'нет',ar:'لا',zh:'不',ja:'いいえ',id:'tidak'}),
  c('goodbye','greet','\u{1F44B}',{en:'goodbye',es:'adiós',fr:'au revoir',de:'tschüss',pt:'tchau',ru:'до свидания',ar:'مع السلامة',zh:'再见',ja:'さようなら',id:'selamat tinggal'}),
  c('welcome','greet','\u{1F6AA}',{en:'welcome',es:'bienvenido',fr:'bienvenue',de:'willkommen',pt:'bem-vindo',ru:'добро пожаловать',ar:'أهلا وسهلا',zh:'欢迎',ja:'ようこそ',id:'selamat datang'}),
  c('how_are_you','greet','\u{1F642}',{en:'how are you?',es:'¿cómo estás?',fr:'comment ça va ?',de:"wie geht's?",pt:'como vai?',ru:'как дела?',ar:'كيف حالك؟',zh:'你好吗？',ja:'お元気ですか？',id:'apa kabar?'}),

  // ---- people & pronouns ----
  c('i','people','\u{1F9CD}',{en:'I',es:'yo',fr:'je',de:'ich',pt:'eu',ru:'я',ar:'أنا',zh:'我',ja:'私',id:'saya'}),
  c('you','people','\u{1F9D1}',{en:'you (informal)',es:'tú',fr:'tu',de:'du',pt:'você',ru:'ты',ar:'أنت',zh:'你',ja:'君',id:'kamu'}),
  c('you_formal','people','\u{1F454}',{en:'you (formal)',es:'usted',fr:'vous',de:'Sie',pt:'o senhor',ru:'вы',ar:'حضرتك',zh:'您',ja:'あなた',id:'Anda'}),
  c('he_she','people','\u{1F9D1}‍\u{1F91D}‍\u{1F9D1}',{en:'he / she',es:'él / ella',fr:'il / elle',de:'er / sie',pt:'ele / ela',ru:'он / она',ar:'هو / هي',zh:'他 / 她',ja:'彼 / 彼女',id:'dia'}),
  c('we','people','\u{1F46A}',{en:'we',es:'nosotros',fr:'nous',de:'wir',pt:'nós',ru:'мы',ar:'نحن',zh:'我们',ja:'私たち',id:'kami'}),
  c('they','people','\u{1F465}',{en:'they',es:'ellos',fr:'ils',de:'sie',pt:'eles',ru:'они',ar:'هم',zh:'他们',ja:'彼ら',id:'mereka'}),
  c('man','people','\u{1F468}',{en:'man',es:'hombre',fr:'homme',de:'Mann',pt:'homem',ru:'мужчина',ar:'رجل',zh:'男人',ja:'男の人',id:'laki-laki'}),
  c('woman','people','\u{1F469}',{en:'woman',es:'mujer',fr:'femme',de:'Frau',pt:'mulher',ru:'женщина',ar:'امرأة',zh:'女人',ja:'女の人',id:'perempuan'}),
  c('boy','people','\u{1F466}',{en:'boy',es:'niño',fr:'garçon',de:'Junge',pt:'menino',ru:'мальчик',ar:'ولد',zh:'男孩',ja:'男の子',id:'anak laki-laki'}),
  c('girl','people','\u{1F467}',{en:'girl',es:'niña',fr:'fille',de:'Mädchen',pt:'menina',ru:'девочка',ar:'بنت',zh:'女孩',ja:'女の子',id:'anak perempuan'}),
  c('friend','people','\u{1F91D}',{en:'friend',es:'amigo',fr:'ami',de:'Freund',pt:'amigo',ru:'друг',ar:'صديق',zh:'朋友',ja:'友達',id:'teman'}),
  c('mother','people','\u{1F469}‍\u{1F467}',{en:'mother',es:'madre',fr:'mère',de:'Mutter',pt:'mãe',ru:'мать',ar:'أم',zh:'母亲',ja:'母',id:'ibu'}),
  c('father','people','\u{1F468}‍\u{1F466}',{en:'father',es:'padre',fr:'père',de:'Vater',pt:'pai',ru:'отец',ar:'أب',zh:'父亲',ja:'父',id:'ayah'}),
  c('brother','people','\u{1F468}‍\u{1F91D}‍\u{1F468}',{en:'brother',es:'hermano',fr:'frère',de:'Bruder',pt:'irmão',ru:'брат',ar:'أخ',zh:'兄弟',ja:'兄弟',id:'saudara laki-laki'}),
  c('sister','people','\u{1F469}‍\u{1F91D}‍\u{1F469}',{en:'sister',es:'hermana',fr:'sœur',de:'Schwester',pt:'irmã',ru:'сестра',ar:'أخت',zh:'姐妹',ja:'姉妹',id:'saudara perempuan'}),
  c('child','people','\u{1F9D2}',{en:'child',es:'niño',fr:'enfant',de:'Kind',pt:'criança',ru:'ребёнок',ar:'طفل',zh:'孩子',ja:'子供',id:'anak'}),
  c('name','people','\u{1F4DB}',{en:'name',es:'nombre',fr:'nom',de:'Name',pt:'nome',ru:'имя',ar:'اسم',zh:'名字',ja:'名前',id:'nama'}),
  c('teacher','people','\u{1F9D1}‍\u{1F3EB}',{en:'teacher',es:'maestro',fr:'professeur',de:'Lehrer',pt:'professor',ru:'учитель',ar:'معلم',zh:'老师',ja:'先生',id:'guru'}),

  // ---- food & drink ----
  c('water','food','\u{1F4A7}',{en:'water',es:'agua',fr:'eau',de:'Wasser',pt:'água',ru:'вода',ar:'ماء',zh:'水',ja:'水',id:'air'}),
  c('tea','food','\u{1F375}',{en:'tea',es:'té',fr:'thé',de:'Tee',pt:'chá',ru:'чай',ar:'شاي',zh:'茶',ja:'お茶',id:'teh'}),
  c('milk','food','\u{1F95B}',{en:'milk',es:'leche',fr:'lait',de:'Milch',pt:'leite',ru:'молоко',ar:'حليب',zh:'牛奶',ja:'牛乳',id:'susu'}),
  c('rice','food','\u{1F35A}',{en:'rice',es:'arroz',fr:'riz',de:'Reis',pt:'arroz',ru:'рис',ar:'أرز',zh:'米饭',ja:'ご飯',id:'nasi'}),
  c('bread','food','\u{1FAD3}',{en:'bread / flatbread',es:'pan',fr:'pain',de:'Brot',pt:'pão',ru:'хлеб',ar:'خبز',zh:'面包',ja:'パン',id:'roti'}),
  c('food','food','\u{1F37D}',{en:'food',es:'comida',fr:'nourriture',de:'Essen',pt:'comida',ru:'еда',ar:'طعام',zh:'食物',ja:'食べ物',id:'makanan'}),
  c('salt','food','\u{1F9C2}',{en:'salt',es:'sal',fr:'sel',de:'Salz',pt:'sal',ru:'соль',ar:'ملح',zh:'盐',ja:'塩',id:'garam'}),
  c('sugar','food','\u{1F36C}',{en:'sugar',es:'azúcar',fr:'sucre',de:'Zucker',pt:'açúcar',ru:'сахар',ar:'سكر',zh:'糖',ja:'砂糖',id:'gula'}),
  c('fruit','food','\u{1F34E}',{en:'fruit',es:'fruta',fr:'fruit',de:'Obst',pt:'fruta',ru:'фрукт',ar:'فاكهة',zh:'水果',ja:'果物',id:'buah'}),
  c('mango','food','\u{1F96D}',{en:'mango',es:'mango',fr:'mangue',de:'Mango',pt:'manga',ru:'манго',ar:'مانجو',zh:'芒果',ja:'マンゴー',id:'mangga'}),
  c('vegetable','food','\u{1F955}',{en:'vegetable',es:'verdura',fr:'légume',de:'Gemüse',pt:'legume',ru:'овощ',ar:'خضار',zh:'蔬菜',ja:'野菜',id:'sayur'}),
  c('tasty','food','\u{1F60B}',{en:'tasty',es:'sabroso',fr:'délicieux',de:'lecker',pt:'gostoso',ru:'вкусный',ar:'لذيذ',zh:'好吃',ja:'おいしい',id:'enak'}),
  c('hungry','food','\u{1F35C}',{en:'hungry',es:'hambriento',fr:'affamé',de:'hungrig',pt:'com fome',ru:'голодный',ar:'جائع',zh:'饿',ja:'お腹がすいた',id:'lapar'}),
  c('thirsty','food','\u{1F964}',{en:'thirsty',es:'sediento',fr:'assoiffé',de:'durstig',pt:'com sede',ru:'хочет пить',ar:'عطشان',zh:'渴',ja:'喉が渇いた',id:'haus'}),

  // ---- numbers & money ----
  c('one','numbers','1️⃣',{en:'one',es:'uno',fr:'un',de:'eins',pt:'um',ru:'один',ar:'واحد',zh:'一',ja:'一',id:'satu'}),
  c('two','numbers','2️⃣',{en:'two',es:'dos',fr:'deux',de:'zwei',pt:'dois',ru:'два',ar:'اثنان',zh:'二',ja:'二',id:'dua'}),
  c('three','numbers','3️⃣',{en:'three',es:'tres',fr:'trois',de:'drei',pt:'três',ru:'три',ar:'ثلاثة',zh:'三',ja:'三',id:'tiga'}),
  c('four','numbers','4️⃣',{en:'four',es:'cuatro',fr:'quatre',de:'vier',pt:'quatro',ru:'четыре',ar:'أربعة',zh:'四',ja:'四',id:'empat'}),
  c('five','numbers','5️⃣',{en:'five',es:'cinco',fr:'cinq',de:'fünf',pt:'cinco',ru:'пять',ar:'خمسة',zh:'五',ja:'五',id:'lima'}),
  c('six','numbers','6️⃣',{en:'six',es:'seis',fr:'six',de:'sechs',pt:'seis',ru:'шесть',ar:'ستة',zh:'六',ja:'六',id:'enam'}),
  c('seven','numbers','7️⃣',{en:'seven',es:'siete',fr:'sept',de:'sieben',pt:'sete',ru:'семь',ar:'سبعة',zh:'七',ja:'七',id:'tujuh'}),
  c('eight','numbers','8️⃣',{en:'eight',es:'ocho',fr:'huit',de:'acht',pt:'oito',ru:'восемь',ar:'ثمانية',zh:'八',ja:'八',id:'delapan'}),
  c('nine','numbers','9️⃣',{en:'nine',es:'nueve',fr:'neuf',de:'neun',pt:'nove',ru:'девять',ar:'تسعة',zh:'九',ja:'九',id:'sembilan'}),
  c('ten','numbers','\u{1F51F}',{en:'ten',es:'diez',fr:'dix',de:'zehn',pt:'dez',ru:'десять',ar:'عشرة',zh:'十',ja:'十',id:'sepuluh'}),
  c('money','numbers','\u{1F4B0}',{en:'money',es:'dinero',fr:'argent',de:'Geld',pt:'dinheiro',ru:'деньги',ar:'مال',zh:'钱',ja:'お金',id:'uang'}),
  c('price','numbers','\u{1F3F7}',{en:'price',es:'precio',fr:'prix',de:'Preis',pt:'preço',ru:'цена',ar:'سعر',zh:'价格',ja:'値段',id:'harga'}),
  c('how_much','numbers','❓',{en:'how much / how many',es:'cuánto',fr:'combien',de:'wie viel',pt:'quanto',ru:'сколько',ar:'كم',zh:'多少',ja:'いくら',id:'berapa'}),

  // ---- places & directions ----
  c('house','places','\u{1F3E0}',{en:'house',es:'casa',fr:'maison',de:'Haus',pt:'casa',ru:'дом',ar:'بيت',zh:'房子',ja:'家',id:'rumah'}),
  c('city','places','\u{1F3D9}',{en:'city',es:'ciudad',fr:'ville',de:'Stadt',pt:'cidade',ru:'город',ar:'مدينة',zh:'城市',ja:'都市',id:'kota'}),
  c('village','places','\u{1F3D8}',{en:'village',es:'pueblo',fr:'village',de:'Dorf',pt:'aldeia',ru:'деревня',ar:'قرية',zh:'村庄',ja:'村',id:'desa'}),
  c('road','places','\u{1F6E3}',{en:'road',es:'camino',fr:'route',de:'Straße',pt:'estrada',ru:'дорога',ar:'طريق',zh:'路',ja:'道',id:'jalan'}),
  c('station','places','\u{1F689}',{en:'station',es:'estación',fr:'gare',de:'Bahnhof',pt:'estação',ru:'вокзал',ar:'محطة',zh:'车站',ja:'駅',id:'stasiun'}),
  c('market','places','\u{1F6D2}',{en:'market',es:'mercado',fr:'marché',de:'Markt',pt:'mercado',ru:'рынок',ar:'سوق',zh:'市场',ja:'市場',id:'pasar'}),
  c('shop','places','\u{1F3EA}',{en:'shop',es:'tienda',fr:'magasin',de:'Laden',pt:'loja',ru:'магазин',ar:'متجر',zh:'商店',ja:'店',id:'toko'}),
  c('school','places','\u{1F3EB}',{en:'school',es:'escuela',fr:'école',de:'Schule',pt:'escola',ru:'школа',ar:'مدرسة',zh:'学校',ja:'学校',id:'sekolah'}),
  c('hospital','places','\u{1F3E5}',{en:'hospital',es:'hospital',fr:'hôpital',de:'Krankenhaus',pt:'hospital',ru:'больница',ar:'مستشفى',zh:'医院',ja:'病院',id:'rumah sakit'}),
  c('here','places','\u{1F4CD}',{en:'here',es:'aquí',fr:'ici',de:'hier',pt:'aqui',ru:'здесь',ar:'هنا',zh:'这里',ja:'ここ',id:'di sini'}),
  c('there','places','\u{1F449}',{en:'there',es:'allí',fr:'là',de:'dort',pt:'ali',ru:'там',ar:'هناك',zh:'那里',ja:'そこ',id:'di sana'}),
  c('where','places','\u{1F5FA}',{en:'where',es:'dónde',fr:'où',de:'wo',pt:'onde',ru:'где',ar:'أين',zh:'哪里',ja:'どこ',id:'di mana'}),
  c('left','places','⬅️',{en:'left',es:'izquierda',fr:'gauche',de:'links',pt:'esquerda',ru:'налево',ar:'يسار',zh:'左',ja:'左',id:'kiri'}),
  c('right_dir','places','➡️',{en:'right (direction)',es:'derecha',fr:'droite',de:'rechts',pt:'direita',ru:'направо',ar:'يمين',zh:'右',ja:'右',id:'kanan'}),
  c('straight','places','⬆️',{en:'straight ahead',es:'recto',fr:'tout droit',de:'geradeaus',pt:'em frente',ru:'прямо',ar:'مستقيم',zh:'直走',ja:'まっすぐ',id:'lurus'}),

  // ---- time ----
  c('today','time','\u{1F4C5}',{en:'today',es:'hoy',fr:"aujourd'hui",de:'heute',pt:'hoje',ru:'сегодня',ar:'اليوم',zh:'今天',ja:'今日',id:'hari ini'}),
  c('tomorrow','time','➡️\u{1F4C5}',{en:'tomorrow',es:'mañana',fr:'demain',de:'morgen',pt:'amanhã',ru:'завтра',ar:'غدا',zh:'明天',ja:'明日',id:'besok'}),
  c('yesterday','time','⬅️\u{1F4C5}',{en:'yesterday',es:'ayer',fr:'hier',de:'gestern',pt:'ontem',ru:'вчера',ar:'أمس',zh:'昨天',ja:'昨日',id:'kemarin'}),
  c('morning','time','\u{1F305}',{en:'morning',es:'mañana',fr:'matin',de:'Morgen',pt:'manhã',ru:'утро',ar:'صباح',zh:'早上',ja:'朝',id:'pagi'}),
  c('evening','time','\u{1F307}',{en:'evening',es:'tarde',fr:'soir',de:'Abend',pt:'noitinha',ru:'вечер',ar:'مساء',zh:'晚上',ja:'夕方',id:'sore'}),
  c('night','time','\u{1F319}',{en:'night',es:'noche',fr:'nuit',de:'Nacht',pt:'noite',ru:'ночь',ar:'ليل',zh:'夜晚',ja:'夜',id:'malam'}),
  c('now','time','⏱',{en:'now',es:'ahora',fr:'maintenant',de:'jetzt',pt:'agora',ru:'сейчас',ar:'الآن',zh:'现在',ja:'今',id:'sekarang'}),
  c('day','time','☀️',{en:'day',es:'día',fr:'jour',de:'Tag',pt:'dia',ru:'день',ar:'يوم',zh:'天',ja:'日',id:'hari'}),
  c('time','time','⌛',{en:'time',es:'tiempo',fr:'temps',de:'Zeit',pt:'tempo',ru:'время',ar:'وقت',zh:'时间',ja:'時間',id:'waktu'}),
  c('week','time','\u{1F5D3}',{en:'week',es:'semana',fr:'semaine',de:'Woche',pt:'semana',ru:'неделя',ar:'أسبوع',zh:'星期',ja:'週',id:'minggu'}),

  // ---- verbs (citation / dictionary form) ----
  c('to_go','verbs','\u{1F6B6}',{en:'to go',es:'ir',fr:'aller',de:'gehen',pt:'ir',ru:'идти',ar:'يذهب',zh:'去',ja:'行く',id:'pergi'}),
  c('to_come','verbs','\u{1F44B}',{en:'to come',es:'venir',fr:'venir',de:'kommen',pt:'vir',ru:'приходить',ar:'يأتي',zh:'来',ja:'来る',id:'datang'}),
  c('to_eat','verbs','\u{1F374}',{en:'to eat',es:'comer',fr:'manger',de:'essen',pt:'comer',ru:'есть',ar:'يأكل',zh:'吃',ja:'食べる',id:'makan'}),
  c('to_drink','verbs','\u{1F945}',{en:'to drink',es:'beber',fr:'boire',de:'trinken',pt:'beber',ru:'пить',ar:'يشرب',zh:'喝',ja:'飲む',id:'minum'}),
  c('to_do','verbs','\u{1F6E0}',{en:'to do',es:'hacer',fr:'faire',de:'machen',pt:'fazer',ru:'делать',ar:'يفعل',zh:'做',ja:'する',id:'melakukan'}),
  c('to_see','verbs','\u{1F440}',{en:'to see',es:'ver',fr:'voir',de:'sehen',pt:'ver',ru:'видеть',ar:'يرى',zh:'看',ja:'見る',id:'melihat'}),
  c('to_speak','verbs','\u{1F5E3}',{en:'to speak',es:'hablar',fr:'parler',de:'sprechen',pt:'falar',ru:'говорить',ar:'يتكلم',zh:'说',ja:'話す',id:'berbicara'}),
  c('to_know','verbs','\u{1F9E0}',{en:'to know',es:'saber',fr:'savoir',de:'wissen',pt:'saber',ru:'знать',ar:'يعرف',zh:'知道',ja:'知る',id:'tahu'}),
  c('to_want','verbs','\u{1F91A}',{en:'to want',es:'querer',fr:'vouloir',de:'wollen',pt:'querer',ru:'хотеть',ar:'يريد',zh:'想要',ja:'欲しい',id:'ingin'}),
  c('to_give','verbs','\u{1F381}',{en:'to give',es:'dar',fr:'donner',de:'geben',pt:'dar',ru:'давать',ar:'يعطي',zh:'给',ja:'あげる',id:'memberi'}),
  c('to_take','verbs','\u{1F91B}',{en:'to take',es:'tomar',fr:'prendre',de:'nehmen',pt:'pegar',ru:'брать',ar:'يأخذ',zh:'拿',ja:'取る',id:'mengambil'}),
  c('to_sleep','verbs','\u{1F634}',{en:'to sleep',es:'dormir',fr:'dormir',de:'schlafen',pt:'dormir',ru:'спать',ar:'ينام',zh:'睡觉',ja:'寝る',id:'tidur'}),
  c('to_sit','verbs','\u{1FA91}',{en:'to sit',es:'sentarse',fr:"s'asseoir",de:'sitzen',pt:'sentar',ru:'сидеть',ar:'يجلس',zh:'坐',ja:'座る',id:'duduk'}),
  c('to_read','verbs','\u{1F4D6}',{en:'to read / to study',es:'leer',fr:'lire',de:'lesen',pt:'ler',ru:'читать',ar:'يقرأ',zh:'读',ja:'読む',id:'membaca'}),
  c('to_work','verbs','\u{1F4BC}',{en:'to work',es:'trabajar',fr:'travailler',de:'arbeiten',pt:'trabalhar',ru:'работать',ar:'يعمل',zh:'工作',ja:'働く',id:'bekerja'}),
  c('to_learn','verbs','\u{1F393}',{en:'to learn',es:'aprender',fr:'apprendre',de:'lernen',pt:'aprender',ru:'учиться',ar:'يتعلم',zh:'学习',ja:'学ぶ',id:'belajar'}),

  // ---- describing & question words ----
  c('good','describe','\u{1F44D}',{en:'good',es:'bueno',fr:'bon',de:'gut',pt:'bom',ru:'хороший',ar:'جيد',zh:'好',ja:'良い',id:'bagus'}),
  c('bad','describe','\u{1F44E}',{en:'bad',es:'malo',fr:'mauvais',de:'schlecht',pt:'ruim',ru:'плохой',ar:'سيء',zh:'坏',ja:'悪い',id:'buruk'}),
  c('big','describe','\u{1F418}',{en:'big',es:'grande',fr:'grand',de:'groß',pt:'grande',ru:'большой',ar:'كبير',zh:'大',ja:'大きい',id:'besar'}),
  c('small','describe','\u{1F41C}',{en:'small',es:'pequeño',fr:'petit',de:'klein',pt:'pequeno',ru:'маленький',ar:'صغير',zh:'小',ja:'小さい',id:'kecil'}),
  c('hot','describe','\u{1F525}',{en:'hot',es:'caliente',fr:'chaud',de:'heiß',pt:'quente',ru:'горячий',ar:'حار',zh:'热',ja:'暑い',id:'panas'}),
  c('cold','describe','❄️',{en:'cold',es:'frío',fr:'froid',de:'kalt',pt:'frio',ru:'холодный',ar:'بارد',zh:'冷',ja:'寒い',id:'dingin'}),
  c('new','describe','✨',{en:'new',es:'nuevo',fr:'nouveau',de:'neu',pt:'novo',ru:'новый',ar:'جديد',zh:'新',ja:'新しい',id:'baru'}),
  c('old','describe','\u{1F4DC}',{en:'old',es:'viejo',fr:'vieux',de:'alt',pt:'velho',ru:'старый',ar:'قديم',zh:'旧',ja:'古い',id:'lama'}),
  c('beautiful','describe','\u{1F338}',{en:'beautiful',es:'hermoso',fr:'beau',de:'schön',pt:'bonito',ru:'красивый',ar:'جميل',zh:'美丽',ja:'美しい',id:'cantik'}),
  c('what','describe','❓',{en:'what',es:'qué',fr:'quoi',de:'was',pt:'o que',ru:'что',ar:'ماذا',zh:'什么',ja:'何',id:'apa'}),
  c('who','describe','\u{1F464}',{en:'who',es:'quién',fr:'qui',de:'wer',pt:'quem',ru:'кто',ar:'من',zh:'谁',ja:'誰',id:'siapa'}),
  c('why','describe','\u{1F914}',{en:'why',es:'por qué',fr:'pourquoi',de:'warum',pt:'por que',ru:'почему',ar:'لماذا',zh:'为什么',ja:'なぜ',id:'mengapa'}),
  c('how','describe','\u{1F501}',{en:'how',es:'cómo',fr:'comment',de:'wie',pt:'como',ru:'как',ar:'كيف',zh:'怎么',ja:'どう',id:'bagaimana'}),
  c('very','describe','\u{1F4A5}',{en:'very',es:'muy',fr:'très',de:'sehr',pt:'muito',ru:'очень',ar:'جدا',zh:'很',ja:'とても',id:'sangat'}),
  c('more','describe','➕',{en:'more',es:'más',fr:'plus',de:'mehr',pt:'mais',ru:'больше',ar:'أكثر',zh:'更多',ja:'もっと',id:'lebih'}),
  c('and','describe','\u{1F517}',{en:'and',es:'y',fr:'et',de:'und',pt:'e',ru:'и',ar:'و',zh:'和',ja:'と',id:'dan'}),
  c('also','describe','\u{1F504}',{en:'also',es:'también',fr:'aussi',de:'auch',pt:'também',ru:'тоже',ar:'أيضا',zh:'也',ja:'も',id:'juga'}),
  c('not','describe','\u{1F6AB}',{en:'not',es:'no',fr:'ne pas',de:'nicht',pt:'não',ru:'не',ar:'لا',zh:'不',ja:'ない',id:'tidak'}),
]

export const CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((x) => [x.id, x]))

export const conceptsInUnit = (unit) => CONCEPTS.filter((x) => x.unit === unit)
