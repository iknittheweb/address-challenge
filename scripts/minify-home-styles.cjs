// scripts/minify-home-styles.cjs
// One-off script to minify home-styles.css to home-styles.min.css for index.html

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

const cssPath = path.join(__dirname, '../dist/css/home-styles.css');
const minPath = path.join(__dirname, '../dist/css/home-styles.min.css');

if (!fs.existsSync(cssPath)) {
  console.error('home-styles.css not found in dist/css.');
  process.exit(1);
}

const css = fs.readFileSync(cssPath, 'utf8');

postcss([cssnano])
  .process(css, { from: cssPath, to: minPath })
  .then((result) => {
    fs.writeFileSync(minPath, result.css);
    console.log('Minified home-styles.css → home-styles.min.css');
  })
  .catch((err) => {
    console.error('Minification failed:', err);
    process.exit(1);
  });
