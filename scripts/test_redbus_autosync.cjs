const assert = require('assert');

const slugifyCity = (cityName) => {
  if (!cityName) return '';
  const clean = cityName.toLowerCase().trim();
  if (clean.includes('bengaluru') || clean.includes('bangalore')) return 'bangalore';
  if (clean.includes('chennai') || clean.includes('madras')) return 'chennai';
  if (clean.includes('hyderabad') || clean.includes('secunderabad')) return 'hyderabad';
  if (clean.includes('delhi') || clean.includes('ncr')) return 'delhi';
  if (clean.includes('mumbai') || clean.includes('bombay')) return 'mumbai';
  if (clean.includes('kolkata') || clean.includes('calcutta')) return 'kolkata';
  if (clean.includes('vijayawada')) return 'vijayawada';
  if (clean.includes('tirupati') || clean.includes('tirumala')) return 'tirupati';
  if (clean.includes('varanasi') || clean.includes('kashi') || clean.includes('banaras')) return 'varanasi';
  if (clean.includes('ayodhya')) return 'ayodhya';
  if (clean.includes('shirdi')) return 'shirdi';
  if (clean.includes('haridwar') || clean.includes('kedarnath') || clean.includes('badrinath') || clean.includes('rishikesh')) return 'haridwar';
  if (clean.includes('somnath') || clean.includes('veraval')) return 'somnath';
  if (clean.includes('puri') || clean.includes('konark')) return 'puri';
  if (clean.includes('madurai')) return 'madurai';
  if (clean.includes('ujjain')) return 'ujjain';
  if (clean.includes('ahmedabad')) return 'ahmedabad';
  if (clean.includes('lucknow')) return 'lucknow';
  if (clean.includes('pune')) return 'pune';
  if (clean.includes('rameswaram')) return 'rameswaram';
  if (clean.includes('thanjavur')) return 'thanjavur';
  return clean.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const buildRedbusUrl = (origin, destination, date = null, bus = null) => {
  const fromSlug = slugifyCity(origin || 'Bengaluru');
  let toSlug = slugifyCity(destination || 'Tirupati');
  if (fromSlug === toSlug) toSlug = `${toSlug}-temple`;
  const baseUrl = `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}`;
  const params = new URLSearchParams();
  if (origin) params.set('fromCityName', origin);
  if (destination) params.set('toCityName', destination);
  if (date) params.set('onward', date);
  if (bus && bus.operator && bus.operator !== 'RedBus') params.set('operator', bus.operator);
  if (bus && bus.busType) params.set('busType', bus.busType);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
};

const url1 = buildRedbusUrl('Bengaluru', 'Tirupati', '2026-06-28', { operator: 'KSRTC', busType: 'EV Sleeper' });
console.log('Test 1:', url1);
assert(url1.includes('bangalore-to-tirupati'), 'Slug should be bangalore-to-tirupati');
assert(url1.includes('fromCityName=Bengaluru'), 'fromCityName should be Bengaluru');
assert(url1.includes('toCityName=Tirupati'), 'toCityName should be Tirupati');
assert(url1.includes('onward=2026-06-28'), 'onward date should be 2026-06-28');

const url2 = buildRedbusUrl('Hyderabad', 'Tirupati', '2026-06-28');
console.log('Test 2:', url2);
assert(url2.includes('hyderabad-to-tirupati'), 'Slug should be hyderabad-to-tirupati');

const url3 = buildRedbusUrl('Delhi', 'Varanasi', '2026-07-01');
console.log('Test 3:', url3);
assert(url3.includes('delhi-to-varanasi'), 'Slug should be delhi-to-varanasi');

const url4 = buildRedbusUrl('Tirupati (GPS Verified)', 'Tirumala Venkateswara Temple');
console.log('Test 4:', url4);
assert(url4.includes('tirupati-to-tirupati-temple'), 'Same-city should append -temple');

console.log('All RedBus URL generation tests passed successfully!');

