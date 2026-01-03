#!/usr/bin/env node // Use Node.js to run this script
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

// =============================
// Simplified Single-Page Build
// =============================
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Register a custom Handlebars helper for template logic
Handlebars.registerHelper('eq', (a, b) => a === b);

// =============================================================
// STEP 1: Load environment variables
const mode = process.argv[2] ? process.argv[2].toLowerCase() : '';
let dotenvPath = '.env.gh';
if (process.env.DOTENV_CONFIG_PATH) {
  dotenvPath = process.env.DOTENV_CONFIG_PATH;
} else if (mode === 'domain') {
  dotenvPath = '.env.domain';
}
require('dotenv').config({ path: dotenvPath });
console.log(
  '[DEBUG] base_url:',
  process.env.base_url,
  '| asset_url:',
  process.env.asset_url,
  '| dotenvPath:',
  dotenvPath
);

// STEP 2: Get base_url and asset_url from environment variables
let baseUrl = process.env.base_url;
// Hard-code assetUrl if you wish, or keep using env
const assetUrl = process.env.asset_url || '/img/';
if (baseUrl.length > 1 && baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
if (typeof baseUrl !== 'string' || baseUrl.trim() === '' || typeof assetUrl !== 'string' || assetUrl.trim() === '') {
  console.error('base_url and asset_url must be set (non-empty) in your .env.gh or .env.domain file.');
  process.exit(1);
}

// STEP 3: Process the single template and output as index.html
const templatePath = path.join(__dirname, 'src', 'templates', 'address-challenge.30-days-of-html.template.html');
console.log(`[DEBUG] Processing template: ${templatePath}`);
const templateSrc = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateSrc);
const context = Object.assign({}, process.env, {
  base_url: baseUrl,
  asset_url: assetUrl,
});
let htmlContent = template(context);
// Optional: Add cache busting to CSS/JS
const cacheBust = Date.now();
htmlContent = htmlContent.replace(/(href="[^"]+\.css")(")/g, `$1?v=${cacheBust}$2`);
htmlContent = htmlContent.replace(/(src="[^"]+\.js")(")/g, `$1?v=${cacheBust}$2`);
// Remove template warnings and workflow comments
let finalHtml = htmlContent.replace(
  /<!--\s*IMPORTANT: This is a TEMPLATE file![\s\S]*?DO NOT edit index\.html directly - it gets overwritten!\s*-->/,
  ''
);
// Output to dist/index.html
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, finalHtml);
console.log(`Built ${outputPath}`);
// Copy to project root as index.html (for GitHub Pages)
const rootOutputPath = path.join(__dirname, 'index.html');
fs.copyFileSync(outputPath, rootOutputPath);
console.log('Copied index.html to project root.');

// (Optional) Copy JS files to dist/js if needed in the future
