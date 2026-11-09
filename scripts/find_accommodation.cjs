const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("activeTab === 'accommodation'") || l.includes('function Accommodation') || l.includes('reservingHotel')) {
    console.log((i+1) + ': ' + l.trim());
  }
});

