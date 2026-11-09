const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'dist') {
      search(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes('window.Razorpay') || txt.includes('new Razorpay') || txt.includes('Razorpay(')) {
        console.log('Match in:', full);
      }
    }
  }
}

search('frontend/src');

