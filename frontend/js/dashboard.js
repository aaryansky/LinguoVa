// ── 1. AUTH CHECK
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '../index.html';
} else {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.role === 'admin') {
    window.location.href = 'admin.html';
  }
}

// ── 2. Helpers
function getUser() {
  return JSON.parse(localStorage.getItem('user')) || {};
}
function getStats() {
  if (typeof LinguovaStats !== 'undefined') {
    return LinguovaStats.get();
  }
  // Unified stats object stored separately so any page can update it
  const defaults = {
    streak: 0,
    xp: 0,
    wordsLearned: 0,
    accuracy: 0,
    grammarProgress: 0,
    vocabProgress: 0,
    pronunProgress: 0,
    todayCompleted: 0,
    todayGoal: 5,
    lastActiveDate: '',
    totalAnswered: 0,
    totalCorrect: 0,
    aiChatDoneToday: false,
    wordsLearnedToday: 0,
    quizQuestionsToday: 0
  };
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user._id || 'guest';
  const lang = user.language || 'Japanese';
  const statsKey = `linguova_stats_${userId}_${lang}`;
  const saved = JSON.parse(localStorage.getItem(statsKey)) || {};
  return Object.assign({}, defaults, saved);
}

function getGoalProgress() {
  const stats = getStats();
  let savedTargets = JSON.parse(localStorage.getItem('linguova_selected_targets'));
  if (!savedTargets || !Array.isArray(savedTargets)) {
    savedTargets = ['targetAI', 'targetWords', 'targetQuiz'];
  }
  
  const hasAI = savedTargets.includes('targetAI');
  const hasWords = savedTargets.includes('targetWords');
  const hasQuiz = savedTargets.includes('targetQuiz');

  let totalWeight = 0;
  let totalProgress = 0;
  let completedCount = 0;
  
  if (hasAI) {
    totalWeight += 1;
    totalProgress += stats.aiChatDoneToday ? 1 : 0;
    if (stats.aiChatDoneToday) completedCount += 1;
  }
  if (hasWords) {
    totalWeight += 1;
    const wl = stats.wordsLearnedToday || 0;
    totalProgress += Math.min(5, wl) / 5;
    if (wl >= 5) completedCount += 1;
  }
  if (hasQuiz) {
    totalWeight += 1;
    const ql = stats.quizQuestionsToday || 0;
    totalProgress += Math.min(5, ql) / 5;
    if (ql >= 5) completedCount += 1;
  }
  
  const goalPct = totalWeight > 0 ? Math.round((totalProgress / totalWeight) * 100) : 0;
  return { goalPct, completedCount, totalWeight };
}

function initTargets() {
  const targets = ['targetAI', 'targetWords', 'targetQuiz'];
  
  // Load saved selection state or default to all checked
  let saved = JSON.parse(localStorage.getItem('linguova_selected_targets'));
  if (!saved || !Array.isArray(saved)) {
    saved = ['targetAI', 'targetWords', 'targetQuiz'];
  }
  
  targets.forEach(tId => {
    const el = document.getElementById(tId);
    if (el) {
      el.checked = saved.includes(tId);
      el.addEventListener('change', () => {
        const active = targets.filter(id => document.getElementById(id)?.checked);
        localStorage.setItem('linguova_selected_targets', JSON.stringify(active));
        renderDashboard(); // Re-render doughnut and texts
      });
    }
  });
}

// ── 3. Chart reference (so we can update it later)
let goalChartInstance = null;

function setBar(barId, pctId, value) {
  const v = Math.min(100, Math.max(0, value));
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(pctId);
  if (bar) bar.style.width = v + '%';
  if (lbl) lbl.textContent = v + '%';
}

// ── 4. Main render function — pulls from localStorage and updates every element
function renderDashboard() {
  const user  = getUser();
  const stats = getStats();

  // Merge user-level fields into stats (backward compat)
  const streak      = stats.streak      ?? user.streak      ?? 0;
  const xp          = stats.xp          ?? user.xp           ?? 0;
  const wordsLearned= stats.wordsLearned ?? user.wordsLearned ?? 0;
  const accuracy    = stats.accuracy    ?? user.accuracy     ?? 0;
  const grammar     = stats.grammarProgress  || 0;
  const vocab       = stats.vocabProgress    || 0;
  const pronun      = stats.pronunProgress   || 0;

  // KPI cards
  document.getElementById('streak').textContent   = streak;
  document.getElementById('xp').textContent       = xp;
  document.getElementById('words').textContent    = wordsLearned;
  document.getElementById('accuracy').textContent = accuracy + '%';

  // Progress bars
  setBar('barGrammar', 'pctGrammar', grammar);
  setBar('barVocab',   'pctVocab',   vocab);
  setBar('barPronun',  'pctPronun',  pronun);

  // Sync checkboxes across tabs/refreshes
  let savedTargets = JSON.parse(localStorage.getItem('linguova_selected_targets'));
  if (!savedTargets || !Array.isArray(savedTargets)) {
    savedTargets = ['targetAI', 'targetWords', 'targetQuiz'];
  }
  const targetAIEl = document.getElementById('targetAI');
  const targetWordsEl = document.getElementById('targetWords');
  const targetQuizEl = document.getElementById('targetQuiz');
  if (targetAIEl) targetAIEl.checked = savedTargets.includes('targetAI');
  if (targetWordsEl) targetWordsEl.checked = savedTargets.includes('targetWords');
  if (targetQuizEl) targetQuizEl.checked = savedTargets.includes('targetQuiz');

  // Update status label colors and texts
  if (document.getElementById('statusAI')) {
    document.getElementById('statusAI').textContent = stats.aiChatDoneToday ? '1/1' : '0/1';
    document.getElementById('statusAI').style.color = stats.aiChatDoneToday ? 'var(--accent-green)' : 'var(--text-secondary)';
  }
  if (document.getElementById('statusWords')) {
    const wl = stats.wordsLearnedToday || 0;
    document.getElementById('statusWords').textContent = `${wl}/5`;
    document.getElementById('statusWords').style.color = wl >= 5 ? 'var(--accent-green)' : 'var(--text-secondary)';
  }
  if (document.getElementById('statusQuiz')) {
    const ql = stats.quizQuestionsToday || 0;
    document.getElementById('statusQuiz').textContent = `${ql}/5`;
    document.getElementById('statusQuiz').style.color = ql >= 5 ? 'var(--accent-green)' : 'var(--text-secondary)';
  }

  // Calculate and update targets progress
  const { goalPct, completedCount, totalWeight } = getGoalProgress();

  // Today's Goal donut label + sub-text
  const goalPctEl = document.getElementById('goalPct');
  const goalSubEl = document.getElementById('goalSub');
  if (goalPctEl) goalPctEl.textContent = goalPct + '%';
  if (goalSubEl) goalSubEl.textContent = `${completedCount}/${totalWeight} Targets Completed`;

  // Update or rebuild the donut chart
  if (goalChartInstance) {
    goalChartInstance.data.datasets[0].data = [goalPct, 100 - goalPct];
    goalChartInstance.update();
  }

  // Sidebar user info
  if (user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userInitials').textContent =
      user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  const levelNum = Math.floor(xp / 400) + 1;
  const levelStr = user.level || 'Beginner';
  if (document.getElementById('userLevel')) {
    document.getElementById('userLevel').textContent = `Level ${levelNum} · ${levelStr}`;
  }
}

// ── 5. Greeting based on time
function setGreeting() {
  const user = getUser();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = (user.name || 'Learner').split(' ')[0];
  document.getElementById('greeting').textContent = `${greet}, ${firstName} 👋`;
}

// ── 6. Language selector
function initLangSelect() {
  const user = getUser();
  const langSelect = document.getElementById('langSelect');
  langSelect.value = user.language || 'Japanese';
  langSelect.addEventListener('change', (e) => {
    if (typeof LinguovaStats !== 'undefined') {
      LinguovaStats.changeLanguage(e.target.value).then(() => {
        window.location.reload();
      });
    } else {
      const u = getUser();
      u.language = e.target.value;
      localStorage.setItem('user', JSON.stringify(u));
      window.location.reload();
    }
  });
}

// ── 7. Build donut chart (once)
function initChart() {
  const { goalPct } = getGoalProgress();

  const ctx = document.getElementById('goalChart').getContext('2d');
  goalChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [goalPct, 100 - goalPct],
        backgroundColor: ['#5C5D67', '#EDADC7'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '75%',
      plugins: { legend: { display: false } },
      animation: { duration: 600 }
    }
  });
}

// ── 8. Live updates — react when any other tab/page writes to localStorage
window.addEventListener('storage', (e) => {
  if ((e.key && e.key.startsWith('linguova_stats')) || e.key === 'user') {
    renderDashboard();
  }
});

// Also poll every 3 seconds as fallback for same-tab updates
setInterval(() => {
  renderDashboard();
}, 3000);

// ── 9. Boot
setGreeting();
initLangSelect();
initChart();
initTargets();
renderDashboard();
