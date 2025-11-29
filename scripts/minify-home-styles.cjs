// scripts/minify-home-styles.cjs
// One-off script to minify styles.css to styles.min.css for index.html

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

const cssPath = path.join(__dirname, '../dist/css/styles.css');
const minPath = path.join(__dirname, '../dist/css/styles.min.css');

if (!fs.existsSync(cssPath)) {
  console.error('styles.css not found in dist/css.');
  process.exit(1);
}

const css = fs.readFileSync(cssPath, 'utf8');

postcss([cssnano])
  .process(css, { from: cssPath, to: minPath })
  .then((result) => {
    fs.writeFileSync(minPath, result.css);
    console.log('Minified styles.css → styles.min.css');
  })
  .catch((err) => {
    console.error('Minification failed:', err);
    process.exit(1);
  });
