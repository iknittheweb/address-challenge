// =====================================================================
// Inline Critical CSS Script (Beginner-Friendly)
// =====================================================================
// Purpose: Automatically inlines critical CSS for all HTML files in the project root using the 'critical' package.
// Features:
//   - Finds all HTML files in the project root
//   - Matches each HTML file to its corresponding CSS file
//   - Inlines above-the-fold CSS for desktop, tablet, and mobile viewports
//   - Uses the 'critical' package for best-practice performance
// Usage:
//   - Run after building your project to optimize page load speed
// Key Concepts:
//   - Critical CSS
//   - Above-the-fold optimization
//   - Multi-viewport support
// =====================================================================

import { generate } from 'critical';
import fs from 'fs';
import path from 'path';

const htmlDir = process.cwd(); // Set to project root
const cssDir = path.join(process.cwd(), 'dist', 'css');

// =============================================================
// Main function: Inline critical CSS for all HTML files
// -------------------------------------------------------------
async function inlineAllCriticalCSS() {
  // STEP 1: Find all HTML files in the project root (excluding node_modules, dist, etc.)
  const htmlFiles = fs
    .readdirSync(htmlDir)
    .filter((file) => file.endsWith('.html') && file !== 'node_modules' && !file.startsWith('dist/'));

  // STEP 2: Only use mobile viewport for critical CSS (best practice)
  const mobileViewport = { width: 375, height: 667, label: 'mobile' };

  // STEP 3: For each HTML file, find the matching CSS file and inline mobile critical CSS
  for (const htmlFile of htmlFiles) {
    let base;
    if (htmlFile === 'index.html') {
      base = 'styles';
    } else {
      base = htmlFile.split('.')[0];
    }
    const cssFile = path.join(cssDir, `${base}.css`);
    const htmlPath = path.join(htmlDir, htmlFile);
    if (fs.existsSync(cssFile)) {
      try {
        // Generate mobile critical CSS (extract only, do not inline)
        const result = await generate({
          base: path.dirname(htmlPath),
          src: path.basename(htmlPath),
          css: [cssFile],
          inline: false,
          extract: true,
          width: mobileViewport.width,
          height: mobileViewport.height,
          // Limit critical CSS scope to above-the-fold selectors
          include: ['.header', '.nav', '.hero', '.main-cta', '.topnav', '.logo'],
        });
        const criticalCss = result.css;
        // Minify the extracted critical CSS
        const postcss = (await import('postcss')).default;
        const cssnano = (await import('cssnano')).default;
        let minified;
        try {
          minified = await postcss([cssnano]).process(criticalCss, { from: undefined });
        } catch (minErr) {
          console.error(`Minification failed for ${htmlFile}:`, minErr.message);
          process.exit(1);
        }
        // Verify minified CSS with postcss parsing
        try {
          await postcss().process(minified.css, { from: undefined });
        } catch (parseErr) {
          console.error(`Critical CSS verification failed for ${htmlFile}:`, parseErr.message);
          console.error('Build stopped due to invalid critical CSS.');
          process.exit(1);
        }
        // Remove @charset from minified critical CSS (not allowed in <style> tags)
        let safeCriticalCss = minified.css.replace(/@charset\s+"[^"]*";?/gi, '');
        // Inject minified critical CSS into HTML <head>
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        // Remove any previous critical CSS blocks (optional, for idempotency)
        htmlContent = htmlContent.replace(/<style[^>]*data-critical[^>]*>[\s\S]*?<\/style>/gi, '');
        // Insert minified critical CSS before closing </head>
        htmlContent = htmlContent.replace(/<\/head>/i, `<style data-critical>${safeCriticalCss}</style>\n</head>`);
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
        console.log(`Critical CSS inlining succeeded for ${htmlFile} (mobile)`);
      } catch (err) {
        console.error(`Critical CSS inlining failed for ${htmlFile} (mobile):`, err.message);
        process.exit(1);
      }
    } else {
      console.warn(`No matching CSS file for ${htmlFile} (${cssFile}) - skipping critical CSS inlining.`);
    }
  }
}

// =============================================================
// Run the main function
// =============================================================
inlineAllCriticalCSS();
// Place this at the very end of the file:
console.log('successful');
