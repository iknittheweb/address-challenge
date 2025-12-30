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

// =============================================================
// STEP 0: Ensure all .env* files have sections for every page template
// =============================================================

// =============================================================
// STEP 0.5: Import required Node.js modules
// =============================================================
const fs = require('fs'); // Node.js file system module for reading/writing files
const path = require('path'); // Node.js path module for handling file and directory paths
const Handlebars = require('handlebars'); // Handlebars templating engine for processing HTML templates

// Register a custom Handlebars helper for template logic
// Usage: {{#if (eq a b)}} ... {{/if}}
Handlebars.registerHelper('eq', function (a, b) {
  // Register a custom Handlebars helper 'eq' for equality checks
  return a === b; // Returns true if a equals b
});

// =============================================================
// STEP 1: Determine which environment file to use
// -------------------------------------------------------------
// This step selects the correct .env file based on your build mode (local, alt, prod, etc.)
// You can pass a mode (like 'alt' or 'prod') as a command line argument.
// This lets you build for different environments using different .env files.

const mode = process.argv[2] ? process.argv[2].toLowerCase() : ''; // Get build mode from command line argument (e.g., 'alt', 'prod')
let dotenvPath = '.env.local'; // Default to local development .env file
if (process.env.DOTENV_CONFIG_PATH) {
  // If DOTENV_CONFIG_PATH env var is set, use that file
  dotenvPath = process.env.DOTENV_CONFIG_PATH;
} else if (mode === 'domain') {
  // Use .env.domain for custom domain builds
  dotenvPath = '.env.domain';
} else if (mode === 'gh') {
  // Use .env.gh for GitHub Pages builds
  dotenvPath = '.env.gh';
}
require('dotenv').config({ path: dotenvPath }); // Load environment variables from the selected .env file
console.log(
  '[DEBUG] base_url:',
  process.env.base_url,
  '| asset_url:',
  process.env.asset_url,
  '| dotenvPath:',
  dotenvPath
); // Debug: print loaded URLs and .env file
console.log(
  '[DEBUG] typeof base_url:',
  typeof process.env.base_url,
  '| typeof asset_url:',
  typeof process.env.asset_url
); // Debug: print types
console.log(
  '[DEBUG] JSON.stringify(base_url):',
  JSON.stringify(process.env.base_url),
  '| JSON.stringify(asset_url):',
  JSON.stringify(process.env.asset_url)
); // Debug: print stringified values

// =============================================================
// STEP 2: Get base_url and asset_url from environment variables
// -------------------------------------------------------------
// This step loads the main site URL and asset path from your selected .env file.

let baseUrl = process.env.base_url; // The main site URL (e.g., https://yoursite.com)
const assetUrl = process.env.asset_url; // The base path for static assets (images, CSS, JS)
// Remove trailing slash from base_url if present (for consistency), but do not strip if baseUrl is just '/'
if (baseUrl.length > 1 && baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1); // Remove trailing slash if needed
// Safety check: Make sure required variables are set (allow "/" and "/img")
if (typeof baseUrl !== 'string' || baseUrl.trim() === '' || typeof assetUrl !== 'string' || assetUrl.trim() === '') {
  console.error('base_url and asset_url must be set (non-empty) in your .env or .env.production file.'); // Print error if missing
  process.exit(1); // Exit script if required variables are missing
}

// =============================================================
// STEP 3: Find and process all HTML template files
// -------------------------------------------------------------
// This step finds all HTML templates, injects environment variables, and generates final HTML files.
console.log('Building HTML for all template files...');

// Use glob to find all .template.html files in src/templates only
const glob = require('glob'); // Import glob for file pattern matching
const allTemplates = glob.sync(path.join(__dirname, 'src', 'templates', '*.template.html')); // Find all .template.html files in src/templates
const indexTemplate = allTemplates.find((f) => path.basename(f) === 'index.template.html'); // Find the main index template
const otherTemplates = allTemplates.filter((f) => path.basename(f) !== 'index.template.html'); // All other templates

let buildFailed = false; // Track if any build step fails
const processTemplate = (templatePath) => {
  // Function to process a single template file
  try {
    // DEBUG: Print which template is being processed and what baseUrl is used
    console.log(`[DEBUG] Processing template: ${templatePath}`);
    console.log(`[DEBUG] Using base_url: ${baseUrl}`);
    // Read the template file as a string
    const templateSrc = fs.readFileSync(templatePath, 'utf8'); // Read the template file as a string
    const template = Handlebars.compile(templateSrc); // Compile the template using Handlebars

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
        description: process.env.SCHEMA_description || 'Description for new page.',
        url: process.env.SCHEMA_URL || baseUrl + '/dist/pages/new-page.html', // For legacy support
        url: process.env.SCHEMA_URL || baseUrl + '/new-page.html',
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
    // Build context for Handlebars template
    let context = Object.assign({}, process.env, {
      schema_json: JSON.stringify(schemaData, null, 2), // For ld+json blocks
      'HOME-JS_FILE': '/dist/js/script.js', // Main JS file path
      'HOME-css_file': process.env['HOME-css_file'] || '/dist/css/styles.css', // Main CSS file path
      // Add other asset/script paths here as needed
    });
    // For index.template.html, ensure index_css_file is set from env
    if (path.basename(templatePath) === 'index.template.html') {
      context.index_css_file = process.env.index_css_file || 'styles.css';
    }
    // Debug: Log context for this template
    console.log(`[DEBUG] Context keys for ${templatePath}:`, Object.keys(context));

    // Render the template with the context
    let htmlContent = template(context); // Render the template with the context

    // Extra debug for portfolio.template.html (must be after context is created)
    if (templatePath.endsWith('portfolio.template.html')) {
      console.log('[DEBUG][portfolio] context.base_url:', context.base_url);
      console.log('[DEBUG][portfolio] context.asset_url:', context.asset_url);
      const lines = htmlContent.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (line.includes('localhost') || line.includes('5500')) {
          console.log(`[DEBUG][portfolio] Rendered line ${idx + 1}:`, line.trim());
        }
      });
    }

    // =========================
    // CACHE BUSTING: Add a version query string to CSS and JS references
    // =========================
    // Use a timestamp for versioning (can be replaced with a hash if desired)
    const cacheBust = Date.now();
    // Add ?v=timestamp to all .css and .js file references in the HTML
    htmlContent = htmlContent.replace(/(href="[^"]+\.css)(")/g, `$1?v=${cacheBust}$2`);
    htmlContent = htmlContent.replace(/(src="[^"]+\.js)(")/g, `$1?v=${cacheBust}$2`);

    // Remove template warnings and workflow comments from the output HTML
    let finalHtml = htmlContent.replace(
      /<!--\s*IMPORTANT: This is a TEMPLATE file![\s\S]*?DO NOT edit index\.html directly - it gets overwritten!\s*-->/,
      ''
    ); // Remove template warning comments
    finalHtml = finalHtml.replace(/<!--\s*-{2,}\s*BEGINNER-FRIENDLY EXPLANATORY COMMENTS[\s\S]*?-{2,}\s*-->/g, ''); // Remove beginner-friendly comments
    finalHtml = finalHtml.replace(
      /<!--\s*Build System Workflow \(2025\):[\s\S]*?DO NOT edit the generated \*\.html file directly[\s\S]*?-->/g,
      ''
    ); // Remove workflow comments

    // Inject header and footer from dist/index.html
    let header = ''; // Placeholder for header HTML
    let footer = ''; // Placeholder for footer HTML
    try {
      const distIndexHtmlPath = path.join(__dirname, 'dist', 'index.html'); // Path to built index.html
      if (fs.existsSync(distIndexHtmlPath)) {
        // If index.html exists
        const indexHtml = fs.readFileSync(distIndexHtmlPath, 'utf8'); // Read index.html
        const headerMatch = indexHtml.match(/<header[\s\S]*?<\/header>/i); // Extract <header>...</header>
        const footerMatch = indexHtml.match(/<footer[\s\S]*?<\/footer>/i); // Extract <footer>...</footer>
        header = headerMatch ? headerMatch[0] : ''; // Use found header or empty string
        footer = footerMatch ? footerMatch[0] : ''; // Use found footer or empty string
      }
    } catch (err) {
      console.warn('Could not read header/footer from dist/index.html:', err.message); // Warn if header/footer can't be read
    }
    finalHtml = finalHtml.replace(/<!--\s*HEADER_PLACEHOLDER\s*-->/i, header); // Replace header placeholder
    finalHtml = finalHtml.replace(/<!--\s*FOOTER_PLACEHOLDER\s*-->/i, footer); // Replace footer placeholder

    // Warn if any Handlebars placeholders were not replaced
    const unreplaced = finalHtml.match(/{{[A-Z0-9_]+}}/g); // Find any unreplaced Handlebars placeholders
    if (unreplaced && unreplaced.length > 0) {
      console.warn(`\u26a0\ufe0f Unreplaced placeholders found in ${templatePath}:`, unreplaced); // Warn if any are found
    }

    // Write the final HTML to the output file (same name, .html extension)
    const outputFileName = path.basename(templatePath).replace('.template.html', '.html'); // Output file name
    const distDir = path.join(__dirname, 'dist'); // Output directory
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true }); // Create dist/ if it doesn't exist
    const outputPath = path.join(distDir, outputFileName); // Full output path
    fs.writeFileSync(outputPath, finalHtml); // Write the final HTML file
    console.log(`Built ${outputPath}`); // Log success
  } catch (error) {
    // If anything goes wrong, print an error message
    console.error(`Build failed for ${templatePath}:`, error.message);
  }
};

// Build index.template.html first
if (indexTemplate) {
  processTemplate(indexTemplate); // Build index.template.html first
}
otherTemplates.forEach(processTemplate); // Then build all other templates

// =============================================================
// STEP 4: Copy JavaScript files to the dist directory
// -------------------------------------------------------------
// This step copies all .js files from src/js to dist/js so they are available in the final build.
const jsSrcDir = path.join(__dirname, 'src', 'js'); // Source JS directory
const jsDistDir = path.join(__dirname, 'dist', 'js'); // Destination JS directory
if (!fs.existsSync(jsDistDir)) fs.mkdirSync(jsDistDir, { recursive: true }); // Create dist/js if needed

const jsFiles = fs.readdirSync(jsSrcDir).filter((f) => f.endsWith('.js')); // List all .js files in src/js
jsFiles.forEach((file) => {
  fs.copyFileSync(path.join(jsSrcDir, file), path.join(jsDistDir, file)); // Copy each JS file to dist/js
  console.log(`Copied ${file} to dist/js/`); // Log copy
});

// =============================================================
// STEP 5: (REMOVED) Do not copy HTML files to the project root. All HTML stays in dist/.
const distHtmlFiles = fs.readdirSync(path.join(__dirname, 'dist')).filter((f) => f.endsWith('.html'));

// =============================================================
// STEP 6: Remove <pre><code>...</code></pre> blocks from HTML files in dist/
// -------------------------------------------------------------
// This step removes code blocks from HTML files in dist/ to keep output clean.
const preCodeRegex = /<pre><code[\s\S]*?<\/code><\/pre>/gi; // Regex to match <pre><code> blocks
distHtmlFiles.forEach((file) => {
  const filePath = path.join(__dirname, 'dist', file); // Path to HTML file
  let html = fs.readFileSync(filePath, 'utf8'); // Read file
  const cleaned = html.replace(preCodeRegex, ''); // Remove code blocks
  if (cleaned !== html) {
    fs.writeFileSync(filePath, cleaned, 'utf8'); // Write cleaned HTML
    console.log(`Removed <pre><code> blocks from dist/${file}`); // Log removal
  }
});

// =============================================================
// STEP 7: Remove trailing slashes from void elements in HTML files in dist/
// -------------------------------------------------------------
// This step cleans up HTML by removing trailing slashes from void elements (e.g., <br /> becomes <br>).
const VOID_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]; // List of HTML void elements
distHtmlFiles.forEach((file) => {
  const filePath = path.join(__dirname, 'dist', file); // Path to HTML file
  let html = fs.readFileSync(filePath, 'utf8'); // Read file
  VOID_ELEMENTS.forEach((tag) => {
    const regex = new RegExp(`<${tag}([^>]*)\s*/>`, 'gi'); // Regex to match <tag />
    html = html.replace(regex, `<${tag}$1>`); // Replace with <tag>
  });
  fs.writeFileSync(filePath, html); // Write cleaned HTML
  console.log(`Removed trailing slashes from void elements in dist/${file}`); // Log cleanup
});

// =============================================================
// STEP 8: Format HTML files in dist/ using Prettier
// -------------------------------------------------------------
// This step formats all HTML files in dist/ for consistent, readable markup.
const { execSync } = require('child_process'); // Import execSync to run shell commands
try {
  const htmlPaths = distHtmlFiles.map((f) => path.join('dist', f)).join(' '); // Join all HTML file names in dist/
  if (htmlPaths) {
    execSync(`npx prettier --write ${htmlPaths}`, { stdio: 'inherit' }); // Format HTML files with Prettier
    console.log('Formatted dist HTML files with Prettier.'); // Log formatting
  }
} catch (err) {
  console.warn('Prettier formatting failed:', err.message); // Warn if Prettier fails
}
