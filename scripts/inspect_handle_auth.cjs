const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/PaymentGatewayModal.jsx', 'utf8');
const lines = content.split('\n');

const bIdx = lines.findIndex(l => l.includes('const handleAuthorizePayment'));
console.log('handleAuthorizePayment starts at line', bIdx + 1);
console.log(lines.slice(bIdx - 5, bIdx + 50).join('\n'));

