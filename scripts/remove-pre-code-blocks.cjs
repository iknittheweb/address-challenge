// =====================================================================
// remove-pre-code-blocks.cjs
// =====================================================================
// This script removes all <pre><code>...</code></pre> blocks from every HTML file in dist/.
// BEGINNER-FRIENDLY: Each section is commented for clarity.
// Usage: node scripts/remove-pre-code-blocks.cjs

// =====================================================================
// 1. IMPORTS
// =====================================================================
const fs = require('fs');
const path = require('path');

// =====================================================================
// 2. CONSTANTS: Directory and file list
// =====================================================================
const distDir = path.join(__dirname, '..', 'dist');
const htmlFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.html'));

// =====================================================================
// 3. REGEX: Pattern to match <pre><code> blocks
// =====================================================================
const preCodeRegex = /<pre><code[\s\S]*?<\/code><\/pre>/gi;

// =====================================================================
// 4. MAIN LOGIC: Remove blocks from each file
// =====================================================================
htmlFiles.forEach((file) => {
  const filePath = path.join(distDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const cleaned = html.replace(preCodeRegex, '');
  if (cleaned !== html) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`Removed <pre><code> blocks from ${file}`);
  }
});

// =====================================================================
// 5. DONE
// =====================================================================
console.log('Preprocessing complete.');
