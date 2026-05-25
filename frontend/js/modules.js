// Auth check
const token = localStorage.getItem('token');
let user;
if (!token) {
  window.location.href = '../index.html';
} else {
  user = JSON.parse(localStorage.getItem('user'));
  if (user && user.role === 'admin') {
    window.location.href = 'admin.html';
  }
}
// Initial sidebar user card update
updateSidebarUserCard();

const langDisplay = document.getElementById('langDisplay');
langDisplay.value = user.language || 'Japanese';
langDisplay.addEventListener('change', (e) => {
  if (typeof LinguovaStats !== 'undefined') {
    LinguovaStats.changeLanguage(e.target.value).then(() => {
      window.location.reload();
    });
  } else {
    user.language = e.target.value;
    localStorage.setItem('user', JSON.stringify(user));
    window.location.reload();
  }
});

// ════════════════════════════════════════════════════════════
//  VOCABULARY FLASHCARD DATA
//  Each card: word, phonetic, pos (part of speech), meaning,
//             example (in target language), translation
// ════════════════════════════════════════════════════════════
const defaultVocab = {
  Japanese: [
    { word:'桜',     phonetic:'Sa · ku · ra',    pos:'noun',      meaning:'Cherry Blossom',    example:'桜の花が咲いています。',         translation:'The cherry blossoms are blooming.' },
    { word:'橋',     phonetic:'Ha · shi',         pos:'noun',      meaning:'Bridge',            example:'川に橋があります。',             translation:'There is a bridge over the river.' },
    { word:'空',     phonetic:'So · ra',          pos:'noun',      meaning:'Sky / Air',         example:'今日の空はきれいです。',          translation:'The sky is beautiful today.' },
    { word:'猫',     phonetic:'Ne · ko',          pos:'noun',      meaning:'Cat',               example:'猫が眠っています。',             translation:'The cat is sleeping.' },
    { word:'食べる', phonetic:'Ta · be · ru',     pos:'verb',      meaning:'To eat',            example:'私は寿司を食べます。',           translation:'I eat sushi.' },
    { word:'嬉しい', phonetic:'U · re · shi · i', pos:'adjective', meaning:'Happy / Glad',      example:'あなたに会えて嬉しいです。',     translation:'I am happy to see you.' },
    { word:'勉強',   phonetic:'Ben · kyō',        pos:'noun/verb', meaning:'Study / To study',  example:'毎日日本語を勉強します。',       translation:'I study Japanese every day.' },
    { word:'電車',   phonetic:'Den · sha',        pos:'noun',      meaning:'Train',             example:'電車で学校に行きます。',         translation:'I go to school by train.' },
    { word:'友達',   phonetic:'To · mo · da · chi',pos:'noun',     meaning:'Friend',            example:'友達と映画を見ました。',         translation:'I watched a movie with my friend.' },
    { word:'山',     phonetic:'Ya · ma',          pos:'noun',      meaning:'Mountain',          example:'富士山は日本で一番高い山です。', translation:'Mt. Fuji is the tallest mountain in Japan.' },
    { word:'海',     phonetic:'U · mi',           pos:'noun',      meaning:'Sea / Ocean',       example:'夏に海で泳ぎます。',             translation:'I swim in the sea in summer.' },
    { word:'月',     phonetic:'Tsu · ki',         pos:'noun',      meaning:'Moon / Month',      example:'今夜の月は丸いです。',           translation:'Tonight\'s moon is full.' },
  ],
  French: [
    { word:'Bonjour',   phonetic:'Bon · zhur',     pos:'greeting', meaning:'Hello / Good day',  example:'Bonjour, comment allez-vous?',    translation:'Hello, how are you?' },
    { word:'Merci',     phonetic:'Mer · si',        pos:'phrase',   meaning:'Thank you',         example:'Merci beaucoup pour votre aide.', translation:'Thank you very much for your help.' },
    { word:'Maison',    phonetic:'Meh · zon',       pos:'noun',     meaning:'House / Home',      example:'Je rentre à la maison ce soir.',  translation:'I am going home tonight.' },
    { word:'Voyager',   phonetic:'Vwa · ya · zhé',  pos:'verb',     meaning:'To travel',         example:'J\'aime voyager en Europe.',      translation:'I love travelling in Europe.' },
    { word:'Beau',      phonetic:'Bo',              pos:'adjective',meaning:'Beautiful / Handsome',example:'Le paysage est très beau.',     translation:'The scenery is very beautiful.' },
    { word:'Amour',     phonetic:'A · mur',         pos:'noun',     meaning:'Love',              example:'L\'amour est fort.',              translation:'Love is powerful.' },
  ],
  Spanish: [
    { word:'Hola',      phonetic:'O · la',          pos:'greeting', meaning:'Hello',             example:'¡Hola! ¿Cómo estás?',            translation:'Hello! How are you?' },
    { word:'Gracias',   phonetic:'Gra · si · as',   pos:'phrase',   meaning:'Thank you',         example:'Muchas gracias por tu ayuda.',    translation:'Thank you very much for your help.' },
    { word:'Hermoso',   phonetic:'Er · mo · so',    pos:'adjective',meaning:'Beautiful',         example:'Qué día tan hermoso.',            translation:'What a beautiful day.' },
    { word:'Hablar',    phonetic:'Ab · lar',        pos:'verb',     meaning:'To speak / talk',   example:'Quiero hablar español mejor.',    translation:'I want to speak Spanish better.' },
    { word:'Corazón',   phonetic:'Ko · ra · son',   pos:'noun',     meaning:'Heart',             example:'Te quiero con todo mi corazón.',  translation:'I love you with all my heart.' },
    { word:'Libro',     phonetic:'Li · bro',        pos:'noun',     meaning:'Book',              example:'Estoy leyendo un buen libro.',    translation:'I am reading a good book.' },
  ],
  German: [
    { word:'Danke',     phonetic:'Dan · ke',        pos:'phrase',   meaning:'Thank you',         example:'Danke schön für die Hilfe.',      translation:'Thank you very much for the help.' },
    { word:'Wunderbar', phonetic:'Vun · der · bar', pos:'adjective',meaning:'Wonderful / Great', example:'Das ist wunderbar!',              translation:'That is wonderful!' },
    { word:'Freund',    phonetic:'Froynd',          pos:'noun',     meaning:'Friend',            example:'Er ist mein bester Freund.',      translation:'He is my best friend.' },
    { word:'Lernen',    phonetic:'Ler · nen',       pos:'verb',     meaning:'To learn',          example:'Ich lerne jeden Tag Deutsch.',    translation:'I learn German every day.' },
    { word:'Schön',     phonetic:'Shern',           pos:'adjective',meaning:'Beautiful / Nice',  example:'Du hast ein schönes Lächeln.',    translation:'You have a beautiful smile.' },
    { word:'Reise',     phonetic:'Rye · ze',        pos:'noun',     meaning:'Journey / Trip',    example:'Die Reise war fantastisch.',      translation:'The journey was fantastic.' },
  ],
  Italian: [
    { word:'Ciao',      phonetic:'Chow',            pos:'greeting', meaning:'Hello / Goodbye',   example:'Ciao! Come stai?',                translation:'Hello! How are you?' },
    { word:'Amore',     phonetic:'A · mo · re',     pos:'noun',     meaning:'Love',              example:'L\'amore è la cosa più bella.',   translation:'Love is the most beautiful thing.' },
    { word:'Bellissimo',phonetic:'Bel · lis · si · mo',pos:'adjective',meaning:'Very beautiful', example:'Che panorama bellissimo!',        translation:'What a beautiful view!' },
    { word:'Mangiare',  phonetic:'Man · jah · re',  pos:'verb',     meaning:'To eat',            example:'Mi piace mangiare la pasta.',     translation:'I love eating pasta.' },
    { word:'Famiglia',  phonetic:'Fa · mi · lia',   pos:'noun',     meaning:'Family',            example:'La famiglia è tutto per me.',     translation:'Family is everything to me.' },
    { word:'Grazie',    phonetic:'Gra · tsye',      pos:'phrase',   meaning:'Thank you',         example:'Grazie mille per il tuo aiuto.',  translation:'Thank you very much for your help.' },
  ],
  Hindi: [
    { word:'नमस्ते',   phonetic:'Na · mas · te',    pos:'greeting', meaning:'Hello / Greetings', example:'नमस्ते, आप कैसे हैं?',           translation:'Hello, how are you?' },
    { word:'धन्यवाद',  phonetic:'Dhan · ya · vad',  pos:'phrase',   meaning:'Thank you',         example:'आपकी मदद के लिए धन्यवाद।',       translation:'Thank you for your help.' },
    { word:'सुंदर',    phonetic:'Sun · dar',        pos:'adjective',meaning:'Beautiful / Pretty', example:'यह जगह बहुत सुंदर है।',           translation:'This place is very beautiful.' },
    { word:'पानी',    phonetic:'Pa · ni',           pos:'noun',     meaning:'Water',             example:'मुझे पानी चाहिए।',               translation:'I need water.' },
    { word:'खाना',    phonetic:'Kha · na',          pos:'noun/verb',meaning:'Food / To eat',     example:'खाना बहुत स्वादिष्ट है।',        translation:'The food is very delicious.' },
    { word:'दोस्त',   phonetic:'Dost',             pos:'noun',     meaning:'Friend',            example:'वो मेरा सबसे अच्छा दोस्त है।',   translation:'He is my best friend.' },
  ]
};

let localVocab = {};
try {
  localVocab = JSON.parse(localStorage.getItem('vocabCards')) || {};
} catch(e) {}

let vocabUpdated = false;
for (const lang in defaultVocab) {
  if (!localVocab[lang] || !Array.isArray(localVocab[lang]) || localVocab[lang].length === 0) {
    localVocab[lang] = defaultVocab[lang];
    vocabUpdated = true;
  }
}
if (vocabUpdated) {
  localStorage.setItem('vocabCards', JSON.stringify(localVocab));
}
const vocabCards = localVocab;

// ════════════════════════════════════════════════════════════
//  QUIZ QUESTIONS (Grammar, Daily Quiz, Reading)
// ════════════════════════════════════════════════════════════
const questions = {
  // grammar questions are now per-language (see grammarByLang below)
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
  ],
};

let localGrammar = {};
try {
  localGrammar = JSON.parse(localStorage.getItem('grammarByLang')) || {};
} catch(e) {}

let grammarUpdated = false;
for (const lang in defaultGrammar) {
  if (!localGrammar[lang] || !Array.isArray(localGrammar[lang]) || localGrammar[lang].length === 0) {
    localGrammar[lang] = defaultGrammar[lang];
    grammarUpdated = true;
  }
}
if (grammarUpdated) {
  localStorage.setItem('grammarByLang', JSON.stringify(localGrammar));
}
const grammarByLang = localGrammar;

// ── Sync curriculum from database on startup ──
async function syncCurriculumFromServer() {
  const lang = user.language || 'Japanese';
  try {
    const getApiUrl = () => {
      if (window.location.protocol === 'file:') {
        return 'http://localhost:5000/api';
      }
      if (window.location.port && window.location.port !== '5000') {
        return `${window.location.protocol}//${window.location.hostname}:5000/api`;
      }
      return '/api';
    };
    const API_URL = getApiUrl();
    const res = await fetch(`${API_URL}/curriculum?language=${lang}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.vocab && Array.isArray(data.vocab) && data.vocab.length > 0) {
        vocabCards[lang] = data.vocab;
        localStorage.setItem('vocabCards', JSON.stringify(vocabCards));
      }
      if (data.grammar && Array.isArray(data.grammar) && data.grammar.length > 0) {
        grammarByLang[lang] = data.grammar;
        localStorage.setItem('grammarByLang', JSON.stringify(grammarByLang));
      }
      console.log(`✅ Synced curriculum for ${lang} from database.`);
    }
  } catch (err) {
    console.warn('⚠️ Offline / backend unreachable. Using cached/default curriculum:', err);
  }
}
syncCurriculumFromServer();

// ── Language-specific Daily Quiz questions ──
const quizByLang = {
  Japanese: [
    { q: 'What does "Konnichiwa" mean?',       sentence: 'こんにちは — what is the English translation?',          options: ['Good morning','Hello / Good afternoon','Goodbye','Thank you'],      answer: 1 },
    { q: 'How do you say "Thank you" in Japanese?', sentence: 'You want to thank someone. You say:',                  options: ['すみません (Excuse me)','おはよう (Good morning)','ありがとう (Thank you)','さようなら (Goodbye)'], answer: 2 },
    { q: 'What does "Ichi" (一) mean?',         sentence: 'いち、に、さん... what is "いち"?',                         options: ['Two','Three','One','Four'],                                        answer: 2 },
    { q: 'What is the Japanese word for "water"?', sentence: 'You are thirsty and ask for ________.',              options: ['パン (Bread)','みず (Water)','さかな (Fish)','はな (Flower)'], answer: 1 },
    { q: 'What does "Kawaii" (かわいい) mean?',  sentence: 'The kitten is とても かわいい!',                         options: ['Scary','Cute / Adorable','Big','Fast'],                           answer: 1 },
    { q: 'How do you say "I" (first person) in Japanese?', sentence: '________ は がくせい です。 (I am a student)', options: ['あなた (You)','かれ (He)','わたし (I)','かのじょ (She)'], answer: 2 },
    { q: 'What does "Suki" (すき) mean?',        sentence: '日本語が すき です。',                                      options: ['Difficult','Like / Love','Hate','Study'],                         answer: 1 },
    { q: 'Which number is "Go" (ご) in Japanese?', sentence: 'いち、に、さん、し、_____',                            options: ['4','3','5','6'],                                                  answer: 2 },
  ],
  French: [
    { q: 'What does "Bonjour" mean?',           sentence: 'Bonjour! — what is the English translation?',            options: ['Goodbye','Good evening','Hello / Good day','Thank you'],           answer: 2 },
    { q: 'How do you say "Please" in French?',   sentence: 'Un café, ________, monsieur.',                          options: ['merci (Thank you)','bonjour (Hello)','s\'il vous plaît (Please)','au revoir (Goodbye)'], answer: 2 },
    { q: 'What does "Je m\'appelle" mean?',      sentence: 'Je m\'appelle Marie.',                                   options: ['I live in','I like','My name is','I am going to'],                answer: 2 },
    { q: 'Which is the French word for "bread"?', sentence: 'J\'achète du ________ à la boulangerie.',              options: ['lait (Milk)','pain (Bread)','eau (Water)','fromage (Cheese)'], answer: 1 },
    { q: 'How do you say "How are you?" formally?', sentence: '______, Madame Dupont?',                              options: ['Ça va? (You okay?)','Comment allez-vous? (How are you?)','Tu vas bien? (Are you well?)','Merci (Thanks)'], answer: 1 },
    { q: 'What does "Au revoir" mean?',          sentence: 'Au revoir, à bientôt!',                                  options: ['Hello','Thank you','Good morning','Goodbye'],                     answer: 3 },
    { q: 'How do you say "I love" in French?',   sentence: '________ le français.',                                  options: ['Je déteste (I hate)','Je mange (I eat)','J\'aime (I love)','Je parle (I speak)'], answer: 2 },
    { q: 'What is the French word for "water"?', sentence: 'Un verre d\'________, s\'il vous plaît.',               options: ['vin (Wine)','eau (Water)','lait (Milk)','jus (Juice)'], answer: 1 },
  ],
  Spanish: [
    { q: 'What does "Hola" mean?',               sentence: '¡Hola! ¿Cómo estás?',                                    options: ['Goodbye','Thank you','Hello','Please'],                            answer: 2 },
    { q: 'How do you say "Thank you" in Spanish?', sentence: '________ por tu ayuda.',                               options: ['Por favor (Please)','De nada (You\'re welcome)','Gracias (Thank you)','Lo siento (Sorry)'], answer: 2 },
    { q: 'What does "¿Cómo te llamas?" mean?',   sentence: '¿Cómo te llamas? — Me llamo Carlos.',                    options: ['Where do you live?','How old are you?','What is your name?','How are you?'], answer: 2 },
    { q: 'Which is the Spanish word for "house"?', sentence: 'Mi ________ está en Madrid.',                         options: ['escuela (School)','casa (House)','trabajo (Work)','tienda (Shop)'], answer: 1 },
    { q: 'What does "Buenos días" mean?',         sentence: '¡Buenos días! ¿Qué tal?',                               options: ['Good evening','Good night','Good morning','Good afternoon'],       answer: 2 },
    { q: 'How do you say "I want" in Spanish?',   sentence: '________ un café, por favor.',                          options: ['Tengo (I have)','Puedo (I can)','Quiero (I want)','Soy (I am)'], answer: 2 },
    { q: 'What is the Spanish word for "friend"?', sentence: 'Él es mi mejor ________.',                             options: ['enemigo (Enemy)','hermano (Brother)','amigo (Friend)','maestro (Teacher)'], answer: 2 },
    { q: 'What does "Por favor" mean?',           sentence: 'Dame un vaso de agua, ________.',                       options: ['Thank you','I\'m sorry','Please','Excuse me'],                    answer: 2 },
  ],
  German: [
    { q: 'What does "Guten Morgen" mean?',        sentence: 'Guten Morgen! Wie geht es Ihnen?',                      options: ['Good evening','Good night','Good afternoon','Good morning'],       answer: 3 },
    { q: 'How do you say "Thank you" in German?', sentence: '________ schön für Ihre Hilfe.',                        options: ['Bitte (Please)','Danke (Thank you)','Entschuldigung (Excuse me)','Hallo (Hello)'], answer: 1 },
    { q: 'What does "Wo ist" mean?',              sentence: 'Wo ist der Bahnhof?',                                    options: ['What is','Who is','Where is','When is'],                           answer: 2 },
    { q: 'How do you say "I speak" in German?',   sentence: '________ ein bisschen Deutsch.',                        options: ['Du sprichst (You speak)','Er spricht (He speaks)','Wir sprechen (We speak)','Ich spreche (I speak)'], answer: 3 },
    { q: 'What is the German word for "water"?',  sentence: 'Ein Glas ________, bitte.',                             options: ['Brot (Bread)','Milch (Milk)','Wasser (Water)','Wein (Wine)'], answer: 2 },
    { q: 'What does "Entschuldigung" mean?',      sentence: '________, wo ist die Toilette?',                        options: ['Thank you','Hello','Excuse me','Goodbye'],                         answer: 2 },
    { q: 'What is "Ja" in English?',              sentence: '"Ja, natürlich!" means:',                               options: ['No, of course','Yes, of course','Maybe, of course','Never'],       answer: 1 },
    { q: 'How do you say "How are you?" in German?', sentence: 'Hallo! ________?',                                   options: ['Wie heißen Sie? (What is your name?)','Wo wohnen Sie? (Where do you live?)','Wie geht es Ihnen? (How are you?)','Was machen Sie? (What are you doing?)'], answer: 2 },
  ],
  Italian: [
    { q: 'What does "Ciao" mean?',                sentence: 'Ciao! Come stai?',                                      options: ['Please','Thank you','Hello / Goodbye','Excuse me'],                answer: 2 },
    { q: 'How do you say "Thank you" in Italian?', sentence: '________ mille per il tuo aiuto.',                    options: ['Prego (You\'re welcome)','Per favore (Please)','Grazie (Thank you)','Ciao (Hello)'], answer: 2 },
    { q: 'What does "Come stai?" mean?',          sentence: 'Ciao! Come stai? Sto bene, grazie.',                    options: ['Where are you?','What is your name?','How are you?','What do you want?'], answer: 2 },
    { q: 'What is the Italian word for "beautiful"?', sentence: 'Che vista ________!',                               options: ['brutta (Ugly)','bella (Beautiful)','grande (Big)','piccola (Small)'], answer: 1 },
    { q: 'How do you say "Please" in Italian?',   sentence: 'Un caffè, ________, signore.',                          options: ['grazie (Thanks)','prego (You\'re welcome)','per favore (Please)','scusi (Excuse me)'], answer: 2 },
    { q: 'What does "Mangiare" mean?',            sentence: 'Mi piace ________ la pizza.',                           options: ['drink','sleep','eat','walk'],                                     answer: 2 },
    { q: 'How do you say "Good night" in Italian?', sentence: '________, a domani!',                                 options: ['Buongiorno (Good morning)','Buona sera (Good evening)','Buona notte (Good night)','Arrivederci (Goodbye)'], answer: 2 },
    { q: 'What is "Acqua" in English?',            sentence: 'Un bicchiere d\'acqua, per favore.',                   options: ['Wine','Bread','Coffee','Water'],                                   answer: 3 },
  ],
  Hindi: [
    { q: 'What does "Namaste" mean?',             sentence: 'नमस्ते! आप कैसे हैं?',                                   options: ['Goodbye','Thank you','Hello / Greetings','Please'],                answer: 2 },
    { q: 'How do you say "Thank you" in Hindi?',  sentence: 'आपकी मदद के लिए ________।',                             options: ['नमस्ते (Hello)','कृपया (Please)','धन्यवाद (Thank you)','माफ करें (Excuse me)'], answer: 2 },
    { q: 'What does "Pani" (पानी) mean?',          sentence: 'मुझे पानी चाहिए。',                                      options: ['Food','Tea','Water','Milk'],                                       answer: 2 },
    { q: 'How do you say "Yes" in Hindi?',         sentence: '________, मैं आ सकता हूँ。',                            options: ['नहीं (No)','शायद (Maybe)','हाँ (Yes)','कभी नहीं (Never)'], answer: 2 },
    { q: 'What does "Khana" (खाना) mean?',         sentence: 'खाना बहुत स्वादिष्ट है。',                              options: ['Water','Sleep','Food','Work'],                                     answer: 2 },
    { q: 'What is the Hindi word for "friend"?',   sentence: 'वो मेरा सबसे अच्छा ________ है。',                     options: ['भाई (Brother)','दुश्मन (Enemy)','दोस्त (Friend)','टीचर (Teacher)'], answer: 2 },
    { q: 'How do you say "My name is" in Hindi?', sentence: '________ Aryan है。',                                   options: ['मेरा नाम (My name)','तुम्हारा नाम (Your name)','उसका नाम (His name)','हमारा नाम (Our name)'], answer: 0 },
    { q: 'What does "Sundar" (सुंदर) mean?',       sentence: 'यह जगह बहुत सुंदर है。',                               options: ['Scary','Big','Old','Beautiful'],                                   answer: 3 },
  ],
};

// ── Reading passages per language ──
const readingByLang = {
  Japanese: [
    { passage: '田中さんは毎日学校へ行きます。日本語と数学を勉強します。好きな科目は美術です。', translation: 'Tanaka-san goes to school every day. He studies Japanese and Math. His favourite subject is Art.', q: 'Reading Comprehension', sentence: 'What is Tanaka\'s favourite subject?', options: ['Japanese','Maths','Art','Science'], answer: 2 },
    { passage: 'ゆきさんは毎朝ジョギングをします。そのあとシャワーを浴びて、朝ごはんを食べます。', translation: 'Yuki-san goes jogging every morning. After that, she takes a shower and eats breakfast.', q: 'Reading Comprehension', sentence: 'What does Yuki do every morning?', options: ['Cycling','Jogging','Swimming','Yoga'], answer: 1 },
  ],
  French: [
    { passage: 'Marie est médecin. Elle travaille à l\'hôpital de Paris. Elle aime beaucoup son travail.', translation: 'Marie is a doctor. She works at the Paris hospital. She loves her job very much.', q: 'Reading Comprehension', sentence: 'Where does Marie work?', options: ['At a school','At a hospital','At a restaurant','At home'], answer: 1 },
    { passage: 'Pierre va à la boulangerie chaque matin. Il achète du pain et des croissants pour sa famille.', translation: 'Pierre goes to the bakery every morning. He buys bread and croissants for his family.', q: 'Reading Comprehension', sentence: 'What does Pierre buy?', options: ['Milk and cheese','Bread and croissants','Coffee and cake','Fruit and vegetables'], answer: 1 },
  ],
  Spanish: [
    { passage: 'Carlos estudia español en la universidad. Le gusta mucho aprender idiomas nuevos.', translation: 'Carlos studies Spanish at the university. He really likes learning new languages.', q: 'Reading Comprehension', sentence: 'What is Carlos studying?', options: ['English','French','Spanish','German'], answer: 2 },
  ],
  German: [
    { passage: 'Am Wochenende geht Anna gern in den Park. Sie liest Bücher und hört Musik.', translation: 'On weekends, Anna likes to go to the park. She reads books and listens to music.', q: 'Reading Comprehension', sentence: 'What does Anna do on weekends?', options: ['Goes shopping','Visits friends','Goes to the park','Goes to the cinema'], answer: 2 },
  ],
  Italian: [
    { passage: 'Luca abita a Roma con la sua famiglia. Lavora in un ristorante vicino al Colosseo.', translation: 'Luca lives in Rome with his family. He works in a restaurant near the Colosseum.', q: 'Reading Comprehension', sentence: 'Where does Luca live?', options: ['Milan','Naples','Florence','Rome'], answer: 3 },
  ],
  Hindi: [
    { passage: 'प्रिया को पढ़ना बहुत पसंद है। वो हर रोज़ एक घंटा किताब पढ़ती है。', translation: 'Priya loves to read. She reads a book for an hour every day.', q: 'Reading Comprehension', sentence: 'What does Priya like?', options: ['Cooking','Dancing','Reading','Singing'], answer: 2 },
  ],
};

let currentModule = 'grammar';
let currentIndex  = 0;
let score         = 0;
let answered      = false;

// ════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════
function showModulePicker() {
  document.getElementById('modulePicker').style.display      = 'block';
  document.getElementById('quizInterface').style.display     = 'none';
  document.getElementById('flashcardInterface').style.display = 'none';
}

function startModule(type) {
  currentModule = type;
  currentIndex  = 0;
  score         = 0;
  answered      = false;

  document.getElementById('modulePicker').style.display = 'none';

  if (type === 'vocab') {
    startFlashcards();   // ← Vocabulary goes to flashcard mode
  } else {
    document.getElementById('quizInterface').style.display = 'block';
    const lang   = user.language || 'Japanese';
    const titles = { grammar:'Grammar Lessons', quiz:'Daily Quiz', reading:'Reading Practice' };
    const units  = { grammar:`${lang} Grammar`, quiz:`${lang} Vocabulary`, reading:`${lang} Reading` };
    document.getElementById('quizTitle').textContent = titles[type];
    document.getElementById('quizUnit').textContent  = units[type];

    // For grammar, daily quiz and reading, swap in language-specific questions
    if (type === 'grammar') {
      questions.grammar = (grammarByLang[lang] || grammarByLang['Japanese']).slice();
    }
    if (type === 'quiz') {
      questions.quiz = (quizByLang[lang] || quizByLang['Japanese']).slice();
      // Shuffle so it feels fresh each time
      questions.quiz.sort(() => Math.random() - 0.5);
    }
    if (type === 'reading') {
      questions.reading = (readingByLang[lang] || readingByLang['Japanese']).slice();
    }

    loadQuestion();
  }
}

// ════════════════════════════════════════════════════════════
//  FLASHCARD ENGINE
// ════════════════════════════════════════════════════════════
let fcCards      = [];
let fcIndex      = 0;
let fcKnown      = 0;
let fcUnknown    = 0;
let fcIsFlipped  = false;
let practiceAgainQueue = []; // cards marked "practice more" get re-added

const langCodes = {
  Japanese:'ja-JP', French:'fr-FR', Spanish:'es-ES',
  German:'de-DE',   Italian:'it-IT', Hindi:'hi-IN'
};

function startFlashcards() {
  document.getElementById('flashcardInterface').style.display = 'block';

  // Pick cards for this user's language (fallback to Japanese)
  const lang   = user.language || 'Japanese';
  fcCards      = [...(vocabCards[lang] || vocabCards['Japanese'])];
  fcIndex      = 0;
  fcKnown      = 0;
  fcUnknown    = 0;
  fcIsFlipped  = false;
  practiceAgainQueue = [];

  document.getElementById('fcUnit').textContent = `${fcCards.length} cards · ${lang}`;
  loadFlashcard();
}

function loadFlashcard() {
  fcIsFlipped = false;
  document.getElementById('flashcard').classList.remove('is-flipped');
  document.getElementById('fcActions').style.display = 'none';
  document.getElementById('fcTapHint').style.display = 'block';

  // All cards done → show results
  if (fcIndex >= fcCards.length) {
    if (practiceAgainQueue.length > 0) {
      // Go through "practice again" cards
      fcCards  = [...practiceAgainQueue];
      practiceAgainQueue = [];
      fcIndex  = 0;
      showToast(`Round 2! ${fcCards.length} cards to practice 💪`);
      loadFlashcard();
    } else {
      showFlashcardResults();
    }
    return;
  }

  const card = fcCards[fcIndex];
  const total = fcCards.length;

  document.getElementById('fcWord').textContent      = card.word;
  document.getElementById('fcPhonetic').textContent  = card.phonetic;
  document.getElementById('fcPos').textContent       = card.pos;
  document.getElementById('fcMeaning').textContent   = card.meaning;
  document.getElementById('fcExample').textContent   = card.example;
  document.getElementById('fcTranslation').textContent = card.translation;

  document.getElementById('fcCounter').textContent   = `Card ${fcIndex + 1} of ${total}`;
  document.getElementById('remainingCount').textContent = total - fcIndex;
  document.getElementById('knownCount').textContent  = fcKnown;
  document.getElementById('unknownCount').textContent = fcUnknown;

  const pct = (fcIndex / total) * 100;
  document.getElementById('fcProgressFill').style.width = pct + '%';
}

function flipFlashcard() {
  const card = document.getElementById('flashcard');
  fcIsFlipped = !fcIsFlipped;
  card.classList.toggle('is-flipped', fcIsFlipped);

  if (fcIsFlipped) {
    // Show action buttons after flip
    document.getElementById('fcActions').style.display = 'flex';
    document.getElementById('fcTapHint').style.display = 'none';
  } else {
    document.getElementById('fcActions').style.display = 'none';
    document.getElementById('fcTapHint').style.display = 'block';
  }
}

function fcAnswer(knew) {
  if (knew) {
    fcKnown++;
  } else {
    fcUnknown++;
    practiceAgainQueue.push(fcCards[fcIndex]); // Re-add for practice
  }
  fcIndex++;
  loadFlashcard();
}

// ── Speak word using Web Speech API
function fcSpeak(event) {
  event.stopPropagation();
  speak(document.getElementById('fcWord').textContent);
}
function fcSpeakExample(event) {
  event.stopPropagation();
  speak(document.getElementById('fcExample').textContent);
}
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  // Clean markdown, quotes, parenthesized translations, and emojis
  const cleanText = text
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    .replace(/[`"']/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utt  = new SpeechSynthesisUtterance(cleanText);
  utt.lang   = langCodes[user.language] || 'ja-JP';
  utt.rate   = 0.8;
  window.speechSynthesis.speak(utt);
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    background:var(--primary);color:white;padding:10px 20px;border-radius:99px;
    font-size:14px;font-weight:600;z-index:999;animation:fadeUp 0.3s ease;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function showFlashcardResults() {
  document.getElementById('flashcardInterface').innerHTML = `
    <div class="card" style="text-align:center;padding:52px;max-width:520px;margin:0 auto;">
      <div style="font-size:60px;margin-bottom:16px;">🎉</div>
      <h2 style="font-size:24px;margin-bottom:8px;">Vocabulary Session Complete!</h2>
      <p style="color:var(--text-secondary);margin-bottom:28px;">You went through all the flashcards!</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;">
        <div style="padding:20px;background:rgba(92, 93, 103,0.08);border:1px solid rgba(92, 93, 103,0.25);border-radius:12px;">
          <p style="font-size:36px;font-weight:800;color:var(--accent-green);">${fcKnown}</p>
          <p style="color:var(--text-secondary);font-size:13px;">✅ Words Learned</p>
        </div>
        <div style="padding:20px;background:rgba(196, 147, 176,0.08);border:1px solid rgba(196, 147, 176,0.25);border-radius:12px;">
          <p style="font-size:36px;font-weight:800;color:var(--accent-red);">${fcUnknown}</p>
          <p style="color:var(--text-secondary);font-size:13px;">🔄 Need More Practice</p>
        </div>
      </div>
      <p style="font-size:28px;font-weight:700;color:var(--accent-yellow);margin-bottom:28px;">
        +${fcKnown * 10} XP Earned!
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button class="btn-primary" onclick="startModule('vocab')">Practice Again 🔄</button>
        <button class="btn-primary" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);" onclick="showModulePicker()">Back to Modules</button>
      </div>
    </div>`;

  // ── Save stats to shared store ──
  if (typeof LinguovaStats !== 'undefined') {
    LinguovaStats.addWords(fcKnown);
    LinguovaStats.addXP(fcKnown * 10, 'vocab');
  }
}

// ════════════════════════════════════════════════════════════
//  QUIZ ENGINE (Grammar, Daily Quiz, Reading)
// ════════════════════════════════════════════════════════════
function loadQuestion() {
  const qs = questions[currentModule];
  if (!qs || currentIndex >= qs.length) { showResults(); return; }

  const q = qs[currentIndex];
  answered = false;

  document.getElementById('questionText').textContent = q.q;
  document.getElementById('questionCounter').textContent = `Question ${currentIndex + 1} of ${qs.length}`;
  document.getElementById('progressFill').style.width = `${(currentIndex / qs.length) * 100}%`;

  // Toggle passage box vs standard sentence box
  if (currentModule === 'reading' && q.passage) {
    document.getElementById('readingPassageBox').style.display = 'block';
    document.getElementById('readingPassageText').textContent  = q.passage;
    document.getElementById('readingTranslationText').textContent = q.translation;
    document.getElementById('sentenceBox').textContent = q.sentence; // The actual question
  } else {
    document.getElementById('readingPassageBox').style.display = 'none';
    document.getElementById('sentenceBox').textContent = q.sentence;
  }

  const grid    = document.getElementById('optionsGrid');
  const letters = ['A','B','C','D'];
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <div style="display:flex; align-items:center;"><span class="option-letter">${letters[i]}</span><span class="opt-text">${opt}</span></div>
        <span class="opt-speak" style="cursor:pointer; font-size:18px; padding:4px;" onclick="event.stopPropagation(); speakText(this.previousElementSibling.querySelector('.opt-text').textContent)" title="Listen to option">🔊</span>
      </div>
    `;
    btn.onclick = () => selectAnswer(i, q.answer, btn);
    grid.appendChild(btn);
  });
}

function selectAnswer(selected, correct, btn) {
  if (answered) return;
  answered = true;

  const allBtns = document.querySelectorAll('.option-btn');
  allBtns[correct].classList.add('correct');

  // Get ONLY the answer text
  const correctText = allBtns[correct].querySelector('.opt-text')?.textContent?.trim() || '';

  if (selected === correct) {
    score++;
    showFeedback(true, correctText);
  } else {
    btn.classList.add('wrong');
    showFeedback(false, correctText);
  }
}

function showFeedback(correct, correctText) {
  const box = document.getElementById('feedbackBox');
  if (correct) {
    box.innerHTML = `
      <span style="font-size:52px;display:block;margin-bottom:12px;">✅</span>
      <p style="font-size:20px;font-weight:700;margin-bottom:6px;color:var(--accent-green);">Correct! +20 XP 🎉</p>
      <p style="font-size:14px;color:var(--text-secondary);margin-bottom:24px;">Great job! Keep it up.</p>
      <button class="btn-primary" onclick="nextQuestion()">Next Question →</button>`;
  } else {
    box.innerHTML = `
      <span style="font-size:52px;display:block;margin-bottom:12px;">❌</span>
      <p style="font-size:18px;font-weight:700;margin-bottom:16px;">Not quite this time!</p>
      <div style="
        background: rgba(92, 93, 103,0.1);
        border: 1.5px solid rgba(92, 93, 103,0.35);
        border-radius: 10px;
        padding: 14px 20px;
        margin-bottom: 20px;
        text-align:left;
      ">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:var(--accent-green);margin-bottom:6px;">✅ CORRECT ANSWER</p>
        <p style="font-size:17px;font-weight:700;color:var(--text-primary);">${correctText}</p>
      </div>
      <button class="btn-primary" onclick="nextQuestion()">Next Question →</button>`;
  }
  document.getElementById('feedback').style.display = 'flex';
}
function nextQuestion() {
  document.getElementById('feedback').style.display = 'none';
  currentIndex++;
  loadQuestion();
}
function skipQuestion() { currentIndex++; loadQuestion(); }

function showResults() {
  const qs = questions[currentModule];

  // ── Save stats to shared store ──
  if (typeof LinguovaStats !== 'undefined') {
    const src = currentModule === 'grammar' ? 'grammar' : 'vocab';
    LinguovaStats.recordQuiz(score, qs.length, src);
    LinguovaStats.addXP(score * 20, src);
  }

  document.getElementById('quizInterface').innerHTML = `
    <div class="card" style="text-align:center;padding:48px;max-width:500px;margin:0 auto;">
      <div style="font-size:56px;margin-bottom:16px;">🎉</div>
      <h2 style="font-size:24px;margin-bottom:8px;">Module Complete!</h2>
      <p style="color:var(--text-secondary);margin-bottom:24px;">You scored ${score} out of ${qs.length}</p>
      <p style="font-size:32px;font-weight:700;color:var(--accent-yellow);margin-bottom:32px;">+${score * 20} XP Earned!</p>
      <button class="btn-primary" onclick="showModulePicker()">Back to Modules</button>
    </div>`;
}

// ── Voice Assistance for Reading Passages ──
function speakReadingPassage(isEnglish) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const text = isEnglish 
    ? document.getElementById('readingTranslationText').textContent 
    : document.getElementById('readingPassageText').textContent;
    
  // Clean markdown, quotes, parenthesized translations, and emojis
  const cleanText = text
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    .replace(/[`"']/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utt = new SpeechSynthesisUtterance(cleanText);
  
  if (isEnglish) {
    utt.lang = 'en-US';
  } else {
    utt.lang = langCodes[user.language] || 'ja-JP';
  }
  
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

// ── Voice Assistance for Quiz / Grammar ──
function speakSentence() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  let sentence = document.getElementById('sentenceBox').textContent || '';
  // Replace the blank ____ with the word "blank"
  sentence = sentence.replace(/_+/g, "blank");
  // Strip English translation in parentheses if present
  sentence = sentence.replace(/\s*\([^)]*\)/g, '').trim();
  
  speakTextCore(sentence);
}

function speakText(rawText) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Strip English translation in parentheses
  const textToRead = rawText.replace(/\s*\([^)]*\)/g, '').trim();
  speakTextCore(textToRead);
}

function speakTextCore(text) {
  if (!text) return;
  
  // Clean markdown, quotes, parenthesized translations, and emojis
  const cleanText = text
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    .replace(/[`"']/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utt = new SpeechSynthesisUtterance(cleanText);
  utt.lang = langCodes[user.language] || 'ja-JP';
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

// ── SIDEBAR DYNAMIC UPDATES ──
function updateSidebarUserCard() {
  try {
    const sbUser = JSON.parse(localStorage.getItem('user')) || {};
    const sbStats = typeof LinguovaStats !== 'undefined' ? LinguovaStats.get() : {};
    const sbXp = sbStats.xp ?? sbUser.xp ?? 0;
    const sbLevelNum = Math.floor(sbXp / 400) + 1;
    const sbLevelStr = sbUser.level || 'Beginner';

    const nameEl = document.getElementById('userName');
    const initialsEl = document.getElementById('userInitials');
    const levelEl = document.getElementById('userLevel');

    if (nameEl) nameEl.textContent = sbUser.name || '';
    if (initialsEl && sbUser.name) {
      initialsEl.textContent = sbUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (levelEl) levelEl.textContent = `Level ${sbLevelNum} · ${sbLevelStr}`;
  } catch (e) {
    console.error('Error updating sidebar user card:', e);
  }
}

// Update on storage change
window.addEventListener('storage', (e) => {
  if ((e.key && e.key.startsWith('linguova_stats')) || e.key === 'user') {
    updateSidebarUserCard();
  }
});

// Polling interval
setInterval(updateSidebarUserCard, 3000);
