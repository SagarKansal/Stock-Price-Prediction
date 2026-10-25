import { v, s, g, ex } from './_h.js'

// B2. Aspect, participles, causatives, modals, reported speech.
//
// Below this level you can be understood. Above it you can be precise: say the
// same thing five ways and pick the one that fits. The causative pairs and the
// participle system are the gate, because they are what lets you build long
// sentences instead of stringing short ones together.

export default {
  id: 'l4',
  vocab: [
    // --- causative pairs: Marathi derives "make someone do X" morphologically ---
    v('c_shikavne', 'शिकवणे', 'śikavṇe', 'to teach', { pos: 'verb', note: 'causative of शिकणे (to learn)' }),
    v('c_samjavne', 'समजावणे', 'samjāvṇe', 'to explain', { pos: 'verb', note: 'causative of समजणे' }),
    v('c_basavne', 'बसवणे', 'basavṇe', 'to seat someone', { pos: 'verb', note: 'causative of बसणे' }),
    v('c_uthavne', 'उठवणे', 'uṭhavṇe', 'to wake someone', { pos: 'verb', note: 'causative of उठणे' }),
    v('c_hasavne', 'हसवणे', 'hasavṇe', 'to make someone laugh', { pos: 'verb', note: 'causative of हसणे' }),
    v('c_pajne', 'पाजणे', 'pājṇe', 'to give someone a drink', { pos: 'verb', note: 'irregular causative of पिणे' }),
    v('c_bharavne', 'भरवणे', 'bharavṇe', 'to feed someone by hand', { pos: 'verb', note: 'what you do to a toddler; खाऊ घालणे is the general "feed"' }),
    v('c_dakhavne', 'दाखवणे', 'dākhavṇe', 'to show', { pos: 'verb', note: 'causative of दिसणे (to be visible)' }),
    v('c_milavne', 'मिळवणे', 'miḷavṇe', 'to obtain, to earn', { pos: 'verb', note: 'causative of मिळणे' }),
    v('c_vadhavne', 'वाढवणे', 'vāḍhavṇe', 'to increase, to raise', { pos: 'verb', note: 'causative of वाढणे' }),
    v('c_jhopavne', 'झोपवणे', 'jhopavṇe', 'to put someone to sleep', { pos: 'verb' }),
    v('c_radavne', 'रडवणे', 'raḍavṇe', 'to make someone cry', { pos: 'verb' }),

    // --- participles ---
    v('part_narā', 'करणारा', 'karaṇārā', 'one who does, the doer', { note: 'agentive participle; करणारी / करणारं' }),
    v('part_lelā', 'केलेला', 'kelelā', 'done, having been done', { note: 'past participle used as an adjective; केलेली / केलेलं' }),
    v('part_tana', 'करताना', 'kartānā', 'while doing', { note: 'two actions at once' }),
    v('part_un', 'करून', 'karūn', 'having done', { note: 'one action then the next; also the first half of a compound verb' }),
    v('part_aycha', 'करायचा', 'karāycā', 'to be done, intended', { note: 'prospective; करायची / करायचं' }),
    v('part_ava', 'करावं', 'karāvã', 'ought to be done', { note: 'obligative; often softens an order into a suggestion' }),

    // --- modals ---
    v('m_shakne', 'शकणे', 'śakṇe', 'to be able to', { pos: 'verb', note: 'मी करू शकतो; never used alone' }),
    v('m_lagne', 'लागणे', 'lāgṇe', 'to have to', { pos: 'verb', note: 'मला जावं लागेल = external compulsion' }),
    v('m_pahije', 'पाहिजे', 'pāhije', 'want; should', { note: 'मला पाणी पाहिजे = want; मी जायला पाहिजे = should' }),
    v('m_naye', 'नये', 'naye', 'should not', { note: 'तू जाऊ नये: a judgement, not an order' }),
    v('m_nakos', 'नकोस', 'nakos', "don't (to तू)", { note: 'जाऊ नकोस = direct prohibition; नका for तुम्ही' }),
    v('m_shakyata', 'शक्यता', 'śakyatā', 'possibility', { g: 'f' }),

    // --- aspect helpers ---
    v('a_hota', 'होता', 'hotā', 'was', { note: 'होती / होतं; builds the pluperfect and past continuous' }),
    v('a_ase', 'असे', 'ase', 'used to be', { note: 'करत असे = used to do, habitually, long ago' }),
    v('a_asel', 'असेल', 'asel', 'will be, might be', { note: 'also expresses probability: तो आला असेल = he has probably come' }),

    // --- reported speech ---
    v('r_mhanun', 'म्हणून', 'mhaṇūn', 'saying that; therefore', { note: 'the quotative particle, and also "so/therefore"' }),
    v('r_mhanje', 'म्हणजे', 'mhaṇje', 'that is to say, meaning', { note: 'the single most useful word for explaining yourself' }),

    // --- B2 abstract vocabulary ---
    v('b_kaaran', 'कारणाने', 'kāraṇāne', 'because of', { note: 'त्या कारणाने = for that reason' }),
    v('b_mhanun2', 'त्यामुळे', 'tyāmuḷe', 'because of that, hence' ),
    v('b_tari', 'तरी', 'tarī', 'even so, nevertheless' ),
    v('b_tarihi', 'तरीही', 'tarīhī', 'nonetheless' ),
    v('b_jari', 'जरी', 'jarī', 'although', { note: 'pairs with तरी: जरी ... तरी' }),
    v('b_pan', 'पण', 'paṇ', 'but' ),
    v('b_kinva', 'किंवा', 'kinvā', 'or' ),
    v('b_shivay', 'शिवाय', 'śivāy', 'without; besides' ),
    v('b_ऐवजी', 'ऐवजी', 'aivajī', 'instead of' ),
    v('b_baddal', 'बद्दल', 'baddal', 'about, regarding' ),
    v('b_parinam', 'परिणाम', 'pariṇām', 'result, effect', { g: 'm', obl: 'परिणामा' }),
    v('b_sambandh', 'संबंध', 'sambandh', 'relation, connection', { g: 'm', obl: 'संबंधा' }),
    v('b_mahiti', 'माहिती', 'māhitī', 'information', { g: 'f', note: 'मला माहिती आहे = I know (a fact)' }),
    v('b_garaj', 'गरज', 'garaj', 'need', { g: 'f', note: 'मला गरज आहे' }),
    v('b_sanधी', 'संधी', 'sandhī', 'opportunity', { g: 'f' }),
    v('b_jababdari', 'जबाबदारी', 'jabābdārī', 'responsibility', { g: 'f' }),
    v('b_adchan', 'अडचण', 'aḍcaṇ', 'difficulty, problem', { g: 'f' }),
    v('b_upay', 'उपाय', 'upāy', 'solution, remedy', { g: 'm', obl: 'उपाया' }),
    v('b_pratyaksha', 'प्रत्यक्ष', 'pratyakṣa', 'in person, actually' ),
    v('b_kadachit', 'कदाचित', 'kadācit', 'perhaps' ),
    v('b_nakki', 'नक्की', 'nakkī', 'definitely, for sure' ),
    v('b_barach', 'बराच', 'barāc', 'quite a lot of', { note: 'बरीच / बरंच' }),
    v('b_thodasa', 'थोडासा', 'thoḍāsā', 'a little bit of' ),
  ],

  sentences: [
    s('mr-l4-1', ['ती', 'मुलांना', 'मराठी', 'शिकवते'], 'tī mulānnā marāṭhī śikavte', 'She teaches the children Marathi.', { skills: ['causative'], note: 'शिकवणे is शिकणे with -व- inserted. Marathi builds "make someone X" into the verb instead of adding a word.' }),
    s('mr-l4-2', ['मी', 'हे', 'करू', 'शकतो'], 'mī he karū śakto', 'I can do this.', { skills: ['modal'], note: 'The main verb goes to its -ऊ form and शकणे takes the ending.' }),
    s('mr-l4-3', ['मला', 'उद्या', 'जावं', 'लागेल'], 'malā udyā jāvã lāgel', 'I will have to go tomorrow.', { skills: ['modal', 'experiencer'], note: 'लागणे expresses compulsion from outside. Compare मला जायचं आहे, which is your own intention.' }),
    s('mr-l4-4', ['काम', 'करणारा', 'माणूस', 'कुठे', 'आहे'], 'kām karaṇārā māṇūs kuṭhe āhe', 'Where is the man who does the work?', { skills: ['participle'], note: 'करणारा is the agentive participle and behaves exactly like an adjective, agreeing with माणूस.' }),
    s('mr-l4-5', ['हे', 'काल', 'केलेलं', 'काम', 'आहे'], 'he kāl kelelã kām āhe', 'This is the work done yesterday.', { skills: ['participle'], note: 'केलेलं is the past participle as an adjective, neuter to match काम.' }),
    s('mr-l4-6', ['जेवताना', 'बोलू', 'नकोस'], 'jevtānā bolū nakos', "Don't talk while eating.", { skills: ['participle', 'prohibition'], note: '-ताना marks two simultaneous actions. नकोस is the direct prohibition for तू; for तुम्ही it is नका.' }),
    s('mr-l4-7', ['तो', 'जेवण', 'करून', 'गेला'], 'to jevaṇ karūn gelā', 'He left after eating.', { skills: ['participle'], note: '-ऊन marks sequence: first one action, then the other.' }),
    s('mr-l4-8', ['मला', 'उद्या', 'जायचं', 'आहे'], 'malā udyā jāycã āhe', 'I want to go tomorrow.', { skills: ['prospective'], note: 'The prospective -आयचं plus आहे is how Marathi says "I intend to". Contrast with लागेल in sentence 3.' }),
    s('mr-l4-9', ['तू', 'हे', 'करायला', 'पाहिजे'], 'tū he karāylā pāhije', 'You should do this.', { skills: ['modal'], note: 'पाहिजे after -आयला is advice. After a bare noun (मला पाणी पाहिजे) it means want.' }),
    s('mr-l4-10', ['तो', 'रोज', 'इथे', 'येत', 'असे'], 'to roj ithe yet ase', 'He used to come here every day.', { skills: ['habitual-past'], note: 'करत असे is the remote habitual past: a routine that is over. करत होता would be "was coming" on one occasion.' }),
    s('mr-l4-11', ['मी', 'तेव्हा', 'अभ्यास', 'करत', 'होतो'], 'mī tevhā abhyās karat hoto', 'I was studying at that time.', { skills: ['past-continuous'] }),
    s('mr-l4-12', ['त्याने', 'काम', 'केलं', 'होतं'], 'tyāne kām kelã hotã', 'He had done the work.', { skills: ['pluperfect', 'ergative'], note: 'Pluperfect = past participle + होतं. The ergative rules still apply underneath.' }),
    s('mr-l4-13', ['तो', 'आला', 'असेल'], 'to ālā asel', 'He has probably come.', { skills: ['probability'], note: 'असेल turns a statement into a guess. Marathi marks probability grammatically where English adds "probably".' }),
    s('mr-l4-14', ['तो', 'म्हणाला', 'की', 'तो', 'उद्या', 'येईल'], 'to mhaṇālā kī to udyā yeīl', 'He said he would come tomorrow.', { skills: ['reported-speech'], note: 'Marathi does NOT backshift the tense the way English does. येईल stays future.' }),
    s('mr-l4-15', ['जरी', 'पाऊस', 'पडला', 'तरी', 'मी', 'येईन'], 'jarī pāūs paḍlā tarī mī yeīn', 'Even if it rains, I will come.', { skills: ['concessive'], note: 'जरी ... तरी is another fixed pair, like the relative-correlatives at L3.' }),
    s('mr-l4-16', ['मला', 'त्याच्याबद्दल', 'माहिती', 'नाही'], 'malā tyācyābaddal māhitī nāhī', "I don't have information about him.", { skills: ['experiencer'], note: 'त्याच्या (oblique genitive) + बद्दल. Position words stack onto the genitive, not just the plain oblique.' }),
    s('mr-l4-17', ['त्यामुळे', 'मी', 'उशिरा', 'पोहोचलो'], 'tyāmuḷe mī uśirā pohoclo', 'Because of that, I arrived late.', { skills: ['connective'] }),
    s('mr-l4-18', ['हे', 'पुस्तक', 'वाचायला', 'सोपं', 'आहे'], 'he pustak vācāylā sopã āhe', 'This book is easy to read.', { skills: ['infinitive'], note: '-आयला is the "to do" form used after adjectives and verbs of purpose.' }),
  ],

  grammar: [
    g('l4-g1', 'THE GATE: causatives are built, not borrowed',
      'English needs a helper ("make him laugh", "teach" as a separate word from "learn"). Marathi inserts -व- into the verb stem. Once you see the pattern you can generate dozens of verbs you have never been taught, and you can also decode them when you hear them.',
      [
        ex('शिकणे → शिकवणे', 'śikaṇe → śikavṇe', 'to learn → to teach'),
        ex('उठणे → उठवणे', 'uṭhaṇe → uṭhavṇe', 'to get up → to wake someone'),
        ex('बसणे → बसवणे', 'basaṇe → basavṇe', 'to sit → to seat someone'),
        ex('हसणे → हसवणे', 'hasaṇe → hasavṇe', 'to laugh → to make laugh'),
        ex('वाढणे → वाढवणे', 'vāḍhaṇe → vāḍhavṇe', 'to grow → to increase'),
        ex('पिणे → पाजणे', 'piṇe → pājṇe', 'to drink → to give a drink', 'irregular'),
        ex('दिसणे → दाखवणे', 'disaṇe → dākhavṇe', 'to be visible → to show', 'irregular'),
      ]),
    g('l4-g2', 'The participle system: six ways to hang a clause off a verb',
      'These are what let you stop speaking in short sentences. Three of them (करणारा, केलेला, करायचा) are adjectives and agree in gender; three (करताना, करून, करत) are invariant.',
      [
        ex('करणारा', 'karaṇārā', 'the one who does', 'agrees: करणारी / करणारं'),
        ex('केलेला', 'kelelā', 'done, having been done', 'agrees: केलेली / केलेलं'),
        ex('करायचा', 'karāycā', 'to be done, intended', 'agrees: करायची / करायचं'),
        ex('करताना', 'kartānā', 'while doing', 'invariant'),
        ex('करून', 'karūn', 'having done', 'invariant'),
        ex('करत', 'karat', 'doing', 'invariant; builds the continuous'),
      ]),
    g('l4-g3', 'Four ways to say "must", and they are not interchangeable',
      'Choosing the wrong one does not make you incomprehensible, it makes you rude or wrong about who decided.',
      [
        ex('मला जायचं आहे', 'malā jāycã āhe', 'I want to go.', 'my own intention'),
        ex('मला जावं लागेल', 'malā jāvã lāgel', 'I will have to go.', 'compulsion from outside'),
        ex('मी जायला पाहिजे', 'mī jāylā pāhije', 'I should go.', 'advice or moral obligation'),
        ex('मी जाऊ शकतो', 'mī jāū śakto', 'I can go.', 'ability or permission'),
        ex('तू जाऊ नये', 'tū jāū naye', 'You should not go.', 'a judgement'),
        ex('जाऊ नकोस', 'jāū nakos', "Don't go.", 'a direct order'),
      ]),
    g('l4-g4', 'Aspect: when it happened versus how it sat in time',
      'Marathi distinguishes a one-off past event, a routine that is finished, something ongoing in the past, and something completed before another past event. English blurs several of these.',
      [
        ex('त्याने केलं', 'tyāne kelã', 'he did it', 'simple perfective'),
        ex('त्याने केलं आहे', 'tyāne kelã āhe', 'he has done it', 'present perfect: still relevant'),
        ex('त्याने केलं होतं', 'tyāne kelã hotã', 'he had done it', 'pluperfect'),
        ex('तो करत होता', 'to karat hotā', 'he was doing it', 'past continuous'),
        ex('तो करत असे', 'to karat ase', 'he used to do it', 'remote habitual, now over'),
        ex('तो करायचा', 'to karāycā', 'he used to do it', 'the colloquial equivalent of करत असे'),
      ]),
    g('l4-g5', 'Reported speech does not shift tense',
      'English moves "I will come" back to "he would come". Marathi leaves the original tense alone and just attaches it with की. This is one of the easiest things to get right and one of the most commonly over-corrected by English speakers.',
      [
        ex('तो म्हणाला की तो येईल', 'to mhaṇālā kī to yeīl', 'He said he would come.', 'येईल stays future'),
        ex('ती म्हणाली की तिला आवडतं', 'tī mhaṇālī kī tilā āvaḍtã', 'She said she liked it.', 'आवडतं stays present'),
        ex('"मी येतो" म्हणून तो गेला', '"mī yeto" mhaṇūn to gelā', 'Saying "I will come", he left.', 'म्हणून as a quotative'),
      ]),
  ],
}
