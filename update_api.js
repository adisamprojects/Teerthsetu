const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const newBaseUrl = 'https://teerthsetu-backend.onrender.com';

function updateUrls(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updateUrls(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes("fetch('/api/")) {
                content = content.replace(/fetch\('\/api\//g, `fetch('${newBaseUrl}/api/`);
                fs.writeFileSync(fullPath, content);
                console.log(`Updated API URLs in: ${file}`);
            }
        }
    }
}

updateUrls(srcDir);
console.log("All API URLs successfully updated to point to the cloud backend!");
