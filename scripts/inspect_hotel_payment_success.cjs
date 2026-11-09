const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('PaymentGatewayModal') || l.includes('handlePaymentSuccess') || l.includes('onSuccess') || l.includes('handleConfirmBooking')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

