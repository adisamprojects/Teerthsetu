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

function invokeExpress(app, method, url, body = null) {
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
      'host': 'localhost:5000'
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

async function runDirectTests() {
  console.log(`\n========================================================================`);
  console.log(`     TEERTHSETU AI DAY VERIFICATION SUITE — COMPREHENSIVE E2E TESTS     `);
  console.log(`========================================================================\n`);

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${title} - ${extra}`);
    }
  }

  try {
    // ---------------------------------------------------------------
    // 1. PAYMENT GATEWAY INTEGRATION (Razorpay Test Mode)
    // ---------------------------------------------------------------
    console.log('--- SUITE 1: RAZORPAY TEST MODE & PAYMENT ORDER CREATION ---');
    const orderRes = await invokeExpress(app, 'POST', '/api/payment/create-order', {
      amount: 3200,
      currency: 'INR',
      notes: { bookingType: 'hotel', hotelName: 'Grand Palace Hotel' }
    });
    assert('Payment order generated successfully', orderRes.status === 200 && orderRes.data.success);
    assert('Order ID is standard Razorpay test format (order_test_xxx)', typeof orderRes.data.orderId === 'string' && orderRes.data.orderId.startsWith('order_test_'));
    assert('Order amount correctly converted to paise (320000)', orderRes.data.amount === 320000);
    assert('Key ID returned is sandbox key (rzp_test_TeerthSetuSandbox)', orderRes.data.keyId === 'rzp_test_TeerthSetuSandbox');
    const orderId = orderRes.data.orderId;

    // ---------------------------------------------------------------
    // 2. FAILED PAYMENT HANDLING
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 2: FAILED / DECLINED PAYMENT SIMULATION ---');
    const declineRes = await invokeExpress(app, 'POST', '/api/payment/verify', {
      simulateFailure: true,
      razorpay_order_id: orderId,
      razorpay_payment_id: 'pay_failed_declined',
      razorpay_signature: 'dummy_declined_signature'
    });
    assert('Declined payment rejected with HTTP 400', declineRes.status === 400);
    assert('Rejection notice specifies bank decline / validation error', declineRes.data && declineRes.data.message.includes('declined'));

    // ---------------------------------------------------------------
    // 3. CRYPTOGRAPHIC SIGNATURE VERIFICATION
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 3: CRYPTOGRAPHIC HMAC-SHA256 SIGNATURE VERIFICATION ---');
    const paymentId = 'pay_test_' + Date.now();
    const validSignature = crypto
      .createHmac('sha256', 'rzp_test_secret_TeerthSetuKey2026')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verifyRes = await invokeExpress(app, 'POST', '/api/payment/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      amount: 3200
    });
    assert('Valid HMAC signature verification succeeds with HTTP 200', verifyRes.status === 200 && verifyRes.data.success && verifyRes.data.verified);
    assert('Receipt returned with verified transactionId', !!verifyRes.data.transactionId && verifyRes.data.transactionId.startsWith('TXN-'));

    // ---------------------------------------------------------------
    // 4. DUPLICATE PAYMENT CALLBACK PROTECTION (IDEMPOTENCY)
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 4: DUPLICATE PAYMENT CALLBACK PROTECTION (IDEMPOTENCY) ---');
    const duplicateRes = await invokeExpress(app, 'POST', '/api/payment/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      amount: 3200
    });
    assert('Duplicate payment callback processed idempotently', duplicateRes.status === 200 && duplicateRes.data.duplicate === true);
    assert('Preserves original transactionId without duplicate charging', duplicateRes.data.transactionId === verifyRes.data.transactionId);

    // ---------------------------------------------------------------
    // 5. REALISTIC HOTEL INVENTORY ENGINE (Pilot Hotel Grand Palace)
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 5: REALISTIC HOTEL INVENTORY TRACKING (GRAND PALACE PILOT) ---');
    const hotelsRes = await invokeExpress(app, 'GET', '/api/hotels');
    assert('Hotels inventory endpoint responds with HTTP 200', hotelsRes.status === 200);
    const grandPalace = hotelsRes.data.find(h => h.id === 'grand-palace-1' || h.name.includes('Grand Palace'));
    assert('Grand Palace Hotel pilot exists in database', !!grandPalace);
    assert('Total Rooms is exactly 100', grandPalace && grandPalace.totalRooms === 100);
    assert('Already Booked is exactly 72', grandPalace && grandPalace.alreadyBooked === 72);
    assert('Vacant Rooms is exactly 28', grandPalace && grandPalace.vacantRooms === 28);
    assert('Platform Reserved Rooms is exactly 10', grandPalace && grandPalace.platformReservedRooms === 10);
    assert('Platform Booked Rooms starts at 0', grandPalace && grandPalace.platformBookedRooms === 0);
    assert('Platform Available Rooms starts at 10', grandPalace && grandPalace.platformAvailableRooms === 10);
    assert('Transparently identified as demo inventory (isDemoInventory: true)', grandPalace && grandPalace.isDemoInventory === true);

    // ---------------------------------------------------------------
    // 6. HOTEL BOOKING & ATOMIC INVENTORY DECREMENT
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 6: HOTEL BOOKING & ATOMIC INVENTORY DECREMENT ---');
    const bookStayRes = await invokeExpress(app, 'POST', '/api/stays/bookings', {
      hotelId: grandPalace.id,
      guestName: 'Aditya Samprathi',
      phone: '+91 98765 43210',
      email: 'aditya@example.com',
      roomType: 'Deluxe Heritage Room (Platform Exclusive)',
      roomsCount: 2,
      checkInDate: '2026-11-20',
      checkOutDate: '2026-11-22',
      guests: 2,
      payment: {
        paymentId: paymentId,
        orderId: orderId,
        method: 'UPI (Razorpay Sandbox)',
        amount: 6400,
        status: 'PAID'
      }
    });

    assert('Hotel booking succeeds with HTTP 200', bookStayRes.status === 200 && bookStayRes.data.success);
    assert('Booking contains reference TS-HTL-XXXX', bookStayRes.data.stay && (bookStayRes.data.stay.reference.startsWith('TS-HTL-') || bookStayRes.data.stay.reference.startsWith('TS-STY-')));
    assert('Platform available rooms atomically decremented from 10 to 8', bookStayRes.data.updatedHotel && bookStayRes.data.updatedHotel.platformAvailableRooms === 8);
    assert('Platform booked rooms increased from 0 to 2', bookStayRes.data.updatedHotel && bookStayRes.data.updatedHotel.platformBookedRooms === 2);
    assert('Overall vacant rooms decremented from 28 to 26', bookStayRes.data.updatedHotel && bookStayRes.data.updatedHotel.vacantRooms === 26);
    assert('Overall already booked rooms increased from 72 to 74', bookStayRes.data.updatedHotel && bookStayRes.data.updatedHotel.alreadyBooked === 74);

    // ---------------------------------------------------------------
    // 7. DOUBLE-BOOKING & OVERCAPACITY PREVENTION
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 7: DOUBLE-BOOKING & OVERCAPACITY PREVENTION ---');
    const overbookRes = await invokeExpress(app, 'POST', '/api/stays/bookings', {
      hotelId: grandPalace.id,
      guestName: 'Unauthorized Scalper',
      phone: '+91 99999 00000',
      email: 'scalper@example.com',
      roomType: 'Deluxe Heritage Room (Platform Exclusive)',
      roomsCount: 20, // Only 8 left!
      payment: {
        paymentId: 'pay_unauthorized',
        orderId: 'order_unauthorized',
        status: 'PAID'
      }
    });
    assert('Overbooking request rejected with HTTP 400', overbookRes.status === 400);
    assert('Rejection notice specifies inventory exhaustion', overbookRes.data && overbookRes.data.message.includes('Inventory Exhausted'));

    // ---------------------------------------------------------------
    // 8. FLIGHT SEARCH (4 INPUTS ONLY)
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 8: FLIGHT SEARCH (SOURCE, DESTINATION, DATE, PASSENGERS) ---');
    const flightSearchRes = await invokeExpress(app, 'GET', '/api/flights/search?source=Bengaluru&destination=Tirupati&date=2026-11-25&passengers=2');
    assert('Flight search responds with HTTP 200', flightSearchRes.status === 200);
    assert('Flight search returns scheduled flights array', Array.isArray(flightSearchRes.data.flights) && flightSearchRes.data.flights.length > 0);
    
    const flight0 = flightSearchRes.data.flights[0];
    assert('Flight has airline branding (IndiGo, Air India, SpiceJet, etc.)', !!flight0.airline);
    assert('Flight has flight number (e.g. 6E-7127)', !!flight0.flightNo);
    assert('Flight has departure time & arrival time', !!flight0.departureTime && !!flight0.arrivalTime);
    assert('Flight has duration (e.g. 1h 05m)', !!flight0.duration);
    assert('Flight has starting fare (₹)', typeof flight0.startingFare === 'number' && flight0.startingFare > 0);

    // ---------------------------------------------------------------
    // 9. FLIGHT BOOKING & E-TICKET GENERATION
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 9: FLIGHT BOOKING WORKFLOW & E-TICKET GENERATION ---');
    const flightOrderRes = await invokeExpress(app, 'POST', '/api/payment/create-order', {
      amount: flight0.startingFare * 2,
      currency: 'INR',
      notes: { flightNo: flight0.flightNo, route: `${flight0.fromCity} to ${flight0.toCity}` }
    });
    const fltOrderId = flightOrderRes.data.orderId;
    const fltPaymentId = 'pay_flt_test_' + Date.now();
    const fltSig = crypto
      .createHmac('sha256', 'rzp_test_secret_TeerthSetuKey2026')
      .update(`${fltOrderId}|${fltPaymentId}`)
      .digest('hex');

    await invokeExpress(app, 'POST', '/api/payment/verify', {
      razorpay_order_id: fltOrderId,
      razorpay_payment_id: fltPaymentId,
      razorpay_signature: fltSig,
      amount: flight0.startingFare * 2
    });

    const flightBookRes = await invokeExpress(app, 'POST', '/api/flights/book', {
      flight: flight0,
      passengerDetails: [
        { name: 'Aditya Samprathi', age: '28', gender: 'Male' },
        { name: 'Radhika Samprathi', age: '26', gender: 'Female' }
      ],
      contactPhone: '+91 98765 43210',
      contactEmail: 'aditya@example.com',
      payment: {
        paymentId: fltPaymentId,
        orderId: fltOrderId,
        method: 'Razorpay UPI (Test)',
        status: 'PAID',
        amount: flight0.startingFare * 2
      }
    });

    assert('Flight booking succeeds with HTTP 200', flightBookRes.status === 200 && flightBookRes.data.success);
    assert('Flight booking contains unique transit reference TS-FLT-XXXX', flightBookRes.data.booking && flightBookRes.data.booking.reference.startsWith('TS-FLT-'));
    assert('Payment status confirmed as PAID', flightBookRes.data.booking.paymentStatus === 'PAID');
    assert('No fake airline PNR claimed (uses TeerthSetu GDS transit reference)', flightBookRes.data.booking.reference.startsWith('TS-FLT-') && flightBookRes.data.booking.disclaimer.includes('TeerthSetu'));
    const bookedRef = flightBookRes.data.booking.reference;

    // ---------------------------------------------------------------
    // 10. FLIGHT BOOKING RETRIEVAL & LOOKUP
    // ---------------------------------------------------------------
    console.log('\n--- SUITE 10: FLIGHT BOOKING RETRIEVAL & LOOKUP ---');
    const lookupRes = await invokeExpress(app, 'GET', `/api/flights/bookings/${bookedRef}`);
    assert('Lookup by reference returns HTTP 200', lookupRes.status === 200 && lookupRes.data.success);
    assert('Lookup matches passengers and flight number', lookupRes.data.booking.passengers[0].name === 'Aditya Samprathi' && lookupRes.data.booking.flightNo === flight0.flightNo);

    console.log(`\n========================================================================`);
    console.log(`  ALL E2E VERIFICATIONS COMPLETE: ${passed} / ${total} CHECKS PASSED (${Math.round(passed / total * 100)}%)`);
    console.log(`========================================================================\n`);

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runDirectTests();
