const VocabCard = require('../models/VocabCard');
const GrammarQuestion = require('../models/GrammarQuestion');

const defaultVocab = {
  Japanese: [
    { word:'桜',     phonetic:'Sa · ku · ra',    pos:'noun',      meaning:'Cherry Blossom',    example:'桜の花が咲いています。',         translation:'The cherry blossoms are blooming.' },
    { word:'猫',     phonetic:'Ne · ko',          pos:'noun',      meaning:'Cat',               example:'猫が眠っています。',             translation:'The cat is sleeping.' },
    { word:'食べる', phonetic:'Ta · be · ru',     pos:'verb',      meaning:'To eat',            example:'私は寿司を食べます。',           translation:'I eat sushi.' }
  ],
  French: [
    { word:'Bonjour',   phonetic:'Bon · zhur',     pos:'greeting', meaning:'Hello / Good day',  example:'Bonjour, comment allez-vous?',    translation:'Hello, how are you?' },
    { word:'Maison',    phonetic:'Meh · zon',       pos:'noun',     meaning:'House / Home',      example:'Je rentre à la maison ce soir.',  translation:'I am going home tonight.' }
  ],
  Spanish: [
    { word:'Hola',      phonetic:'O · la',          pos:'greeting', meaning:'Hello',             example:'¡Hola! ¿Cómo estás?',            translation:'Hello! How are you?' },
    { word:'Gracias',   phonetic:'Gra · si · as',   pos:'phrase',   meaning:'Thank you',         example:'Muchas gracias por tu ayuda.',    translation:'Thank you very much for your help.' }
  ],
  German: [
    { word:'Danke',     phonetic:'Dan · ke',        pos:'phrase',   meaning:'Thank you',         example:'Danke schön für die Hilfe.',      translation:'Thank you very much for the help.' },
    { word:'Wunderbar', phonetic:'Vun · der · bar', pos:'adjective',meaning:'Wonderful / Great', example:'Das ist wunderbar!',              translation:'Das ist wunderbar!' }
  ],
  Italian: [
    { word:'Ciao',      phonetic:'Chow',            pos:'greeting', meaning:'Hello / Goodbye',   example:'Ciao! Come stai?',                translation:'Hello! How are you?' },
    { word:'Grazie',    phonetic:'Gra · tsi · eh',  pos:'phrase',   meaning:'Thank you',         example:'Grazie mille per la cena.',       translation:'Thank you very much for the dinner.' }
  ],
  Hindi: [
    { word:'खाना',    phonetic:'Kha · na',          pos:'noun/verb',meaning:'Food / To eat',     example:'खाना बहुत स्वादिष्ट है।',        translation:'The food is very delicious.' },
    { word:'दोस्त',   phonetic:'Dost',             pos:'noun',     meaning:'Friend',            example:'वो मेरा सबसे अच्छा दोस्त है।',   translation:'He is my best friend.' }
  ]
};

const defaultGrammar = {
  Japanese: [
    { q: 'Choose the correct particle:', sentence: '私 ________ 学生です。 (I am a student)', options: ['が (ga - subject marker)','を (o - object marker)','は (wa - topic marker)','に (ni - direction/time)'], answer: 2 },
    { q: 'Which verb correctly completes the sentence?', sentence: '毎日りんごを ________。 (I eat an apple every day)', options: ['飲みます (drink)','食べます (eat)','見ます (watch)','行きます (go)'], answer: 1 },
    { q: 'Select the correct question word:', sentence: 'それは ________ ですか？ (What is that?)', options: ['だれ (who)','どこ (where)','いつ (when)','なん (what)'], answer: 3 },
    { q: 'Choose the correct past tense:', sentence: '昨日映画を ________。 (I watched a movie yesterday)', options: ['見ます (watch)','見る (to watch)','見ました (watched)','見て (watching)'], answer: 2 },
    { q: 'Pick the right location particle:', sentence: '学校 ________ 行きます。 (I go to school)', options: ['で (at/by)','へ (to)','を (object marker)','が (subject marker)'], answer: 1 },
  ],
  French: [
    { q: 'Which verb correctly completes the sentence?', sentence: 'Je ________ un étudiant. (I am a student)', options: ['suis (am)','es (are)','est (is)','sommes (are)'], answer: 0 },
    { q: 'Choose the correct definite article:', sentence: 'J\'aime ________ pomme. (I like the apple)', options: ['le (the - masc)','la (the - fem)','les (the - plural)','l\' (the - before vowel)'], answer: 1 },
    { q: 'Select the correct pronoun:', sentence: '________ parlons français. (We speak French)', options: ['Je (I)','Tu (You)','Il (He)','Nous (We)'], answer: 3 },
    { q: 'Choose the correct preposition:', sentence: 'Je vais ________ Paris. (I am going to Paris)', options: ['en (in/to)','au (at the)','à (to/at)','de (from/of)'], answer: 2 },
    { q: 'Pick the correct verb form:', sentence: 'Tu ________ une pizza? (Are you eating a pizza?)', options: ['mange (eat - I)','manges (eat - you)','mangeons (eat - we)','mangent (eat - they)'], answer: 1 },
  ],
  Spanish: [
    { q: 'Which verb correctly completes the sentence?', sentence: 'Yo ________ de España. (I am from Spain)', options: ['soy (am)','estoy (am - state/location)','es (is)','eres (are)'], answer: 0 },
    { q: 'Choose the correct definite article:', sentence: '________ libro es rojo. (The book is red)', options: ['El (The - masc)','La (The - fem)','Los (The - masc plural)','Las (The - fem plural)'], answer: 0 },
    { q: 'Select the correct pronoun:', sentence: '________ hablamos español. (We speak Spanish)', options: ['Yo (I)','Tú (You)','Él (He)','Nosotros (We)'], answer: 3 },
    { q: 'Choose the correct preposition:', sentence: 'Voy ________ la playa. (I am going to the beach)', options: ['en (in/on)','por (for/by)','a (to)','de (from/of)'], answer: 2 },
    { q: 'Pick the correct verb form:', sentence: 'Tú ________ una manzana. (You eat an apple)', options: ['como (eat - I)','comes (eat - you)','come (eats - he/she)','comemos (eat - we)'], answer: 1 },
  ],
  German: [
    { q: 'Which verb correctly completes the sentence?', sentence: 'Ich ________ ein Student. (I am a student)', options: ['bin (am)','bist (are)','ist (is)','sind (are)'], answer: 0 },
    { q: 'Choose the correct definite article:', sentence: 'Das ist ________ Hund. (That is the dog)', options: ['der (the - masc)','die (the - fem)','das (the - neut)','den (the - masc acc)'], answer: 0 },
    { q: 'Select the correct pronoun:', sentence: '________ sprechen Deutsch. (We speak German)', options: ['Ich (I)','Du (You)','Er (He)','Wir (We)'], answer: 3 },
    { q: 'Choose the correct preposition:', sentence: 'Ich gehe ________ Hause. (I am going home)', options: ['nach (to/after)','zu (to/at)','in (in/into)','auf (on/upon)'], answer: 0 },
    { q: 'Pick the correct verb form:', sentence: 'Du ________ einen Apfel. (You eat an apple)', options: ['esse (eat - I)','isst (eat - you)','esst (eat - you all)','essen (eat - we/they)'], answer: 1 },
  ],
  Italian: [
    { q: 'Which verb correctly completes the sentence?', sentence: 'Io ________ uno studente. (I am a student)', options: ['sono (am/are)','sei (are)','è (is)','siamo (are)'], answer: 0 },
    { q: 'Choose the correct definite article:', sentence: '________ pizza è buona. (The pizza is good)', options: ['Il (The - masc)','La (The - fem)','I (The - masc plural)','Le (The - fem plural)'], answer: 1 },
    { q: 'Select the correct pronoun:', sentence: '________ parliamo italiano. (We speak Italian)', options: ['Io (I)','Tu (You)','Lui (He)','Noi (We)'], answer: 3 },
    { q: 'Choose the correct preposition:', sentence: 'Vado ________ Roma. (I am going to Rome)', options: ['in (in/to)','a (to/at)','da (from/by)','di (of)'], answer: 1 },
    { q: 'Pick the correct verb form:', sentence: 'Tu ________ una mela. (You eat an apple)', options: ['mangio (eat - I)','mangi (eat - you)','mangia (eats - he/she)','mangiamo (eat - we)'], answer: 1 },
  ],
  Hindi: [
    { q: 'Which verb correctly completes the sentence?', sentence: 'मैं एक छात्र ________। (I am a student)', options: ['हूँ (am)','हो (are)','है (is)','हैं (are)'], answer: 0 },
    { q: 'Choose the correct pronoun:', sentence: '________ सेब खाता हूँ। (I eat an apple)', options: ['मैं (I)','तुम (You)','वह (He/She)','हम (We)'], answer: 0 },
    { q: 'Select the correct postposition:', sentence: 'किताब मेज़ ________ है। (The book is on the table)', options: ['का (of)','को (to)','पर (on)','से (from)'], answer: 2 },
    { q: 'Choose the correct tense:', sentence: 'कल हम दिल्ली ________। (We will go to Delhi tomorrow)', options: ['गए (went)','जाएँगे (will go)','जाते हैं (go)','जा रहे हैं (are going)'], answer: 1 },
    { q: 'Pick the correct gender agreement:', sentence: 'मेरी ________ बहुत अच्छी है। (My car is very good)', options: ['गाड़ी (car)','घर (house)','भाई (brother)','कुत्ता (dog)'], answer: 0 },
  ]
};

const seedCurriculum = async () => {
  try {
    const vocabCount = await VocabCard.countDocuments();
    if (vocabCount === 0) {
      console.log('🌱 Seeding default vocabulary cards...');
      const cardsToInsert = [];
      for (const [language, cards] of Object.entries(defaultVocab)) {
        cards.forEach(c => {
          cardsToInsert.push({
            language,
            word: c.word,
            phonetic: c.phonetic,
            pos: c.pos,
            meaning: c.meaning,
            example: c.example,
            translation: c.translation
          });
        });
      }
      await VocabCard.insertMany(cardsToInsert);
      console.log(`✅ Seeded ${cardsToInsert.length} vocabulary cards!`);
    }

    const grammarCount = await GrammarQuestion.countDocuments();
    if (grammarCount === 0) {
      console.log('🌱 Seeding default grammar questions...');
      const questionsToInsert = [];
      for (const [language, questions] of Object.entries(defaultGrammar)) {
        questions.forEach(q => {
          questionsToInsert.push({
            language,
            q: q.q,
            sentence: q.sentence,
            options: q.options,
            answer: q.answer
          });
        });
      }
      await GrammarQuestion.insertMany(questionsToInsert);
      console.log(`✅ Seeded ${questionsToInsert.length} grammar questions!`);
    }
  } catch (err) {
    console.error('❌ Failed to seed curriculum:', err.message);
  }
};

module.exports = seedCurriculum;
