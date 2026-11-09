const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let hasEarlyReturn = false;
  let lineOfReturn = -1;
  lines.forEach((l, idx) => {
    if (l.match(/if\s*\([^)]+\)\s*return(\s+null)?;/)) {
      hasEarlyReturn = true;
      lineOfReturn = idx + 1;
    }
    if (hasEarlyReturn && l.match(/\b(use[A-Z]\w+)\s*\(/)) {
      console.log(`POTENTIAL HOOK VIOLATION in ${filePath} at line ${idx + 1}: hook called after early return at line ${lineOfReturn}`);
      console.log(`  Line ${lineOfReturn}: ${lines[lineOfReturn - 1].trim()}`);
      console.log(`  Line ${idx + 1}: ${l.trim()}\n`);
    }
  });
}

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) scan(p);
    else if (p.endsWith('.jsx') || p.endsWith('.js')) checkFile(p);
  }
}

scan('frontend/src');

