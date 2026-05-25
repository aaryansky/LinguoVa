/**
 * linguova-stats.js
 * ─────────────────────────────────────────────────────────────
 * Shared utility to read / write the language-specific stats
 * objects in localStorage so each course tracks progress independently.
 *
 * Stats schema:
 *   streak          – number  (day streak)
 *   xp              – number  (total XP)
 *   wordsLearned    – number  (total unique words learned)
 *   accuracy        – number  (0–100, percentage)
 *   grammarProgress – number  (0–100)
 *   vocabProgress   – number  (0–100)
 *   pronunProgress  – number  (0–100)
 *   todayCompleted  – number  (tasks done today)
 *   todayGoal       – number  (daily target tasks, default 5)
 *   lastActiveDate  – string  (YYYY-MM-DD, for streak calc)
 *   totalAnswered   – number  (for accuracy calc)
 *   totalCorrect    – number  (for accuracy calc)
 *   aiChatDoneToday - boolean (daily target completion flag)
 *   wordsLearnedToday - number (daily target count)
 *   quizQuestionsToday - number (daily target count)
 * ─────────────────────────────────────────────────────────────
 */

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

const LinguovaStats = (() => {

  const DEFAULTS = {
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

  /** Determine the unique localStorage key for active user + selected language */
  function getStatsKey() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user._id || 'guest';
    const lang = user.language || 'Japanese';
    return `linguova_stats_${userId}_${lang}`;
  }

  function load() {
    try {
      const key = getStatsKey();
      const saved = JSON.parse(localStorage.getItem(key));
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const activeLang = user.language || 'Japanese';
      
      // If local stats don't exist in local storage, load from user session progress
      if (!saved && user.token) {
        const dbProgress = user.progress || {};
        const langStats = dbProgress[activeLang] || {};
        
        const initial = Object.assign({}, DEFAULTS, {
          streak: langStats.streak ?? (activeLang === user.language ? (user.streak || 0) : 0),
          xp: langStats.xp ?? (activeLang === user.language ? (user.xp || 0) : 0),
          wordsLearned: langStats.wordsLearned ?? (activeLang === user.language ? (user.wordsLearned || 0) : 0),
          accuracy: langStats.accuracy ?? (activeLang === user.language ? (user.accuracy || 0) : 0)
        });
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      return Object.assign({}, DEFAULTS, saved || {});
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function save(stats) {
    const key = getStatsKey();
    localStorage.setItem(key, JSON.stringify(stats));

    // Sync with MongoDB in the background (fire-and-forget)
    const token = localStorage.getItem('token');
    if (token) {
      const userObj = JSON.parse(localStorage.getItem('user')) || {};
      const activeLang = userObj.language || 'Japanese';
      const API_BASE = window.getApiBase();
      fetch(`${API_BASE}/api/auth/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          xp: stats.xp || 0,
          streak: stats.streak || 0,
          wordsLearned: stats.wordsLearned || 0,
          accuracy: stats.accuracy || 0,
          language: activeLang
        })
      })
      .then(async res => {
        if (!res.ok) {
          console.warn('Failed to sync stats to database:', res.statusText);
        } else {
          // Success: update the local user object progress map
          const data = await res.json();
          const user = JSON.parse(localStorage.getItem('user')) || {};
          if (data.progress) {
            user.progress = data.progress;
            user.language = data.language || user.language;
            user.xp = data.xp;
            user.streak = data.streak;
            user.wordsLearned = data.wordsLearned;
            user.accuracy = data.accuracy;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      })
      .catch(err => console.warn('Network error while syncing stats:', err.message));
    }
  }

  /* ── Public API ── */

  /** Read the full stats object */
  function get() { return load(); }

  /**
   * Add XP. Automatically recalculates progress fields.
   * source: 'grammar' | 'vocab' | 'pronun' | 'ai' | 'daily'
   */
  function addXP(amount, source) {
    const s = load();
    s.xp += amount;

    // Increment today's completed count
    s.todayCompleted = (s.todayCompleted || 0) + 1;
    if (!s.todayGoal) s.todayGoal = 5;

    // Mark AI chat completion if active
    if (source === 'ai' || source === 'pronun') {
      s.aiChatDoneToday = true;
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (s.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (s.lastActiveDate === yesterday) {
        s.streak = (s.streak || 0) + 1;
      } else if (s.lastActiveDate !== today) {
        s.streak = 1; // reset if gap
      }
      s.lastActiveDate = today;
    }

    // Source-specific progress (cap at 100)
    const boost = Math.min(5, Math.round(amount / 4));
    if (source === 'grammar') {
      s.grammarProgress = Math.min(100, (s.grammarProgress || 0) + boost);
    } else if (source === 'vocab') {
      s.vocabProgress = Math.min(100, (s.vocabProgress || 0) + boost);
    } else if (source === 'pronun' || source === 'ai') {
      s.pronunProgress = Math.min(100, (s.pronunProgress || 0) + boost);
    }

    save(s);
    return s;
  }

  /**
   * Record quiz answers (for accuracy).
   * correct: number of correct answers
   * total:   total questions answered
   * source:  'grammar' | 'vocab' | 'daily'
   */
  function recordQuiz(correct, total, source) {
    const s = load();
    s.totalCorrect  = (s.totalCorrect  || 0) + correct;
    s.totalAnswered = (s.totalAnswered || 0) + total;
    s.quizQuestionsToday = (s.quizQuestionsToday || 0) + total;
    s.accuracy = s.totalAnswered > 0
      ? Math.round((s.totalCorrect / s.totalAnswered) * 100)
      : 0;

    // Boost the relevant progress bar
    if (total > 0) {
      const pct = Math.round((correct / total) * 100);
      if (source === 'grammar') {
        s.grammarProgress = Math.min(100, Math.round(
          ((s.grammarProgress || 0) * 0.7) + (pct * 0.3)
        ));
      } else if (source === 'vocab' || source === 'daily') {
        s.vocabProgress = Math.min(100, Math.round(
          ((s.vocabProgress || 0) * 0.7) + (pct * 0.3)
        ));
      }
    }

    save(s);
    return s;
  }

  /**
   * Record words learned from flashcards or daily-words.
   * count: how many new words were marked as "known"
   */
  function addWords(count) {
    const s = load();
    s.wordsLearned = (s.wordsLearned || 0) + count;
    s.wordsLearnedToday = (s.wordsLearnedToday || 0) + count;
    s.vocabProgress = Math.min(100, (s.vocabProgress || 0) + Math.min(10, count));
    save(s);
    return s;
  }

  /** Set daily goal (total tasks for today) */
  function setDailyGoal(n) {
    const s = load();
    s.todayGoal = n;
    save(s);
    return s;
  }

  /** Reset today's completed count (call at midnight / new day) */
  function resetDailyIfNeeded() {
    const s = load();
    const today = new Date().toISOString().split('T')[0];
    if (s.lastActiveDate && s.lastActiveDate !== today) {
      s.todayCompleted = 0;
      s.aiChatDoneToday = false;
      s.wordsLearnedToday = 0;
      s.quizQuestionsToday = 0;
      save(s);
    }
    return s;
  }

  return { get, addXP, recordQuiz, addWords, setDailyGoal, resetDailyIfNeeded, getStatsKey };
})();

// Auto-reset daily progress if it's a new day
LinguovaStats.resetDailyIfNeeded();
