// =====================================================================
// minify-home-styles.cjs
// =====================================================================
// This script minifies styles.css to styles.min.css for index.html.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. IMPORTS
// =====================================================================
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

// =====================================================================
// 2. CONSTANTS: File paths
// =====================================================================
const cssPath = path.join(__dirname, '../dist/css/styles.css');
const minPath = path.join(__dirname, '../dist/css/styles.min.css');

// =====================================================================
// 3. FILE CHECK: Ensure source CSS exists
// =====================================================================
if (!fs.existsSync(cssPath)) {
  console.error('styles.css not found in dist/css.');
  process.exit(1);
}

// =====================================================================
// 4. READ SOURCE CSS
// =====================================================================
const css = fs.readFileSync(cssPath, 'utf8');

// =====================================================================
// 5. MINIFICATION LOGIC
// =====================================================================
postcss([cssnano])
  .process(css, { from: cssPath, to: minPath })
  .then((result) => {
    fs.writeFileSync(minPath, result.css);
    console.log('Minified styles.css → styles.min.css');
  })
  .catch((err) => {
    // =====================================================================
    // 6. ERROR HANDLING
    // =====================================================================
    console.error('Minification failed:', err);
    process.exit(1);
  });
