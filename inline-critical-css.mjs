// inline-critical-css.mjs
// Automatically inlines critical CSS for all HTML files in dist/pages using the 'critical' package

import { generate } from 'critical';
import fs from 'fs';
import path from 'path';

const htmlDir = path.join(process.cwd(), 'dist', 'pages');
const cssDir = path.join(process.cwd(), 'dist', 'css');

async function inlineAllCriticalCSS() {
  // Find all HTML files in dist/pages
  const htmlFiles = fs.readdirSync(htmlDir).filter((file) => file.endsWith('.html'));

  // For each HTML file, find the matching CSS file (same base name, or styles.css for index.html)
  for (const htmlFile of htmlFiles) {
    const base = htmlFile === 'index.html' ? 'styles' : path.basename(htmlFile, '.html');
    const cssFile = path.join(cssDir, `${base}.css`);
    const htmlPath = path.join(htmlDir, htmlFile);

    if (fs.existsSync(cssFile)) {
      console.log(`Inlining critical CSS for ${htmlFile} using ${cssFile}`);
      try {
        await generate({
          base: path.dirname(htmlPath),
          src: path.basename(htmlPath),
          css: [cssFile],
          inline: true,
          
          width: 1300,
          height: 900,
          target: {
            html: htmlPath,
          },
        });
        console.log(`Critical CSS inlining succeeded for ${htmlFile}`);
      } catch (err) {
        console.error(`Critical CSS inlining failed for ${htmlFile}:`, err.message);
      }
    } else {
      console.warn(`No matching CSS file for ${htmlFile} (${cssFile}) - skipping critical CSS inlining.`);
    }
  }
}

inlineAllCriticalCSS();
