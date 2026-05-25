const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, '../frontend/pages');

// ── Shared SVG icons ──────────────────────────────────────────────────
const SVG = {
  book:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  pencil:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  target:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  news:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="18" y1="14" x2="12" y2="14"/><line x1="18" y1="10" x2="12" y2="10"/><line x1="18" y1="18" x2="12" y2="18"/></svg>`,
  trophy:`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 18 12 22 16 18"/><path d="M12 22V14"/><path d="M20 4H4l2 6 6 4 6-4z"/><path d="M4 4c0 4 2 6 4 8"/><path d="M20 4c0 4-2 6-4 8"/></svg>`,
  words: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  star:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  user:  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  logo:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EDADC7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  refresh:`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  crown: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#EDADC7" stroke="#EDADC7" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  spark: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
};

function iconWrap(svg, colorClass) {
  return `<span class="mod-icon-wrap ${colorClass}">${svg}</span>`;
}

// ── modules.html changes ──────────────────────────────────────────────
const modulesFile = path.join(pagesDir, 'modules.html');
let m = fs.readFileSync(modulesFile, 'utf-8');

m = m.replace('<h1>📚 Learning Modules</h1>', '<h1>Learning Modules</h1>');
m = m.replace('<div class="mod-icon">📝</div>', iconWrap(SVG.pencil, 'mi-blush'));
m = m.replace('<div class="mod-icon">📖</div>', iconWrap(SVG.book, 'mi-lilac1'));
m = m.replace('<div class="mod-icon">🎯</div>', iconWrap(SVG.target, 'mi-lilac2'));
m = m.replace('<div class="mod-icon">📰</div>', iconWrap(SVG.news, 'mi-ash'));
m = m.replace('<span>📖 Vocabulary Cards</span>', '<span>Vocabulary Cards</span>');
// Fix logo emoji that has no logo-icon class wrapper
m = m.replace('<div class="sidebar-logo"><span>🌐</span><span class="logo-text">LinguoVa</span></div>',
  `<div class="sidebar-logo"><span class="logo-icon">${SVG.logo}</span><span class="logo-text">LinguoVa</span></div>`);

fs.writeFileSync(modulesFile, m);

// ── leaderboard.html changes ──────────────────────────────────────────
const lbFile = path.join(pagesDir, 'leaderboard.html');
let lb = fs.readFileSync(lbFile, 'utf-8');

lb = lb.replace('<h1>🏆 Leaderboard</h1>', `<h1 style="display:flex;align-items:center;gap:10px;">${SVG.trophy} Leaderboard</h1>`);
lb = lb.replace('<div class="crown">👑</div>', `<div class="crown">${SVG.crown}</div>`);
// Replace person emojis with avatar initials divs (they're already circles, remove emoji)
lb = lb.replace('<div class="podium-avatar">🧑</div>', '<div class="podium-avatar">P</div>');
lb = lb.replace('<div class="podium-avatar large">👩</div>', '<div class="podium-avatar large">A</div>');
lb = lb.replace('<div class="podium-avatar">👦</div>', '<div class="podium-avatar">R</div>');
// Fix logo emoji
lb = lb.replace('<div class="sidebar-logo"><span>🌐</span><span class="logo-text">LinguoVa</span></div>',
  `<div class="sidebar-logo"><span class="logo-icon">${SVG.logo}</span><span class="logo-text">LinguoVa</span></div>`);

fs.writeFileSync(lbFile, lb);

// ── daily-words.html changes ──────────────────────────────────────────
const dwFile = path.join(pagesDir, 'daily-words.html');
let dw = fs.readFileSync(dwFile, 'utf-8');

dw = dw.replace('<h1>📖 Daily Words</h1>', `<h1 style="display:flex;align-items:center;gap:10px;"><span class="mod-icon-wrap mi-lilac1">${SVG.words}</span> Daily Words</h1>`);
dw = dw.replace('🔥 <span id="learnedCount">0</span>/5 Learned Today', '<span id="learnedCount">0</span>/5 Learned Today');
dw = dw.replace('🔄 New Words', `${SVG.refresh} New Words`);
dw = dw.replace('<div class="completion-emoji">🎉</div>', `<div class="completion-emoji mod-icon-wrap mi-blush" style="width:64px;height:64px;border-radius:16px;font-size:30px;">${SVG.star}</div>`);
dw = dw.replace('<span>🔥</span>', `<span class="mod-icon-wrap mi-lilac2" style="width:32px;height:32px;border-radius:8px;">${SVG.spark}</span>`);
// Fix logo emoji
dw = dw.replace('<div class="sidebar-logo"><span>🌐</span><span class="logo-text">LinguoVa</span></div>',
  `<div class="sidebar-logo"><span class="logo-icon">${SVG.logo}</span><span class="logo-text">LinguoVa</span></div>`);
// Fix Daily Words sidebar nav item
dw = dw.replace('<a href="daily-words.html" class="nav-item active">📖 Daily Words</a>',
  `<a href="daily-words.html" class="nav-item active"><span class="nav-icon">${SVG.book}</span>Daily Words</a>`);

fs.writeFileSync(dwFile, dw);

console.log('✅ All pages updated!');
