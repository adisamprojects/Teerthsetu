const REDBUS_CITY_IDS = {
  'bangalore': 122,
  'bengaluru': 122,
  'tirupati': 145,
  'tirumala': 145,
  'delhi': 729,
  'new-delhi': 729,
  'varanasi': 651,
  'kashi': 651,
  'banaras': 651,
  'hyderabad': 124,
  'secunderabad': 124,
  'chennai': 123,
  'madras': 123,
  'mumbai': 462,
  'pune': 130,
  'ahmedabad': 236,
  'kolkata': 125,
  'lucknow': 733,
  'ayodhya': 1864,
  'shirdi': 692,
  'haridwar': 911,
  'puri': 1102,
  'madurai': 140,
  'somnath': 1045,
  'ujjain': 1048,
  'rameswaram': 1120,
  'thanjavur': 1354,
  'vijayawada': 134
};

function slugifyCity(cityName) {
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
}

function formatRedbusDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const mon = months[d.getMonth()];
    const yr = d.getFullYear();
    return `${day}-${mon}-${yr}`;
  } catch (e) {
    return '';
  }
}

function buildSafeRedbusUrl(origin, destination, date = null, bus = null) {
  const fromSlug = slugifyCity(origin || 'Bengaluru');
  let toSlug = slugifyCity(destination || 'Tirupati');

  if (fromSlug === toSlug) {
    toSlug = `${toSlug}-temple`;
  }

  const baseUrl = `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}`;

  const fromId = REDBUS_CITY_IDS[fromSlug];
  const toId = REDBUS_CITY_IDS[toSlug];

  const params = new URLSearchParams();

  // ONLY attach search parameters IF both numeric City IDs are present!
  // This guarantees RedBus will NEVER parse NaN or throw "Please enter source and destination"
  if (fromId && toId) {
    const fromDisplayName = (origin || 'Bengaluru').split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const toDisplayName = (destination || 'Tirupati').split(' ')[0].replace(/[^a-zA-Z]/g, '');
    params.set('fromCityName', fromDisplayName);
    params.set('fromCityId', String(fromId));
    params.set('toCityName', toDisplayName);
    params.set('toCityId', String(toId));
    params.set('srcCountry', 'IND');
    params.set('destCountry', 'IND');

    const formattedDate = formatRedbusDate(date);
    if (formattedDate) {
      params.set('onward', formattedDate);
    }

    if (bus?.operator && bus.operator !== 'RedBus') {
      params.set('operator', bus.operator);
    }
  }

  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

console.log('Test 1 (Bengaluru to Tirupati with date):');
console.log(buildSafeRedbusUrl('Bengaluru', 'Tirupati', '2026-11-09'));

console.log('Test 2 (Delhi to Varanasi):');
console.log(buildSafeRedbusUrl('Delhi', 'Varanasi', '2026-11-15'));

console.log('Test 3 (Unknown origin to Tirupati - clean canonical route fallback):');
console.log(buildSafeRedbusUrl('UnknownTown', 'Tirupati'));

