const https = require('https');

https.get('https://www.redbus.in/bus-tickets/bangalore-to-tirupati', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const m = body.match(/fromCityId["':\s]+(\d+)/i) || body.match(/source["':\s]+(\d+)/i) || body.match(/"id":\s*"?(\d+)"?,\s*"name":\s*"Bangalore"/i);
    console.log('Match from:', m);
    const m2 = body.match(/toCityId["':\s]+(\d+)/i) || body.match(/destination["':\s]+(\d+)/i) || body.match(/"id":\s*"?(\d+)"?,\s*"name":\s*"Tirupati"/i);
    console.log('Match to:', m2);

    // Look for JSON-LD or script with search params
    const scripts = body.match(/<script[^>]*>(.*?)<\/script>/gis) || [];
    for (const s of scripts) {
      if (s.includes('fromCityId') || s.includes('fromCityName') || s.includes('cityId') || s.includes('Bangalore')) {
        console.log('Found script snippet:', s.slice(0, 400));
        break;
      }
    }
  });
}).on('error', console.error);

