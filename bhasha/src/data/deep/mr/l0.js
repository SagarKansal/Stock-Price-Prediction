import { v, s, g, ex } from './_h.js'

// Pre-A1. This is what a Marathi two-year-old in a Marathi household actually
// says and hears, which is NOT the same list as a tourist phrasebook. No
// toddler says नमस्कार or धन्यवाद. They say आई, पाणी, नको, दे, आणखी. Several
// words here (बाऊ, खाऊ, शू) are child-register and an adult using them to
// another adult would sound ridiculous, which is noted on each.
//
// Verbs appear in the bare imperative, because that is the only verb form a
// toddler hears and the only one they produce. Infinitives arrive at L1.

export default {
  id: 'l0',
  vocab: [
    // --- the people in the room ---
    v('aai', 'आई', 'āī', 'mother, mum', { g: 'f', concept: 'mother', note: 'the first word, universally' }),
    v('baba', 'बाबा', 'bābā', 'father, dad', { g: 'm', concept: 'father' }),
    v('tai', 'ताई', 'tāī', 'elder sister', { g: 'f', note: 'also used for any slightly older girl or woman' }),
    v('dada', 'दादा', 'dādā', 'elder brother', { g: 'm', note: 'also used for any slightly older boy or man' }),
    v('aaji', 'आजी', 'ājī', 'grandmother', { g: 'f' }),
    v('aajoba', 'आजोबा', 'ājobā', 'grandfather', { g: 'm' }),
    v('baal', 'बाळ', 'bāḷ', 'baby, little one', { g: 'n', concept: 'child', note: 'neuter, which is why it takes -ं endings' }),
    v('mi', 'मी', 'mī', 'I', { concept: 'i' }),
    v('majha', 'माझा', 'mājhā', 'mine, my', { note: 'माझी for feminine, माझं for neuter' }),

    // --- what a toddler needs ---
    v('paani', 'पाणी', 'pāṇī', 'water', { g: 'n', concept: 'water' }),
    v('dudh', 'दूध', 'dūdh', 'milk', { g: 'n', concept: 'milk' }),
    v('khaau', 'खाऊ', 'khāū', 'treat, snack', { g: 'm', note: 'child word; an adult says खायला काहीतरी' }),
    v('bhuk', 'भूक', 'bhūk', 'hunger', { g: 'f', concept: 'hungry', note: 'a noun: hunger happens TO you' }),
    v('jhop', 'झोप', 'jhop', 'sleep', { g: 'f', concept: 'to_sleep' }),
    v('shu', 'शू', 'śū', 'pee', { note: 'child word' }),
    v('baau', 'बाऊ', 'bāū', 'ouch, a hurt', { note: 'child word; adults say दुखापत' }),
    v('dukhta', 'दुखतं', 'dukhtã', 'it hurts', { note: 'neuter verb form, because the thing hurting is usually unspecified' }),

    // --- the imperative verbs toddlers live inside ---
    v('de', 'दे', 'de', 'give (it to me)', { pos: 'verb', concept: 'to_give', note: 'bare stem; the plain imperative' }),
    v('ghe', 'घे', 'ghe', 'take', { pos: 'verb', concept: 'to_take' }),
    v('ye', 'ये', 'ye', 'come', { pos: 'verb', concept: 'to_come' }),
    v('ja', 'जा', 'jā', 'go', { pos: 'verb', concept: 'to_go' }),
    v('bas', 'बस', 'bas', 'sit', { pos: 'verb', concept: 'to_sit' }),
    v('uth', 'ऊठ', 'ūṭh', 'get up', { pos: 'verb' }),
    v('kha', 'खा', 'khā', 'eat', { pos: 'verb', concept: 'to_eat' }),
    v('pi', 'पी', 'pī', 'drink', { pos: 'verb', concept: 'to_drink' }),
    v('bagh', 'बघ', 'bagh', 'look', { pos: 'verb', concept: 'to_see' }),
    v('chal', 'चल', 'cal', "come on, let's go", { pos: 'verb', note: 'the most-heard word in any Marathi household' }),
    v('thamb', 'थांब', 'thāmb', 'wait, stop', { pos: 'verb' }),
    v('pal', 'पळ', 'paḷ', 'run', { pos: 'verb' }),

    // --- wanting and refusing: the whole emotional range of age two ---
    v('hava', 'हवं', 'havã', '(I) want', { note: 'neuter form; हवा for masculine things, हवी for feminine' }),
    v('nako', 'नको', 'nako', "no, don't want", { note: 'refusal AND prohibition; does not change form' }),
    v('aankhi', 'आणखी', 'āṇkhī', 'more', { concept: 'more' }),
    v('pure', 'पुरे', 'pure', 'enough, stop' ),
    v('ho', 'हो', 'ho', 'yes', { concept: 'yes' }),
    v('nahi', 'नाही', 'nāhī', 'no, not', { concept: 'no' }),

    // --- first adjectives ---
    v('motha', 'मोठा', 'moṭhā', 'big', { adj: true, concept: 'big', note: 'मोठी / मोठं for feminine and neuter' }),
    v('chota', 'छोटा', 'choṭā', 'small', { adj: true, concept: 'small' }),
    v('garam', 'गरम', 'garam', 'hot', { concept: 'hot', note: 'never changes form, because it ends in a consonant' }),
    v('chaan', 'छान', 'chān', 'nice, lovely', { concept: 'good', note: 'the all-purpose word of approval' }),
    v('ghaan', 'घाण', 'ghāṇ', 'dirty, yucky' ),
    v('god', 'गोड', 'goḍ', 'sweet' ),

    // --- things in a toddler's world ---
    v('khelna', 'खेळणं', 'kheḷṇã', 'toy', { g: 'n' }),
    v('gadi', 'गाडी', 'gāḍī', 'car, vehicle', { g: 'f' }),
    v('bahuli', 'बाहुली', 'bāhulī', 'doll', { g: 'f' }),
    v('chendu', 'चेंडू', 'cendū', 'ball', { g: 'm' }),
    v('pustak', 'पुस्तक', 'pustak', 'book', { g: 'n' }),
    v('boot', 'बूट', 'būṭ', 'shoe', { g: 'm' }),

    // --- animals, the other universal toddler obsession ---
    v('kutra', 'कुत्रा', 'kutrā', 'dog', { g: 'm' }),
    v('manjar', 'मांजर', 'mānjar', 'cat', { g: 'n' }),
    v('gay', 'गाय', 'gāy', 'cow', { g: 'f' }),
    v('pakshi', 'पक्षी', 'pakṣī', 'bird', { g: 'm' }),
    v('hatti', 'हत्ती', 'hattī', 'elephant', { g: 'm' }),

    // --- where ---
    v('ghar', 'घर', 'ghar', 'home, house', { g: 'n', concept: 'house' }),
    v('baher', 'बाहेर', 'bāher', 'outside' ),
    v('ithe', 'इथे', 'ithe', 'here', { concept: 'here' }),
    v('kuthe', 'कुठे', 'kuṭhe', 'where', { concept: 'where' }),
    v('kay', 'काय', 'kāy', 'what', { concept: 'what' }),
  ],

  sentences: [
    s('mr-l0-1', ['आई', 'ये'], 'āī ye', 'Mummy, come.', { skills: ['imperative'] }),
    s('mr-l0-2', ['पाणी', 'हवं'], 'pāṇī havã', 'Want water.', { skills: ['want'], note: 'हवं is neuter to match पाणी. A toddler gets this right by ear long before they could explain it.' }),
    s('mr-l0-3', ['नको', 'बाबा'], 'nako bābā', "No, Papa.", { skills: ['refusal'] }),
    s('mr-l0-4', ['आणखी', 'दूध'], 'āṇkhī dūdh', 'More milk.', { skills: ['want'] }),
    s('mr-l0-5', ['भूक', 'लागली'], 'bhūk lāglī', "I'm hungry.", { skills: ['experiencer'], note: 'Literally "hunger has attached". लागली is feminine to agree with भूक. Marathi treats hunger as something that happens to you, not something you are.' }),
    s('mr-l0-6', ['हे', 'काय', 'आहे'], 'he kāy āhe', 'What is this?', { skills: ['question'], note: 'The single most frequent sentence of age two, in any language.' }),
    s('mr-l0-7', ['बाऊ', 'झालं'], 'bāū jhālã', 'I got hurt.', { skills: ['past'], note: 'झालं is neuter. Child register; an adult would say मला लागलं.' }),
    s('mr-l0-8', ['मला', 'दे'], 'malā de', 'Give me.', { skills: ['imperative', 'dative'], note: 'मला = "to me". The dative shows up on day one and never leaves.' }),
    s('mr-l0-9', ['चल', 'बाहेर'], 'cal bāher', "Let's go outside.", { skills: ['imperative'] }),
    s('mr-l0-10', ['झोप', 'आली'], 'jhop ālī', "I'm sleepy.", { skills: ['experiencer'], note: 'Literally "sleep has come". Same pattern as भूक लागली.' }),
    s('mr-l0-11', ['आजी', 'कुठे', 'आहे'], 'ājī kuṭhe āhe', 'Where is grandma?', { skills: ['question'] }),
    s('mr-l0-12', ['हा', 'माझा'], 'hā mājhā', 'This is mine.', { skills: ['possessive'], note: 'हा and माझा are both masculine. For a feminine thing: ही माझी. For neuter: हे माझं.' }),
    s('mr-l0-13', ['तो', 'कुत्रा', 'बघ'], 'to kutrā bagh', 'Look at that dog.', { skills: ['imperative'] }),
    s('mr-l0-14', ['मी', 'करतो'], 'mī kartō', "I'll do it.", { skills: ['present'], note: 'A boy says करतो, a girl says करते. Marathi makes children state their own gender in every single sentence about themselves.' }),
  ],

  grammar: [
    g('l0-g1', 'Toddler Marathi has almost no grammar, and that is the point',
      'At this level verbs appear only as bare commands (दे, ये, जा, बस) and sentences are one or two words. There are no tenses to learn yet. Start here even if you are an adult: these are the forty words that carry the most weight in a Marathi household, and you will hear every one of them within an hour of walking into one.',
      [
        ex('दे', 'de', 'Give.', 'bare stem = plain command'),
        ex('पाणी दे', 'pāṇī de', 'Give water.', 'object first, verb last, as in every Marathi sentence'),
        ex('मला पाणी दे', 'malā pāṇī de', 'Give me water.', 'recipient, object, verb'),
      ]),
    g('l0-g2', 'नको and हवं: the two words that run age two',
      'हवं means "(I) want" and नको means "no / do not want / do not". They are not a simple pair: हवं changes form to agree with the thing wanted, while नको never changes at all. नको also doubles as the prohibition on verbs, which you will meet properly at L1.',
      [
        ex('पाणी हवं', 'pāṇī havã', 'Want water.', 'पाणी is neuter → हवं'),
        ex('चहा हवा', 'cahā havā', 'Want tea.', 'चहा is masculine → हवा'),
        ex('पोळी हवी', 'poḷī havī', 'Want a chapati.', 'पोळी is feminine → हवी'),
        ex('नको', 'nako', 'No / do not want.', 'identical in all three genders'),
      ]),
    g('l0-g3', 'Hunger and sleep happen TO you',
      'Marathi does not say "I am hungry". It says hunger attached itself to you: भूक लागली. Sleep comes to you: झोप आली. This experiencer pattern is one of the deepest habits in the language and it governs hunger, thirst, sleep, cold, fear, anger, memory and liking. Learning it as a toddler phrase now saves rebuilding your instincts at L2.',
      [
        ex('भूक लागली', 'bhūk lāglī', 'I am hungry.', 'भूक is feminine → लागली'),
        ex('तहान लागली', 'tahān lāglī', 'I am thirsty.', 'तहान is feminine too'),
        ex('झोप आली', 'jhop ālī', 'I am sleepy.', 'झोप is feminine'),
        ex('थंडी वाजली', 'thaṇḍī vājlī', 'I feel cold.', 'literally "cold has struck"'),
      ]),
  ],
}
