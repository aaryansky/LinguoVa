// Auth check
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '../index.html';
} else {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.role === 'admin') {
    window.location.href = 'admin.html';
  }
}

// Load stats from unified stats object
function getStats() {
  if (typeof LinguovaStats !== 'undefined') {
    return LinguovaStats.get();
  }
  const defaults = {
    streak: 0,
    xp: 0,
    wordsLearned: 0,
    accuracy: 0
  };
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user._id || 'guest';
    const lang = user.language || 'Japanese';
    const statsKey = `linguova_stats_${userId}_${lang}`;
    const saved = JSON.parse(localStorage.getItem(statsKey)) || {};
    return Object.assign({}, defaults, saved);
  } catch (e) {
    return defaults;
  }
}

// Render profile data dynamically
function renderProfile() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const stats = getStats();
  
  const streak       = stats.streak       ?? user.streak       ?? 0;
  const xp           = stats.xp           ?? user.xp           ?? 0;
  const wordsLearned = stats.wordsLearned ?? user.wordsLearned ?? 0;
  const accuracy     = stats.accuracy     ?? user.accuracy     ?? 0;
  const levelNum     = Math.floor(xp / 400) + 1;
  const levelStr     = user.level || 'Beginner';

  // Fill profile content data
  if (document.getElementById('profileName')) {
    document.getElementById('profileName').textContent = user.name || '';
  }
  if (document.getElementById('profileEmail')) {
    document.getElementById('profileEmail').textContent = user.email || '';
  }
  if (document.getElementById('profileInitials') && user.name) {
    document.getElementById('profileInitials').textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  if (document.getElementById('profileLang')) {
    const flags = {
      Japanese: '🇯🇵 Japanese',
      French: '🇫🇷 French',
      Spanish: '🇪🇸 Spanish',
      German: '🇩🇪 German',
      Italian: '🇮🇹 Italian',
      Hindi: '🇮🇳 Hindi'
    };
    document.getElementById('profileLang').textContent = flags[user.language] || user.language || '🇯🇵 Japanese';
  }
  if (document.getElementById('profileLevel')) {
    document.getElementById('profileLevel').textContent = levelStr;
  }

  if (document.getElementById('statXP')) {
    document.getElementById('statXP').textContent = xp.toLocaleString();
  }
  if (document.getElementById('statStreak')) {
    document.getElementById('statStreak').textContent = streak;
  }
  if (document.getElementById('statWords')) {
    document.getElementById('statWords').textContent = wordsLearned;
  }
  if (document.getElementById('statAccuracy')) {
    document.getElementById('statAccuracy').textContent = accuracy + '%';
  }

  // Fill sidebar user card
  if (document.getElementById('userName')) {
    document.getElementById('userName').textContent = user.name || '';
  }
  if (document.getElementById('userInitials') && user.name) {
    document.getElementById('userInitials').textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  if (document.getElementById('userLevel')) {
    document.getElementById('userLevel').textContent = `Level ${levelNum} · ${levelStr}`;
  }

  // Populate preferences values (only if they aren't actively being focused/edited)
  const goalEl = document.getElementById('profileGoal');
  const remindersEl = document.getElementById('profileReminders');
  if (goalEl && document.activeElement !== goalEl) {
    goalEl.value = user.dailyGoal || '30 minutes';
  }
  if (remindersEl && document.activeElement !== remindersEl) {
    remindersEl.checked = user.remindersEnabled !== false;
  }
}

// Setup preferences listeners
function initPreferences() {
  const goalEl = document.getElementById('profileGoal');
  const remindersEl = document.getElementById('profileReminders');

  if (goalEl) {
    goalEl.addEventListener('change', (e) => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.dailyGoal = e.target.value;
      localStorage.setItem('user', JSON.stringify(user));
    });
  }

  if (remindersEl) {
    remindersEl.addEventListener('change', (e) => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.remindersEnabled = e.target.checked;
      localStorage.setItem('user', JSON.stringify(user));
    });
  }
}

// Initial renders & listeners
renderProfile();
initPreferences();

// Storage change event listener for dynamic updates across tabs
window.addEventListener('storage', (e) => {
  if ((e.key && e.key.startsWith('linguova_stats')) || e.key === 'user') {
    renderProfile();
  }
});

// Fallback interval to capture updates on same tab
setInterval(renderProfile, 3000);

function logout() {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
  }
}
