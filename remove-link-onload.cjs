// remove-link-onload.js
// Removes onload="this.media='all'" and media="print" from <link rel="stylesheet"> tags in all HTML files in the project root.
// Usage: node remove-link-onload.js

const fs = require('fs');
const path = require('path');

const htmlDir = process.cwd();

function cleanLinkTags(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  // Remove onload="this.media='all'" (single or double quotes, any whitespace)
  html = html.replace(/\s*onload\s*=\s*(["'])this\.media='all'\1/gi, '');
  // Remove media="print" (single or double quotes, any whitespace)
  html = html.replace(/\s*media\s*=\s*(["'])print\1/gi, '');
  // Remove extra whitespace between attributes
  html = html.replace(/<link\s+/gi, '<link ');
  html = html.replace(/\s{2,}/g, ' ');
  // Remove trailing whitespace before closing >
  html = html.replace(/\s*>/g, '>');
  fs.writeFileSync(filePath, html);
  console.log(`Cleaned: ${filePath}`);
}

function processDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) return;
    if (file.endsWith('.html')) {
      cleanLinkTags(filePath);
    }
  });
}

processDir(htmlDir);
