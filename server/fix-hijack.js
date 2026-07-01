const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'api-tester.txt');
const b64 = fs.readFileSync(p, 'utf8');
let c = Buffer.from(b64, 'base64').toString('utf8');

c = c.replace(
  'function showHijackDemo()',
  'function _showHijackDemo()'
);

const newFn = [
  'function showHijackDemo() {',
  '  var el = document.getElementById("hijack-token");',
  '  var tk = el ? el.value.trim() : "";',
  '  if (!tk) {',
  '    document.getElementById("hijack-resp").innerHTML = ',
  '      \'<div class="resp-header"><span class="status">\\u26a0\\ufe0f D\\u00e1n token c\\u1ea7n test v\\u00e0o \\u00f4 tr\\u00ean</span></div>\';',
  '    return;',
  '  }',
  '  setToken(tk);',
  '  apiCall("GET", "/api/auth/me", null, "hijack-resp", true);',
  '}',
].join('\n');

c = c.replace('// Sidebar navigation', newFn + '\n\n// Sidebar navigation');

fs.writeFileSync(p, Buffer.from(c, 'utf8').toString('base64'));
console.log('OK');
