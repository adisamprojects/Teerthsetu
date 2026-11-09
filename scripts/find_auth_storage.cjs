const fs = require('fs');
const path = require('path');
function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') search(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      const lines = code.split('\n');
      lines.forEach((l, i) => {
        if (l.includes("localStorage.setItem('user'") || l.includes('localStorage.setItem("user"') || l.includes('google') || l.includes('auth')) {
          if (l.includes('localStorage.setItem') || l.includes('GoogleLogin') || l.includes('jwt') || l.includes('credential')) {
            console.log(full + ':' + (i+1) + ': ' + l.trim());
          }
        }
      });
    }
  }
}
search('frontend/src');

