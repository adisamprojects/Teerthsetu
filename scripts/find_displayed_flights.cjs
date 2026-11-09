const fs = require('fs');
const lines = fs.readFileSync('frontend/src/components/DevoteeTravelsView.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('displayedFlights') || l.includes('pilgrimDestinationsWithAirports')) {
    console.log((i+1) + ': ' + l.trim());
  }
});

