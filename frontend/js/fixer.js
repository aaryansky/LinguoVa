const fs = require('fs');
let mod = fs.readFileSync('frontend/js/modules.js', 'utf8');
const fix = fs.readFileSync('frontend/js/fix.js', 'utf8');
const start = mod.indexOf('// ── Reading passages per language ──');
const end = mod.indexOf('let currentModule = \'grammar\';');
if (start !== -1 && end !== -1) {
  mod = mod.substring(0, start) + fix + '\n' + mod.substring(end);
  fs.writeFileSync('frontend/js/modules.js', mod);
  console.log('Successfully fixed modules.js');
} else {
  console.log('Could not find start or end markers');
}
