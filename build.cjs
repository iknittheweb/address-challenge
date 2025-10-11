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
  - npm run local   -> Builds for local development (.env, GitHub Pages)
  - npm run deploy  -> Builds for production (.env.production, custom domain)
  - npm run alt     -> Builds for alternate environment (.env.alt, alternate GitHub Pages or staging)

  Workflow:
  1. Edit index.template.html (NOT index.html)
  2. Run npm run local after making changes for local dev
  3. Run npm run deploy before pushing to production
  4. Run npm run alt for alternate environments (if needed)
  5. Update .env.production and .env.alt as needed for your URLs and settings
*/

const fs = require('fs');
const path = require('path');
// Load environment variables from .env or .env.production
// Uses dotenv for easy environment management
require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || (process.env.NODE_ENV === 'production' ? '.env.production' : '.env'),
});

/*
  Environment variable usage:
  - BASE_URL: The base URL for your site (e.g., https://iknittheweb.github.io or your custom domain)
  - ASSET_URL: The base path or URL for your static assets (e.g., /src/img or https://yourdomain.com/src/img)
  - CSS_FILE: The CSS file to use (styles.css for development, styles.min.css for production)
  Set these in your .env (for development) and .env.production (for production) files.
*/

const baseUrl = process.env.BASE_URL;
const assetUrl = process.env.ASSET_URL;
const cssFile = process.env.CSS_FILE || 'styles.css'; // Default to development CSS

if (!baseUrl || !assetUrl) {
  console.error('BASE_URL and ASSET_URL must be set in your .env or .env.production file.');
  process.exit(1);
}

console.log('Building with environment variables...');

// Read the template HTML file
const templatePath = path.join(__dirname, 'index.template.html');
const outputPath = path.join(__dirname, 'index.html');

try {
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with environment-specific values
  htmlContent = htmlContent
    .replace(/{{BASE_URL}}/g, baseUrl)
    .replace(/{{ASSET_URL}}/g, assetUrl)
    .replace(/{{CSS_FILE}}/g, cssFile);

  // Remove template warning comment from the output
  htmlContent = htmlContent.replace(
    /<!--\s*IMPORTANT: This is a TEMPLATE file![\s\S]*?DO NOT edit index\.html directly - it gets overwritten!\s*-->\s*/,
    ''
  );

  // Write the processed HTML
  fs.writeFileSync(outputPath, htmlContent);

  console.log(`Built ${outputPath}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Asset URL: ${assetUrl}`);
  console.log(`CSS File: ${cssFile}`);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
