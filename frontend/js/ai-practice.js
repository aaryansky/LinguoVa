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
const userLevel = user.level || 'Learner';
document.getElementById('coachSub').textContent = `AI ${user.language} Tutor · ${userLevel}`;

const coachNames = {
  Japanese: 'Coach Yuki',
  French: 'Coach Chloé',
  Spanish: 'Coach Sofia',
  German: 'Coach Heidi',
  Italian: 'Coach Giulia',
  Hindi: 'Coach Priya'
};
const coachNameEl = document.getElementById('coachName');
if (coachNameEl) {
  coachNameEl.textContent = coachNames[user.language] || 'Coach Emma';
}

const langSelect = document.getElementById('langSelect');
if (langSelect) {
  langSelect.value = user.language || 'Japanese';
  langSelect.addEventListener('change', (e) => {
    user.language = e.target.value;
    localStorage.setItem('user', JSON.stringify(user));
    window.location.reload();
  });
}

// ══════════════════════════════════
//  FREE PRACTICE DATA
// ══════════════════════════════════
const freePracticeData = {
  Japanese: {
    greeting: "こんにちは！ I'm Coach Yuki! 🌸 Talk to me in Japanese or ask anything. I'll gently correct any mistakes!",
    vocab: [{ native: 'こんにちは', en: 'Hello' }, { native: 'ありがとう', en: 'Thank you' }, { native: 'はい / いいえ', en: 'Yes / No' }],
    hint: { rule: 'Basic: Subject + Object + Verb', example: '私は水を飲みます', trans: 'I drink water' }
  },
  French: {
    greeting: "Bonjour ! I'm Coach Chloé! 🌸 Talk to me in French or ask anything. I'll gently correct any mistakes!",
    vocab: [{ native: 'Bonjour', en: 'Hello' }, { native: 'Merci', en: 'Thank you' }, { native: 'Oui / Non', en: 'Yes / No' }],
    hint: { rule: 'Basic: Subject + Verb + Object', example: "Je bois de l'eau", trans: 'I drink water' }
  },
  Spanish: {
    greeting: "¡Hola! I'm Coach Sofia! 🌸 Talk to me in Spanish or ask anything. I'll gently correct any mistakes!",
    vocab: [{ native: 'Hola', en: 'Hello' }, { native: 'Gracias', en: 'Thank you' }, { native: 'Sí / No', en: 'Yes / No' }],
    hint: { rule: 'Adjectives usually follow nouns', example: 'El gato negro', trans: 'The black cat' }
  },
  German: {
    greeting: "Hallo! I'm Coach Heidi! 🌸 Talk to me in German or ask anything. I'll gently correct any mistakes!",
    vocab: [{ native: 'Hallo', en: 'Hello' }, { native: 'Danke', en: 'Thank you' }, { native: 'Ja / Nein', en: 'Yes / No' }],
    hint: { rule: 'Verbs are usually in the second position', example: 'Ich trinke Wasser', trans: 'I drink water' }
  },
  Italian: {
    greeting: "Ciao! I'm Coach Giulia! 🌸 Talk to me in Italian or ask anything. I'll gently correct any mistakes!",
    vocab: [{ native: 'Ciao', en: 'Hello' }, { native: 'Grazie', en: 'Thank you' }, { native: 'Sì / No', en: 'Yes / No' }],
    hint: { rule: 'Subject pronouns are often omitted', example: '(Io) bevo acqua', trans: 'I drink water' }
  },
  Hindi: {
    greeting: "नमस्ते! I'm Coach Priya! 🌸 Talk to me in Hindi or ask anything. I'll gently correct any mistakes!",
    vocab: [{ native: 'नमस्ते', en: 'Hello' }, { native: 'धन्यवाद', en: 'Thank you' }, { native: 'हाँ / नहीं', en: 'Yes / No' }],
    hint: { rule: 'Basic: Subject + Object + Verb', example: 'मैं पानी पीता हूँ', trans: 'I drink water' }
  }
};

function initFreePractice() {
  const lang = user.language || 'Japanese';
  const data = freePracticeData[lang] || freePracticeData['Japanese'];
  
  const freeMessages = document.getElementById('freeMessages');
  if (freeMessages && freeMessages.children.length === 0) {
    freeMessages.innerHTML = `
      <div class="msg ai-msg">
        <div class="msg-avatar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
        <div class="msg-bubble">
          <p>${data.greeting}</p>
          <button class="tts-btn" onclick="playPracticeTTS(this.dataset.text)" data-text="${encodeURIComponent(data.greeting)}" title="Listen to message">🔊</button>
        </div>
      </div>
    `;
  }
  
  const freeInput = document.getElementById('freeInput');
  if (freeInput) freeInput.placeholder = `Type in ${lang}, English, or mix both...`;

  const vocabList = document.getElementById('vocabList');
  if (vocabList) {
    vocabList.innerHTML = data.vocab.map(v => `
      <div class="vocab-item"><span class="vocab-jp">${v.native}</span><span class="vocab-en">${v.en}</span></div>
    `).join('');
  }

  const hintBox = document.getElementById('grammarHintBox');
  if (hintBox) {
    hintBox.innerHTML = `
      <p class="hint-rule">${data.hint.rule}</p>
      <p class="hint-example">${data.hint.example}</p>
      <p class="hint-trans">${data.hint.trans}</p>
    `;
  }
}

initFreePractice();

// ══════════════════════════════════
//  LANGUAGE-SPECIFIC PHRASES
// ══════════════════════════════════
const scenarioPhrases = {
  cafe: {
    Japanese: [
      { native: 'メニューをください', phonetic: 'Menyu wo kudasai', en: 'May I have the menu?' },
      { native: 'コーヒーをひとつ', phonetic: 'Kohi wo hitotsu', en: 'One coffee, please' },
      { native: 'いくらですか？', phonetic: 'Ikura desu ka?', en: 'How much is it?' },
    ],
    French: [
      { native: 'Le menu, s\'il vous plaît', phonetic: 'Luh muh-nü, sil voo pleh', en: 'The menu, please' },
      { native: 'Un café, s\'il vous plaît', phonetic: 'Uhn kah-fay, sil voo pleh', en: 'One coffee, please' },
      { native: 'C\'est combien ?', phonetic: 'Say kohm-byahn', en: 'How much is it?' },
    ],
    Spanish: [
      { native: '¿Me puede traer el menú?', phonetic: 'Meh pweh-deh trah-air el meh-noo', en: 'Can you bring me the menu?' },
      { native: 'Un café, por favor', phonetic: 'Oon kah-feh, por fah-vor', en: 'One coffee, please' },
      { native: '¿Cuánto es?', phonetic: 'Kwan-toh es', en: 'How much is it?' },
    ],
    German: [
      { native: 'Die Speisekarte, bitte', phonetic: 'Dee shpay-zeh-kar-teh, bit-teh', en: 'The menu, please' },
      { native: 'Einen Kaffee, bitte', phonetic: 'Eye-nen kaf-feh, bit-teh', en: 'One coffee, please' },
      { native: 'Was kostet das?', phonetic: 'Vass kos-tet das', en: 'How much does it cost?' },
    ],
    Italian: [
      { native: 'Il menù, per favore', phonetic: 'Eel meh-noo, pehr fah-voh-reh', en: 'The menu, please' },
      { native: 'Un caffè, per favore', phonetic: 'Oon kaf-feh, pehr fah-voh-reh', en: 'One coffee, please' },
      { native: 'Quanto costa?', phonetic: 'Kwan-toh kos-tah', en: 'How much is it?' },
    ],
    Hindi: [
      { native: 'मेनू दीजिए', phonetic: 'Menu dijiye', en: 'Please give me the menu' },
      { native: 'एक कॉफ़ी लाइए', phonetic: 'Ek coffee laiye', en: 'Please bring one coffee' },
      { native: 'यह कितने का है?', phonetic: 'Yah kitne ka hai?', en: 'How much does this cost?' },
    ],
  },
  restaurant: {
    Japanese: [
      { native: '予約があります', phonetic: 'Yoyaku ga arimasu', en: 'I have a reservation' },
      { native: 'おすすめは何ですか？', phonetic: 'Osusume wa nan desu ka?', en: 'What do you recommend?' },
      { native: 'お会計をお願いします', phonetic: 'Okaikei wo onegaishimasu', en: 'Check, please' },
    ],
    French: [
      { native: 'J\'ai une réservation', phonetic: 'Zhay ün reh-zehr-vah-syohn', en: 'I have a reservation' },
      { native: 'Qu\'est-ce que vous recommandez ?', phonetic: 'Kes-keh voo reh-ko-mahn-day', en: 'What do you recommend?' },
      { native: 'L\'addition, s\'il vous plaît', phonetic: 'Lah-dee-syohn, sil voo pleh', en: 'The check, please' },
    ],
    Spanish: [
      { native: 'Tengo una reserva', phonetic: 'Ten-go oo-nah reh-sehr-vah', en: 'I have a reservation' },
      { native: '¿Qué me recomienda?', phonetic: 'Keh meh reh-ko-myehn-dah', en: 'What do you recommend?' },
      { native: 'La cuenta, por favor', phonetic: 'Lah kwehn-tah, por fah-vor', en: 'The check, please' },
    ],
    German: [
      { native: 'Ich habe eine Reservierung', phonetic: 'Ikh hah-beh eye-neh reh-sehr-vee-roong', en: 'I have a reservation' },
      { native: 'Was empfehlen Sie?', phonetic: 'Vas em-pfay-len zee', en: 'What do you recommend?' },
      { native: 'Die Rechnung, bitte', phonetic: 'Dee rech-noong, bit-teh', en: 'The check, please' },
    ],
    Italian: [
      { native: 'Ho una prenotazione', phonetic: 'Oh oo-nah preh-no-tah-tsyoh-neh', en: 'I have a reservation' },
      { native: 'Cosa consiglia?', phonetic: 'Koh-zah kon-see-lyah', en: 'What do you recommend?' },
      { native: 'Il conto, per favore', phonetic: 'Eel kon-toh, pehr fah-voh-reh', en: 'The check, please' },
    ],
    Hindi: [
      { native: 'मेरी बुकिंग है', phonetic: 'Meri booking hai', en: 'I have a reservation' },
      { native: 'आप क्या सुझाते हैं?', phonetic: 'Aap kya sujhate hain?', en: 'What do you recommend?' },
      { native: 'बिल लाइए, कृपया', phonetic: 'Bill laiye, kripaya', en: 'Please bring the bill' },
    ],
  },
  airport: {
    Japanese: [
      { native: 'チェックインをお願いします', phonetic: 'Chekkuin wo onegaishimasu', en: 'Check-in please' },
      { native: '搭乗口はどこですか？', phonetic: 'Tojoguchi wa doko desu ka?', en: 'Where is the boarding gate?' },
      { native: '窓側の席をお願いします', phonetic: 'Madogawa no seki wo onegaishimasu', en: 'Window seat, please' },
    ],
    French: [
      { native: 'Je voudrais m\'enregistrer', phonetic: 'Zhuh voo-dreh mahn-reh-zhees-treh', en: 'I would like to check in' },
      { native: 'Où est la porte d\'embarquement ?', phonetic: 'Oo eh lah port dahm-bark-mahn', en: 'Where is the boarding gate?' },
      { native: 'Un siège côté fenêtre, s\'il vous plaît', phonetic: 'Uhn syehj koh-tay fuh-nehtr, sil voo pleh', en: 'A window seat, please' },
    ],
    Spanish: [
      { native: 'Quiero hacer el check-in', phonetic: 'Kyeh-ro ah-sehr el check-in', en: 'I want to check in' },
      { native: '¿Dónde está la puerta?', phonetic: 'Dohn-deh es-tah lah pwehr-tah', en: 'Where is the gate?' },
      { native: 'Un asiento de ventana, por favor', phonetic: 'Oon ah-syehn-toh deh vehn-tah-nah, por fah-vor', en: 'A window seat, please' },
    ],
    German: [
      { native: 'Ich möchte einchecken', phonetic: 'Ikh mökh-teh eyn-chek-en', en: 'I would like to check in' },
      { native: 'Wo ist das Gate?', phonetic: 'Voh ist das gate', en: 'Where is the gate?' },
      { native: 'Einen Fensterplatz, bitte', phonetic: 'Eye-nen fen-ster-plats, bit-teh', en: 'A window seat, please' },
    ],
    Italian: [
      { native: 'Vorrei fare il check-in', phonetic: 'Vor-ray fah-reh eel check-in', en: 'I would like to check in' },
      { native: 'Dov\'è il gate?', phonetic: 'Doh-veh eel gate', en: 'Where is the gate?' },
      { native: 'Un posto al finestrino, per favore', phonetic: 'Oon pos-toh al fee-neh-stree-noh, pehr fah-voh-reh', en: 'A window seat, please' },
    ],
    Hindi: [
      { native: 'चेक-इन करना है', phonetic: 'Check-in karna hai', en: 'I need to check in' },
      { native: 'गेट कहाँ है?', phonetic: 'Gate kahan hai?', en: 'Where is the gate?' },
      { native: 'खिड़की की सीट चाहिए', phonetic: 'Khidki ki seat chahiye', en: 'I want a window seat' },
    ],
  },
  hotel: {
    Japanese: [
      { native: 'チェックインしたいです', phonetic: 'Chekkuin shitai desu', en: 'I\'d like to check in' },
      { native: '予約番号は～です', phonetic: 'Yoyaku bango wa ~ desu', en: 'My reservation number is ~' },
      { native: 'WiFiのパスワードは？', phonetic: 'WiFi no pasuwado wa?', en: 'What\'s the WiFi password?' },
    ],
    French: [
      { native: 'Je voudrais m\'enregistrer', phonetic: 'Zhuh voo-dreh mahn-reh-zhees-treh', en: 'I\'d like to check in' },
      { native: 'Mon numéro de réservation est...', phonetic: 'Mohn nü-meh-roh duh reh-zehr-vah-syohn eh', en: 'My reservation number is...' },
      { native: 'Quel est le mot de passe WiFi ?', phonetic: 'Kel eh luh moh duh pass WiFi', en: 'What\'s the WiFi password?' },
    ],
    Spanish: [
      { native: 'Quisiera registrarme', phonetic: 'Kee-syeh-rah reh-hees-trar-meh', en: 'I\'d like to check in' },
      { native: 'Mi número de reserva es...', phonetic: 'Mee noo-meh-ro deh reh-sehr-vah es', en: 'My reservation number is...' },
      { native: '¿Cuál es la contraseña del WiFi?', phonetic: 'Kwal es lah kon-trah-seh-nyah del WiFi', en: 'What\'s the WiFi password?' },
    ],
    German: [
      { native: 'Ich möchte einchecken', phonetic: 'Ikh mökh-teh eyn-chek-en', en: 'I\'d like to check in' },
      { native: 'Meine Reservierungsnummer ist...', phonetic: 'My-neh reh-sehr-vee-roongs-noo-mer ist', en: 'My reservation number is...' },
      { native: 'Was ist das WLAN-Passwort?', phonetic: 'Vas ist das WLAN passvort', en: 'What\'s the WiFi password?' },
    ],
    Italian: [
      { native: 'Vorrei fare il check-in', phonetic: 'Vor-ray fah-reh eel check-in', en: 'I\'d like to check in' },
      { native: 'Il mio numero di prenotazione è...', phonetic: 'Eel mee-oh noo-meh-ro dee preh-no-tah-tsyoh-neh eh', en: 'My reservation number is...' },
      { native: 'Qual è la password del WiFi?', phonetic: 'Kwal eh lah password del WiFi', en: 'What\'s the WiFi password?' },
    ],
    Hindi: [
      { native: 'चेक-इन करना है', phonetic: 'Check-in karna hai', en: 'I\'d like to check in' },
      { native: 'मेरा बुकिंग नंबर है...', phonetic: 'Mera booking number hai...', en: 'My reservation number is...' },
      { native: 'WiFi का पासवर्ड क्या है?', phonetic: 'WiFi ka password kya hai?', en: 'What\'s the WiFi password?' },
    ],
  },
  shopping: {
    Japanese: [
      { native: 'これはいくらですか？', phonetic: 'Kore wa ikura desu ka?', en: 'How much is this?' },
      { native: 'サイズはありますか？', phonetic: 'Saizu wa arimasu ka?', en: 'Do you have my size?' },
      { native: 'もっと安くなりますか？', phonetic: 'Motto yasuku narimasu ka?', en: 'Can you lower the price?' },
    ],
    French: [
      { native: 'Combien ça coûte ?', phonetic: 'Kohm-byahn sah koot', en: 'How much does this cost?' },
      { native: 'Avez-vous ma taille ?', phonetic: 'Ah-vay voo mah ty', en: 'Do you have my size?' },
      { native: 'Pouvez-vous baisser le prix ?', phonetic: 'Poo-vay voo bay-say luh pree', en: 'Can you lower the price?' },
    ],
    Spanish: [
      { native: '¿Cuánto cuesta esto?', phonetic: 'Kwan-toh kwes-tah es-toh', en: 'How much does this cost?' },
      { native: '¿Tiene mi talla?', phonetic: 'Tyeh-neh mee tah-yah', en: 'Do you have my size?' },
      { native: '¿Puede hacer un descuento?', phonetic: 'Pweh-deh ah-sehr oon des-kwehn-toh', en: 'Can you give a discount?' },
    ],
    German: [
      { native: 'Was kostet das?', phonetic: 'Vas kos-tet das', en: 'How much does this cost?' },
      { native: 'Haben Sie meine Größe?', phonetic: 'Hah-ben zee my-neh grö-seh', en: 'Do you have my size?' },
      { native: 'Können Sie den Preis senken?', phonetic: 'Kö-nen zee den preys zen-ken', en: 'Can you lower the price?' },
    ],
    Italian: [
      { native: 'Quanto costa questo?', phonetic: 'Kwan-toh kos-tah kwes-toh', en: 'How much does this cost?' },
      { native: 'Avete la mia taglia?', phonetic: 'Ah-veh-teh lah mee-ah tah-lyah', en: 'Do you have my size?' },
      { native: 'Può farmi uno sconto?', phonetic: 'Pwoh far-mee oo-noh skon-toh', en: 'Can you give me a discount?' },
    ],
    Hindi: [
      { native: 'यह कितने का है?', phonetic: 'Yah kitne ka hai?', en: 'How much does this cost?' },
      { native: 'मेरा साइज़ है?', phonetic: 'Mera size hai?', en: 'Do you have my size?' },
      { native: 'थोड़ा कम करेंगे?', phonetic: 'Thoda kam karenge?', en: 'Can you lower the price?' },
    ],
  },
  doctor: {
    Japanese: [
      { native: '頭が痛いです', phonetic: 'Atama ga itai desu', en: 'I have a headache' },
      { native: '熱があります', phonetic: 'Netsu ga arimasu', en: 'I have a fever' },
      { native: '薬はどう飲みますか？', phonetic: 'Kusuri wa do nomimasu ka?', en: 'How should I take the medicine?' },
    ],
    French: [
      { native: 'J\'ai mal à la tête', phonetic: 'Zhay mahl ah lah tet', en: 'I have a headache' },
      { native: 'J\'ai de la fièvre', phonetic: 'Zhay duh lah fyevr', en: 'I have a fever' },
      { native: 'Comment dois-je prendre ce médicament ?', phonetic: 'Ko-mahn dwah zhuh prahn-dreh suh meh-dee-kah-mahn', en: 'How should I take this medicine?' },
    ],
    Spanish: [
      { native: 'Me duele la cabeza', phonetic: 'Meh dweh-leh lah kah-beh-sah', en: 'I have a headache' },
      { native: 'Tengo fiebre', phonetic: 'Ten-go fyeh-breh', en: 'I have a fever' },
      { native: '¿Cómo debo tomar el medicamento?', phonetic: 'Koh-mo deh-bo toh-mar el meh-dee-kah-men-toh', en: 'How should I take the medicine?' },
    ],
    German: [
      { native: 'Ich habe Kopfschmerzen', phonetic: 'Ikh hah-beh kopf-shmehr-tsen', en: 'I have a headache' },
      { native: 'Ich habe Fieber', phonetic: 'Ikh hah-beh fee-ber', en: 'I have a fever' },
      { native: 'Wie soll ich das Medikament nehmen?', phonetic: 'Vee zol ikh das meh-dee-kah-ment nay-men', en: 'How should I take the medicine?' },
    ],
    Italian: [
      { native: 'Ho mal di testa', phonetic: 'Oh mal dee tes-tah', en: 'I have a headache' },
      { native: 'Ho la febbre', phonetic: 'Oh lah feb-breh', en: 'I have a fever' },
      { native: 'Come devo prendere la medicina?', phonetic: 'Koh-meh deh-voh pren-deh-reh lah meh-dee-chee-nah', en: 'How should I take the medicine?' },
    ],
    Hindi: [
      { native: 'सिर दर्द है', phonetic: 'Sir dard hai', en: 'I have a headache' },
      { native: 'बुखार है', phonetic: 'Bukhar hai', en: 'I have a fever' },
      { native: 'दवाई कैसे लेनी है?', phonetic: 'Dawai kaise leni hai?', en: 'How should I take the medicine?' },
    ],
  },
  directions: {
    Japanese: [
      { native: '～はどこですか？', phonetic: '~ wa doko desu ka?', en: 'Where is ~?' },
      { native: '右に曲がってください', phonetic: 'Migi ni magatte kudasai', en: 'Please turn right' },
      { native: '駅まで歩いてどのくらい？', phonetic: 'Eki made aruite dono kurai?', en: 'How far is the station on foot?' },
    ],
    French: [
      { native: 'Où est... ?', phonetic: 'Oo eh', en: 'Where is...?' },
      { native: 'Tournez à droite', phonetic: 'Toor-nay ah drwaht', en: 'Turn right' },
      { native: 'C\'est loin à pied ?', phonetic: 'Say lwahn ah pyay', en: 'Is it far on foot?' },
    ],
    Spanish: [
      { native: '¿Dónde está...?', phonetic: 'Dohn-deh es-tah', en: 'Where is...?' },
      { native: 'Gire a la derecha', phonetic: 'Hee-reh ah lah deh-reh-chah', en: 'Turn right' },
      { native: '¿Está lejos a pie?', phonetic: 'Es-tah leh-hos ah pyeh', en: 'Is it far on foot?' },
    ],
    German: [
      { native: 'Wo ist...?', phonetic: 'Voh ist', en: 'Where is...?' },
      { native: 'Biegen Sie rechts ab', phonetic: 'Bee-gen zee rechts ap', en: 'Turn right' },
      { native: 'Wie weit ist es zu Fuß?', phonetic: 'Vee vayt ist es tsoo foos', en: 'How far is it on foot?' },
    ],
    Italian: [
      { native: 'Dov\'è...?', phonetic: 'Doh-veh', en: 'Where is...?' },
      { native: 'Giri a destra', phonetic: 'Jee-ree ah des-trah', en: 'Turn right' },
      { native: 'È lontano a piedi?', phonetic: 'Eh lon-tah-noh ah pyeh-dee', en: 'Is it far on foot?' },
    ],
    Hindi: [
      { native: '...कहाँ है?', phonetic: '...kahan hai?', en: 'Where is...?' },
      { native: 'दाहिने मुड़िए', phonetic: 'Dahine mudiye', en: 'Turn right' },
      { native: 'पैदल कितनी दूर है?', phonetic: 'Paidal kitni door hai?', en: 'How far on foot?' },
    ],
  },
  interview: {
    Japanese: [
      { native: '私の名前は～です', phonetic: 'Watashi no namae wa ~ desu', en: 'My name is ~' },
      { native: '御社に興味があります', phonetic: 'Onsha ni kyomi ga arimasu', en: 'I am interested in your company' },
      { native: '質問してもいいですか？', phonetic: 'Shitsumon shite mo ii desu ka?', en: 'May I ask a question?' },
    ],
    French: [
      { native: 'Je m\'appelle...', phonetic: 'Zhuh mah-pel', en: 'My name is...' },
      { native: 'Je suis très intéressé(e) par votre entreprise', phonetic: 'Zhuh swee treh ahn-teh-reh-say par votr ahn-truh-preez', en: 'I am very interested in your company' },
      { native: 'Puis-je poser une question ?', phonetic: 'Pwee zhuh poh-zay ün kes-tyohn', en: 'May I ask a question?' },
    ],
    Spanish: [
      { native: 'Me llamo...', phonetic: 'Meh yah-moh', en: 'My name is...' },
      { native: 'Estoy muy interesado/a en su empresa', phonetic: 'Es-toy mwee een-teh-reh-sah-doh en soo em-preh-sah', en: 'I am very interested in your company' },
      { native: '¿Puedo hacer una pregunta?', phonetic: 'Pweh-doh ah-sehr oo-nah preh-goon-tah', en: 'May I ask a question?' },
    ],
    German: [
      { native: 'Mein Name ist...', phonetic: 'Mayn nah-meh ist', en: 'My name is...' },
      { native: 'Ich interessiere mich sehr für Ihr Unternehmen', phonetic: 'Ikh in-teh-reh-see-reh mikh zayr für eer oon-ter-nay-men', en: 'I am very interested in your company' },
      { native: 'Darf ich eine Frage stellen?', phonetic: 'Darf ikh eye-neh frah-geh shtel-en', en: 'May I ask a question?' },
    ],
    Italian: [
      { native: 'Mi chiamo...', phonetic: 'Mee kyah-moh', en: 'My name is...' },
      { native: 'Sono molto interessato/a alla sua azienda', phonetic: 'Soh-noh mol-toh in-teh-res-sah-toh ah-lah soo-ah ah-tsyen-dah', en: 'I am very interested in your company' },
      { native: 'Posso fare una domanda?', phonetic: 'Pos-soh fah-reh oo-nah doh-man-dah', en: 'May I ask a question?' },
    ],
    Hindi: [
      { native: 'मेरा नाम ... है', phonetic: 'Mera naam ... hai', en: 'My name is...' },
      { native: 'मुझे आपकी कंपनी में बहुत रुचि है', phonetic: 'Mujhe aapki company mein bahut ruchi hai', en: 'I am very interested in your company' },
      { native: 'क्या मैं एक सवाल पूछ सकता/सकती हूँ?', phonetic: 'Kya main ek sawal pooch sakta/sakti hoon?', en: 'May I ask a question?' },
    ],
  },
};

// ══════════════════════════════════
//  SCENARIO DEFINITIONS
// ══════════════════════════════════
const scenarios = {
  cafe: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`, charName: 'Yuki (Café Staff)',
    context: `Café in ${user.language === 'Japanese' ? 'Tokyo' : 'Paris'}`,
    banner: 'You just walked into a cozy local café. Find a seat and order something!',
    userRole: `You are a tourist visiting a local café. Practice ordering drinks, asking about the menu, and paying the bill.`,
    phrases: [
      { native: 'メニューをください', phonetic: 'Menyu wo kudasai', en: 'May I have the menu?' },
      { native: 'コーヒーをひとつ', phonetic: 'Kohi wo hitotsu', en: 'One coffee, please' },
      { native: 'いくらですか？', phonetic: 'Ikura desu ka?', en: 'How much is it?' },
    ],
    tips: '• Greet the waiter first\n• Ask for recommendations\n• Practice numbers for ordering quantities',
    systemPrompt: (lang, level) => `You are Yuki, a friendly and patient café staff member at a local ${lang} café. 
The customer is a ${level} level ${lang} language learner practicing their ${lang}.
Rules:
- Speak primarily in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Stay fully in character as a café staff member
- Ask for their order, offer suggestions, tell them prices
- If they make grammar mistakes, include a gentle note like "[💡 Note: ...]"  
- Keep the conversation realistic and flowing
- Start by greeting the customer warmly in ${lang}`
  },
  restaurant: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v4"/><path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3z"/><path d="M12 11v11"/><path d="M18 17v5"/></svg>`, charName: 'Restaurant Waiter',
    context: 'Fine Dining Restaurant',
    banner: 'Welcome to our restaurant! You\'ve made a reservation. The waiter approaches...',
    userRole: 'You are dining at a local restaurant. Practice ordering from the menu, asking about ingredients, and handling the bill.',
    phrases: [
      { native: '予約があります', phonetic: 'Yoyaku ga arimasu', en: 'I have a reservation' },
      { native: 'おすすめは何ですか？', phonetic: 'Osusume wa nan desu ka?', en: 'What do you recommend?' },
      { native: 'お会計をお願いします', phonetic: 'Okaikei wo onegaishimasu', en: 'Check, please' },
    ],
    tips: '• Mention dietary restrictions early\n• Ask about daily specials\n• Practice polite request forms',
    systemPrompt: (lang, level) => `You are a professional restaurant waiter at an upscale ${lang} restaurant.
The diner is a ${level} level ${lang} language student.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Stay in character as a formal waiter
- Guide them through the dining experience: seating, menu, ordering, dessert, bill
- Gently correct language mistakes with [💡 Note: ...]
- Use formal/polite language register
- Start by welcoming them and asking if they have a reservation`
  },
  airport: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.2-2 1-.3.7-.1 1.5.4 2L9 14l-2.5 2.5L4 16l-2 2 3.5 1.5L7 23l2-2-.5-2.5L11 16l4.3 5.3c.5.5 1.3.7 2 .4.8-.4 1.2-1.2 1-2.1z"/></svg>`, charName: 'Airport Staff',
    context: 'International Airport Check-in',
    banner: 'You\'re at the check-in counter at the airport. The staff member greets you.',
    userRole: 'You are a traveller checking in for your flight. Practice check-in procedures, passport control, and asking about your gate.',
    phrases: [
      { native: 'チェックインをお願いします', phonetic: 'Chekkuin wo onegaishimasu', en: 'Check-in please' },
      { native: '搭乗口はどこですか？', phonetic: 'Tojoguchi wa doko desu ka?', en: 'Where is the boarding gate?' },
      { native: '窓側の席をお願いします', phonetic: 'Madogawa no seki wo onegaishimasu', en: 'Window seat, please' },
    ],
    tips: '• Have your passport ready to show\n• Ask about baggage allowance\n• Practice asking for directions',
    systemPrompt: (lang, level) => `You are an airport check-in staff member at an international airport in a ${lang}-speaking country.
The traveller is a ${level} level ${lang} student.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Handle: check-in, seat preferences, baggage, boarding gate directions
- Correct mistakes gently with [💡 Note: ...]
- Keep interactions realistic and helpful
- Start by asking for their passport and flight number in ${lang}`
  },
  hotel: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`, charName: 'Hotel Receptionist',
    context: 'Hotel Reception Desk',
    banner: 'You arrive at your hotel after a long journey. The receptionist smiles at you.',
    userRole: 'You are checking into your hotel. Practice confirming your reservation, asking about amenities, and requesting help.',
    phrases: [
      { native: 'チェックインしたいです', phonetic: 'Chekkuin shitai desu', en: 'I\'d like to check in' },
      { native: '予約番号は～です', phonetic: 'Yoyaku bango wa ~ desu', en: 'My reservation number is ~' },
      { native: 'WiFiのパスワードは？', phonetic: 'WiFi no pasuwado wa?', en: 'What\'s the WiFi password?' },
    ],
    tips: '• Confirm your booking details\n• Ask about breakfast timing\n• Request a room with a view',
    systemPrompt: (lang, level) => `You are a professional hotel receptionist at a 4-star hotel in a ${lang}-speaking country.
The guest is a ${level} level ${lang} student checking in.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Handle check-in: name, reservation, room key, amenities, WiFi, checkout time
- Correct language mistakes gently with [💡 Note: ...]
- Be warm and professional
- Start by welcoming the guest in ${lang}`
  },
  shopping: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`, charName: 'Shop Assistant',
    context: 'Local Market / Shopping',
    banner: 'You\'re browsing a local market. A shop assistant approaches to help you.',
    userRole: 'You are shopping for souvenirs or clothes. Practice asking about prices, sizes, colors, and bargaining.',
    phrases: [
      { native: 'これはいくらですか？', phonetic: 'Kore wa ikura desu ka?', en: 'How much is this?' },
      { native: 'サイズはありますか？', phonetic: 'Saizu wa arimasu ka?', en: 'Do you have my size?' },
      { native: 'もっと安くなりますか？', phonetic: 'Motto yasuku narimasu ka?', en: 'Can you lower the price?' },
    ],
    tips: '• Describe what you\'re looking for\n• Ask about discounts\n• Practice color and size vocabulary',
    systemPrompt: (lang, level) => `You are a friendly shop assistant at a local market/store in a ${lang}-speaking country.
The customer is a ${level} level ${lang} student.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Help them find items, discuss prices, sizes, colors
- Gently correct mistakes with [💡 Note: ...]
- Be enthusiastic and helpful
- Start by asking how you can help them in ${lang}`
  },
  doctor: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`, charName: 'Dr. Tanaka',
    context: 'Medical Clinic',
    banner: 'You\'re not feeling well and visit a local clinic. Dr. Tanaka calls you in.',
    userRole: 'You are a patient visiting a doctor. Practice describing symptoms, understanding medical advice, and asking follow-up questions.',
    phrases: [
      { native: '頭が痛いです', phonetic: 'Atama ga itai desu', en: 'I have a headache' },
      { native: '熱があります', phonetic: 'Netsu ga arimasu', en: 'I have a fever' },
      { native: '薬はどう飲みますか？', phonetic: 'Kusuri wa do nomimasu ka?', en: 'How should I take the medicine?' },
    ],
    tips: '• Learn body part vocabulary first\n• Describe pain intensity\n• Ask about medication instructions',
    systemPrompt: (lang, level) => `You are a kind and patient doctor (Dr. Tanaka) at a clinic in a ${lang}-speaking country.
The patient is a ${level} level ${lang} student who isn't feeling well.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Ask about symptoms, duration, medical history
- Give simple medical advice and prescriptions
- Correct language mistakes gently with [💡 Note: ...]
- Start by welcoming the patient and asking what brings them in today`
  },
  directions: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`, charName: 'Local Resident',
    context: 'City Streets',
    banner: 'You\'re lost in the city! You stop a friendly local to ask for directions.',
    userRole: 'You are a tourist who is lost. Practice asking for directions, understanding navigation instructions, and thanking people.',
    phrases: [
      { native: '～はどこですか？', phonetic: '~ wa doko desu ka?', en: 'Where is ~?' },
      { native: '右に曲がってください', phonetic: 'Migi ni magatte kudasai', en: 'Please turn right' },
      { native: '駅まで歩いてどのくらい？', phonetic: 'Eki made aruite dono kurai?', en: 'How far is the station on foot?' },
    ],
    tips: '• Learn compass directions\n• Practice "turn left/right"\n• Ask landmark-based directions',
    systemPrompt: (lang, level) => `You are a friendly local resident in a city in a ${lang}-speaking country.
A tourist (${level} level ${lang} student) has stopped you to ask for directions.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Give realistic directions using landmarks, turns, distances
- Be patient and friendly
- Correct language mistakes gently with [💡 Note: ...]
- Offer to repeat if they seem confused
- Start by responding to them stopping you`
  },
  interview: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`, charName: 'HR Manager',
    context: 'Job Interview',
    banner: 'You\'re interviewing for a position at a local company. The HR manager invites you in.',
    userRole: 'You are a job candidate. Practice introducing yourself, discussing your experience, and answering interview questions formally.',
    phrases: [
      { native: '私の名前は～です', phonetic: 'Watashi no namae wa ~ desu', en: 'My name is ~' },
      { native: '御社に興味があります', phonetic: 'Onsha ni kyomi ga arimasu', en: 'I am interested in your company' },
      { native: '質問してもいいですか？', phonetic: 'Shitsumon shite mo ii desu ka?', en: 'May I ask a question?' },
    ],
    tips: '• Use polite/formal language register\n• Prepare a self-introduction\n• Practice describing your skills',
    systemPrompt: (lang, level) => `You are an HR manager at a company in a ${lang}-speaking country conducting a job interview.
The candidate is a ${level} level ${lang} student practicing formal conversation.
Rules:
- Speak in ${lang} ALWAYS USING ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${lang} using the English alphabet.
- Follow each ${lang} sentence with its English translation in parentheses
- Ask standard interview questions: self-introduction, strengths, experience, why this company
- Use formal language
- Correct language mistakes professionally with [💡 Note: ...]
- Start by welcoming the candidate and asking them to introduce themselves`
  }
};

// ══════════════════════════════════
//  MODE SWITCHING
// ══════════════════════════════════
function switchMode(mode) {
  document.getElementById('modeFree').style.display = mode === 'free' ? 'flex' : 'none';
  document.getElementById('modeScenario').style.display = mode === 'scenario' ? 'block' : 'none';
  document.getElementById('tabFree').classList.toggle('active', mode === 'free');
  document.getElementById('tabScenario').classList.toggle('active', mode === 'scenario');
}

// ══════════════════════════════════
//  SCENARIO LOGIC
// ══════════════════════════════════
let currentScenario = null;
let scenarioHistory = [];

function startScenario(type) {
  const sc = scenarios[type];
  currentScenario = type;
  scenarioHistory = [];

  // Update UI
  document.getElementById('scenarioPicker').style.display = 'none';
  document.getElementById('scenarioChat').style.display = 'flex';
  document.getElementById('scAvatar').innerHTML = sc.icon;
  document.getElementById('scCharName').textContent = sc.charName;
  document.getElementById('scContext').textContent = sc.context;
  document.getElementById('bannerText').textContent = sc.banner;
  document.getElementById('userRole').textContent = sc.userRole;
  document.getElementById('scenarioTips').textContent = sc.tips;

  // Fill useful phrases — pick by user's language, fallback to Japanese
  const phraseList = document.getElementById('usefulPhrases');
  const langPhrases = (scenarioPhrases[type] && scenarioPhrases[type][user.language])
    ? scenarioPhrases[type][user.language]
    : (scenarioPhrases[type] ? scenarioPhrases[type]['Japanese'] : sc.phrases);
  phraseList.innerHTML = langPhrases.map(p => `
    <div class="vocab-item" style="flex-direction:column;align-items:flex-start;gap:3px;">
      <span class="vocab-jp">${p.native}</span>
      <span style="font-size:11px;color:var(--lilac-2);font-style:italic;">${p.phonetic}</span>
      <span class="vocab-en">${p.en}</span>
    </div>
  `).join('');

  // Clear messages and add opening AI message
  const msgArea = document.getElementById('scenarioMessages');
  msgArea.innerHTML = '';

  // Auto-start scenario with AI opening line
  sendToGemini('__START__', 'scenario');
}

if (typeof window.getApiBase !== 'function') {
  window.getApiBase = () => {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:5000';
    }
    if (window.location.port && window.location.port !== '5000') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return '';
  };
}
var API_BASE = window.getApiBase();

window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
};

let activeScenarioTab = 'picker';

window.switchScenarioSubtab = function(tab) {
  activeScenarioTab = tab;
  const pBtn = document.getElementById('btnScenariosTab');
  const hBtn = document.getElementById('btnHistoryTab');
  const pickerGrid = document.getElementById('scenarioGridContainer');
  const historyList = document.getElementById('scenarioHistoryContainer');
  
  if (tab === 'picker') {
    // Style active tab
    pBtn.style.background = 'var(--lilac-2)';
    pBtn.style.color = 'white';
    hBtn.style.background = 'transparent';
    hBtn.style.color = 'var(--text-secondary)';
    
    // Show grid, hide history
    pickerGrid.style.display = 'grid';
    historyList.style.display = 'none';
  } else {
    // Style active tab
    hBtn.style.background = 'var(--lilac-2)';
    hBtn.style.color = 'white';
    pBtn.style.background = 'transparent';
    pBtn.style.color = 'var(--text-secondary)';
    
    // Show history, hide grid
    pickerGrid.style.display = 'none';
    historyList.style.display = 'block';
    
    loadScenarioHistory();
  }
};

window.loadScenarioHistory = async function() {
  const grid = document.getElementById('historyGrid');
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:32px; color:var(--lilac-ash);">Loading saved reports...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/api/ai/scenario-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const history = await res.json();
      renderScenarioHistory(history);
    } else {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:32px; color:var(--blush);">Failed to load history records.</div>';
    }
  } catch (err) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:32px; color:var(--blush);">Cannot connect to server.</div>';
  }
};

function getScenarioDisplayName(key) {
  const names = {
    cafe: '☕ At the Café',
    restaurant: '🍽 Restaurant Dinner',
    airport: '✈️ At the Airport',
    hotel: '🏨 Hotel Check-In',
    shopping: '🛍 Shopping Spree',
    doctor: '🩺 Doctor\'s Visit',
    directions: '🗺 Asking Directions',
    interview: '💼 Job Interview'
  };
  return names[key] || key;
}

function renderScenarioHistory(sessions) {
  const grid = document.getElementById('historyGrid');
  if (!sessions || sessions.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:32px; color:var(--lilac-ash);">No saved scenario practices found. Start practicing to get reports!</div>';
    return;
  }
  
  grid.innerHTML = sessions.map(s => {
    const dateStr = new Date(s.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
    const scoreColor = s.grammarScore >= 80 ? 'linear-gradient(135deg, #A68BA5, #C493B0)' : 'linear-gradient(135deg, #EDADC7, #D199B6)';
    return `
      <div class="card" style="background:#FFFFFF; border:1px solid var(--border); border-radius:var(--radius); padding:20px; display:flex; flex-direction:column; gap:12px; box-shadow:0 2px 8px rgba(166,139,165,0.05); transition:transform 0.2s;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="font-weight:700; color:var(--charcoal); margin-bottom:4px; font-size:15px;">${getScenarioDisplayName(s.scenarioKey)}</h4>
            <p style="font-size:12px; color:var(--text-secondary);">${dateStr}</p>
          </div>
          <div style="width:38px; height:38px; border-radius:50%; background:${scoreColor}; display:flex; align-items:center; justify-content:center; color:white; font-size:13px; font-weight:700;">
            ${s.grammarScore}
          </div>
        </div>
        <div style="font-size:12px; color:var(--text-secondary); display:flex; gap:8px;">
          <span class="sc-tag" style="background:rgba(92,93,103,0.1); color:var(--charcoal);">${s.language}</span>
          <span class="sc-tag">${s.level}</span>
        </div>
        <button class="btn-primary" onclick="openSavedReport('${s._id}')" style="background:var(--lilac-2); border:none; border-radius:8px; padding:8px; font-size:12px; cursor:pointer; color:white; font-weight:600; text-align:center; width:100%; display:flex; align-items:center; justify-content:center; gap:4px; margin-top:8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Report
        </button>
      </div>
    `;
  }).join('');
}

window.openSavedReport = async function(sessionId) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/scenario-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const list = await res.json();
      const session = list.find(s => s._id === sessionId);
      if (session) {
        populateAndOpenReportModal(session);
      }
    }
  } catch (err) {
    alert('Failed to retrieve saved report data.');
  }
};

function parseMarkdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/### (.*?)(?:\n|<br>|$)/g, '<h5 style="font-size:14px; font-weight:700; margin:12px 0 6px; color:var(--charcoal);">$1</h5>')
    .replace(/## (.*?)(?:\n|<br>|$)/g, '<h4 style="font-size:15px; font-weight:700; margin:16px 0 8px; color:var(--charcoal);">$1</h4>')
    .replace(/# (.*?)(?:\n|<br>|$)/g, '<h3 style="font-size:16px; font-weight:700; margin:20px 0 10px; color:var(--charcoal);">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--lilac-2); font-weight:700;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(196,147,176,0.12); color:var(--lilac-2); padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace;">$1</code>')
    .replace(/- (.*?)(?:\n|<br>|$)/g, '<li style="margin-left:14px; margin-bottom:4px; list-style-type:disc;">$1</li>')
    .replace(/\n/g, '<br>');
}

function populateAndOpenReportModal(session) {
  document.getElementById('reportScore').textContent = session.grammarScore;
  document.getElementById('reportScenarioTitle').textContent = getScenarioDisplayName(session.scenarioKey);
  
  const dateStr = new Date(session.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'});
  document.getElementById('reportMeta').textContent = `${session.language} · ${session.level} · ${dateStr}`;
  
  document.getElementById('reportContent').innerHTML = parseMarkdownToHtml(session.grammaticalReport);
  
  // Render Transcript
  const trContainer = document.getElementById('reportTranscript');
  trContainer.style.display = 'none'; // reset closed
  trContainer.innerHTML = session.transcript.map(msg => {
    if (msg.text === '__START__') return ''; // skip initial setup prompt message
    return `
      <div style="margin-bottom:8px; display:flex; flex-direction:column; align-items: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};">
        <span style="font-size:10px; color:var(--text-secondary); margin-bottom:2px; padding:0 4px;">
          ${msg.role === 'user' ? 'You' : 'AI Partner'}
        </span>
        <div style="background: ${msg.role === 'user' ? 'var(--blush)' : 'white'}; color: var(--charcoal); border: 1.5px solid var(--border); border-radius:10px; padding:10px 14px; font-size:12px; max-width:85%; line-height:1.5; overflow-wrap:break-word;">
          ${msg.text.replace(/\[SUGGESTION\].*(\n|$)/g, '').trim()}
        </div>
      </div>
    `;
  }).join('');
  
  openModal('reportModal');
}

window.toggleReportTranscript = function() {
  const tr = document.getElementById('reportTranscript');
  if (tr.style.display === 'none' || tr.style.display === '') {
    tr.style.display = 'flex';
  } else {
    tr.style.display = 'none';
  }
};

window.finishAndAnalyzeScenario = async function() {
  if (!scenarioHistory || scenarioHistory.length === 0) {
    alert("Please send a few messages before ending the practice session.");
    return;
  }
  
  if (!confirm("Are you ready to finish the practice and get your grammatical analysis report?")) {
    return;
  }
  
  // Show loading indicator
  const btn = document.getElementById('btnAnalyze');
  const origContent = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Analyzing...';
  
  // Disable user inputs
  document.getElementById('scenarioInput').disabled = true;
  
  try {
    const res = await fetch(`${API_BASE}/api/ai/analyze-scenario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        scenarioKey: currentScenario,
        transcript: scenarioHistory
      })
    });
    
    if (res.ok) {
      const session = await res.json();
      btn.disabled = false;
      btn.innerHTML = origContent;
      
      // Open the report modal
      populateAndOpenReportModal(session);
      
      // Go back to picker
      backToScenarioPicker();
      
      // Trigger tab refresh
      switchScenarioSubtab('history');
    } else {
      const err = await res.json();
      alert(`Analysis failed: ${err.message}`);
      btn.disabled = false;
      btn.innerHTML = origContent;
      document.getElementById('scenarioInput').disabled = false;
    }
  } catch (err) {
    alert("Connection error. Could not reach evaluation server.");
    btn.disabled = false;
    btn.innerHTML = origContent;
    document.getElementById('scenarioInput').disabled = false;
  }
};

function backToScenarioPicker() {
  document.getElementById('scenarioPicker').style.display = 'block';
  document.getElementById('scenarioChat').style.display = 'none';
  currentScenario = null;
  scenarioHistory = [];
  
  // Reset tabs to picker
  switchScenarioSubtab('picker');
}

// ══════════════════════════════════
//  MESSAGING
// ══════════════════════════════════
const freeHistory = [];

document.getElementById('freeInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendFree(); });
document.getElementById('scenarioInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendScenario(); });

async function sendFree() {
  const input = document.getElementById('freeInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendMsg(msg, 'user', 'freeMessages');
  freeHistory.push({ role: 'user', text: msg });
  await sendToGemini(msg, 'free');
}

async function sendScenario() {
  const input = document.getElementById('scenarioInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendMsg(msg, 'user', 'scenarioMessages');
  scenarioHistory.push({ role: 'user', text: msg });
  await sendToGemini(msg, 'scenario');
}

async function sendToGemini(message, mode) {
  const isScenario = mode === 'scenario';
  const messagesId = isScenario ? 'scenarioMessages' : 'freeMessages';
  const history    = isScenario ? scenarioHistory : freeHistory;

  const typingId = showTyping(messagesId);
  if (isScenario) {
    document.getElementById('scenarioInput').disabled = true;
  } else {
    document.getElementById('freeInput').disabled = true;
    document.getElementById('freeMicBtn').disabled = true;
  }

  let systemPrompt;
  if (isScenario && currentScenario) {
    systemPrompt = scenarios[currentScenario].systemPrompt(user.language, user.level);
    systemPrompt += `\n\nAt the very end of your response, provide exactly 3 suggested replies for the user in ${user.language} to keep the conversation going. Format each suggestion on a new line starting with "[SUGGESTION]" followed by the native script, a pipe character "|", the phonetic English spelling, another pipe character "|", and the English translation. Example: [SUGGESTION] मुझे बुखार है। | Mujhe bukhar hai. | I have a fever.`;
  } else {
    const currentCoachName = coachNames[user.language] || 'Emma';
    systemPrompt = `You are Coach ${currentCoachName}, a friendly ${user.language} language tutor for ${user.level} level students.
- Respond conversationally in English but teach in ${user.language}
- When writing in ${user.language}, ALWAYS USE ITS NATIVE SCRIPT (e.g., Devanagari for Hindi, Kanji/Kana for Japanese). DO NOT write ${user.language} using the English alphabet.
- Follow each ${user.language} sentence with its ACTUAL English translation in parentheses (e.g. नमस्ते (Hello)).
- Correct grammar mistakes gently with a 💡 SUGGESTION: block
- Keep responses concise (2-4 sentences)
- Encourage the learner`;
  }

  // For scenario start, send a special instruction
  const actualMessage = message === '__START__'
    ? `Please start the scenario with your opening line in character. Keep it natural and inviting.`
    : message;

  if (message === '__START__') {
    if (isScenario) scenarioHistory.push({ role: 'user', text: actualMessage });
    else freeHistory.push({ role: 'user', text: actualMessage });
  }

  // The history sent to the backend should be the prior conversation, 
  // excluding the current message which is passed directly to sendMessage.
  const historyToSend = history.slice(0, -1).slice(-8);

  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        message: actualMessage,
        language: user.language,
        level: user.level,
        history: historyToSend,
        systemPrompt  // Pass to backend
      })
    });
    const data = await res.json();
    if (res.ok) {
      if (isScenario) scenarioHistory.push({ role: 'model', text: data.reply });
      else freeHistory.push({ role: 'model', text: data.reply });
      appendMsg(data.reply, 'ai', messagesId);
      // ── Track XP for each AI conversation exchange
      if (typeof LinguovaStats !== 'undefined') {
        LinguovaStats.addXP(15, 'ai');
      }
    } else {
      let errMsg = data.message || 'Server error';
      if (errMsg.includes('429') || errMsg.includes('quota')) {
        errMsg = 'You hit the free AI rate limit! Please wait a full 60 seconds without clicking send, then try again.';
      } else if (errMsg.includes('API_KEY_INVALID')) {
        errMsg = 'Your Google Gemini API key is missing or invalid.';
      }
      
      // Remove the user's message from history since the AI failed to process it
      if (isScenario) scenarioHistory.pop();
      else freeHistory.pop();
      
      appendMsg(`⚠️ ${errMsg}`, 'ai', messagesId);
    }
  } catch (err) {
    removeTyping(typingId);
    appendMsg('⚠️ Cannot connect to server. Make sure backend is running!', 'ai', messagesId);
  } finally {
    // If typing indicator is still there, remove it
    const t = document.getElementById(typingId);
    if (t) t.remove();

    if (isScenario) {
      document.getElementById('scenarioInput').disabled = false;
      document.getElementById('scenarioInput').focus();
    } else {
      document.getElementById('freeInput').disabled = false;
      document.getElementById('freeMicBtn').disabled = false;
      document.getElementById('freeInput').focus();
    }
  }
}

// ══════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════
function appendMsg(text, role, containerId) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = `msg ${role === 'ai' ? 'ai-msg' : 'user-msg'}`;

  let parsedText = text;
  let suggestionsHtml = '';

  if (role === 'ai') {
    const sugRegex = /\[SUGGESTION\]\s*([^|]+)\|\s*([^|]+)\|\s*(.*)/g;
    let match;
    const suggestions = [];
    while ((match = sugRegex.exec(text)) !== null) {
      suggestions.push({
        native: match[1].trim(),
        phonetic: match[2].trim(),
        en: match[3].trim()
      });
    }

    // Remove suggestions from the main text
    parsedText = parsedText.replace(/\[SUGGESTION\].*(\n|$)/g, '').trim();

    if (suggestions.length > 0) {
      suggestionsHtml = '<div class="reply-suggestions">';
      suggestions.forEach(sug => {
        // We pass ONLY the native text to playPracticeTTS
        suggestionsHtml += `
          <div class="suggestion-chip">
            <div class="sug-text" onclick="populateScenarioInput(this.dataset.native)" data-native="${encodeURIComponent(sug.native)}">
              <div class="sug-native">${sug.native}</div>
              <div class="sug-phonetic">${sug.phonetic}</div>
              <div class="sug-en">${sug.en}</div>
            </div>
            <button class="sug-tts" onclick="playPracticeTTS(this.dataset.native)" data-native="${encodeURIComponent(sug.native)}" title="Listen">🔊</button>
          </div>
        `;
      });
      suggestionsHtml += '</div>';
    }
  }

  const formattedText = parsedText
    .replace(/💡 (SUGGESTION|Note):(.*?)(\n|$)/gs, (_, __, content) =>
      `</p><div class="suggestion-block">💡 <strong>Note:</strong>${content}</div><p>`)
    .replace(/\n/g, '<br>');

  let avatarHtml = '';
  if (role === 'user') {
    avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  } else {
    if (currentScenario && scenarios[currentScenario]) {
      avatarHtml = scenarios[currentScenario].icon;
    } else {
      avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    }
  }

  // The main text we pass to TTS should not contain the suggestions
  div.innerHTML = `
    <div class="msg-avatar">${avatarHtml}</div>
    <div class="msg-bubble-wrap">
      <div class="msg-bubble">
        <p>${formattedText}</p>
        ${role === 'ai' ? `<button class="tts-btn" onclick="playPracticeTTS(this.dataset.text)" data-text="${encodeURIComponent(parsedText)}" title="Listen to message">🔊</button>` : ''}
      </div>
      ${suggestionsHtml}
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function populateScenarioInput(encodedNative) {
  const input = document.getElementById('scenarioInput');
  if (input) {
    input.value = decodeURIComponent(encodedNative);
    input.focus();
  }
}

function showTyping(containerId) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'msg ai-msg';
  const id = 'typing-' + Date.now();
  div.id = id;
  const isScenario = containerId === 'scenarioMessages';
  let avatarHtml = '';
  if (isScenario && currentScenario && scenarios[currentScenario]) {
    avatarHtml = scenarios[currentScenario].icon;
  } else {
    avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  }
  div.innerHTML = `<div class="msg-avatar">${avatarHtml}</div><div class="typing-indicator"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}
function removeTyping(id) { document.getElementById(id)?.remove(); }

// ══════════════════════════════════
//  SPEECH RECOGNITION (AUDIO INPUT)
// ══════════════════════════════════
let recognition = null;
let isRecording = false;
let currentMicBtnId = null;

const langCodes = {
  Japanese: 'ja-JP',
  French: 'fr-FR',
  Spanish: 'es-ES',
  German: 'de-DE',
  Italian: 'it-IT',
  Hindi: 'hi-IN'
};

function toggleSpeech(inputId, btnId) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser. Please use Chrome.");
    return;
  }

  const btn = document.getElementById(btnId);
  const inputEl = document.getElementById(inputId);

  if (isRecording) {
    if (recognition) recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = langCodes[user.language] || 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isRecording = true;
    currentMicBtnId = btnId;
    btn.classList.add('recording');
    inputEl.placeholder = "Listening...";
  };

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    inputEl.value = finalTranscript + interimTranscript;
  };

  recognition.onend = () => {
    isRecording = false;
    currentMicBtnId = null;
    btn.classList.remove('recording');
    inputEl.placeholder = inputId === 'freeInput' ? `Type in ${user.language}, English, or mix both...` : "Reply to the scenario character...";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    isRecording = false;
    btn.classList.remove('recording');
    inputEl.placeholder = "Error: " + event.error;
    
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      alert("Microphone access is blocked! Please click the camera/mic icon in your browser's address bar and allow microphone access to use voice typing.");
    } else if (event.error === 'no-speech') {
      // just ignore no-speech, it ends automatically
    } else {
      alert("Speech recognition failed: " + event.error);
    }

    setTimeout(() => {
      inputEl.placeholder = inputId === 'freeInput' ? `Type in ${user.language}, English, or mix both...` : "Reply to the scenario character...";
    }, 2000);
  };

  recognition.start();
}

let currentUtterance = null; // Global reference prevents Chrome garbage collection bug
let isTtsPaused = false; // Manual tracker for Chrome pause bug

function playPracticeTTS(encodedText) {
  const text = decodeURIComponent(encodedText);
  // Remove the grammar suggestion block from the spoken text
  let cleanText = text.replace(/💡 (SUGGESTION|Note):(.*?)(\n|$)/gs, '').trim();
  
  // Clean markdown formatting, quotes, parenthesized translations, and emojis (e.g. cherry blossom)
  cleanText = cleanText
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    .replace(/[`"']/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!cleanText) return;

  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance.lang = langCodes[user.language] || 'en-US';
  currentUtterance.rate = 0.9; // Slightly slower for better comprehension
  
  // Reset buttons when speech finishes naturally
  currentUtterance.onend = () => {
    isTtsPaused = false;
    document.querySelectorAll('.audio-pause-btn').forEach(btn => btn.innerHTML = '⏸️ Pause');
  };
  
  // Resume if it was previously paused before starting a new one
  window.speechSynthesis.resume();
  // Stop any ongoing speech
  window.speechSynthesis.cancel();
  
  isTtsPaused = false;
  // Reset pause buttons
  document.querySelectorAll('.audio-pause-btn').forEach(btn => btn.innerHTML = '⏸️ Pause');
  
  window.speechSynthesis.speak(currentUtterance);
}

function toggleAudioPause() {
  const synth = window.speechSynthesis;
  const btns = document.querySelectorAll('.audio-pause-btn');
  
  if (synth.speaking) {
    if (isTtsPaused) {
      synth.resume();
      isTtsPaused = false;
      btns.forEach(btn => btn.innerHTML = '⏸️ Pause');
    } else {
      synth.pause();
      isTtsPaused = true;
      btns.forEach(btn => btn.innerHTML = '▶️ Resume');
    }
  }
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
