const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/DevoteeTravelsView.jsx', 'utf8');

const oldLines = `  const pilgrimDestinationsWithAirports = pilgrimageDestinations.filter(d => d.airportCode);
  const displayedFlights = apiFlights && apiFlights.length > 0 ? apiFlights : filteredFlights;`;

const newTarget = `  const currentDestinationMeta = pilgrimageDestinations.find(d => d.city.toLowerCase() === selectedDestinationCity.toLowerCase()) || pilgrimageDestinations[0];`;

const replacement = `  const pilgrimDestinationsWithAirports = pilgrimageDestinations.filter(d => d.airportCode);
  const displayedFlights = apiFlights && apiFlights.length > 0 ? apiFlights : filteredFlights;

  const currentDestinationMeta = pilgrimageDestinations.find(d => d.city.toLowerCase() === selectedDestinationCity.toLowerCase()) || pilgrimageDestinations[0];`;

if (!code.includes(oldLines)) {
  console.error('FAIL: oldLines not found');
  process.exit(1);
}

// Remove from top
code = code.replace(oldLines + '\n\n', '');
// If without double newline
if (code.includes(oldLines)) {
  code = code.replace(oldLines + '\n', '');
}
if (code.includes(oldLines)) {
  code = code.replace(oldLines, '');
}

// Insert after filteredFlights
if (!code.includes(newTarget)) {
  console.error('FAIL: newTarget not found');
  process.exit(1);
}

code = code.replace(newTarget, replacement);

fs.writeFileSync('frontend/src/components/DevoteeTravelsView.jsx', code, 'utf8');
console.log('SUCCESS: Moved displayedFlights and pilgrimDestinationsWithAirports below filteredFlights');

