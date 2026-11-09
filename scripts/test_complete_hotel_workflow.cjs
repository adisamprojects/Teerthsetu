process.env.NODE_ENV = 'test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_TeerthSetuSandbox';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_TeerthSetuKey2026';

const { EventEmitter } = require('events');
const { IncomingMessage, ServerResponse } = require('http');
const crypto = require('crypto');
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
    req.method = method;
    req.url = url;
    req.httpVersion = '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;

    const jsonStr = body ? JSON.stringify(body) : '';
    req.headers = {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(jsonStr)),
      'host': 'localhost:5000',
      ...extraHeaders
    };

    let resData = '';
    const res = new ServerResponse(req);
    res.assignSocket(socket);

    res.write = function (chunk, encoding, cb) {
      if (chunk) resData += chunk.toString();
      if (typeof cb === 'function') cb();
      return true;
    };

    res.end = function (chunk, encoding, cb) {
      if (chunk) resData += chunk.toString();
      if (typeof cb === 'function') cb();
      let json = null;
      try { json = JSON.parse(resData); } catch (e) { json = resData; }
      resolve({ status: res.statusCode, headers: res.getHeaders(), data: json });
    };

    app.handle(req, res);

    if (jsonStr) {
      req.push(Buffer.from(jsonStr));
    }
    req.push(null);
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log('   TIRTHSETU HOTEL BOOKING & GOOGLE PAY AI WORKFLOW VERIFICATION SUITE   ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message} ${details ? '(' + JSON.stringify(details) + ')' : ''}`);
      failed++;
    }
  }

  try {
    // ---------------------------------------------------------
    // TEST 1: Devotee Profile Auto-Retrieval
    // ---------------------------------------------------------
    console.log('--- TEST 1: Devotee Profile Auto-Retrieval (No re-entering data) ---');
    const profileRes = await invokeExpress(app, 'GET', '/api/devotee/profile', null, {
      authorization: 'Bearer mock-jwt-devotee-test'
    });
    const profileData = profileRes.data?.profile;
    assert(profileRes.status === 200, 'GET /api/devotee/profile returns HTTP 200');
    assert(profileData && profileData.devoteeId === 'DEV-2026-8941', `Resolved Devotee ID: ${profileData?.devoteeId}`);
    assert(profileData && (profileData.fullName === 'Devendra Kumar' || profileData.fullName === 'Devotee'), `Resolved Devotee Name: ${profileData?.fullName}`);
    assert(profileData && profileData.mobileNumber === '+91 9876543210', `Resolved Mobile: ${profileData?.mobileNumber}`);
    assert(profileData && profileData.email === 'devotee@teerthsethu.in', `Resolved Email: ${profileData?.email}`);
    assert(profileData && profileData.activePilgrimagePass != null, `Active Pilgrimage Pass attached: ${profileData?.activePilgrimagePass}`);

    // ---------------------------------------------------------
    // TEST 2: Hotel Listings & Occupancy Enrichment
    // ---------------------------------------------------------
    console.log('\n--- TEST 2: Hotel Listings & Real-time Occupancy Aggregation ---');
    const hotelsRes = await invokeExpress(app, 'GET', '/api/hotels');
    const hotelsData = hotelsRes.data;
    assert(hotelsRes.status === 200, 'GET /api/hotels returns HTTP 200');
    const hotelList = hotelsData.hotels || hotelsData;
    assert(Array.isArray(hotelList) && hotelList.length > 0, `Retrieved ${hotelList?.length} hotels from provider/inventory`);
    const targetHotel = hotelList.find(h => h.id === 'grand-palace-1') || hotelList[0];
    assert(targetHotel != null, `Target hotel found: ${targetHotel?.name}`);
    assert(typeof targetHotel.confirmedGuestsCount === 'number', `Live confirmed guests aggregate: ${targetHotel?.confirmedGuestsCount}`);
    assert(typeof targetHotel.platformAvailableRooms === 'number', `Platform-allocated available rooms: ${targetHotel?.platformAvailableRooms}`);

    // ---------------------------------------------------------
    // TEST 3: AI Room Recommendation (Single Input: Guests)
    // ---------------------------------------------------------
    console.log('\n--- TEST 3: AI-Assisted Room Selection Engine ---');
    // Case A: 2 Guests
    const rec2Res = await invokeExpress(app, 'POST', '/api/stays/ai-recommend-room', {
      hotelId: targetHotel.id,
      numberOfPeople: 2,
      checkInDate: '2026-11-15',
      checkOutDate: '2026-11-17'
    }, { authorization: 'Bearer mock-jwt-devotee-test' });

    assert(rec2Res.status === 200 && rec2Res.data.success === true, 'AI Recommendation for 2 guests succeeded');
    const rec2 = rec2Res.data.recommendation;
    assert(rec2 && rec2.roomsCount >= 1, `Rooms recommended: ${rec2?.roomsCount} (${rec2?.roomType})`);
    assert(rec2 && rec2.totalPayable > 0, `Calculated transparent price with GST: ₹${rec2?.totalPayable}`);
    assert(rec2 && typeof rec2.rationale === 'string' && rec2.rationale.length > 10, `AI reasoning rationale: "${rec2?.rationale?.slice(0, 75)}..."`);

    // Case B: 5 Guests (Multi-guest group configuration)
    const rec5Res = await invokeExpress(app, 'POST', '/api/stays/ai-recommend-room', {
      hotelId: targetHotel.id,
      numberOfPeople: 5,
      checkInDate: '2026-11-15',
      checkOutDate: '2026-11-17'
    }, { authorization: 'Bearer mock-jwt-devotee-test' });

    assert(rec5Res.status === 200 && rec5Res.data.success === true, 'AI Recommendation for 5 guests succeeded');
    const rec5 = rec5Res.data.recommendation;
    assert(rec5 && rec5.roomsCount >= 2, `Accommodates 5 guests (Rooms Needed: ${rec5?.roomsCount})`);

    // ---------------------------------------------------------
    // TEST 4: Temporary 10-Minute Inventory Hold
    // ---------------------------------------------------------
    console.log('\n--- TEST 4: 10-Minute Temporary Inventory Hold (Hold Lock) ---');
    const holdRes = await invokeExpress(app, 'POST', '/api/stays/hold', {
      hotelId: targetHotel.id,
      roomType: rec2.roomType,
      roomsCount: rec2.roomsCount,
      guestsCount: 2,
      checkInDate: rec2.checkInDate,
      checkOutDate: rec2.checkOutDate
    }, { authorization: 'Bearer mock-jwt-devotee-test' });

    assert(holdRes.status === 200 && holdRes.data.success === true, 'Inventory hold created successfully');
    const holdData = holdRes.data;
    assert(holdData.holdId && holdData.holdId.startsWith('HOLD-'), `Generated Hold ID: ${holdData.holdId}`);
    assert(holdData.remainingSeconds > 500, `Hold countdown duration is 10 min (~600s): ${holdData.remainingSeconds}s remaining`);

    // Verify hold query
    const checkHoldRes = await invokeExpress(app, 'GET', `/api/stays/hold/${holdData.holdId}`);
    assert(checkHoldRes.status === 200 && checkHoldRes.data.hold?.isExpired === false, 'Hold is active and verified on backend');

    // ---------------------------------------------------------
    // TEST 5: Payment Gateway Order & Google Pay / UPI Verification
    // ---------------------------------------------------------
    console.log('\n--- TEST 5: Payment Gateway Order & Google Pay HMAC Signature Verification ---');
    const orderRes = await invokeExpress(app, 'POST', '/api/payment/create-order', {
      amount: rec2.totalPayable,
      currency: 'INR',
      notes: { bookingType: 'hotel_stay', devoteeId: profileData.devoteeId }
    });
    assert(orderRes.status === 200 && orderRes.data.success === true, `Created payment order: ${orderRes.data.orderId}`);
    const orderId = orderRes.data.orderId;

    // Cryptographic HMAC-SHA256 signature generation
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_TeerthSetuKey2026';
    const paymentId = `pay_gpay_${Date.now()}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verifyRes = await invokeExpress(app, 'POST', '/api/payment/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: generatedSignature,
      amount: rec2.totalPayable
    });
    assert(verifyRes.status === 200 && verifyRes.data.verified === true, 'Cryptographic payment signature verified securely on backend');

    // ---------------------------------------------------------
    // TEST 6: Atomic Reservation Confirmation & Reference Number
    // ---------------------------------------------------------
    console.log('\n--- TEST 6: Booking Confirmation & Canonical Reference Generation ---');
    const confirmRes = await invokeExpress(app, 'POST', '/api/stays/confirm', {
      holdId: holdData.holdId,
      payment: {
        orderId: orderId,
        paymentId: paymentId,
        transactionId: verifyRes.data.transactionId,
        signature: generatedSignature,
        method: 'Google Pay (UPI)'
      },
      paymentMethod: 'Google Pay (UPI)',
      devoteeProfile: profileData
    }, { authorization: 'Bearer mock-jwt-devotee-test' });

    assert(
      (confirmRes.status === 200 || confirmRes.status === 201) && confirmRes.data.success === true,
      `Booking confirmed successfully (HTTP ${confirmRes.status})`
    );
    const booking = confirmRes.data.booking;
    assert(booking && booking.bookingId && booking.bookingId.startsWith('TS-HTL-'), `Booking ID has canonical format: ${booking?.bookingId}`);
    assert(booking && booking.status === 'CONFIRMED', `Booking status is CONFIRMED`);
    assert(booking && booking.qrToken != null, `Secure reception QR Token issued: ${booking?.qrToken?.substring(0, 16)}...`);
    assert(booking && booking.paymentMethod === 'Google Pay (UPI)', 'Payment method correctly recorded as Google Pay (UPI)');

    // ---------------------------------------------------------
    // TEST 7: Reception QR Verification & One-Time Check-In
    // ---------------------------------------------------------
    console.log('\n--- TEST 7: Hotel Reception QR Code Scan & One-Time Check-In ---');
    const qrToken = booking.qrToken;
    const qrScanRes = await invokeExpress(app, 'GET', `/api/stays/verify-qr/${qrToken}`);
    assert(qrScanRes.status === 200 && qrScanRes.data.valid === true, 'Hotel reception QR verification endpoint succeeds');
    assert(qrScanRes.data.devoteeName === 'Devendra Kumar' || qrScanRes.data.devoteeName === 'Devotee', `Devotee name verified: ${qrScanRes.data.devoteeName}`);
    assert(qrScanRes.data.checkedIn === false, 'Check-in state initially false');

    // Check-in post
    const checkinRes = await invokeExpress(app, 'POST', `/api/stays/checkin-qr/${qrToken}`);
    assert(checkinRes.status === 200 && checkinRes.data.success === true, 'First check-in at reception succeeded');

    // Duplicate check-in must be rejected
    const dupCheckinRes = await invokeExpress(app, 'POST', `/api/stays/checkin-qr/${qrToken}`);
    assert(dupCheckinRes.status === 400 && dupCheckinRes.data.success === false, 'Duplicate scan prevented: QR code cannot be reused');

    // ---------------------------------------------------------
    // TEST 8: Live Occupancy Aggregation
    // ---------------------------------------------------------
    console.log('\n--- TEST 8: Hotel Live Occupancy Aggregation ---');
    const occRes = await invokeExpress(app, 'GET', `/api/hotels/${targetHotel.id}/occupancy`);
    assert(occRes.status === 200, 'GET /api/hotels/:id/occupancy returns HTTP 200');
    assert(
      occRes.data && typeof occRes.data.confirmedGuestsCount === 'number' && occRes.data.confirmedGuestsCount >= 2,
      `Live confirmed guests aggregate: ${occRes.data?.confirmedGuestsCount}`
    );

    console.log('\n========================================================================');
    console.log(`     TEST EXECUTION COMPLETE: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  }
}

runTests();
