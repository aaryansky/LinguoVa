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

// Helper to get stats
function getStats() {
  try {
    const saved = typeof LinguovaStats !== 'undefined' ? LinguovaStats.get() : {};
    return saved;
  } catch (e) {
    return {};
  }
}

// Function to update sidebar user card and page inputs dynamically
function renderSettingsPage() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const stats = getStats();
  const xp = stats.xp ?? user.xp ?? 0;
  const levelNum = Math.floor(xp / 400) + 1;
  const levelStr = user.level || 'Beginner';

  // Sidebar User Card
  if (document.getElementById('userName')) {
    document.getElementById('userName').textContent = user.name || '';
  }
  if (document.getElementById('userInitials') && user.name) {
    document.getElementById('userInitials').textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  if (document.getElementById('userLevel')) {
    document.getElementById('userLevel').textContent = `Level ${levelNum} · ${levelStr}`;
  }

  // Settings inputs (only load values if they aren't active element to prevent overwriting user typing)
  const nameEl = document.getElementById('settingsName');
  const emailEl = document.getElementById('settingsEmail');
  const langEl = document.getElementById('settingsLang');
  const levelEl = document.getElementById('settingsLevel');
  const goalEl = document.getElementById('settingsGoal');
  const remindersEl = document.getElementById('settingsReminders');

  if (nameEl && document.activeElement !== nameEl) nameEl.value = user.name || '';
  if (emailEl && document.activeElement !== emailEl) emailEl.value = user.email || '';
  if (langEl && document.activeElement !== langEl) langEl.value = user.language || 'Japanese';
  if (levelEl && document.activeElement !== levelEl) levelEl.value = user.level || 'Beginner';
  if (goalEl && document.activeElement !== goalEl) goalEl.value = user.dailyGoal || '30 minutes';
  if (remindersEl && document.activeElement !== remindersEl) remindersEl.checked = user.remindersEnabled !== false;
}

// Initial render
renderSettingsPage();

// Handle form submit
document.getElementById('accountForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const oldLanguage = user.language;
  const newLanguage = document.getElementById('settingsLang').value;
  
  // Update other user object fields in localStorage
  user.name = document.getElementById('settingsName').value;
  user.email = document.getElementById('settingsEmail').value;
  user.level = document.getElementById('settingsLevel').value;
  user.dailyGoal = document.getElementById('settingsGoal').value;
  user.remindersEnabled = document.getElementById('settingsReminders').checked;
  localStorage.setItem('user', JSON.stringify(user));
  
  // Sync language change and retrieve correct stats
  if (typeof LinguovaStats !== 'undefined') {
    LinguovaStats.changeLanguage(newLanguage).then(() => {
      renderSettingsPage();
      const successEl = document.getElementById('settingsSuccess');
      successEl.style.display = 'block';
      setTimeout(() => {
        successEl.style.display = 'none';
        if (oldLanguage !== newLanguage) {
          window.location.reload();
        }
      }, 1000);
    });
  } else {
    user.language = newLanguage;
    localStorage.setItem('user', JSON.stringify(user));
    renderSettingsPage();
    const successEl = document.getElementById('settingsSuccess');
    successEl.style.display = 'block';
    setTimeout(() => {
      successEl.style.display = 'none';
      if (oldLanguage !== newLanguage) {
        window.location.reload();
      }
    }, 1000);
  }
});

// Sync goals and reminders change immediately
document.getElementById('settingsGoal').addEventListener('change', (e) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  user.dailyGoal = e.target.value;
  localStorage.setItem('user', JSON.stringify(user));
});

document.getElementById('settingsReminders').addEventListener('change', (e) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  user.remindersEnabled = e.target.checked;
  localStorage.setItem('user', JSON.stringify(user));
});

// Storage event listener for dynamic updates
window.addEventListener('storage', (e) => {
  if ((e.key && e.key.startsWith('linguova_stats')) || e.key === 'user') {
    renderSettingsPage();
  }
});

// Fallback interval for dynamic updates
setInterval(renderSettingsPage, 3000);

