const fs = require('fs');
const content = fs.readFileSync('backend/server.js', 'utf8');
const routes = content.match(/app\.(get|post|put|delete)\(['"][^'"]+['"]/g);
console.log(routes ? routes.join('\n') : 'No routes found');

