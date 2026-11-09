const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');
const checks = [
  { name: 'No Book Free Darshan Pass', test: !content.includes('Book Free Darshan Pass') },
  { name: 'Make Payment button present', test: content.includes('Make Payment (₹{getDarshanAmount()})') },
  { name: 'Redirecting to Razorpay text present', test: content.includes('Redirecting to Razorpay...') },
  { name: 'General Entry has fee (₹50)', test: content.includes('General Darshan Entry (₹50') },
  { name: 'No PaymentGatewayModal in DevoteeDashboard', test: !content.includes('PaymentGatewayModal') }
];
let allPassed = true;
checks.forEach(c => {
  console.log((c.test ? '✓ PASS: ' : '✗ FAIL: ') + c.name);
  if (!c.test) allPassed = false;
});
process.exit(allPassed ? 0 : 1);
