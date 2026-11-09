const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/DevoteeTravelsView.jsx', 'utf8');

// Parse lines and inspect every const/let declaration position vs usage
const lines = content.split('\n');
const declarations = {};

lines.forEach((line, idx) => {
  const match = line.match(/^\s*(?:const|let)\s+([a-zA-Z0-9_]+)\s*=/);
  if (match) {
    const varName = match[1];
    if (!declarations[varName]) {
      declarations[varName] = idx + 1;
    }
  }
});

console.log('Top declarations found:', Object.keys(declarations).length);

// Now check if any of these are referenced before their declaration line
const errors = [];
lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  // Ignore imports or comments
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
  
  for (const [varName, declLine] of Object.entries(declarations)) {
    if (declLine > lineNum) {
      // Check if varName is used as an identifier in this line
      const regex = new RegExp('\\b' + varName + '\\b');
      if (regex.test(line)) {
        // Exclude function params, object keys if not values
        if (!line.includes('const ' + varName) && !line.includes('let ' + varName)) {
          errors.push({ varName, usedAt: lineNum, declaredAt: declLine, line: line.trim() });
        }
      }
    }
  }
});

console.log('Potential TDZ references found:', errors.length);
errors.forEach(e => {
  console.log(`Line ${e.usedAt}: "${e.varName}" used before declaration at line ${e.declaredAt} -> ${e.line}`);
});

