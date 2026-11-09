const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('confirmedStay') || l.includes('ConfirmedStay') || l.includes('PAYMENT SUCCESSFUL') || l.includes('BOOKING CONFIRMED')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

