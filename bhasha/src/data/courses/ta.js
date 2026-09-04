import { w, s, g } from './_helpers.js'

export default {
  code: 'ta',
  review: 'draft',
  // Tamil is diglossic: செந்தமிழ் (written) and கொடுந்தமிழ் (spoken) differ enough
  // that a course in one leaves you stranded in the other. This pack teaches the
  // written standard, which is what signage, news and formal speech use, and
  // flags the spoken form where it diverges sharply.
  register: 'written standard',
  lexicon: {
    hello: w('வணக்கம்','vaṇakkam'), thanks: w('நன்றி','naṉṟi'), please: w('தயவுசெய்து','tayavuseydu'),
    sorry: w('மன்னிக்கவும்','maṉṉikkavum'), yes: w('ஆம்','ām'), no: w('இல்லை','illai'),
    goodbye: w('போய் வருகிறேன்','pōy varugiṟēṉ',{ note:'literally "I go and come" - saying only "I go" is unlucky' }),
    welcome: w('வரவேற்பு','varavēṟpu'), how_are_you: w('எப்படி இருக்கிறீர்கள்','eppaḍi irukkiṟīrgaḷ'),

    i: w('நான்','nāṉ'), you: w('நீ','nī'), you_formal: w('நீங்கள்','nīṅgaḷ'),
    he_she: w('அவர்','avar',{ note:'polite, either gender; அவன் he, அவள் she are the plain forms' }),
    we: w('நாங்கள்','nāṅgaḷ',{ note:'exclusive; நாம் nām includes the listener' }), they: w('அவர்கள்','avargaḷ'),
    man: w('ஆண்','āṇ'), woman: w('பெண்','peṇ'), boy: w('பையன்','paiyaṉ'), girl: w('சிறுமி','siṟumi'),
    friend: w('நண்பர்','naṇbar'), mother: w('அம்மா','ammā'), father: w('அப்பா','appā'),
    brother: w('அண்ணன்','aṇṇaṉ',{ note:'elder brother; தம்பி tambi is younger' }),
    sister: w('அக்கா','akkā',{ note:'elder sister; தங்கை taṅgai is younger' }),
    child: w('குழந்தை','kuḻandai'), name: w('பெயர்','peyar'), teacher: w('ஆசிரியர்','āsiriyar'),

    water: w('தண்ணீர்','taṇṇīr'), tea: w('தேநீர்','tēnīr'), milk: w('பால்','pāl'),
    rice: w('அரிசி','arisi',{ note:'uncooked; சாதம் sādam once cooked' }), bread: w('ரொட்டி','roṭṭi'),
    food: w('உணவு','uṇavu'), salt: w('உப்பு','uppu'), sugar: w('சர்க்கரை','sarkkarai'),
    fruit: w('பழம்','paḻam'), mango: w('மாம்பழம்','māmbaḻam'), vegetable: w('காய்கறி','kāygaṟi'),
    tasty: w('சுவையான','suvaiyāṉa'), hungry: w('பசி','pasi'), thirsty: w('தாகம்','tāgam'),

    one: w('ஒன்று','oṉṟu'), two: w('இரண்டு','iraṇḍu'), three: w('மூன்று','mūṉṟu'), four: w('நான்கு','nāṉgu'),
    five: w('ஐந்து','aindu'), six: w('ஆறு','āṟu'), seven: w('ஏழு','ēḻu'), eight: w('எட்டு','eṭṭu'),
    nine: w('ஒன்பது','oṉbadu'), ten: w('பத்து','pattu'),
    money: w('பணம்','paṇam'), price: w('விலை','vilai'), how_much: w('எவ்வளவு','evvaḷavu'),

    house: w('வீடு','vīḍu'), city: w('நகரம்','nagaram'), village: w('கிராமம்','kirāmam'),
    road: w('சாலை','sālai'), station: w('நிலையம்','nilaiyam'), market: w('சந்தை','sandai'),
    shop: w('கடை','kaḍai'), school: w('பள்ளி','paḷḷi'), hospital: w('மருத்துவமனை','maruttuvamaṉai'),
    here: w('இங்கே','iṅgē'), there: w('அங்கே','aṅgē'), where: w('எங்கே','eṅgē'),
    left: w('இடது','iḍadu'), right_dir: w('வலது','valadu'), straight: w('நேராக','nērāga'),

    today: w('இன்று','iṉṟu'), tomorrow: w('நாளை','nāḷai'), yesterday: w('நேற்று','nēṟṟu'),
    morning: w('காலை','kālai'), evening: w('மாலை','mālai'), night: w('இரவு','iravu'),
    now: w('இப்போது','ippōdu'), day: w('நாள்','nāḷ'), time: w('நேரம்','nēram'), week: w('வாரம்','vāram'),

    to_go: w('போக','pōga'), to_come: w('வர','vara'), to_eat: w('சாப்பிட','sāppiḍa'), to_drink: w('குடிக்க','kuḍikka'),
    to_do: w('செய்ய','seyya'), to_see: w('பார்க்க','pārkka'), to_speak: w('பேச','pēsa'), to_know: w('தெரிய','teriya'),
    to_want: w('வேண்டும்','vēṇḍum'), to_give: w('கொடுக்க','koḍukka'), to_take: w('எடுக்க','eḍukka'),
    to_sleep: w('தூங்க','tūṅga'), to_sit: w('உட்கார','uṭkāra'), to_read: w('படிக்க','paḍikka'),
    to_work: w('வேலை செய்ய','vēlai seyya'), to_learn: w('கற்க','kaṟka'),

    good: w('நல்ல','nalla'), bad: w('கெட்ட','keṭṭa'), big: w('பெரிய','periya'), small: w('சிறிய','siṟiya'),
    hot: w('சூடான','sūḍāṉa'), cold: w('குளிர்ந்த','kuḷirnda'), new: w('புதிய','pudiya'), old: w('பழைய','paḻaiya'),
    beautiful: w('அழகான','aḻagāṉa'), what: w('என்ன','eṉṉa'), who: w('யார்','yār'), why: w('ஏன்','ēṉ'),
    how: w('எப்படி','eppaḍi'), very: w('மிக','miga'), more: w('அதிக','adiga'), and: w('மற்றும்','maṭṟum'),
    also: w('கூட','kūḍa'), not: w('இல்லை','illai'),
  },
  sentences: [
    s('ta-1',['இது','என்ன'],'idu eṉṉa',[null,'what'],'What is this?','greet','No copula needed. இது is "this", அது is "that".'),
    s('ta-2',['என்','பெயர்','ராகுல்'],'eṉ peyar rāgul',[null,'name',null],'My name is Rahul.','people','என் is "my". Tamil equational sentences need no verb.'),
    s('ta-3',['நீங்கள்','எப்படி','இருக்கிறீர்கள்'],'nīṅgaḷ eppaḍi irukkiṟīrgaḷ',['you_formal','how',null],'How are you?','greet','இருக்கிறீர்கள் = இரு (be) + கிற (present) + ீர்கள் (you-plural). Suffixes stack in a fixed order.'),
    s('ta-4',['எனக்கு','தண்ணீர்','வேண்டும்'],'eṉakku taṇṇīr vēṇḍum',['i','water','to_want'],'I want water.','food','எனக்கு is "to me", the dative. வேண்டும் is not conjugated for person.'),
    s('ta-5',['நான்','கடைக்கு','போகிறேன்'],'nāṉ kaḍaikku pōgiṟēṉ',['i','shop','to_go'],'I am going to the shop.','places','கடைக்கு = கடை + கு, the dative "to". Tamil glues, it does not use separate words.'),
    s('ta-6',['தேநீர்','மிக','சூடாக','இருக்கிறது'],'tēnīr miga sūḍāga irukkiṟadu',['tea','very','hot',null],'The tea is very hot.','food','சூடான becomes சூடாக before a verb: adjective to adverb.'),
    s('ta-7',['நிலையம்','எங்கே','இருக்கிறது'],'nilaiyam eṅgē irukkiṟadu',['station','where',null],'Where is the station?','places','இருக்கிறது is the "it" form. Tamil verbs agree with person, number AND gender.'),
    s('ta-8',['இதன்','விலை','என்ன'],'idaṉ vilai eṉṉa',[null,'price','what'],'What does this cost?','numbers','இதன் is the genitive of இது: "of this".'),
    s('ta-9',['எனக்கு','தமிழ்','தெரியாது'],'eṉakku tamiḻ teriyādu',['i',null,'to_know'],"I don't know Tamil.",'verbs','தெரியாது is a single negative verb form. Tamil negates inside the verb, not with a separate word.'),
    s('ta-10',['அவர்','என்','நண்பர்'],'avar eṉ naṇbar',['he_she',null,'friend'],'He is my friend.','people','அவர் is the respectful third person for either gender, and the safe default for adults.'),
    s('ta-11',['உணவு','மிக','சுவையாக','இருக்கிறது'],'uṇavu miga suvaiyāga irukkiṟadu',['food','very','tasty',null],'The food is very tasty.','food','Same adjective-to-adverb shift as sentence 6.'),
    s('ta-12',['நான்','நாளை','வருவேன்'],'nāṉ nāḷai varuvēṉ',['i','tomorrow','to_come'],'I will come tomorrow.','time','வருவேன் = வா (come) + வ (future) + ஏன் (I).'),
    s('ta-13',['உங்கள்','வீடு','எங்கே'],'uṅgaḷ vīḍu eṅgē',[null,'house','where'],'Where is your house?','places','உங்கள் is the polite "your", from நீங்கள்.'),
    s('ta-14',['எனக்கு','பசிக்கிறது'],'eṉakku pasikkiṟadu',['i','hungry'],'I am hungry.','food','Hunger is a verb happening TO you, in the dative. Two words carry the whole sentence.'),
    s('ta-15',['தயவுசெய்து','மெதுவாக','பேசுங்கள்'],'tayavuseydu meduvāga pēsuṅgaḷ',['please',null,'to_speak'],'Please speak slowly.','verbs','பேசுங்கள் is the polite plural imperative.'),
    s('ta-16',['மீண்டும்','சந்திப்போம்'],'mīṇḍum sandippōm',[null,null],'See you again.','greet','Literally "we will meet again".'),
  ],
  grammar: [
    g('greet','One letter, several sounds','க is read k at the start of a word, g between vowels, and h in some positions. Tamil writes the phoneme and lets position decide the sound, which is why its alphabet is half the size of Devanagari.'),
    g('people','Written Tamil is not spoken Tamil','This course teaches the written standard. In Chennai, நான் போகிறேன் comes out as நான் போறேன். Expect a second learning curve when you first hear real speech; that gap is a feature of the language, not a gap in this course.'),
    g('food','Agglutination: suffixes stack','வீட்டிற்கு = வீடு + இற் + கு = "to the house". Instead of separate prepositions, Tamil bolts endings onto the noun in a fixed order. Long words are normal.'),
    g('places','Dative for wanting and needing','எனக்கு (to me) is the subject of wanting, hunger, knowing and liking. Tamil, Hindi and Telugu all share this pattern despite being from different families.'),
    g('verbs','Negation is built into the verb','English adds "not"; Tamil changes the verb: தெரியும் (I know) becomes தெரியாது (I do not know). There is no floating negative particle to move around.'),
  ],
}
