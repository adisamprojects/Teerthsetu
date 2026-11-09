const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');

const checks = [
  { 
    name: 'Auto-sync active booking in useEffect', 
    test: content.includes('activePass?.bookingId') && content.includes('setActiveBookingId(activePass.bookingId)')
  },
  {
    name: 'Active booking fallback resolution',
    test: content.includes('if (upcomingBookings.length > 0) return upcomingBookings[0]')
  },
  {
    name: 'Auto-resolve headcount from activeBooking.visitors',
    test: content.includes('const visitorsCount = activeBooking?.visitors ? Number(activeBooking.visitors) : 2')
  },
  {
    name: 'Auto-resolve checkIn date from activeBooking.date',
    test: content.includes('const checkIn = activeBooking?.date || new Date(Date.now() + 86400000).toISOString().split(\'T\')[0]')
  },
  {
    name: 'AI Active Darshan Pass Sync Banner on Stays page',
    test: content.includes('Active Pass Synchronized') && content.includes('Stays Suggested for {activeBooking.templeName}')
  },
  {
    name: 'Auto-sync indicator in reservation modal',
    test: content.includes('Auto-filled from {activeBooking.templeName} pass')
  },
  {
    name: 'Auto-selected headcount indicator in modal',
    test: content.includes('Pre-selected {activeBooking.visitors || 2} people matching your active Darshan pass')
  }
];

let allPassed = true;
console.log('========================================================================');
console.log('   ZERO-INPUT STAY AUTO-SYNC FROM ACTIVE BOOKING VERIFICATION');
console.log('========================================================================');
checks.forEach(c => {
  console.log((c.test ? '  ✓ PASS: ' : '  ✗ FAIL: ') + c.name);
  if (!c.test) allPassed = false;
});

if (allPassed) {
  console.log('========================================================================');
  console.log('   ALL 7 AUTO-SYNC & ZERO-INPUT CHECKS PASSED (100%)');
  console.log('========================================================================');
  process.exit(0);
} else {
  process.exit(1);
}

