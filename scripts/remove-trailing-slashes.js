// Remove trailing slashes from void elements in HTML files after build
// Usage: node scripts/remove-trailing-slashes.js <directory>

const fs = require('fs');
const path = require('path');

const VOID_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

const htmlDir = process.argv[2] || path.join(__dirname, '../dist/pages');

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

function processDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) return;
    if (file.endsWith('.html')) processFile(filePath);
  });
}

processDir(htmlDir);
