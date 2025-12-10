// =====================================================================
// autoprefix-css.cjs
// =====================================================================
// This script runs Autoprefixer on all CSS files in dist/css.
// It automatically adds vendor prefixes for cross-browser compatibility.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. IMPORTS
// =====================================================================
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

// =====================================================================
// 2. CONSTANTS & PATHS
// =====================================================================
// Set the directory containing CSS files to process
const cssDir = path.join(__dirname, '../dist/css');

// =====================================================================
// 3. MAIN LOGIC: Autoprefix All CSS Files
// =====================================================================
// Reads each CSS file, runs Autoprefixer, and writes the result back.
// Errors are caught and logged for easier debugging.

fs.readdirSync(cssDir)
  .filter((file) => file.endsWith('.css'))
  .forEach((file) => {
    const filePath = path.join(cssDir, file);
    const css = fs.readFileSync(filePath, 'utf8');
    postcss([autoprefixer])
      .process(css, { from: filePath, to: filePath })
      .then((result) => {
        fs.writeFileSync(filePath, result.css);
        if (result.map) {
          fs.writeFileSync(filePath + '.map', result.map.toString());
        }
        console.log(`Autoprefixed: ${file}`);
      })
      .catch((err) => {
        console.error(`Error autoprefixing ${file}:`, err);
      });
  });
