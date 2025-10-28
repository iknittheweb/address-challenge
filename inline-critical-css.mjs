// inline-critical-css.mjs
// Automatically inlines critical CSS for all HTML files in the project root using the 'critical' package

import { generate } from 'critical';
import fs from 'fs';
import path from 'path';

const htmlDir = process.cwd(); // Set to project root
const cssDir = path.join(process.cwd(), 'dist', 'css');

async function inlineAllCriticalCSS() {
  // Find all HTML files in the project root (excluding node_modules, dist, etc.)
  const htmlFiles = fs
    .readdirSync(htmlDir)
    .filter((file) => file.endsWith('.html') && file !== 'node_modules' && !file.startsWith('dist/'));

  // For each HTML file, find the matching CSS file (same base name, or styles.css for index.html)
  const viewports = [
    { width: 1300, height: 900, label: 'desktop' },
    { width: 800, height: 1280, label: 'tablet' },
    { width: 375, height: 667, label: 'mobile' },
  ];
  for (const htmlFile of htmlFiles) {
    const base = htmlFile === 'index.html' ? 'styles' : path.basename(htmlFile, '.html');
    const cssFile = path.join(cssDir, `${base}.css`);
    const htmlPath = path.join(htmlDir, htmlFile);

    if (fs.existsSync(cssFile)) {
      for (const vp of viewports) {
        console.log(`Inlining critical CSS for ${htmlFile} (${vp.label}) using ${cssFile}`);
        try {
          await generate({
            base: path.dirname(htmlPath),
            src: path.basename(htmlPath),
            css: [cssFile],
            inline: true,
            width: vp.width,
            height: vp.height,
            target: {
              html: htmlPath,
            },
          });
          console.log(`Critical CSS inlining succeeded for ${htmlFile} (${vp.label})`);
        } catch (err) {
          console.error(`Critical CSS inlining failed for ${htmlFile} (${vp.label}):`, err.message);
        }
      }
    } else {
      console.warn(`No matching CSS file for ${htmlFile} (${cssFile}) - skipping critical CSS inlining.`);
    }
  }
}

inlineAllCriticalCSS();
