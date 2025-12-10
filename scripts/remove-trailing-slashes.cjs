// =====================================================================
// remove-trailing-slashes.cjs
// =====================================================================
// This script removes trailing slashes from void elements in HTML files after build.
// BEGINNER-FRIENDLY: Each section is commented for clarity.
// Usage: node scripts/remove-trailing-slashes.js <directory>

// =====================================================================
// 1. IMPORTS
// =====================================================================
const fs = require('fs');
const path = require('path');

// =====================================================================
// 2. CONSTANTS: Void elements and directory
// =====================================================================
const VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
// Default to project root (where script is located) if no directory is provided
const htmlDir = process.argv[2] || path.resolve(__dirname, '..');

// =====================================================================
// 3. UTILITY FUNCTION: Process a single file
// =====================================================================
function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  VOID_ELEMENTS.forEach((tag) => {
    // Replace <tag ... /> with <tag ...>
    const regex = new RegExp(`<${tag}([^>]*)\s*/>`, 'gi');
    html = html.replace(regex, `<${tag}$1>`);
  });
  fs.writeFileSync(filePath, html);
  console.log(`Processed: ${filePath}`);
}

// =====================================================================
// 4. MAIN LOGIC: Process all HTML files in directory
// =====================================================================
function processDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) return;
    if (file.endsWith('.html')) processFile(filePath);
  });
}

// =====================================================================
// 5. RUN SCRIPT
// =====================================================================
processDir(htmlDir);
