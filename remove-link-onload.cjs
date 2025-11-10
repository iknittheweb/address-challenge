// remove-link-onload.js
// Removes onload="this.media='all'" and media="print" from <link rel="stylesheet"> tags in all HTML files in the project root.
// Usage: node remove-link-onload.js

const fs = require('fs');
const path = require('path');

const htmlDir = process.cwd();

function cleanLinkTags(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  // Remove onload="this.media='all'" from <link rel="stylesheet">
  html = html.replace(/(<link[^>]+rel=["']stylesheet["'][^>]+)onload=["']this\.media='all'["']/gi, '$1');
  // Remove media="print" from <link rel="stylesheet">
  html = html.replace(/(<link[^>]+rel=["']stylesheet["'][^>]+)media=["']print["']/gi, '$1');
  // Remove any leftover double spaces
  html = html.replace(/\s{2,}/g, ' ');
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
