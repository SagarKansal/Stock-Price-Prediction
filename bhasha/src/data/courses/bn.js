import { w, s, g } from './_helpers.js'

export default {
  code: 'bn',
  review: 'draft',
  lexicon: {
    hello: w('নমস্কার','nômoshkar',{ note:'Hindu convention; আসসালামু আলাইকুম is the Muslim greeting' }),
    thanks: w('ধন্যবাদ','dhônnobad'), please: w('দয়া করে','dôya kôre'), sorry: w('দুঃখিত','duḥkhito'),
    yes: w('হ্যাঁ','hyã'), no: w('না','na'), goodbye: w('বিদায়','biday'), welcome: w('স্বাগতম','shagôtom'),
    how_are_you: w('কেমন আছেন','kemon achhen'),

    i: w('আমি','ami'), you: w('তুমি','tumi'), you_formal: w('আপনি','apni'), he_she: w('সে','she'),
    we: w('আমরা','amra'), they: w('তারা','tara'), man: w('পুরুষ','purush'), woman: w('নারী','nari'),
    boy: w('ছেলে','chhele'), girl: w('মেয়ে','meye'), friend: w('বন্ধু','bôndhu'), mother: w('মা','ma'),
    father: w('বাবা','baba'), brother: w('ভাই','bhai'), sister: w('বোন','bon'), child: w('শিশু','shishu'),
    name: w('নাম','nam'), teacher: w('শিক্ষক','shikkhôk'),

    water: w('জল','jôl',{ note:'পানি (pani) in Bangladesh' }), tea: w('চা','cha'), milk: w('দুধ','dudh'),
    rice: w('ভাত','bhat'), bread: w('রুটি','ruṭi'), food: w('খাবার','khabar'), salt: w('নুন','nun'),
    sugar: w('চিনি','cini'), fruit: w('ফল','phôl'), mango: w('আম','am'), vegetable: w('সবজি','shôbji'),
    tasty: w('সুস্বাদু','shushadu'), hungry: w('ক্ষুধার্ত','khudharto'), thirsty: w('তৃষ্ণার্ত','trishnarto'),

    one: w('এক','ek'), two: w('দুই','dui'), three: w('তিন','tin'), four: w('চার','car'), five: w('পাঁচ','pãc'),
    six: w('ছয়','chhôy'), seven: w('সাত','sat'), eight: w('আট','aṭ'), nine: w('নয়','nôy'), ten: w('দশ','dôsh'),
    money: w('টাকা','ṭaka'), price: w('দাম','dam'), how_much: w('কত','kôto'),

    house: w('বাড়ি','baṛi'), city: w('শহর','shôhor'), village: w('গ্রাম','gram'), road: w('রাস্তা','rasta'),
    station: w('স্টেশন','sṭeshôn'), market: w('বাজার','bajar'), shop: w('দোকান','dokan'), school: w('স্কুল','skul'),
    hospital: w('হাসপাতাল','haspatal'), here: w('এখানে','ekhane'), there: w('সেখানে','shekhane'),
    where: w('কোথায়','kothay'), left: w('বাঁ দিকে','bã dike'), right_dir: w('ডান দিকে','ḍan dike'), straight: w('সোজা','shoja'),

    today: w('আজ','aj'), tomorrow: w('আগামীকাল','agamikal'), yesterday: w('গতকাল','gôtokal'),
    morning: w('সকাল','shôkal'), evening: w('সন্ধ্যা','shôndhya'), night: w('রাত','rat'), now: w('এখন','ekhon'),
    day: w('দিন','din'), time: w('সময়','shômoy'), week: w('সপ্তাহ','shôptaho'),

    to_go: w('যাওয়া','jaoya'), to_come: w('আসা','asha'), to_eat: w('খাওয়া','khaoya'), to_drink: w('পান করা','pan kôra'),
    to_do: w('করা','kôra'), to_see: w('দেখা','dekha'), to_speak: w('বলা','bôla'), to_know: w('জানা','jana'),
    to_want: w('চাওয়া','caoya'), to_give: w('দেওয়া','deoya'), to_take: w('নেওয়া','neoya'), to_sleep: w('ঘুমানো','ghumano'),
    to_sit: w('বসা','bôsha'), to_read: w('পড়া','pôṛa'), to_work: w('কাজ করা','kaj kôra'), to_learn: w('শেখা','shekha'),

    good: w('ভালো','bhalo'), bad: w('খারাপ','kharap'), big: w('বড়','bôṛo'), small: w('ছোট','chhoṭo'),
    hot: w('গরম','gôrom'), cold: w('ঠান্ডা','ṭhanḍa'), new: w('নতুন','nôtun'), old: w('পুরনো','purono'),
    beautiful: w('সুন্দর','shundor'), what: w('কী','ki'), who: w('কে','ke'), why: w('কেন','keno'),
    how: w('কেমন','kemon'), very: w('খুব','khub'), more: w('বেশি','beshi'), and: w('এবং','ebông'),
    also: w('ও','o'), not: w('না','na'),
  },
  sentences: [
    s('bn-1',['এটা','কী'],'eṭa ki',[null,'what'],'What is this?','greet','No verb. Bengali has no present-tense "is" in this pattern at all.'),
    s('bn-2',['আমার','নাম','রাহুল'],'amar nam rahul',[null,'name',null],'My name is Rahul.','people','Literally "my name Rahul". Adding a copula here would be wrong, not just optional.'),
    s('bn-3',['আপনি','কেমন','আছেন'],'apni kemon achhen',['you_formal','how',null],'How are you?','greet','আছেন is the আপনি form. তুমি takes আছো, তুই takes আছিস. The verb, not a pronoun, carries the politeness.'),
    s('bn-4',['আমার','জল','চাই'],'amar jôl cai',[null,'water','to_want'],'I want water.','food','Literally "my water is-wanted". In Bangladesh you would say পানি, not জল.'),
    s('bn-5',['আমি','বাজারে','যাচ্ছি'],'ami bajare jacchi',['i','market','to_go'],'I am going to the market.','places','বাজারে = বাজার + -এ, the locative ending.'),
    s('bn-6',['চা','খুব','গরম'],'cha khub gôrom',['tea','very','hot'],'The tea is very hot.','food','Again no copula. This is the single biggest structural difference from Hindi.'),
    s('bn-7',['স্টেশন','কোথায়'],'sṭeshôn kothay',['station','where'],'Where is the station?','places','Question word last, no verb.'),
    s('bn-8',['এটার','দাম','কত'],'eṭar dam kôto',[null,'price','how_much'],'How much does this cost?','numbers','Literally "of-this price how-much".'),
    s('bn-9',['আমি','বাংলা','জানি','না'],'ami bangla jani na',['i',null,'to_know','not'],"I don't know Bengali.",'verbs','না goes AFTER the verb in Bengali, unlike Hindi where नहीं goes before.'),
    s('bn-10',['সে','আমার','বন্ধু'],'she amar bôndhu',['he_she',null,'friend'],'He is my friend.','people','সে is he, she and they-singular. Bengali has no grammatical gender whatsoever.'),
    s('bn-11',['খাবার','খুব','সুস্বাদু'],'khabar khub shushadu',['food','very','tasty'],'The food is very tasty.','food','Adjectives never inflect, because there is no gender to agree with.'),
    s('bn-12',['আমি','আগামীকাল','আসব'],'ami agamikal ashbo',['i','tomorrow','to_come'],'I will come tomorrow.','time','আসব is the first-person future. Bengali verbs conjugate for person, never for gender.'),
    s('bn-13',['আপনার','বাড়ি','কোথায়'],'apnar baṛi kothay',[null,'house','where'],'Where is your house?','places','আপনার is the polite "your", from আপনি.'),
    s('bn-14',['আমার','খিদে','পেয়েছে'],'amar khide peyechhe',[null,'hungry',null],'I am hungry.','food','Literally "my hunger has arrived".'),
    s('bn-15',['দয়া','করে','আস্তে','বলুন'],'dôya kôre aste bôlun',['please','to_do',null,'to_speak'],'Please speak slowly.','verbs','বলুন is the আপনি imperative.'),
    s('bn-16',['আবার','দেখা','হবে'],'abar dekha hôbe',[null,'to_see',null],'See you again.','greet','Literally "a meeting will happen". The standard everyday goodbye.'),
  ],
  grammar: [
    g('greet','The missing "is"','Bengali has no present-tense copula in equational sentences. "The tea is hot" is just চা গরম. Learners from Hindi keep inserting a verb that does not belong.'),
    g('people','No gender, at all','No masculine or feminine nouns, no gendered adjectives, no gendered verb forms, and one pronoun সে for he and she. This makes Bengali dramatically easier than Hindi in one specific way.'),
    g('people','Politeness lives in the verb','তুই / তুমি / আপনি each take a different verb ending. You do not add a polite word, you conjugate differently. Choose আপনি with strangers until invited otherwise.'),
    g('food','The inherent vowel is ô, not a','ক is "kô", not "ka". Every Devanagari reader gets this wrong for the first week. And শ ষ স are all pronounced /ʃ/.'),
    g('verbs','Negation follows the verb','জানি না, not না জানি. This is the reverse of Hindi and of most Indo-Aryan neighbours.'),
  ],
}
