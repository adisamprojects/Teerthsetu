const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/PaymentGatewayModal.jsx', 'utf8');
const lines = content.split('\n');
let returnLine = -1;
let hookViolations = 0;

lines.forEach((l, i) => {
  if (l.includes('if (!isOpen) return null;')) {
    returnLine = i + 1;
    console.log(`Found 'if (!isOpen) return null;' at line ${returnLine}`);
  }
  if (returnLine > 0 && l.match(/\buse[A-Z]\w+\(/)) {
    console.error(`HOOK VIOLATION at line ${i + 1}: ${l.trim()}`);
    hookViolations++;
  }
});

if (hookViolations === 0) {
  console.log('SUCCESS: ZERO hook violations found! All hooks execute unconditionally.');
} else {
  console.error(`FAILURE: ${hookViolations} hook violations found.`);
}

