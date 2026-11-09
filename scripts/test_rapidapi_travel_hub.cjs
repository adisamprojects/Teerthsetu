process.env.NODE_ENV = 'test';

const assert = require('assert');
const { EventEmitter } = require('events');
const { IncomingMessage, ServerResponse } = require('http');
const app = require('../backend/server.js');

function createMockSocket() {
  const socket = new EventEmitter();
  socket.remoteAddress = '127.0.0.1';
  socket.remotePort = 54321;
  socket.encrypted = false;
  socket.writable = true;
  socket.readable = true;
  socket.destroy = function () { return this; };
  socket.write = function () { return true; };
  socket.end = function () { return this; };
  socket.pause = function () { return this; };
  socket.resume = function () { return this; };
  socket.setTimeout = function () { return this; };
  socket.setKeepAlive = function () { return this; };
  return socket;
}

function invokeExpress(app, method, url, body = null, extraHeaders = {}) {
  return new Promise((resolve) => {
    const socket = createMockSocket();
    const req = new IncomingMessage(socket);
    req.method = method.toUpperCase();
    req.url = url;
    req.headers = {
      'host': '127.0.0.1',
      'user-agent': 'RapidAPI-Travel-Hub-Tester/1.0',
      'accept': 'application/json',
      ...extraHeaders
    };

    let payload = '';
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.headers['content-type'] = 'application/json';
      req.headers['content-length'] = Buffer.byteLength(payload).toString();
    }

    const res = new ServerResponse(req);
    res.assignSocket(socket);

    const resChunks = [];
    res.write = function (chunk, encoding) {
      if (chunk) {
        resChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || 'utf8'));
      }
      return true;
    };

    res.end = function (chunk, encoding) {
      if (chunk) {
        resChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || 'utf8'));
      }
      const rawBody = Buffer.concat(resChunks).toString('utf8');
      let json = null;
      try {
        json = JSON.parse(rawBody);
      } catch (e) {
        json = rawBody;
      }
      resolve({
        statusCode: res.statusCode,
        status: res.statusCode,
        headers: res.getHeaders(),
        body: json
      });
    };

    app.handle(req, res);

    if (payload) {
      process.nextTick(() => {
        req.push(payload);
        req.push(null);
      });
    } else {
      process.nextTick(() => {
        req.push(null);
      });
    }
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log('   RAPIDAPI TRAVEL & ACCOMMODATION SUITE VERIFICATION TESTS');
  console.log('   Marketplace: https://rapidapi.com/search/Travel?sortBy=ByRelevance');
  console.log('========================================================================\n');

  try {
    // 1. Travel API Status
    console.log('--- TEST 1: RapidAPI Travel Ecosystem Status ---');
    const resStatus = await invokeExpress(app, 'GET', '/api/travel-api/status');
    const statusData = resStatus.body;
    assert.strictEqual(resStatus.statusCode, 200, 'Expected 200 OK');
    assert.strictEqual(statusData.success, true, 'Status success should be true');
    assert.strictEqual(statusData.status, 'OPERATIONAL', 'Status should be OPERATIONAL');
    assert(statusData.services.accommodations, 'Accommodations service should be defined');
    assert(statusData.services.flights, 'Flights service should be defined');
    assert(statusData.services.trains, 'Trains service should be defined');
    assert(statusData.services.cabs, 'Cabs service should be defined');
    console.log('  ✓ PASS: Travel API status is OPERATIONAL with 5 active domains');
    console.log(`  ✓ PASS: Mode: ${statusData.mode} | Catalog: ${statusData.catalogUrl}`);

    // 2. Travel API Catalog
    console.log('\n--- TEST 2: RapidAPI Travel & Accommodation Catalog ---');
    const resCatalog = await invokeExpress(app, 'GET', '/api/travel-api/catalog');
    const catalogData = resCatalog.body;
    assert.strictEqual(resCatalog.statusCode, 200);
    assert.strictEqual(catalogData.success, true);
    assert(Array.isArray(catalogData.catalog), 'Catalog should be an array');
    assert(catalogData.catalog.length >= 5, 'Catalog should have at least 5 top APIs');
    const bookingApi = catalogData.catalog.find(c => c.id === 'booking-com-api');
    const skyscannerApi = catalogData.catalog.find(c => c.id === 'skyscanner-api');
    const irctcApi = catalogData.catalog.find(c => c.id === 'irctc-railway-api');
    assert(bookingApi, 'Booking.com API in catalog');
    assert(skyscannerApi, 'Skyscanner API in catalog');
    assert(irctcApi, 'IRCTC API in catalog');
    console.log(`  ✓ PASS: Catalog returned ${catalogData.catalog.length} integrated RapidAPI services`);
    console.log(`  ✓ PASS: Found Booking.com (${bookingApi.host}), Skyscanner (${skyscannerApi.host}), IRCTC (${irctcApi.host})`);

    // 3. Flight Search via RapidAPI
    console.log('\n--- TEST 3: RapidAPI Live Flight Search (Bengaluru -> Tirupati) ---');
    const resFlights = await invokeExpress(app, 'POST', '/api/travel-api/flights', {
      sourceCity: 'Bengaluru',
      destinationCity: 'Tirupati',
      date: '2026-06-28',
      passengers: 2
    });
    const flightData = resFlights.body;
    assert.strictEqual(resFlights.statusCode, 200);
    assert.strictEqual(flightData.success, true);
    assert(Array.isArray(flightData.flights) && flightData.flights.length > 0);
    assert.strictEqual(flightData.originCode, 'BLR');
    assert.strictEqual(flightData.destinationCode, 'TIR');
    console.log(`  ✓ PASS: Found ${flightData.count} flights for route BLR -> TIR on ${flightData.date}`);
    console.log(`  ✓ PASS: Sample flight: ${flightData.flights[0].airline} ${flightData.flights[0].flightNo} (₹${flightData.flights[0].startingFare})`);

    // 4. Train Search via RapidAPI IRCTC
    console.log('\n--- TEST 4: RapidAPI Train Search (SBC -> TPTY) ---');
    const resTrains = await invokeExpress(app, 'POST', '/api/travel-api/trains', {
      sourceCity: 'Bengaluru',
      destinationCity: 'Tirupati',
      date: '2026-06-28'
    });
    const trainData = resTrains.body;
    assert.strictEqual(resTrains.statusCode, 200);
    assert.strictEqual(trainData.success, true);
    assert(Array.isArray(trainData.trains) && trainData.trains.length > 0);
    console.log(`  ✓ PASS: Found ${trainData.count} trains via ${trainData.provider}`);
    console.log(`  ✓ PASS: Top express: ${trainData.trains[0].trainName} (#${trainData.trains[0].trainNo})`);

    // 5. Cab & Transfer Estimator
    console.log('\n--- TEST 5: RapidAPI Pilgrimage Cab & Hilltop Transfer Estimator ---');
    const resCabs = await invokeExpress(app, 'POST', '/api/travel-api/cabs', {
      pickup: 'Tirupati Railway Station',
      drop: 'Tirumala Hilltop Vaikuntam Gate 1',
      vehicleType: 'ALL'
    });
    const cabData = resCabs.body;
    assert.strictEqual(resCabs.statusCode, 200);
    assert.strictEqual(cabData.success, true);
    assert(Array.isArray(cabData.cabs) && cabData.cabs.length >= 3);
    console.log(`  ✓ PASS: ${cabData.routesAvailable} cab options computed for ${cabData.drop}`);
    console.log(`  ✓ PASS: Sedan: ₹${cabData.cabs[0].totalPayable} | SUV: ₹${cabData.cabs[1].totalPayable} | Tempo: ₹${cabData.cabs[2].totalPayable}`);

    // 6. Indian Railways PNR Status
    console.log('\n--- TEST 6: Indian Railways PNR Status Verification ---');
    const resPnr = await invokeExpress(app, 'GET', '/api/travel-api/pnr/2468135790');
    const pnrData = resPnr.body;
    assert.strictEqual(resPnr.statusCode, 200);
    assert.strictEqual(pnrData.success, true);
    assert.strictEqual(pnrData.pnr, '2468135790');
    assert.strictEqual(pnrData.chartingStatus, 'CHART PREPARED');
    console.log(`  ✓ PASS: PNR ${pnrData.pnr} verified on train ${pnrData.trainName}`);
    console.log(`  ✓ PASS: Passenger status: ${pnrData.passengers[0].bookingStatus}`);

    // 7. Hotel Accommodation Engine
    console.log('\n--- TEST 7: RapidAPI Hotel Search Engine ---');
    const resHotels = await invokeExpress(app, 'POST', '/api/hotel-api/search', {
      destination: 'Tirupati',
      guests: 2,
      rooms: 1
    });
    const hotelData = resHotels.body;
    assert.strictEqual(resHotels.statusCode, 200);
    assert.strictEqual(hotelData.success, true);
    assert(hotelData.hotels.length > 0);
    console.log(`  ✓ PASS: RapidAPI Hotel Search returned ${hotelData.hotels.length} verified stays in Tirupati`);

    console.log('\n========================================================================');
    console.log('   ALL 7 RAPIDAPI SUITE INTEGRATION TESTS PASSED CLEANLY (100%)');
    console.log('========================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
