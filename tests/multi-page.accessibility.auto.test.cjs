// Accessibility auto test using axe-core
const axe = require('axe-core');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('multi-page accessibility: all pages', async () => {
  const pages = [
    'dist/pages/new-page.html',
    'dist/pages/about.html',
    'dist/pages/contact.html',
    'dist/pages/portfolio.html',
  ];
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    // Debug: Log the loaded HTML to confirm <html lang="en"> is present
    console.log(`\n--- DEBUG: Loaded HTML for ${page} ---\n`);
    console.log(html.slice(0, 5000)); // Print first 5000 chars for brevity
    if (!html.includes('<html lang="en"')) {
      console.warn(`\nWARNING: <html lang="en"> not found in ${page}!\n`);
    }
    const dom = new JSDOM(html);
    const results = await axe.run(dom.window.document);
    if (results.violations.length > 0) {
      console.log(`\nAccessibility violations in ${page}:`);
      results.violations.forEach((v) => {
        console.log(`- [${v.id}] ${v.help}`);
        console.log(`  Description: ${v.description}`);
        console.log(`  Impact: ${v.impact}`);
        v.nodes.forEach((node) => {
          console.log(`    Element: ${node.target.join(', ')}`);
          console.log(`    Failure Summary: ${node.failureSummary}`);
        });
      });
    }
    expect(results.violations.length).toBe(0);
  }
});
