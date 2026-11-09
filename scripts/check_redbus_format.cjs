const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function test() {
  try {
    const s1 = await get('https://www.redbus.in/maint/suggesthome?keyword=Bangalore');
    console.log('Bangalore status:', s1.status, s1.body.slice(0, 300));

    const s2 = await get('https://www.redbus.in/maint/suggesthome?keyword=Tirupati');
    console.log('Tirupati status:', s2.status, s2.body.slice(0, 300));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();

