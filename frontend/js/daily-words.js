// Base API configuration (handles local Live Server vs local Backend vs file:/// vs Production deployment)
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
const langEl = document.getElementById('userLang');
if (langEl) langEl.textContent = user.language || 'Japanese';

let learnedCount = 0;
let wordData     = [];

// ── Load words on page start
loadWords(false);

async function loadWords(forceRefresh) {
  const today      = new Date().toDateString();
  const cacheKey   = `daily_words_${user.language}_${today}`;
  const cachedData = localStorage.getItem(cacheKey);

  // Use cached words unless user clicked "New Words"
  if (cachedData && !forceRefresh) {
    const parsed = JSON.parse(cachedData);
    wordData = parsed.words;
    learnedCount = parsed.learnedCount || 0;
    renderWords(wordData, parsed.learnedIndexes || []);
    return;
  }

  // Show loading
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('wordsGrid').style.display = 'none';
  document.getElementById('completionState').style.display = 'none';
  learnedCount = 0;
  updateProgress();

  try {
    const API_BASE = window.getApiBase();
    const res = await fetch(`${API_BASE}/api/ai/daily-words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ language: user.language })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    wordData = data.words;
    // Cache in localStorage for the day
    localStorage.setItem(cacheKey, JSON.stringify({
      words: wordData,
      learnedCount: 0,
      learnedIndexes: []
    }));

    renderWords(wordData, []);
  } catch (err) {
    document.getElementById('loadingState').innerHTML = `
      <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
      <p>Could not load words: ${err.message}</p>
      <p style="font-size:13px;color:var(--text-secondary);margin:8px 0 20px">Make sure <code>npm run dev</code> is running</p>
      <button class="btn-primary" onclick="loadWords(true)">Try Again</button>`;
  }
}

function renderWords(words, learnedIndexes) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('wordsGrid').style.display = 'grid';

  const grid = document.getElementById('wordsGrid');
  grid.innerHTML = words.map((w, i) => {
    const isLearned = learnedIndexes.includes(i);
    const diffClass = (w.difficulty || 'Intermediate').toLowerCase() === 'advanced'
      ? 'difficulty-advanced' : 'difficulty-intermediate';

    return `
      <div class="word-card-wrap ${isLearned ? 'learned flipped' : ''}" id="card-${i}" onclick="flipCard(${i}, event)">
        <div class="word-card">
          <!-- FRONT -->
          <div class="word-card-front">
            <p class="card-word">${w.word}</p>
            <p class="card-pronunciation">${w.pronunciation}</p>
            <span class="card-difficulty ${diffClass}">${w.difficulty || 'Intermediate'}</span>
            <button class="speak-btn" onclick="speakWord(event, '${w.word}', '${user.language}')">
              🔊 Hear it
            </button>
            <p class="flip-hint">Tap to reveal meaning →</p>
          </div>
          <!-- BACK -->
          <div class="word-card-back">
            <p class="card-meaning">${w.meaning}</p>
            <p class="card-example">"${w.example}"</p>
            <p class="card-translation">${w.translation}</p>
            <button class="speak-btn" onclick="speakWord(event, '${w.example}', '${user.language}')" style="margin-bottom:12px;">
              🔊 Hear example
            </button>
            <button class="learned-btn" id="learn-btn-${i}" onclick="markLearned(event, ${i})"
              ${isLearned ? 'disabled' : ''}>
              ${isLearned ? '✅ Learned!' : '✅ Mark as Learned'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Restore learned count
  learnedCount = learnedIndexes.length;
  updateProgress();
}

// ── Flip card
function flipCard(index, event) {
  // Don't flip if clicking buttons
  if (event.target.tagName === 'BUTTON') return;
  const card = document.getElementById(`card-${index}`);
  card.classList.toggle('flipped');
}

// ── Mark word as learned
function markLearned(event, index) {
  event.stopPropagation();
  const btn  = document.getElementById(`learn-btn-${index}`);
  const card = document.getElementById(`card-${index}`);

  btn.disabled = true;
  btn.textContent = '✅ Learned!';
  card.classList.add('learned');

  learnedCount++;
  updateProgress();

  // ── Track in shared stats
  if (typeof LinguovaStats !== 'undefined') {
    LinguovaStats.addWords(1);
    LinguovaStats.addXP(10, 'vocab');
  }

  // Save to cache
  const today    = new Date().toDateString();
  const cacheKey = `daily_words_${user.language}_${today}`;
  const cached   = JSON.parse(localStorage.getItem(cacheKey) || '{}');
  const learned  = cached.learnedIndexes || [];
  learned.push(index);
  localStorage.setItem(cacheKey, JSON.stringify({
    ...cached, learnedCount, learnedIndexes: learned
  }));

  // Show completion if all 5 done
  if (learnedCount >= 5) {
    setTimeout(showCompletion, 600);
  }
}

// ── Web Speech API pronunciation
function speakWord(event, text, language) {
  event.stopPropagation();
  if (!window.speechSynthesis) {
    alert('Your browser doesn\'t support speech. Try Chrome or Edge.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any current speech

  const langCodes = {
    'Japanese': 'ja-JP',
    'French':   'fr-FR',
    'Spanish':  'es-ES',
    'German':   'de-DE',
    'Italian':  'it-IT',
    'Hindi':    'hi-IN',
    'English':  'en-US'
  };  // Clean markdown, quotes, parenthesized translations, and emojis (e.g. cherry blossom)
  const cleanText = text
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    .replace(/[`"']/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang  = langCodes[language] || 'en-US';
  utterance.rate  = 0.8;  // Slightly slower for learning
  window.speechSynthesis.speak(utterance);
}

// ── Update progress bar
function updateProgress() {
  const pct = (learnedCount / 5) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('learnedCount').textContent = learnedCount;

  const labels = ['Start learning!', 'Great start! 🌱', 'Halfway there! 💪', 'Almost done! 🔥', 'One more! ⭐', 'All done! 🎉'];
  document.getElementById('progressLabel').textContent = labels[learnedCount] || 'All done! 🎉';
}

// ── Show completion screen
function showCompletion() {
  // ── Bonus XP for finishing all daily words
  if (typeof LinguovaStats !== 'undefined') {
    LinguovaStats.addXP(50, 'vocab');
  }
  document.getElementById('wordsGrid').style.display = 'none';
  document.getElementById('completionState').style.display = 'block';
}

// ── Review: show cards again from completion
function reviewWords() {
  document.getElementById('completionState').style.display = 'none';
  document.getElementById('wordsGrid').style.display = 'grid';
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
