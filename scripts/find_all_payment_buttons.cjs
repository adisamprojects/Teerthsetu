const fs = require('fs');
const path = require('path');
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') walk(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      const lines = code.split('\n');
      lines.forEach((l, i) => {
        if (/Make Payment|Book Free|Proceed to/i.test(l)) {
          console.log(full + ':' + (i+1) + ': ' + l.trim());
        }
      });
    }
  }
}
walk('frontend/src');

