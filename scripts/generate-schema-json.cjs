// =====================================================================
// generate-schema-json.cjs
// =====================================================================
// This script reads schema_json from .env.local and writes src/js/schema-json.js for runtime injection.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. IMPORTS
// =====================================================================
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// =====================================================================
// 2. CONSTANTS
// =====================================================================
const schemaJson = process.env.schema_json || '';
const outputPath = path.join(process.cwd(), 'src/js/schema-json.js');

// =====================================================================
// 3. MAIN LOGIC: Generate JS for schema injection
// =====================================================================
const jsContent = `// src/js/schema-json.js\n// This file is generated at build time\nconst schemaJson = ${JSON.stringify(schemaJson)};\nif (schemaJson) {\n  const script = document.createElement('script');\n  script.type = 'application/ld+json';\n  script.text = schemaJson;\n  document.head.appendChild(script);\n}\n`;

// =====================================================================
// 4. OUTPUT: Write file and log
// =====================================================================
fs.writeFileSync(outputPath, jsContent);
console.log('Generated src/js/schema-json.js from .env.local schema_json');
