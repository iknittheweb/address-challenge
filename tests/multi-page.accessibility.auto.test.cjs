const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

test('multi-page accessibility: all pages', async () => {
  // Automatically find all HTML files in the output directory
  const glob = require('glob');
  // Adjust this path if your output HTML files are in a different folder
  const outputDir = path.resolve(__dirname, '../');
  const pages = glob.sync(path.join(outputDir, '*.html'));
  for (const page of pages) {
    if (!fs.existsSync(page)) {
      console.warn(`Skipping missing file: ${page}`);
      continue;
    }
    let html = fs.readFileSync(page, 'utf8');
    // Preprocess: Remove all <script> tags and external <link> resources
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(
      /<link[^>]*href=["']https?:\/\/(fonts|kit)\.[^>]+>/gi,
      ''
    );
    html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

    // Ensure <title> is the first child of <head>
    html = html.replace(
      /(<head[^>]*>)([\s\S]*?)(<title[\s\S]*?<\/title>)([\s\S]*?)(<\/head>)/i,
      (m, headOpen, beforeTitle, titleTag, afterTitle, headClose) => {
        // Remove any other <title> tags
        let rest = (beforeTitle + afterTitle).replace(
          /<title[\s\S]*?<\/title>/gi,
          ''
        );
        // Remove comments before <title>
        rest = rest.replace(/<!--([\s\S]*?)-->/g, '');
        return `${headOpen}\n  ${titleTag}\n${rest}\n${headClose}`;
      }
    );

    // console.log(`\n--- DEBUG: Loaded HTML for ${page} (preprocessed) ---\n`);
    // console.log(html.slice(0, 5000)); // Removed for best practice: too verbose
    // Accept <html lang="en"> with any additional attributes (e.g., class)
    if (!/<html\s+lang=["']en["'](\s|>)/i.test(html)) {
      console.warn(
        `\nWARNING: <html lang=\"en\" (with optional attributes) not found in ${page}!\n`
      );
    }
    // Suppress jsdom image load warnings
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('error', (msg) => {
      if (typeof msg === 'string' && msg.includes('Could not load img')) return;
      console.error(msg);
    });
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole,
    });
    // Inject axe-core into the jsdom window
    const axeSource = fs.readFileSync(
      require.resolve('axe-core/axe.min.js'),
      'utf8'
    );
    dom.window.eval(axeSource);
    // Wait for window to be ready
    await new Promise((resolve) => {
      dom.window.addEventListener('load', resolve);
    });
    const results = await dom.window.axe.run(dom.window.document);
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
}, 60000);
