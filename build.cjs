// =====================================================================
// BEGINNER-FRIENDLY EXPLANATORY COMMENTS
// =====================================================================
// This file is your project's build script. It automates tasks like:
//   - Compiling code
//   - Bundling files
//   - Injecting environment variables
//   - Preparing files for deployment
//
// Why use a build script?
//   - Saves you time by automating repetitive work
//   - Reduces manual errors
//   - Ensures your project is always built the same way
//
// You can run this script with different commands to build for local development,
// alternate environments (like GitHub Pages or Netlify), or production.
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
    1. Edit index.template.html (NOT index.html)
    2. Run npm run local after making changes for local dev
    3. Run npm run alt for alternate environments (GitHub Pages)
    4. Run npm run netlify-alt for alternate environments (Netlify)
    5. Run npm run prod before pushing to production
    6. Update .env, .env.alt, .env.netlify-alt, and .env.production as needed for your URLs and settings
  =====================================================================
*/


// Import required Node.js modules
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
// =============================================================
// You can pass a mode (like 'alt' or 'prod') as a command line argument.
// This lets you build for different environments using different .env files.
const mode = process.argv[2] ? process.argv[2].toLowerCase() : '';
let dotenvPath = '.env'; // Default: local development
if (process.env.DOTENV_CONFIG_PATH) {
  // If DOTENV_CONFIG_PATH is set, use that
  dotenvPath = process.env.DOTENV_CONFIG_PATH;
} else if (mode === 'alt') {
  dotenvPath = '.env.alt';
} else if (mode === 'netlify-alt') {
  dotenvPath = '.env.netlify-alt';
} else if (mode === 'prod' || mode === 'production') {
  dotenvPath = '.env.production';
}
// Load environment variables from the selected .env file
require('dotenv').config({ path: dotenvPath });


// =============================================================
// STEP 2: Get BASE_URL and ASSET_URL from environment variables
// =============================================================
let baseUrl = process.env.BASE_URL; // The main site URL (e.g., https://yoursite.com)
const assetUrl = process.env.ASSET_URL; // The base path for static assets (images, CSS, JS)

// Remove trailing slash from BASE_URL if present (for consistency)
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

// Safety check: Make sure required variables are set
if (!baseUrl || !assetUrl) {
  console.error('BASE_URL and ASSET_URL must be set in your .env or .env.production file.');
  process.exit(1);
}


// =============================================================
// STEP 3: Find and process all HTML template files
// =============================================================
console.log('Building HTML for all template files...');


// Use glob to find all .template.html files in the project root and src/templates
const glob = require('glob');
const templateFiles = glob
  .sync(path.join(__dirname, '*.template.html'))
  .concat(glob.sync(path.join(__dirname, 'src', 'templates', '*.template.html')));


// Loop through each template file and process it
templateFiles.forEach((templatePath) => {
  try {
    // Read the template file as a string
    const templateSrc = fs.readFileSync(templatePath, 'utf8');
    // Compile the template using Handlebars
    const template = Handlebars.compile(templateSrc);

    // Prepare schema.org JSON-LD data for SEO and rich results
    // This block customizes the schema for each template type
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
    const context = Object.assign({}, process.env, {
      SCHEMA_JSON: JSON.stringify(schemaData, null, 2), // For ld+json blocks
      HOME_JS_FILE: '/dist/js/script.js', // Main JS file path
      HOME_CSS_FILE: '/dist/css/styles.css', // Main CSS file path
      // Add other asset/script paths here as needed
    });

    // Render the template with the context
    const htmlContent = template(context);

    // Remove template warnings and workflow comments from the output HTML
    let finalHtml = htmlContent.replace(
      /<!--\s*IMPORTANT: This is a TEMPLATE file![\s\S]*?DO NOT edit index\.html directly - it gets overwritten!\s*-->/,
      ''
    );
    finalHtml = finalHtml.replace(/<!--\s*-{2,}\s*BEGINNER-FRIENDLY EXPLANATORY COMMENTS[\s\S]*?-{2,}\s*-->/g, '');
    finalHtml = finalHtml.replace(
      /<!--\s*Build System Workflow \(2025\):[\s\S]*?DO NOT edit the generated \*\.html file directly[\s\S]*?-->/g,
      ''
    );

    // Warn if any Handlebars placeholders were not replaced
    const unreplaced = finalHtml.match(/{{[A-Z0-9_]+}}/g);
    if (unreplaced && unreplaced.length > 0) {
      console.warn(`\u26a0\ufe0f Unreplaced placeholders found in ${templatePath}:`, unreplaced);
    }

    // Write the final HTML to the output file (same name, .html extension)
    const outputFileName = path.basename(templatePath).replace('.template.html', '.html');
    const outputPath = path.join(__dirname, outputFileName);
    fs.writeFileSync(outputPath, finalHtml);
    console.log(`Built ${outputPath}`);
  } catch (error) {
    // If anything goes wrong, print an error message
    console.error(`Build failed for ${templatePath}:`, error.message);
  }
});

// =============================================================
// STEP 4: Copy JavaScript files to the dist directory
// =============================================================
// This copies all .js files from src/js to dist/js so they are available in the final build
const jsSrcDir = path.join(__dirname, 'src', 'js');
const jsDistDir = path.join(__dirname, 'dist', 'js');
if (!fs.existsSync(jsDistDir)) fs.mkdirSync(jsDistDir, { recursive: true });

const jsFiles = fs.readdirSync(jsSrcDir).filter((f) => f.endsWith('.js'));
jsFiles.forEach((file) => {
  fs.copyFileSync(path.join(jsSrcDir, file), path.join(jsDistDir, file));
  console.log(`Copied ${file} to dist/js/`);
});
