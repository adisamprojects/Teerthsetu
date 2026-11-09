const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/DevoteeTravelsView.jsx', 'utf8');

const activeCatDeclarationIndex = content.indexOf('const [activeCategory, setActiveCategory]');
const firstActiveCatUsageIndex = content.indexOf('activeCategory ===');

console.log('activeCategory declaration position:', activeCatDeclarationIndex);
console.log('first activeCategory usage position:', firstActiveCatUsageIndex);

if (activeCatDeclarationIndex < 0) {
  console.error('FAIL: activeCategory declaration not found');
  process.exit(1);
}

if (activeCatDeclarationIndex > firstActiveCatUsageIndex) {
  console.error('FAIL: activeCategory used BEFORE declaration!');
  process.exit(1);
}

console.log('✓ PASS: activeCategory is declared BEFORE first usage (No TDZ / ReferenceError)!');

