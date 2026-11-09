const fs = require('fs');
const content = fs.readFileSync('backend/server.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('/api/flights') || l.includes('flight')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

