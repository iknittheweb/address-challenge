#!/usr/bin/env node
// ------------------------------------------------------------
// BEGINNER-FRIENDLY EXPLANATORY COMMENTS
// ------------------------------------------------------------
// This file is a build script for your project.
// It automates tasks like compiling, bundling, or processing files before deployment.
//
// Key concepts:
// - Build script: Automates repetitive tasks for you
// - Compilation: Converts code to a format browsers understand
// - Automation: Saves time and reduces manual errors
// ------------------------------------------------------------

/*
  BUILD SCRIPT - Updates URLs and injects environment variables for different environments

  USAGE:
  - npm run local       -> Builds for local development (.env, live server)
  - npm run alt         -> Builds for alternate environment (.env.alt, GitHub Pages)
  - npm run netlify-alt -> Builds for alternate environment (.env.netlify-alt, Netlify)
  - npm run prod        -> Builds for production (.env.production, custom domain)

  Workflow:
  1. Edit index.template.html (NOT index.html) // Sass should compile src/scss/styles.css and entry-point scss files from src/scss/E-pages/ into dist/css
  2. Run npm run local after making changes for local dev
  3. Run npm run alt for alternate environments (GitHub Pages)
  4. Run npm run netlify-alt for alternate environments (Netlify)
  5. Run npm run prod before pushing to production
  6. Update .env, .env.alt, .env.netlify-alt, and .env.production as needed for your URLs and settings
*/

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
// Register 'eq' helper for conditional logic in templates
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

// Determine build mode from command line argument (e.g., node build.cjs alt)
const mode = process.argv[2] ? process.argv[2].toLowerCase() : '';
let dotenvPath = '.env';
if (process.env.DOTENV_CONFIG_PATH) {
  dotenvPath = process.env.DOTENV_CONFIG_PATH;
} else if (mode === 'alt') {
  dotenvPath = '.env.alt';
} else if (mode === 'netlify-alt') {
  dotenvPath = '.env.netlify-alt';
} else if (mode === 'prod' || mode === 'production') {
  dotenvPath = '.env.production';
}
require('dotenv').config({ path: dotenvPath });

let baseUrl = process.env.BASE_URL;
const assetUrl = process.env.ASSET_URL;

// Remove trailing slash from BASE_URL if present
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

// Only remove leading slash in local build mode (npm run local)
// Set BUILD_MODE=local in your npm run local script for clarity
function normalizeUrl(url) {
  if ((process.env.BUILD_MODE === 'local' || process.env.NODE_ENV === 'development') && url.startsWith('/')) {
    return url.slice(1);
  }
  return url;
}

if (!baseUrl || !assetUrl) {
  console.error('BASE_URL and ASSET_URL must be set in your .env or .env.production file.');
  process.exit(1);
}

console.log('Building HTML for all template files...');

// Find all *.template.html files in project root and src/templates
const glob = require('glob');
const templateFiles = glob
  .sync(path.join(__dirname, '*.template.html'))
  .concat(glob.sync(path.join(__dirname, 'src', 'templates', '*.template.html')));

templateFiles.forEach((templatePath) => {
  try {
    const templateSrc = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSrc);

    // Prepare SCHEMA_JSON for ld+json block (same logic as before, per template)
    let schemaData;
    if (templatePath.endsWith('about.template.html')) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Marta',
        description: 'Web developer specializing in accessible, handcrafted websites.',
        url: baseUrl + normalizeUrl('/dist/pages/about.html'),
        url: baseUrl + normalizeUrl('/about.html'),
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
        url: process.env.SCHEMA_URL || baseUrl + normalizeUrl('/dist/pages/new-page.html'),
        url: process.env.SCHEMA_URL || baseUrl + normalizeUrl('/new-page.html'),
        image: process.env.SCHEMA_IMAGE || assetUrl + 'src/img/pages/default.png',
        sameAs: process.env.SCHEMA_SAMEAS ? JSON.parse(process.env.SCHEMA_SAMEAS) : [],
        knowsAbout: process.env.SCHEMA_KNOWSABOUT
          ? JSON.parse(process.env.SCHEMA_KNOWSABOUT)
          : ['HTML', 'CSS', 'JavaScript'],
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
        description:
          'A demonstration of a multi-level navigation bar built with HTML and CSS, featuring dropdown menus, nested navigation, and responsive design for modern web interfaces.',
        url: baseUrl + normalizeUrl('/dist/pages/multi-level-navbar.html'),
        url: baseUrl + normalizeUrl('/multi-level-navbar.html'),
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
        url: baseUrl + normalizeUrl('/dist/pages/contact.html'),
        url: baseUrl + normalizeUrl('/contact.html'),
        image: assetUrl + 'src/img/pages/heading-banner-dark.svg',
        sameAs: [],
        knowsAbout: ['Web Development', 'Accessibility', 'HTML', 'CSS', 'JavaScript'],
      };
    } else {
      schemaData = {};
    }

    // Always use normalizeUrl for script/asset paths in context
    const context = Object.assign({}, process.env, {
      SCHEMA_JSON: JSON.stringify(schemaData, null, 2),
      HOME_JS_FILE: normalizeUrl('/dist/js/script.js'),
      HOME_CSS_FILE: normalizeUrl('/dist/css/styles.css'),
      // Add other asset/script paths here as needed
    });
    const htmlContent = template(context);

    // Remove template warning and workflow comments from the output
    let finalHtml = htmlContent.replace(
      /<!--\s*IMPORTANT: This is a TEMPLATE file![\s\S]*?DO NOT edit index\.html directly - it gets overwritten!\s*-->/,
      ''
    );
    finalHtml = finalHtml.replace(/<!--\s*-{2,}\s*BEGINNER-FRIENDLY EXPLANATORY COMMENTS[\s\S]*?-{2,}\s*-->/g, '');
    finalHtml = finalHtml.replace(
      /<!--\s*Build System Workflow \(2025\):[\s\S]*?DO NOT edit the generated \*\.html file directly[\s\S]*?-->/g,
      ''
    );

    // Warn if unreplaced placeholders remain
    const unreplaced = finalHtml.match(/{{[A-Z0-9_]+}}/g);
    if (unreplaced && unreplaced.length > 0) {
      console.warn(`\u26a0\ufe0f Unreplaced placeholders found in ${templatePath}:`, unreplaced);
    }

    // Output file: same name, but .html extension, in project root
    const outputFileName = path.basename(templatePath).replace('.template.html', '.html');
    const outputPath = path.join(__dirname, outputFileName);
    fs.writeFileSync(outputPath, finalHtml);
    console.log(`Built ${outputPath}`);
  } catch (error) {
    console.error(`Build failed for ${templatePath}:`, error.message);
  }
});
// Copy JS files from src/js to dist/js
const jsSrcDir = path.join(__dirname, 'src', 'js');
const jsDistDir = path.join(__dirname, 'dist', 'js');
if (!fs.existsSync(jsDistDir)) fs.mkdirSync(jsDistDir, { recursive: true });

const jsFiles = fs.readdirSync(jsSrcDir).filter((f) => f.endsWith('.js'));
jsFiles.forEach((file) => {
  fs.copyFileSync(path.join(jsSrcDir, file), path.join(jsDistDir, file));
  console.log(`Copied ${file} to dist/js/`);
});
