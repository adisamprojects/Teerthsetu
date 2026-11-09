const fs = require('fs');

const content = fs.readFileSync('frontend/src/pages/DevoteeDashboard.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('PaymentGatewayModal') || l.includes('selectedTemple') || l.includes('darshan') || l.includes('bookDarshan') || l.includes('bookingModal')) {
    if (l.includes('Modal') || l.includes('Payment') || l.includes('book') || l.includes('Pass') || l.includes('handleBooking')) {
      console.log(`${i + 1}: ${l.trim()}`);
    }
  }
});

