const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchDir(full);
    } else if (full.endsWith('.jsx')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('<PaymentGatewayModal')) {
        console.log(`Found in: ${full}`);
      }
    }
  }
}

searchDir('frontend/src');

