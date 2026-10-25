import { v, s, g, ex } from './_h.js'

// B1. The ergative past.
//
// This is the level the whole ladder exists for. In the perfective past with a
// transitive verb, Marathi marks the subject with -ने and makes the verb agree
// with the OBJECT. Learners who never drill it produce fluent, confident,
// permanently wrong Marathi, and native speakers hear it instantly. It is also
// almost never taught explicitly, because textbooks introduce it as "the past
// tense" alongside the intransitive past and let learners assume one rule.

export default {
  id: 'l3',
  vocab: [
    // --- ergative subject forms: the forms the rule actually needs ---
    v('erg_tyane', 'त्याने', 'tyāne', 'he (ergative)', { note: 'the subject form of तो in the transitive past' }),
    v('erg_tine', 'तिने', 'tine', 'she (ergative)' ),
    v('erg_tyanni', 'त्यांनी', 'tyānnī', 'they (ergative)' ),
    v('erg_kone', 'कोणी', 'koṇī', 'who (ergative)', { note: 'कोणी काम केलं? = who did the work?' }),

    // --- vector verbs: the second half of a compound verb ---
    v('vec_takne', 'टाकणे', 'ṭākṇe', 'to throw; (as vector) to finish off', { pos: 'verb', note: 'खाऊन टाकणे = to eat up completely' }),
    v('vec_kadhne', 'काढणे', 'kāḍhṇe', 'to remove; (as vector) to get through', { pos: 'verb', note: 'वाचून काढणे = to read right through' }),
    v('vec_thevne', 'ठेवणे', 'ṭhevṇe', 'to place; (as vector) to do and keep done', { pos: 'verb', note: 'लिहून ठेवणे = to write down' }),
    v('vec_basne', 'बसणे', 'basṇe', 'to sit; (as vector) to do unfortunately', { pos: 'verb', concept: 'to_sit', note: 'विसरून बसणे = to go and forget' }),
    v('vec_jane_yene', 'जाऊन येणे', 'jāūn yeṇe', 'to go and come back', { pos: 'verb', note: 'Marathi avoids saying only "I am going"' }),

    // --- conjunct verb nouns: noun + करणे / होणे / येणे / वाटणे ---
    v('madat', 'मदत', 'madat', 'help', { g: 'f', note: 'मदत करणे = to help' }),
    v('athavan', 'आठवण', 'āṭhavaṇ', 'memory, missing someone', { g: 'f', note: 'आठवण येणे = to miss, to remember' }),
    v('rag', 'राग', 'rāg', 'anger', { g: 'm', note: 'राग येणे = to get angry' }),
    v('bhiti', 'भीती', 'bhītī', 'fear', { g: 'f', note: 'भीती वाटणे = to feel afraid' }),
    v('anand', 'आनंद', 'ānand', 'joy', { g: 'm', note: 'आनंद होणे = to be happy' }),
    v('tras', 'त्रास', 'trās', 'trouble, bother', { g: 'm', note: 'त्रास होणे = to be troubled' }),
    v('kalji', 'काळजी', 'kāḷjī', 'worry, care', { g: 'f', note: 'काळजी वाटणे = to worry; काळजी घेणे = to take care' }),
    v('ashcharya', 'आश्चर्य', 'āścarya', 'surprise', { g: 'n', note: 'आश्चर्य वाटणे = to be surprised' }),
    v('suru', 'सुरू', 'surū', 'started, on', { note: 'सुरू करणे = to start; सुरू होणे = to begin' }),
    v('band', 'बंद', 'band', 'closed, off', { note: 'बंद करणे = to close, to switch off' }),
    v('tayar', 'तयार', 'tayār', 'ready', { note: 'तयार होणे = to get ready' }),

    // --- relative-correlative pairs ---
    v('rel_jo', 'जो', 'jo', 'who, which (m)', { note: 'pairs with तो' }),
    v('rel_je', 'जे', 'je', 'which, what (n/pl)', { note: 'pairs with ते' }),
    v('rel_jevha', 'जेव्हा', 'jevhā', 'when', { note: 'pairs with तेव्हा' }),
    v('rel_tevha', 'तेव्हा', 'tevhā', 'then, at that time' ),
    v('rel_jithe', 'जिथे', 'jithe', 'where', { note: 'pairs with तिथे' }),
    v('rel_tithe', 'तिथे', 'tithe', 'there', { concept: 'there' }),
    v('rel_jasa', 'जसं', 'jasã', 'as, the way that', { note: 'pairs with तसं' }),
    v('rel_tasa', 'तसं', 'tasã', 'so, that way' ),
    v('rel_ki', 'की', 'kī', 'that (complementiser)', { note: 'मी म्हणालो की... = I said that...' }),

    // --- B1 nouns ---
    v('patra', 'पत्र', 'patra', 'letter', { g: 'n', obl: 'पत्रा' }),
    v('batmi', 'बातमी', 'bātmī', 'news item', { g: 'f', obl: 'बातमी' }),
    v('gosht', 'गोष्ट', 'goṣṭ', 'thing; story', { g: 'f', obl: 'गोष्टी' }),
    v('prashna', 'प्रश्न', 'praśna', 'question', { g: 'm', obl: 'प्रश्ना' }),
    v('uttar', 'उत्तर', 'uttar', 'answer; north', { g: 'n', obl: 'उत्तरा' }),
    v('karan', 'कारण', 'kāraṇ', 'reason; because', { g: 'n', obl: 'कारणा' }),
    v('artha', 'अर्थ', 'artha', 'meaning', { g: 'm', obl: 'अर्था' }),
    v('vichar', 'विचार', 'vicār', 'thought', { g: 'm', obl: 'विचारा', note: 'विचार करणे = to think' }),
    v('mat', 'मत', 'mat', 'opinion; vote', { g: 'n', obl: 'मता' }),
    v('anubhav', 'अनुभव', 'anubhav', 'experience', { g: 'm', obl: 'अनुभवा' }),
    v('ayushya', 'आयुष्य', 'āyuṣya', 'life', { g: 'n', obl: 'आयुष्या' }),
    v('svapna', 'स्वप्न', 'svapna', 'dream', { g: 'n', obl: 'स्वप्ना' }),
    v('ghatna', 'घटना', 'ghaṭnā', 'event, incident', { g: 'f', obl: 'घटने' }),
    v('ambha', 'आंबा', 'āmbā', 'mango', { g: 'm', obl: 'आंब्या', concept: 'mango' }),

    // --- B1 verbs ---
    v('v_tharavne', 'ठरवणे', 'ṭharavṇe', 'to decide', { pos: 'verb' }),
    v('v_samjavne', 'समजावणे', 'samjāvṇe', 'to explain', { pos: 'verb', note: 'the causative of समजणे' }),
    v('v_visarne', 'विसरणे', 'visarṇe', 'to forget', { pos: 'verb' }),
    v('v_athavne', 'आठवणे', 'āṭhavṇe', 'to come to mind', { pos: 'verb', note: 'dative frame: मला आठवलं' }),
    v('v_olakhne', 'ओळखणे', 'oḷakhṇe', 'to recognise, to know a person', { pos: 'verb' }),
    v('v_vatne', 'वाटणे', 'vāṭṇe', 'to feel, to seem', { pos: 'verb', note: 'dative frame; carries most emotions' }),
    v('v_mhanne', 'म्हणणे', 'mhaṇṇe', 'to say', { pos: 'verb' }),
    v('v_nivadne', 'निवडणे', 'nivaḍṇe', 'to choose', { pos: 'verb' }),
    v('v_bolavne', 'बोलावणे', 'bolāvṇe', 'to call, to summon', { pos: 'verb' }),
    v('v_vikne', 'विकणे', 'vikṇe', 'to sell', { pos: 'verb' }),
    v('v_pathavne', 'पाठवणे', 'pāṭhavṇe', 'to send', { pos: 'verb' }),
    v('v_shodhne', 'शोधणे', 'śodhṇe', 'to search for, to find', { pos: 'verb' }),
    v('sagla', 'सगळं', 'sagḷã', 'all, everything', { note: 'सगळा / सगळी / सगळं' }),
  ],

  sentences: [
    s('mr-l3-1', ['रामाने', 'पुस्तक', 'वाचलं'], 'rāmāne pustak vāclã', 'Ram read the book.', { skills: ['ergative', 'agree-n'], note: 'राम takes -ने. वाचलं is NEUTER because पुस्तक is neuter. The verb ignores Ram entirely.' }),
    s('mr-l3-2', ['तिने', 'पोळी', 'खाल्ली'], 'tine poḷī khāllī', 'She ate a chapati.', { skills: ['ergative', 'agree-f'], note: 'खाल्ली is feminine, agreeing with पोळी. Change the food and the verb changes with it.' }),
    s('mr-l3-3', ['त्याने', 'आंबा', 'खाल्ला'], 'tyāne āmbā khāllā', 'He ate a mango.', { skills: ['ergative', 'agree-m'], note: 'Same subject as a feminine object would give खाल्ली. Only the object matters.' }),
    s('mr-l3-4', ['मी', 'काम', 'केलं'], 'mī kām kelã', 'I did the work.', { skills: ['ergative'], note: 'मी serves as its own ergative form. काम is neuter → केलं.' }),
    s('mr-l3-5', ['तू', 'काम', 'केलंस'], 'tū kām kelãs', 'You did the work.', { skills: ['ergative', 'person-marker'], note: 'The -स at the end is the तू marker, stacked AFTER the object agreement. तुम्ही would give केलंत.' }),
    s('mr-l3-6', ['त्यांनी', 'घर', 'विकलं'], 'tyānnī ghar viklã', 'They sold the house.', { skills: ['ergative'], note: 'Plural subjects take -नी rather than -ने.' }),
    s('mr-l3-7', ['आईने', 'मुलाला', 'बोलावलं'], 'āīne mulālā bolāvlã', 'Mother called the boy.', { skills: ['ergative', 'default-neuter'], note: 'The object मुलाला is itself marked with -ला, so the verb cannot agree with it and falls back to neuter singular. This is the sub-rule that catches out learners who thought they had the main rule.' }),
    s('mr-l3-8', ['मी', 'तीन', 'पुस्तकं', 'वाचली'], 'mī tīn pustakã vāclī', 'I read three books.', { skills: ['ergative', 'agree-pl'], note: 'Neuter plural takes -ली. The verb tracks number as well as gender.' }),
    s('mr-l3-9', ['तुम्ही', 'काय', 'सांगितलं'], 'tumhī kāy sāṅgitlã', 'What did you say?', { skills: ['ergative', 'question'] }),
    s('mr-l3-10', ['त्याने', 'पत्र', 'लिहून', 'ठेवलं'], 'tyāne patra lihūn ṭhevlã', 'He wrote the letter down.', { skills: ['compound-verb'], note: 'लिहून ठेवणे: the main verb goes to -ऊन and the vector verb carries the tense and agreement.' }),
    s('mr-l3-11', ['मी', 'सगळं', 'खाऊन', 'टाकलं'], 'mī sagḷã khāūn ṭāklã', 'I ate it all up.', { skills: ['compound-verb'], note: 'टाकणे as a vector adds finality. Without it, खाल्लं just reports the eating; with it, nothing is left.' }),
    s('mr-l3-12', ['तिने', 'मला', 'मदत', 'केली'], 'tine malā madat kelī', 'She helped me.', { skills: ['conjunct-verb', 'agree-f'], note: 'मदत करणे is a conjunct verb, and केली is feminine because मदत is. The real object is the noun, not the person helped.' }),
    s('mr-l3-13', ['मला', 'त्याची', 'आठवण', 'येते'], 'malā tyācī āṭhavaṇ yete', 'I miss him.', { skills: ['conjunct-verb', 'experiencer'], note: 'Literally "his memory comes to me". There is no verb "to miss".' }),
    s('mr-l3-14', ['मला', 'राग', 'आला'], 'malā rāg ālā', 'I got angry.', { skills: ['conjunct-verb', 'experiencer'], note: 'Anger comes to you. आला is masculine to agree with राग.' }),
    s('mr-l3-15', ['जो', 'मुलगा', 'आला', 'तो', 'माझा', 'मित्र', 'आहे'], 'jo mulgā ālā to mājhā mitra āhe', 'The boy who came is my friend.', { skills: ['relative'], note: 'Marathi does not embed relative clauses the way English does. It sets up जो and then answers it with तो.' }),
    s('mr-l3-16', ['जेव्हा', 'मी', 'आलो', 'तेव्हा', 'तो', 'गेला', 'होता'], 'jevhā mī ālo tevhā to gelā hotā', 'When I arrived he had already left.', { skills: ['relative', 'pluperfect'], note: 'गेला होता is the pluperfect: past participle + होता.' }),
    s('mr-l3-17', ['जिथे', 'तू', 'जाशील', 'तिथे', 'मी', 'येईन'], 'jithe tū jāśīl tithe mī yeīn', 'Wherever you go, I will come.', { skills: ['relative', 'future'] }),
    s('mr-l3-18', ['त्याने', 'काम', 'सुरू', 'केलं'], 'tyāne kām surū kelã', 'He started the work.', { skills: ['conjunct-verb', 'ergative'] }),
    s('mr-l3-19', ['मी', 'तिला', 'ओळखतो'], 'mī tilā oḷakhto', 'I know her.', { skills: ['present'], note: 'Present tense, so no ergative. ओळखणे is knowing a person; जाणणे is knowing a fact.' }),
    s('mr-l3-20', ['आम्ही', 'ठरवलं', 'की', 'उद्या', 'जायचं'], 'āmhī ṭharavlã kī udyā jāycã', 'We decided that we would go tomorrow.', { skills: ['complement', 'ergative'], note: 'की introduces a clause, exactly like English "that". जायचं is the prospective form you meet at L4.' }),
  ],

  grammar: [
    g('l3-g1', 'THE GATE: ergative alignment, and why your Marathi sounds foreign without it',
      'In the perfective past with a transitive verb, three things change at once. The subject takes -ने (singular) or -नी (plural). The verb stops agreeing with the subject. The verb agrees with the OBJECT instead, in gender and number. Nothing in English, Spanish, French or German prepares you for this, and Hindi has it too but applies it slightly differently, so even Hindi speakers transfer the wrong instincts. Drill it until the object is the first thing you look at when forming a past sentence.',
      [
        ex('तो आंबा खातो', 'to āmbā khāto', 'He eats a mango.', 'PRESENT: verb agrees with तो'),
        ex('त्याने आंबा खाल्ला', 'tyāne āmbā khāllā', 'He ate a mango.', 'PAST: -ने on the subject, verb matches आंबा (m)'),
        ex('त्याने पोळी खाल्ली', 'tyāne poḷī khāllī', 'He ate a chapati.', 'same man, feminine object → खाल्ली'),
        ex('त्याने सफरचंद खाल्लं', 'tyāne spharcand khāllã', 'He ate an apple.', 'neuter object → खाल्लं'),
        ex('ती गेली', 'tī gelī', 'She went.', 'INTRANSITIVE: no object, so no -ने, and the verb agrees with her'),
      ]),
    g('l3-g2', 'Ergative subject forms',
      'The first and second person pronouns are suppletive: they look identical to their ordinary forms and you have to infer the ergative from the construction. Third person and all nouns show it openly.',
      [
        ex('मी', 'mī', 'I', 'unchanged'),
        ex('तू', 'tū', 'you', 'unchanged, but the verb takes -स'),
        ex('त्याने', 'tyāne', 'he'),
        ex('तिने', 'tine', 'she'),
        ex('आम्ही', 'āmhī', 'we', 'unchanged'),
        ex('तुम्ही', 'tumhī', 'you (polite)', 'unchanged, but the verb takes -त'),
        ex('त्यांनी', 'tyānnī', 'they'),
        ex('रामाने / सीतेने / मुलांनी', 'rāmāne / sītene / mulānnī', 'Ram / Sita / the children', 'oblique stem + -ने or -नी'),
      ]),
    g('l3-g3', 'When the verb gives up and goes neuter',
      'If the object itself carries -ला, which happens whenever the object is a specific person, the verb cannot agree with it. It falls back to neuter singular. This is the sub-rule that makes learners think the main rule is unreliable. It is not: it is the main rule plus one well-defined exception.',
      [
        ex('आईने मुलगा पाहिला', 'āīne mulgā pāhilā', 'Mother saw a boy.', 'unmarked object → verb agrees (m)'),
        ex('आईने मुलाला पाहिलं', 'āīne mulālā pāhilã', 'Mother saw the boy.', 'object marked -ला → neuter default'),
        ex('त्याने तिला बोलावलं', 'tyāne tilā bolāvlã', 'He called her.', 'तिला is marked → neuter, not बोलावली'),
      ]),
    g('l3-g4', 'Compound verbs: the second verb carries the attitude',
      'Marathi routinely pairs a main verb in its -ऊन form with a second "vector" verb that adds nuance rather than meaning. The vector carries the tense and the agreement. Leaving them out is grammatical but makes you sound like a textbook.',
      [
        ex('खाऊन टाकणे', 'khāūn ṭākṇe', 'to eat up completely', 'टाकणे adds finality'),
        ex('वाचून काढणे', 'vācūn kāḍhṇe', 'to read right through', 'काढणे adds getting it done'),
        ex('लिहून ठेवणे', 'lihūn ṭhevṇe', 'to write down and keep', 'ठेवणे adds permanence'),
        ex('विसरून बसणे', 'visarūn basṇe', 'to go and forget', 'बसणे adds regret'),
        ex('जाऊन येणे', 'jāūn yeṇe', 'to go and come back', 'saying only "I am going" sounds ominous'),
      ]),
    g('l3-g5', 'Conjunct verbs: most Marathi verbs are two words',
      'A huge share of the everyday verb inventory is a noun or adjective plus करणे, होणे, येणे or वाटणे. The agreement follows the NOUN, not the person, which is why मदत केली is feminine. Emotions almost all take this shape with a dative experiencer.',
      [
        ex('मदत करणे', 'madat karaṇe', 'to help', 'मदत f → मदत केली'),
        ex('सुरू करणे', 'surū karaṇe', 'to start'),
        ex('राग येणे', 'rāg yeṇe', 'to get angry', 'मला राग आला'),
        ex('भीती वाटणे', 'bhītī vāṭṇe', 'to feel afraid', 'मला भीती वाटते'),
        ex('आनंद होणे', 'ānand hoṇe', 'to be happy', 'मला आनंद झाला'),
        ex('आठवण येणे', 'āṭhavaṇ yeṇe', 'to miss someone', 'मला तुझी आठवण येते'),
      ]),
    g('l3-g6', 'Relative-correlative: set it up, then answer it',
      'English buries a relative clause inside the sentence. Marathi puts a ज- word first, finishes that clause, then answers it with a matching त- word. The pairs are fixed and worth memorising as pairs.',
      [
        ex('जो ... तो', 'jo ... to', 'the one who ... he'),
        ex('जे ... ते', 'je ... te', 'what ... that'),
        ex('जेव्हा ... तेव्हा', 'jevhā ... tevhā', 'when ... then'),
        ex('जिथे ... तिथे', 'jithe ... tithe', 'where ... there'),
        ex('जसं ... तसं', 'jasã ... tasã', 'as ... so'),
        ex('जितकं ... तितकं', 'jitkã ... titkã', 'as much as ... that much'),
      ]),
  ],
}
