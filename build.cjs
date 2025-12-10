#!/usr/bin/env node
// =====================================================================
// Project Build Script (Beginner-Friendly)
// =====================================================================
// Purpose: Automates the process of building, preparing, and formatting your project for deployment.
// Features:
//   - Compiles and processes HTML templates
//   - Injects environment variables for different deployment targets
//   - Copies and cleans up assets and output files
//   - Formats HTML for consistent style
// Usage:
//   - Run with npm scripts for local, alternate, or production builds
// Key Concepts:
//   - Build automation
//   - Environment configuration
//   - Asset management
//   - HTML formatting
// =====================================================================

/*
  =====================================================================
  BUILD SCRIPT OVERVIEW
  =====================================================================
  This script updates URLs and injects environment variables for different environments.

  USAGE:
    - npm run local       -> Build for local development (.env, live server)
    - npm run alt         -> Build for alternate environment (.env.alt, GitHub Pages)
    - npm run netlify-alt -> Build for alternate environment (.env.netlify-alt, Netlify)
    - npm run prod        -> Build for production (.env.production, custom domain)

  Typical Workflow:
    1. Edit src/templates/index.template.html (NOT index.html)
    2. Run npm run local after making changes for local dev
    3. Run npm run alt for alternate environments (GitHub Pages)
    4. Run npm run netlify-alt for alternate environments (Netlify)
    5. Run npm run prod before pushing to production
    6. Update .env, .env.alt, .env.netlify-alt, and .env.production as needed for your URLs and settings
  =====================================================================
*/

// =============================================================
// STEP 0: Ensure all .env* files have sections for every page template
// =============================================================
require('./sync-env-sections.cjs');

// =============================================================
// STEP 0.5: Import required Node.js modules
// =============================================================
const fs = require('fs'); // For reading and writing files
const path = require('path'); // For handling file paths
const Handlebars = require('handlebars'); // For processing HTML templates

// Register a custom Handlebars helper for template logic
// Usage: {{#if (eq a b)}} ... {{/if}}
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

// =============================================================
// STEP 1: Determine which environment file to use
// -------------------------------------------------------------
// This step selects the correct .env file based on your build mode (local, alt, prod, etc.)
// You can pass a mode (like 'alt' or 'prod') as a command line argument.
// This lets you build for different environments using different .env files.
const mode = process.argv[2] ? process.argv[2].toLowerCase() : '';
let dotenvPath = '.env.local'; // Default: local development
if (process.env.DOTENV_CONFIG_PATH) {
  // If DOTENV_CONFIG_PATH is set, use that
  dotenvPath = process.env.DOTENV_CONFIG_PATH;
} else if (mode === 'domain') {
  dotenvPath = '.env.domain';
} else if (mode === 'netlify') {
  dotenvPath = '.env.netlify';
} else if (mode === 'gh') {
  dotenvPath = '.env.gh';
}
// Load environment variables from the selected .env file
require('dotenv').config({ path: dotenvPath });
console.log('[DEBUG] BASE_URL:', process.env.BASE_URL, '| ASSET_URL:', process.env.ASSET_URL, '| dotenvPath:', dotenvPath);
console.log('[DEBUG] typeof BASE_URL:', typeof process.env.BASE_URL, '| typeof ASSET_URL:', typeof process.env.ASSET_URL);
console.log('[DEBUG] JSON.stringify(BASE_URL):', JSON.stringify(process.env.BASE_URL), '| JSON.stringify(ASSET_URL):', JSON.stringify(process.env.ASSET_URL));

// =============================================================
// STEP 2: Get BASE_URL and ASSET_URL from environment variables
// -------------------------------------------------------------
// This step loads the main site URL and asset path from your selected .env file.
let baseUrl = process.env.BASE_URL; // The main site URL (e.g., https://yoursite.com)
const assetUrl = process.env.ASSET_URL; // The base path for static assets (images, CSS, JS)

// Remove trailing slash from BASE_URL if present (for consistency), but do not strip if baseUrl is just '/'
if (baseUrl.length > 1 && baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

// Safety check: Make sure required variables are set (allow "/" and "/img")
if (typeof baseUrl !== 'string' || baseUrl.trim() === '' || typeof assetUrl !== 'string' || assetUrl.trim() === '') {
  console.error('BASE_URL and ASSET_URL must be set (non-empty) in your .env or .env.production file.');
  process.exit(1);
}

// =============================================================
// STEP 3: Find and process all HTML template files
// -------------------------------------------------------------
// This step finds all HTML templates, injects environment variables, and generates final HTML files.
console.log('Building HTML for all template files...');

// Use glob to find all .template.html files in src/templates only
const glob = require('glob');
const allTemplates = glob.sync(path.join(__dirname, 'src', 'templates', '*.template.html'));
const indexTemplate = allTemplates.find((f) => path.basename(f) === 'index.template.html');
const otherTemplates = allTemplates.filter((f) => path.basename(f) !== 'index.template.html');

let buildFailed = false;
const processTemplate = (templatePath) => {
  try {
    // DEBUG: Print which template is being processed and what baseUrl is used
    console.log(`[DEBUG] Processing template: ${templatePath}`);
    console.log(`[DEBUG] Using BASE_URL: ${baseUrl}`);
    // Read the template file as a string
    const templateSrc = fs.readFileSync(templatePath, 'utf8');
    // Compile the template using Handlebars
    const template = Handlebars.compile(templateSrc);

    // Prepare schema.org JSON-LD data for SEO and rich results
    let schemaData;
    if (templatePath.endsWith('about.template.html')) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Marta',
        description: 'Web developer specializing in accessible, handcrafted websites.',
        url: baseUrl + '/dist/pages/about.html', // For legacy support
        url: baseUrl + '/about.html',
        image: assetUrl + 'src/img/pages/Profile.png',
        sameAs: [],
        knowsAbout: ['HTML', 'CSS', 'JavaScript', 'Accessibility', 'SCSS/Sass'],
      };
    } else if (templatePath.endsWith('new-page.template.html')) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': process.env.SCHEMA_TYPE || 'WebPage',
        name: process.env.SCHEMA_NAME || 'New Page',
        description: process.env.SCHEMA_DESCRIPTION || 'Description for new page.',
        url: process.env.SCHEMA_URL || baseUrl + '/dist/pages/new-page.html', // For legacy support
        url: process.env.SCHEMA_URL || baseUrl + '/new-page.html',
        image: process.env.SCHEMA_IMAGE || assetUrl + 'src/img/pages/default.png',
        sameAs: process.env.SCHEMA_SAMEAS ? JSON.parse(process.env.SCHEMA_SAMEAS) : [],
        knowsAbout: process.env.SCHEMA_KNOWSABOUT ? JSON.parse(process.env.SCHEMA_KNOWSABOUT) : ['HTML', 'CSS', 'JavaScript'],
      };
    } else if (templatePath.endsWith('portfolio.template.html')) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'I Knit The Web',
        jobTitle: 'Web Developer',
        description: 'Professional web developer specializing in handcrafted websites for small budgets and big dreams',
        url: baseUrl,
        sameAs: [],
        knowsAbout: ['HTML', 'CSS', 'JavaScript', 'SCSS', 'Web Design', 'Responsive Design'],
      };
    } else if (templatePath.endsWith('multi-level-navbar.template.html')) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Project',
        name: 'Multi-Level navbar',
        description: 'A demonstration of a multi-level navigation bar built with HTML and CSS, featuring dropdown menus, nested navigation, and responsive design for modern web interfaces.',
        url: baseUrl + '/dist/pages/multi-level-navbar.html', // For legacy support
        url: baseUrl + '/multi-level-navbar.html',
        image: process.env.SCHEMA_IMAGE || assetUrl + 'src/img/pages/navbar.png',
        sameAs: ['https://github.com/iknittheweb', 'https://twitter.com/iknittheweb'],
        knowsAbout: ['HTML', 'CSS', 'Navigation', 'Responsive Design', 'Frontend Development'],
      };
    } else if (templatePath.endsWith('contact.template.html')) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact',
        description: 'Contact Marta at I Knit the Web for handcrafted, accessible websites.',
        url: baseUrl + '/dist/pages/contact.html', // For legacy support
        url: baseUrl + '/contact.html',
        image: assetUrl + 'src/img/pages/heading-banner-dark.svg',
        sameAs: [],
        knowsAbout: ['Web Development', 'Accessibility', 'HTML', 'CSS', 'JavaScript'],
      };
    } else {
      schemaData = {};
    }

    // Create the context object for the template
    // This includes all environment variables and custom values
    let context = Object.assign({}, process.env, {
      SCHEMA_JSON: JSON.stringify(schemaData, null, 2), // For ld+json blocks
      'HOME-JS_FILE': '/dist/js/script.js', // Main JS file path
      'HOME-CSS_FILE': process.env['HOME-CSS_FILE'] || '/dist/css/styles.css',
      // Add other asset/script paths here as needed
    });
    // Debug: Log context for this template
    console.log(`[DEBUG] Context keys for ${templatePath}:`, Object.keys(context));

    // Render the template with the context
    let htmlContent = template(context);

    // Extra debug for portfolio.template.html (must be after context is created)
    if (templatePath.endsWith('portfolio.template.html')) {
      console.log('[DEBUG][portfolio] context.BASE_URL:', context.BASE_URL);
      console.log('[DEBUG][portfolio] context.ASSET_URL:', context.ASSET_URL);
      const lines = htmlContent.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (line.includes('localhost') || line.includes('5500')) {
          console.log(`[DEBUG][portfolio] Rendered line ${idx + 1}:`, line.trim());
        }
      });
    }

    // Remove template warnings and workflow comments from the output HTML
    let finalHtml = htmlContent.replace(/<!--\s*IMPORTANT: This is a TEMPLATE file![\s\S]*?DO NOT edit index\.html directly - it gets overwritten!\s*-->/, '');
    finalHtml = finalHtml.replace(/<!--\s*-{2,}\s*BEGINNER-FRIENDLY EXPLANATORY COMMENTS[\s\S]*?-{2,}\s*-->/g, '');
    finalHtml = finalHtml.replace(/<!--\s*Build System Workflow \(2025\):[\s\S]*?DO NOT edit the generated \*\.html file directly[\s\S]*?-->/g, '');

    // Inject header and footer from dist/index.html
    let header = '';
    let footer = '';
    try {
      const distIndexHtmlPath = path.join(__dirname, 'dist', 'index.html');
      if (fs.existsSync(distIndexHtmlPath)) {
        const indexHtml = fs.readFileSync(distIndexHtmlPath, 'utf8');
        const headerMatch = indexHtml.match(/<header[\s\S]*?<\/header>/i);
        const footerMatch = indexHtml.match(/<footer[\s\S]*?<\/footer>/i);
        header = headerMatch ? headerMatch[0] : '';
        footer = footerMatch ? footerMatch[0] : '';
      }
    } catch (err) {
      console.warn('Could not read header/footer from dist/index.html:', err.message);
    }
    finalHtml = finalHtml.replace(/<!--\s*HEADER_PLACEHOLDER\s*-->/i, header);
    finalHtml = finalHtml.replace(/<!--\s*FOOTER_PLACEHOLDER\s*-->/i, footer);

    // Warn if any Handlebars placeholders were not replaced
    const unreplaced = finalHtml.match(/{{[A-Z0-9_]+}}/g);
    if (unreplaced && unreplaced.length > 0) {
      console.warn(`\u26a0\ufe0f Unreplaced placeholders found in ${templatePath}:`, unreplaced);
    }

    // Write the final HTML to the output file (same name, .html extension)
    const outputFileName = path.basename(templatePath).replace('.template.html', '.html');
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    const outputPath = path.join(distDir, outputFileName);
    fs.writeFileSync(outputPath, finalHtml);
    console.log(`Built ${outputPath}`);
  } catch (error) {
    // If anything goes wrong, print an error message
    console.error(`Build failed for ${templatePath}:`, error.message);
  }
};

// Build index.template.html first
if (indexTemplate) {
  processTemplate(indexTemplate);
}
// Then build all other templates
otherTemplates.forEach(processTemplate);

// =============================================================
// STEP 4: Copy JavaScript files to the dist directory
// -------------------------------------------------------------
// This step copies all .js files from src/js to dist/js so they are available in the final build.
const jsSrcDir = path.join(__dirname, 'src', 'js');
const jsDistDir = path.join(__dirname, 'dist', 'js');
if (!fs.existsSync(jsDistDir)) fs.mkdirSync(jsDistDir, { recursive: true });

const jsFiles = fs.readdirSync(jsSrcDir).filter((f) => f.endsWith('.js'));
jsFiles.forEach((file) => {
  fs.copyFileSync(path.join(jsSrcDir, file), path.join(jsDistDir, file));
  console.log(`Copied ${file} to dist/js/`);
});

// =============================================================
// STEP 5: Copy generated HTML files to the project root
// -------------------------------------------------------------
// This step copies all .html files from dist/ to the root directory for deployment (GitHub Pages, etc.)
const distHtmlFiles = fs.readdirSync(path.join(__dirname, 'dist')).filter((f) => f.endsWith('.html'));
distHtmlFiles.forEach((file) => {
  const srcPath = path.join(__dirname, 'dist', file);
  const destPath = path.join(__dirname, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${file} to project root.`);
});

// =============================================================
// STEP 6: Remove <pre><code>...</code></pre> blocks from HTML files in dist/
// -------------------------------------------------------------
// This step removes code blocks from HTML files in dist/ to keep output clean.
const preCodeRegex = /<pre><code[\s\S]*?<\/code><\/pre>/gi;
distHtmlFiles.forEach((file) => {
  const filePath = path.join(__dirname, 'dist', file);
  let html = fs.readFileSync(filePath, 'utf8');
  const cleaned = html.replace(preCodeRegex, '');
  if (cleaned !== html) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`Removed <pre><code> blocks from ${file}`);
  }
});

// =============================================================
// STEP 7: Remove trailing slashes from void elements in HTML files in the project root
// -------------------------------------------------------------
// This step cleans up HTML by removing trailing slashes from void elements (e.g., <br /> becomes <br>).
const VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
const rootHtmlFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith('.html'));
rootHtmlFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  let html = fs.readFileSync(filePath, 'utf8');
  VOID_ELEMENTS.forEach((tag) => {
    const regex = new RegExp(`<${tag}([^>]*)\s*/>`, 'gi');
    html = html.replace(regex, `<${tag}$1>`);
  });
  fs.writeFileSync(filePath, html);
  console.log(`Removed trailing slashes from void elements in ${file}`);
});

// =============================================================
// STEP 8: Format HTML files in the project root using Prettier
// -------------------------------------------------------------
// This step formats all HTML files in the project root for consistent, readable markup.
const { execSync } = require('child_process');
try {
  const htmlPaths = rootHtmlFiles.map((f) => f).join(' ');
  if (htmlPaths) {
    execSync(`npx prettier --write ${htmlPaths}`, { stdio: 'inherit' });
    console.log('Formatted root HTML files with Prettier.');
  }
} catch (err) {
  console.warn('Prettier formatting failed:', err.message);
}
