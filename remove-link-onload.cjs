// =====================================================================
// Remove Link Onload Script (Beginner-Friendly)
// =====================================================================
// Purpose: Clean up <link rel="stylesheet"> tags in all HTML files by removing unnecessary attributes and adding external JS loader.
// Usage: Run with: node remove-link-onload.cjs
// Key Concepts:
//   - Regex replacement for HTML cleanup
//   - Automation across all HTML files in project root
//   - Adding external script for CSS loading
// =====================================================================

// -------------------------------------------------------------
// 1. Import required modules
// -------------------------------------------------------------
const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------
// 2. Set up directory to process (project root)
// -------------------------------------------------------------
const htmlDir = process.cwd();

// -------------------------------------------------------------
// 3. Clean up <link> tags and add external loader in a single HTML file
// -------------------------------------------------------------
function cleanLinkTags(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  // Remove onload="this.media='all'" (single or double quotes, any whitespace)
  html = html.replace(/\s*onload\s*=\s*(\["'])this\.media='all'\1/gi, '');
  // Remove media="print" (single or double quotes, any whitespace)
  html = html.replace(/\s*media\s*=\s*(\["'])print\1/gi, '');
  // Remove extra whitespace between attributes
  html = html.replace(/<link\s+/gi, '<link ');
  html = html.replace(/\s{2,}/g, ' ');
  // Remove trailing whitespace before closing >
  html = html.replace(/\s*>/g, '>');

  // Add external load-css.js after last <link rel="stylesheet"> in <head>
  html = html.replace(
    /(<link[^>]*rel=["']stylesheet["'][^>]*>)(?![\s\S]*<link[^>]*rel=["']stylesheet["'][^>]*>)/i,
    '$1\n    <script src="src/js/load-css.js" defer></script>'
  );

  fs.writeFileSync(filePath, html);
  console.log(`Cleaned and updated: ${filePath}`);
}

// -------------------------------------------------------------
// 4. Process all HTML files in the given directory
// -------------------------------------------------------------
function processDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) return;
    if (file.endsWith('.html')) {
      cleanLinkTags(filePath);
    }
  });
}

// -------------------------------------------------------------
// 5. Run the process for the project root
// -------------------------------------------------------------
processDir(htmlDir);
