const fs = require('fs');

try {
  // This points exactly to the white-background trishul you just uploaded!
  const src = "C:\\Users\\sampr\\.gemini\\antigravity-ide\\brain\\e8a8819e-89bb-4bd9-ac4f-d4d6762809ea\\media__1782540340852.png";
  
  // We copy it to trishul.png
  const dest = "d:\\Divyayatra\\frontend\\public\\trishul.png";
  
  fs.copyFileSync(src, dest);
  
  console.log("SUCCESS: Copied your new Trishul image to frontend/public/trishul.png!");
} catch (err) {
  console.error("ERROR copying file:", err);
}
