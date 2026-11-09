const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/DevoteeTravelsView.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('PaymentGatewayModal') || l.includes('paymentSuccess') || l.includes('onSuccess') || l.includes('confirmedBooking')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

