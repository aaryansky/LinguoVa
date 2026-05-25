const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, '../frontend/pages');

// Inline SVG icon strings - currentColor lets CSS control the color
const ICON = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  modules:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  ai:        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  leaderboard:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 20 18 10"/><polyline points="12 20 12 4"/><polyline points="6 20 6 14"/></svg>`,
  profile:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logo:      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EDADC7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

function ni(icon, text) {
  return `<span class="nav-icon">${icon}</span>${text}`;
}

const replacements = [
  // logo
  { from: '<span class="logo-icon">🌐</span>', to: `<span class="logo-icon">${ICON.logo}</span>` },
  // dashboard active & inactive
  { from: '<a href="dashboard.html" class="nav-item active">📊 Dashboard</a>', to: `<a href="dashboard.html" class="nav-item active">${ni(ICON.dashboard,'Dashboard')}</a>` },
  { from: '<a href="dashboard.html" class="nav-item">📊 Dashboard</a>', to: `<a href="dashboard.html" class="nav-item">${ni(ICON.dashboard,'Dashboard')}</a>` },
  // modules
  { from: '<a href="modules.html" class="nav-item active">📚 Learning Modules</a>', to: `<a href="modules.html" class="nav-item active">${ni(ICON.modules,'Learning Modules')}</a>` },
  { from: '<a href="modules.html" class="nav-item">📚 Learning Modules</a>', to: `<a href="modules.html" class="nav-item">${ni(ICON.modules,'Learning Modules')}</a>` },
  // ai practice
  { from: '<a href="ai-practice.html" class="nav-item active">🤖 AI Practice</a>', to: `<a href="ai-practice.html" class="nav-item active">${ni(ICON.ai,'AI Practice')}</a>` },
  { from: '<a href="ai-practice.html" class="nav-item">🤖 AI Practice</a>', to: `<a href="ai-practice.html" class="nav-item">${ni(ICON.ai,'AI Practice')}</a>` },
  // leaderboard
  { from: '<a href="leaderboard.html" class="nav-item active">🏆 Leaderboard</a>', to: `<a href="leaderboard.html" class="nav-item active">${ni(ICON.leaderboard,'Leaderboard')}</a>` },
  { from: '<a href="leaderboard.html" class="nav-item">🏆 Leaderboard</a>', to: `<a href="leaderboard.html" class="nav-item">${ni(ICON.leaderboard,'Leaderboard')}</a>` },
  // profile
  { from: '<a href="profile.html" class="nav-item active">👤 Profile</a>', to: `<a href="profile.html" class="nav-item active">${ni(ICON.profile,'Profile')}</a>` },
  { from: '<a href="profile.html" class="nav-item">👤 Profile</a>', to: `<a href="profile.html" class="nav-item">${ni(ICON.profile,'Profile')}</a>` },
  // settings
  { from: '<a href="settings.html" class="nav-item active">⚙️ Settings</a>', to: `<a href="settings.html" class="nav-item active">${ni(ICON.settings,'Settings')}</a>` },
  { from: '<a href="settings.html" class="nav-item">⚙️ Settings</a>', to: `<a href="settings.html" class="nav-item">${ni(ICON.settings,'Settings')}</a>` },
];

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
let count = 0;
for (const file of files) {
  const fp = path.join(pagesDir, file);
  let c = fs.readFileSync(fp, 'utf-8');
  const orig = c;
  for (const r of replacements) c = c.split(r.from).join(r.to);
  if (c !== orig) { fs.writeFileSync(fp, c); count++; }
}
console.log('Updated', count, 'files');
