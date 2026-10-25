import { v, s, g, ex } from './_h.js'

// C1. Register, idiom, proverb, and regional variation.
//
// Everything below this level makes you correct. This level makes you sound
// like a person. It is also the level that is almost never taught, because it
// resists the vocabulary-list format: an idiom learned as a gloss is useless,
// and register is a choice rather than a fact.

export default {
  id: 'l5',
  vocab: [
    // --- वाक्प्रचार: idioms. `en` is the meaning; `note` is the literal sense. ---
    v('i_nakane', 'नाकाने कांदे सोलणे', 'nākāne kānde solṇe', 'to be insufferably arrogant', { kind: 'idiom', note: 'literally "to peel onions with your nose"' }),
    v('i_dokyavar', 'डोक्यावर बसणे', 'ḍokyāvar basṇe', 'to take advantage of someone\'s leniency', { kind: 'idiom', note: 'literally "to sit on someone\'s head"' }),
    v('i_panipajne', 'पाणी पाजणे', 'pāṇī pājṇe', 'to defeat someone soundly', { kind: 'idiom', note: 'literally "to make someone drink water"' }),
    v('i_nakinau', 'नाकी नऊ येणे', 'nākī naū yeṇe', 'to be run utterly ragged', { kind: 'idiom', note: 'literally "nine come to the nose"' }),
    v('i_tondatbot', 'तोंडात बोट घालणे', 'tõḍāt boṭ ghālṇe', 'to be astonished', { kind: 'idiom', note: 'literally "to put a finger in your mouth"' }),
    v('i_hatpay', 'हातपाय गाळणे', 'hātpāy gāḷṇe', 'to lose heart, to give up', { kind: 'idiom', note: 'literally "to drop your hands and feet"' }),
    v('i_akash', 'आकाश ठेंगणे होणे', 'ākāś ṭheṅgaṇe hoṇe', 'to be overjoyed', { kind: 'idiom', note: 'literally "for the sky to become short"' }),
    v('i_kanughadne', 'कान उघडणे', 'kān ughaḍṇe', 'to warn someone sternly', { kind: 'idiom', note: 'literally "to open someone\'s ears"' }),
    v('i_tilpapad', 'अंगाचा तिळपापड होणे', 'aṅgācā tiḷpāpaḍ hoṇe', 'to be incandescent with rage', { kind: 'idiom', note: 'literally "for the body to become a sesame wafer"' }),
    v('i_dolyattel', 'डोळ्यांत तेल घालून बघणे', 'ḍoḷyānt tel ghālūn baghṇe', 'to watch with total vigilance', { kind: 'idiom', note: 'literally "to watch with oil poured in the eyes"' }),
    v('i_tonddene', 'तोंड देणे', 'tõḍ deṇe', 'to face up to something', { kind: 'idiom' }),
    v('i_galyatil', 'गळ्यातला ताईत', 'gaḷyātlā tāīt', "someone's favourite, a pet", { kind: 'idiom', note: 'literally "the amulet round the neck"' }),
    v('i_potatkavle', 'पोटात कावळे ओरडणे', 'poṭāt kāvḷe oraḍṇe', 'to be ravenously hungry', { kind: 'idiom', note: 'literally "for crows to caw in your stomach"' }),
    v('i_hatdene', 'हात देणे', 'hāt deṇe', 'to lend a hand', { kind: 'idiom' }),
    v('i_dolalagne', 'डोळा लागणे', 'ḍoḷā lāgṇe', 'to doze off', { kind: 'idiom', note: 'literally "for the eye to attach"' }),

    // --- म्हणी: proverbs ---
    v('p_shite', 'असतील शिते तर जमतील भुते', 'astīl śite tar jamtīl bhute', 'people gather where there is something to gain', { kind: 'proverb', note: 'literally "if there are grains, ghosts will gather"' }),
    v('p_nachta', 'नाचता येईना अंगण वाकडे', 'nāctā yeīnā aṅgaṇ vākaḍe', 'a bad workman blames his tools', { kind: 'proverb', note: 'literally "can\'t dance, says the courtyard is crooked"' }),
    v('p_uthal', 'उथळ पाण्याला खळखळाट फार', 'uthaḷ pāṇyālā khaḷkhaḷāṭ phār', 'empty vessels make the most noise', { kind: 'proverb', note: 'literally "shallow water makes much noise"' }),
    v('p_durun', 'दुरून डोंगर साजरे', 'durūn ḍoṅgar sājare', 'the grass is greener on the other side', { kind: 'proverb', note: 'literally "hills are lovely from a distance"' }),
    v('p_gadhav', 'गाढवाला गुळाची चव काय', 'gāḍhvālā guḷācī cav kāy', 'pearls before swine', { kind: 'proverb', note: 'literally "what does a donkey know of the taste of jaggery"' }),
    v('p_ati', 'अति तेथे माती', 'ati tethe mātī', 'excess of anything ruins it', { kind: 'proverb', note: 'literally "where there is excess, there is dirt"' }),
    v('p_potoba', 'आधी पोटोबा मग विठोबा', 'ādhī poṭobā mag viṭhobā', 'first things first', { kind: 'proverb', note: 'literally "first the stomach-god, then Vithoba"; a very Maharashtrian joke' }),
    v('p_chardivas', 'चार दिवस सासूचे चार दिवस सुनेचे', 'cār divas sāsūce cār divas sunece', "everyone's turn comes eventually", { kind: 'proverb', note: 'literally "four days for the mother-in-law, four for the daughter-in-law"' }),

    // --- register pairs: Sanskritised written form / everyday spoken form ---
    v('reg_sthanak', 'स्थानक', 'sthānak', 'station (formal)', { kind: 'register', note: 'everyday: स्टेशन. You will see स्थानक on signs and hear स्टेशन from every human.' }),
    v('reg_durdhvani', 'दूरध्वनी', 'dūrdhvanī', 'telephone (formal)', { kind: 'register', note: 'everyday: फोन' }),
    v('reg_sanganak', 'संगणक', 'saṅgaṇak', 'computer (formal)', { kind: 'register', note: 'everyday: कॉम्प्युटर' }),
    v('reg_mahavidyalaya', 'महाविद्यालय', 'mahāvidyālaya', 'college (formal)', { kind: 'register', note: 'everyday: कॉलेज' }),
    v('reg_rugnalaya', 'रुग्णालय', 'rugṇālaya', 'hospital (formal)', { kind: 'register', note: 'everyday: हॉस्पिटल, दवाखाना' }),
    v('reg_chitrapat', 'चित्रपट', 'citrapaṭ', 'film (formal)', { kind: 'register', note: 'everyday: सिनेमा, पिक्चर' }),
    v('reg_upahargruha', 'उपाहारगृह', 'upāhārgṛha', 'restaurant (formal)', { kind: 'register', note: 'everyday: हॉटेल' }),
    v('reg_kramank', 'क्रमांक', 'kramāṅk', 'number (formal)', { kind: 'register', note: 'everyday: नंबर' }),

    // --- particles: the grammar of sounding human ---
    v('part_re', 'रे', 're', 'hey (to a male, informal)', { kind: 'particle', note: 'अरे at the start of a sentence. Using it to a stranger or an elder is rude.' }),
    v('part_ga', 'गं', 'gã', 'hey (to a female, informal)', { kind: 'particle', note: 'अगं at the start' }),
    v('part_ho', 'हो', 'ho', 'polite sentence-final particle', { kind: 'particle', note: 'या हो = do come, respectfully' }),
    v('part_na', 'ना', 'nā', 'tag question; softener', { kind: 'particle', note: 'जाऊया ना? = shall we go then?' }),
    v('part_ch', 'च', 'c', 'emphatic: exactly, only, precisely', { kind: 'particle', note: 'attaches to the word it emphasises: मीच = I myself, आत्ताच = just now, तेच = that very one' }),
    v('part_tar', 'तर', 'tar', 'then; as for', { kind: 'particle' }),
    v('part_bara', 'बरं', 'barã', 'alright, okay then', { kind: 'particle' }),

    // --- regional varieties ---
    v('d_puneri', 'पुणेरी', 'puṇerī', 'the Pune variety', { kind: 'dialect', note: 'closest to the written standard, and famous for पुणेरी पाट्या: notice boards whose politeness is a weapon' }),
    v('d_varhadi', 'वऱ्हाडी', 'varhāḍī', 'the Vidarbha variety', { kind: 'dialect', note: 'eastern Maharashtra; uses काहून for का, and different verb endings' }),
    v('d_malvani', 'मालवणी', 'mālvaṇī', 'the Konkan coast variety', { kind: 'dialect', note: 'so distinct that some treat it as a separate language; close to Konkani' }),
    v('d_ahirani', 'अहिराणी', 'ahirāṇī', 'the Khandesh variety', { kind: 'dialect', note: 'northern Maharashtra, around Jalgaon and Dhule' }),
    v('d_kolhapuri', 'कोल्हापुरी', 'kolhāpurī', 'the Kolhapur variety', { kind: 'dialect', note: 'southern, with a characteristically assertive intonation' }),
    v('d_praman', 'प्रमाण मराठी', 'pramāṇ marāṭhī', 'standard Marathi', { kind: 'dialect', note: 'what this course teaches; based on the Pune variety, and nobody\'s first dialect except in Pune' }),

    // --- C1 vocabulary ---
    v('c_dhoran', 'धोरण', 'dhoraṇ', 'policy', { g: 'n', obl: 'धोरणा' }),
    v('c_prabhav', 'प्रभाव', 'prabhāv', 'influence', { g: 'm', obl: 'प्रभावा' }),
    v('c_drushtikon', 'दृष्टिकोन', 'dṛṣṭikon', 'point of view', { g: 'm', obl: 'दृष्टिकोना' }),
    v('c_parampara', 'परंपरा', 'paramparā', 'tradition', { g: 'f', obl: 'परंपरे' }),
    v('c_sanskruti', 'संस्कृती', 'saṁskṛtī', 'culture', { g: 'f' }),
    v('c_jaanivs', 'जाणीव', 'jāṇīv', 'awareness', { g: 'f' }),
    v('c_abhimaan', 'अभिमान', 'abhimān', 'pride', { g: 'm', obl: 'अभिमाना' }),
    v('c_savyay', 'सवय', 'savay', 'habit', { g: 'f', obl: 'सवयी' }),
  ],

  sentences: [
    s('mr-l5-1', ['तो', 'नाकाने', 'कांदे', 'सोलतो'], 'to nākāne kānde solto', 'He is insufferably full of himself.', { skills: ['idiom'], note: 'Translating this word by word gets you onions. Idioms have to be stored whole.' }),
    s('mr-l5-2', ['तू', 'डोक्यावर', 'बसू', 'नकोस'], 'tū ḍokyāvar basū nakos', "Don't push your luck with me.", { skills: ['idiom', 'prohibition'] }),
    s('mr-l5-3', ['त्यांनी', 'आम्हाला', 'पाणी', 'पाजलं'], 'tyānnī āmhālā pāṇī pājlã', 'They thrashed us.', { skills: ['idiom', 'ergative'], note: 'A sports result, not hospitality. The ergative machinery from L3 still runs underneath the idiom.' }),
    s('mr-l5-4', ['मला', 'नाकी', 'नऊ', 'आले'], 'malā nākī naū āle', 'I was run completely ragged.', { skills: ['idiom', 'experiencer'] }),
    s('mr-l5-5', ['उथळ', 'पाण्याला', 'खळखळाट', 'फार'], 'uthaḷ pāṇyālā khaḷkhaḷāṭ phār', 'Empty vessels make the most noise.', { skills: ['proverb'], note: 'Proverbs keep an older grammar: no verb, and a dative पाण्याला where modern prose would use something else.' }),
    s('mr-l5-6', ['दुरून', 'डोंगर', 'साजरे'], 'durūn ḍoṅgar sājare', 'The grass is always greener elsewhere.', { skills: ['proverb'] }),
    s('mr-l5-7', ['आधी', 'पोटोबा', 'मग', 'विठोबा'], 'ādhī poṭobā mag viṭhobā', 'First things first.', { skills: ['proverb'], note: 'Vithoba is the presiding deity of Pandharpur. The joke of putting the stomach ahead of him is specifically Maharashtrian and lands instantly.' }),
    s('mr-l5-8', ['कृपया', 'आपले', 'नाव', 'सांगावे'], 'kṛpayā āple nāv sāṅgāve', 'Kindly state your name.', { skills: ['formal-register'], note: 'आपले instead of तुमचे, and the obligative सांगावे instead of सांगा. This is form-filling and public-announcement Marathi; say it to a friend and they will laugh.' }),
    s('mr-l5-9', ['काय', 'रे', 'कुठे', 'चाललास'], 'kāy re kuṭhe cāllās', 'Oi, where are you off to?', { skills: ['informal-register', 'particle'], note: 'रे marks a male addressee you are close to. To a woman it would be गं, to an elder neither.' }),
    s('mr-l5-10', ['अगं', 'ताई', 'इकडे', 'ये'], 'agã tāī ikaḍe ye', 'Hey, sis, come here.', { skills: ['informal-register', 'particle'] }),
    s('mr-l5-11', ['मीच', 'ते', 'केलं'], 'mīc te kelã', 'I was the one who did it.', { skills: ['emphatic'], note: 'The च clitic attaches to whatever it emphasises. मीच = I and nobody else. Moving it changes the meaning of the sentence entirely.' }),
    s('mr-l5-12', ['तो', 'आत्ताच', 'आला'], 'to āttāc ālā', 'He arrived just this moment.', { skills: ['emphatic'] }),
    s('mr-l5-13', ['चित्रपट', 'बघायला', 'जाऊया', 'ना'], 'citrapaṭ baghāylā jāūyā nā', "Let's go and see a film, shall we?", { skills: ['particle', 'hortative'], note: 'ना softens a proposal into an invitation. Without it, जाऊया is a decision rather than a suggestion.' }),
    s('mr-l5-14', ['ते', 'बघून', 'मी', 'तोंडात', 'बोट', 'घातलं'], 'te baghūn mī tõḍāt boṭ ghātlã', 'I was astonished when I saw it.', { skills: ['idiom', 'participle'] }),
    s('mr-l5-15', ['त्याने', 'लगेच', 'हातपाय', 'गाळले'], 'tyāne lagec hātpāy gāḷle', 'He gave up immediately.', { skills: ['idiom', 'ergative'] }),
    s('mr-l5-16', ['मला', 'त्याच्याशी', 'बोलायचंच', 'नाही'], 'malā tyācyāśī bolāyacãc nāhī', 'I simply do not want to talk to him.', { skills: ['emphatic', 'prospective'], note: 'The च is buried inside बोलायचं + च + नाही. Clitics attach inside words, not between them.' }),
    s('mr-l5-17', ['गावाकडे', 'असंच', 'बोलतात'], 'gāvākaḍe asãc bolatāt', 'That is exactly how they speak back home.', { skills: ['dialect', 'emphatic'], note: 'गावाकडे ("towards the village") is how Maharashtrians refer to their ancestral place, whatever its size.' }),
    s('mr-l5-18', ['मराठीचा', 'मला', 'अभिमान', 'आहे'], 'marāṭhīcā malā abhimān āhe', 'I am proud of Marathi.', { skills: ['formal-register', 'experiencer'] }),
  ],

  grammar: [
    g('l5-g1', 'THE GATE: register is a choice you make in every sentence',
      'Marathi runs two vocabularies in parallel. A Sanskritised layer appears on signage, in news bulletins, in official forms and in school textbooks. An everyday layer, heavily borrowed from Persian, Portuguese and English, is what people actually speak. Using the formal word in conversation sounds pompous; using the colloquial one on a form looks careless. Neither is more correct. Knowing which room you are in is the C1 skill.',
      [
        ex('स्थानक / स्टेशन', 'sthānak / sṭeśan', 'station', 'sign / speech'),
        ex('दूरध्वनी / फोन', 'dūrdhvanī / phon', 'telephone'),
        ex('महाविद्यालय / कॉलेज', 'mahāvidyālaya / kŏlej', 'college'),
        ex('उपाहारगृह / हॉटेल', 'upāhārgṛha / hŏṭel', 'restaurant'),
        ex('चित्रपट / पिक्चर', 'citrapaṭ / pikcar', 'film'),
        ex('आपले नाव सांगावे', 'āple nāv sāṅgāve', 'kindly state your name', 'form-filling register'),
        ex('तुझं नाव काय', 'tujhã nāv kāy', "what's your name", 'speech'),
      ]),
    g('l5-g2', 'The च clitic: the most Marathi thing in Marathi',
      'च attaches to a word and means "exactly that one, and not another". It fuses into the word rather than standing beside it, and moving it rewrites the sentence. English needs stress or a cleft construction to do the same job.',
      [
        ex('मीच केलं', 'mīc kelã', 'I did it (nobody else).'),
        ex('मी तेच केलं', 'mī tec kelã', 'I did exactly that (not something else).'),
        ex('मी आत्ताच केलं', 'mī āttāc kelã', 'I did it just now (not earlier).'),
        ex('तो आलाच नाही', 'to ālāc nāhī', 'He did not come at all.'),
        ex('एकच', 'ekac', 'only one'),
      ]),
    g('l5-g3', 'Address particles encode the whole relationship',
      'अरे / रे for a male you are close to, अगं / गं for a female you are close to, and neither for an elder or a stranger, where you use हो and the तुम्ही forms. Getting this wrong is not a grammar error, it is a social one, and it is noticed instantly.',
      [
        ex('अरे, कुठे चाललास?', 'are, kuṭhe cāllās?', 'Oi, where are you going?', 'to a close male friend'),
        ex('अगं, ऐक ना', 'agã, aik nā', 'Hey, listen', 'to a close female friend'),
        ex('काका, या हो', 'kākā, yā ho', 'Uncle, do come', 'respectful: हो plus the तुम्ही imperative'),
        ex('तुम्ही कसे आहात?', 'tumhī kase āhāt?', 'How are you?', 'the safe default with anyone new'),
      ]),
    g('l5-g4', 'Idioms must be stored whole, never decoded',
      'A learner who translates नाकाने कांदे सोलणे word by word arrives at onions and concludes the speaker is talking about cooking. Treat each of these as a single lexical item with an opaque meaning, exactly as you would treat "kick the bucket" in English. The literal reading is a mnemonic, not the meaning.',
      [
        ex('पाणी पाजणे', 'pāṇī pājṇe', 'to thrash someone', 'not hospitality'),
        ex('डोक्यावर बसणे', 'ḍokyāvar basṇe', 'to take advantage', 'not furniture'),
        ex('तोंडात बोट घालणे', 'tõḍāt boṭ ghālṇe', 'to be astonished', 'not a gesture'),
        ex('नाकी नऊ येणे', 'nākī naū yeṇe', 'to be exhausted', 'the nine is unexplained even to natives'),
      ]),
    g('l5-g5', 'What this course has NOT taught you',
      'Standard Marathi (प्रमाण मराठी) is based on the Pune variety, and it is nobody\'s home dialect outside Pune. A speaker from Nagpur, Kolhapur, Jalgaon or Malvan will understand you perfectly and will not sound like you. Expect a second adjustment the first time you are in Vidarbha or on the Konkan coast; that gap is a feature of the language, not a hole in your learning.',
      [
        ex('वऱ्हाडी: काहून?', 'varhāḍī: kāhūn?', 'why?', 'standard का'),
        ex('मालवणी', 'mālvaṇī', 'Konkan coast', 'so distinct that it is sometimes counted as a separate language'),
        ex('अहिराणी', 'ahirāṇī', 'Khandesh', 'Jalgaon, Dhule, Nandurbar'),
        ex('पुणेरी पाट्या', 'puṇerī pāṭyā', 'Pune notice boards', 'a genre of aggressively polite public signage, and a running Maharashtrian joke'),
      ]),
  ],
}
