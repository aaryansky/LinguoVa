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

// Mock leaderboard data of other students
const leaderboardData = {
  weekly: [
    { name: 'Aryan Kumar',   initials: 'AK', lang: '🇯🇵 Japanese', xp: 2560, streak: 14, isMe: true },
    { name: 'Priya Sharma',  initials: 'PS', lang: '🇫🇷 French',   xp: 1840, streak: 9 },
    { name: 'Rahul Mehta',   initials: 'RM', lang: '🇪🇸 Spanish',  xp: 1320, streak: 7 },
    { name: 'Sneha Patel',   initials: 'SP', lang: '🇩🇪 German',   xp: 1140, streak: 5 },
    { name: 'Vikram Singh',  initials: 'VS', lang: '🇯🇵 Japanese', xp: 980,  streak: 3 },
    { name: 'Ananya Roy',    initials: 'AR', lang: '🇮🇹 Italian',  xp: 760,  streak: 4 },
    { name: 'Karan Joshi',   initials: 'KJ', lang: '🇫🇷 French',   xp: 620,  streak: 2 },
    { name: 'Meera Nair',    initials: 'MN', lang: '🇮🇳 Hindi',    xp: 540,  streak: 1 },
  ],
  monthly: [
    { name: 'Priya Sharma',  initials: 'PS', lang: '🇫🇷 French',   xp: 8400, streak: 28 },
    { name: 'Aryan Kumar',   initials: 'AK', lang: '🇯🇵 Japanese', xp: 7200, streak: 21, isMe: true },
    { name: 'Sneha Patel',   initials: 'SP', lang: '🇩🇪 German',   xp: 6100, streak: 18 },
    { name: 'Vikram Singh',  initials: 'VS', lang: '🇯🇵 Japanese', xp: 4800, streak: 12 },
    { name: 'Rahul Mehta',   initials: 'RM', lang: '🇪🇸 Spanish',  xp: 3900, streak: 10 },
  ],
  alltime: [
    { name: 'Ananya Roy',    initials: 'AR', lang: '🇮🇹 Italian',  xp: 42000, streak: 180 },
    { name: 'Priya Sharma',  initials: 'PS', lang: '🇫🇷 French',   xp: 38500, streak: 120 },
    { name: 'Vikram Singh',  initials: 'VS', lang: '🇯🇵 Japanese', xp: 31200, streak: 90 },
    { name: 'Aryan Kumar',   initials: 'AK', lang: '🇯🇵 Japanese', xp: 24800, streak: 60, isMe: true },
    { name: 'Meera Nair',    initials: 'MN', lang: '🇮🇳 Hindi',    xp: 18600, streak: 45 },
  ]
};

let currentTab = 'weekly';

function setTab(btn, tab) {
  document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTab = tab;
  renderLeaderboard(tab);
}

// Generate dynamic data incorporating the live user
function getLiveLeaderboardData(tab) {
  const sbUser = JSON.parse(localStorage.getItem('user')) || {};
  const sbStats = typeof LinguovaStats !== 'undefined' ? LinguovaStats.get() : {};
  
  const xp = sbStats.xp ?? sbUser.xp ?? 0;
  const streak = sbStats.streak ?? sbUser.streak ?? 0;
  const lang = sbUser.language || 'Japanese';
  
  const flags = {
    Japanese: '🇯🇵 Japanese',
    French: '🇫🇷 French',
    Spanish: '🇪🇸 Spanish',
    German: '🇩🇪 German',
    Italian: '🇮🇹 Italian',
    Hindi: '🇮🇳 Hindi'
  };
  const langStr = flags[lang] || lang;
  
  // Use actual live XP directly for all tabs
  let userXp = xp;
  
  // Create a deep copy of mock list
  const data = JSON.parse(JSON.stringify(leaderboardData[tab]));
  
  // Find "Me" record and replace details with live profile stats
  const meIndex = data.findIndex(p => p.isMe);
  if (meIndex !== -1) {
    data[meIndex].name = sbUser.name || 'Aryan Kumar';
    data[meIndex].initials = (sbUser.name || 'Aryan Kumar').split(' ').map(n => n[0]).join('').toUpperCase();
    data[meIndex].lang = langStr;
    data[meIndex].streak = streak;
    data[meIndex].xp = userXp;
  }
  
  // Re-sort list based on updated XP descending
  data.sort((a, b) => b.xp - a.xp);
  return data;
}

function renderLeaderboard(tab) {
  const data = getLiveLeaderboardData(tab);

  // Update podium top 3
  if (data[0]) { 
    document.getElementById('p1name').textContent = data[0].name.split(' ')[0] + ' ' + (data[0].name.split(' ')[1]?.[0] || '') + '.'; 
    document.getElementById('p1xp').textContent = data[0].xp.toLocaleString() + ' XP'; 
  }
  if (data[1]) { 
    document.getElementById('p2name').textContent = data[1].name.split(' ')[0] + ' ' + (data[1].name.split(' ')[1]?.[0] || '') + '.'; 
    document.getElementById('p2xp').textContent = data[1].xp.toLocaleString() + ' XP'; 
  }
  if (data[2]) { 
    document.getElementById('p3name').textContent = data[2].name.split(' ')[0] + ' ' + (data[2].name.split(' ')[1]?.[0] || '') + '.'; 
    document.getElementById('p3xp').textContent = data[2].xp.toLocaleString() + ' XP'; 
  }

  const rankClasses = ['gold','silver','bronze'];
  const rankSymbols = ['🥇','🥈','🥉'];

  const table = document.getElementById('lbTable');
  table.innerHTML = data.map((person, i) => `
    <div class="lb-row ${person.isMe ? 'me' : ''}">
      <span class="lb-rank ${rankClasses[i] || ''}">${i < 3 ? rankSymbols[i] : '#' + (i+1)}</span>
      <div class="lb-avatar" style="background:${person.isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}">
        ${person.initials}
      </div>
      <div class="lb-name">
        ${person.name} ${person.isMe ? '<span style="font-size:11px;color:var(--primary);font-weight:700;">(You)</span>' : ''}
        <div class="lb-lang">${person.lang}</div>
      </div>
      <span class="lb-streak">🔥 ${person.streak}d</span>
      <span class="lb-xp">${person.xp.toLocaleString()} XP</span>
    </div>
  `).join('');
}

// Initial render
renderLeaderboard('weekly');

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
    renderLeaderboard(currentTab);
    updateSidebarUserCard();
  }
});

// Polling interval
setInterval(() => {
  renderLeaderboard(currentTab);
  updateSidebarUserCard();
}, 3000);
