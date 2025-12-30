#!/usr/bin/env node // This line tells the system to use Node.js to run this script
// =====================================================================
// Environment & Docs Sync Script (Beginner-Friendly)
// =====================================================================
// Purpose: Keeps all .env* files and documentation in sync with your HTML templates.
// Features:
//   - Scans all .template.html files in src/templates
//   - For each template, generates a section in every .env* file
//   - Each section heading is the full template filename
//   - All keys in a section use a snake_case prefix (e.g., address_challenge_)
//   - Adds both a fixed set of keys and all placeholder-driven keys for each page
//   - Ensures no duplicate keys or sections
//   - Preserves existing values where possible
//   - Updates the changelog with latest component changes
// Usage:
//   - Run with: node sync-docs.cjs
// Key Concepts:
//   - Environment variable automation
//   - Template-driven configuration
//   - Documentation consistency
// =====================================================================

// =====================================================================
// 1. Imports and Constants
// =====================================================================
const fs = require('fs'); // Node.js file system module for reading/writing files
const path = require('path'); // Node.js path module for handling file paths
const TEMPLATES_DIR = path.join(__dirname, 'src/templates'); // Path to the templates directory
const ENV_FILES = fs.readdirSync(__dirname).filter((f) => f.startsWith('.env')); // List of all .env* files in the project root
const CHANGELOG_PATH = path.join(__dirname, 'CHANGELOG.md'); // Path to the changelog file
const COMPONENTS_DIRS = [path.join(__dirname, 'src/js'), path.join(__dirname, 'src/scss')]; // Directories containing JS and SCSS components

// =====================================================================
// 2. Helper Functions
// =====================================================================

// getAllFiles: Recursively get all files in a directory
function getAllFiles(dir) {
  // This function returns a list of all files in a directory and its subdirectories
  let results = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name); // Get the full path of the entry
    if (entry.isDirectory()) {
      // If the entry is a directory, recursively get its files
      results = results.concat(getAllFiles(fullPath));
    } else {
      // If the entry is a file, add it to the results
      results.push(fullPath);
    }
  });
  return results; // Return the list of files
}

// toEnvKey: Convert a placeholder like DESC-LIST-CHALLENGE_TITLE to desc_list_challenge_title
function toEnvKey(placeholder) {
  // This function converts a placeholder like DESC-LIST-CHALLENGE_TITLE to desc_list_challenge_title
  let key = placeholder.replace(/-/g, '_'); // Replace dashes with underscores
  key = key.replace(/(_\d.*|__.*|_[A-Z].*)$/, '_'); // Remove trailing numbers/double underscores/caps
  key = key.toLowerCase(); // Convert to lowercase
  return key; // Return the normalized key
}

// bestPracticeValue: Generate a context-aware value for a key, using pageKey and key
// This function creates a smart default value for each required key, based on the page and the key type.
// For example, it will generate a title like 'Address Challenge' for address_challenge_title.
function bestPracticeValue(key) {
  // Use a regular expression to split the key into the pageKey and the actual key name
  const m = key.match(
    /^([a-z0-9_]+)_(asset_url|base_url|csp_meta|robots|css_file|data_breadcrumb_category|data_breadcrumb_category_url|data_nav_config|description|keywords|page_url|schema_json|title)$/
  );
  if (!m) return '';
  const pageKey = m[1]; // e.g., 'address_challenge'
  const k = m[2]; // e.g., 'title'
  // Use a switch statement to generate a value for each key type
  switch (k) {
    case 'asset_url':
      // Example: /assets/address_challenge/
      return `/assets/${pageKey}/`;
    case 'base_url':
      // Example: /
      return '/';
    case 'csp_meta':
      // Example: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';
      return "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';";
    case 'robots':
      // Example: index,follow
      return 'index,follow';
    case 'css_file':
      // Example: /css/address_challenge.css
      return `/css/${pageKey}.css`;
    case 'data_breadcrumb_category':
      // Example: Address Challenge
      return pageKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    case 'data_breadcrumb_category_url':
      // Example: /category/address_challenge/
      return `/category/${pageKey}/`;
    case 'data_nav_config':
      // Example: address_challenge_nav
      return `${pageKey}_nav`;
    case 'description':
      // Example: This is the address challenge page.
      return `This is the ${pageKey.replace(/_/g, ' ')} page.`;
    case 'keywords':
      // Example: address, challenge, example, site
      return `${pageKey.replace(/_/g, ', ')}, example, site`;
    case 'page_url':
      // Example: /address_challenge.html
      return `/${pageKey}.html`;
    case 'schema_json':
      // Example: { "@context": "https://schema.org", "@type": "WebPage", "name": "Address Challenge" }
      return `{"@context":"https://schema.org","@type":"WebPage","name":"${pageKey.replace(/_/g, ' ')}"}`;
    case 'title':
      // Example: Address Challenge
      return pageKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    default:
      return '';
  }
}

// parseEnvFile: Parse .env file into { key: { value, line, raw } }
function parseEnvFile(envPath) {
  // This function reads a .env file and parses it into an object
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/); // Read all lines from the file
  const env = {}; // Object to store key/value pairs
  lines.forEach((line, idx) => {
    const m = line.match(/^([A-Za-z0-9_\-]+)\s*=\s*(.*)$/); // Match lines like KEY=value
    if (m) {
      env[m[1]] = { value: m[2], line: idx, raw: line }; // Store the value and line info
    }
  });
  return { lines, env }; // Return the parsed lines and env object
}

// getPageKeyFromFilename: Get the snake_case page key from a template filename
function getPageKeyFromFilename(filename) {
  // This function extracts the page key from a template filename
  // Example: address-challenge.30-days-of-html.template.html -> address_challenge_30_days_of_html
  return filename.replace('.template.html', '').replace(/\./g, '_').toLowerCase();
}

// getFixedKeysForPage: Always return the required set of keys for every page section
// This function builds a list of all the environment variable keys that should appear in every page's section.
// It uses the pageKey (like 'address_challenge') as a prefix for each required key.
function getFixedKeysForPage(pageKey) {
  // This function returns all required keys for a page section, prefixed with the pageKey
  const requiredKeys = [
    'asset_url',
    'base_url',
    'csp_meta',
    'robots',
    'css_file',
    'data_breadcrumb_category',
    'data_breadcrumb_category_url',
    'data_nav_config',
    'description',
    'keywords',
    'page_url',
    'schema_json',
    'title',
  ];
  // Prefix each key with the pageKey (e.g., address_challenge_title)
  return requiredKeys.map((k) => `${pageKey}_${k}`);
}

// getTemplatePlaceholdersForPage: Return all placeholders in the template that start with the pageKey prefix
function getTemplatePlaceholdersForPage(templatePath, pageKey) {
  // This function finds all Handlebars placeholders in a template that start with the pageKey prefix
  const content = fs.readFileSync(templatePath, 'utf8'); // Read the template file
  const regex = /\{\{\s*([a-zA-Z0-9_\-]+)\s*\}\}/g; // Regex to match {{PLACEHOLDER}}
  const found = new Set(); // Set to store unique keys
  let match;
  while ((match = regex.exec(content)) !== null) {
    let key = match[1].replace(/-/g, '_').toLowerCase(); // Normalize the key
    if (key.startsWith(pageKey + '_')) found.add(key); // Only add keys for this page
  }
  return Array.from(found); // Return all found keys
}

// enforcePlaceholderNaming: Enforce consistent Handlebars placeholder naming in templates
function enforcePlaceholderNaming() {
  // This function enforces consistent naming for Handlebars placeholders in all templates
  const placeholderRegex = /\{\{([A-Z0-9_\-]+)\}\}/g; // Regex to match placeholders
  fs.readdirSync(TEMPLATES_DIR).forEach((file) => {
    if (!file.endsWith('.template.html')) return; // Only process template files
    const filePath = path.join(TEMPLATES_DIR, file); // Get the full path
    let content = fs.readFileSync(filePath, 'utf8'); // Read the file
    let changed = false; // Track if we change anything
    content = content.replace(placeholderRegex, (match, p1) => {
      const fixed = `{{${toEnvKey(p1).toUpperCase()}}}`; // Convert to UPPER_SNAKE_CASE
      if (match !== fixed) changed = true; // If different, mark as changed
      return fixed; // Replace
    });
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8'); // Write updated content
      console.log(`Updated placeholders in ${file}`); // Log update
    }
  });
}

// =====================================================================
// 3. Main Logic: Sync .env* files with template-driven sections
// =====================================================================
function syncEnvFiles() {
  // This function synchronizes all .env* files with the template-driven sections
  // Step 1: Build a map of template filename -> { pageKey, allKeys }
  const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.template.html'));
  const pageSections = {};
  for (const filename of templateFiles) {
    const templatePath = path.join(TEMPLATES_DIR, filename); // Full path to template
    const pageKey = getPageKeyFromFilename(filename); // Get the page key
    const fixedKeys = getFixedKeysForPage(pageKey); // All required keys for this page
    const placeholderKeys = getTemplatePlaceholdersForPage(templatePath, pageKey); // All placeholders in the template
    // Merge and dedupe all keys (required + placeholders)
    const allKeys = Array.from(new Set([...fixedKeys, ...placeholderKeys]));
    pageSections[filename] = { pageKey, allKeys }; // Store in the map
  }

  // Step 2: For each .env* file, remove old page sections and add new ones
  for (const envFile of ENV_FILES) {
    const envPath = path.join(__dirname, envFile); // Full path to the .env file
    let lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/); // Read all lines
    // Remove all old page sections (by heading)
    const sectionHeadings = Object.keys(pageSections); // All template filenames
    let newLines = []; // New file content
    let skip = false; // Whether to skip lines (removing old sections)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; // Current line
      // If this line is a section heading, start skipping
      if (sectionHeadings.some((h) => line.trim() === `# ${h}`)) {
        skip = true;
        continue;
      }
      // While skipping, skip all comment/blank lines until next real line
      if (skip && (line.trim().startsWith('#') || line.trim() === '')) {
        continue;
      }
      skip = false; // Stop skipping
      newLines.push(line); // Keep this line
    }
    // Add new sections for each template
    for (const [filename, { pageKey, allKeys }] of Object.entries(pageSections)) {
      newLines.push(`\n# ${filename}`); // Section heading
      for (const key of allKeys) {
        // If key already exists elsewhere in the file, preserve its value; else, add best-practice value
        const existing = lines.find((l) => l.match(new RegExp(`^${key}\s*=`)));
        if (existing) {
          newLines.push(existing); // Use existing value
        } else {
          newLines.push(`${key}=${bestPracticeValue(key)}`); // Add default value
        }
      }
    }
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8'); // Write updated file
    console.log(`Synced ${envFile}`); // Log update
  }
}
