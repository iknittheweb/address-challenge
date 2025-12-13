// =====================================================================
// generate-envs.js
// =====================================================================
// This script generates .env files for different environments based on template placeholders.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. IMPORTS
// =====================================================================
import fs from 'fs';
import path from 'path';

// =====================================================================
// 2. CONSTANTS & ENVIRONMENT CONFIG
// =====================================================================
const templateDir = path.join(process.cwd(), 'src', 'templates');
const envFiles = [
  { name: '.env.example', url: '/', asset: '/src/img/', prod: false },
  { name: '.env', url: '/', asset: '/src/img/', prod: false },
  {
    name: '.env.alt',
    url: 'http://iknittheweb.github.io/',
    asset: 'http://iknittheweb.github.io/src/img/',
    prod: true,
  },
  {
    name: '.env.netlify-alt',
    url: 'https://iknittheweb.netlify.app/',
    asset: 'https://iknittheweb.netlify.app/src/img/',
    prod: true,
  },
  { name: '.env.production', url: 'https://iknittheweb.com/', asset: 'https://iknittheweb.com/src/img/', prod: true },
];

const header = `# Add more keys as needed for other templates/pages
# .env.example
#
# Copy this file to .env (for development), .env.alt (for github pages), .env.netlify-alt (for netlify), or .env.production (for production) and fill in your values.
# These variables are loaded automatically by the build scripts.

# Development environment:
# BASE_URL=/
# ASSET_URL=/
# CSS_FILE=styles.css

# Alternate environment:
# BASE_URL=https://iknittheweb.github.io
# ASSET_URL=
# CSS_FILE=styles.min.css

# Netlify environment:
# BASE_URL=https://iknittheweb.netlify.app
# ASSET_URL=https://iknittheweb.netlify.app/src/img
# CSS_FILE=styles.min.css

# For production, create .env.production:
# BASE_URL=https://iknittheweb.com
# ASSET_URL=https://iknittheweb.com/src/img
# CSS_FILE=styles.min.css
`;

// =====================================================================
// 3. UTILITY FUNCTIONS
// =====================================================================
// Recursively find all .template.html files in the workspace
function findAllTemplateFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findAllTemplateFiles(filePath));
    } else if (file.endsWith('.template.html')) {
      results.push(filePath);
    }
  });
  return results;
}

// =====================================================================
// 4. MAIN LOGIC: Find placeholders and generate env files
// =====================================================================
const workspaceDir = process.cwd();
const files = findAllTemplateFiles(workspaceDir);
const placeholderMap = {};

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(/{{([A-Z0-9_]+)}}/g)];
  const placeholders = matches.map((m) => m[1]);
  // Use base filename (before any dot) for section key
  const relFile = path.relative(workspaceDir, filePath);
  const baseSection = path.basename(relFile).split('.')[0];
  placeholderMap[baseSection] = Array.from(new Set([...(placeholderMap[baseSection] || []), ...placeholders]));
});

// Helper to generate values for each placeholder
function autoValue(key, page, env) {
  function urlJoin(...parts) {
    return parts
      .map((p, i) => {
        if (i === 0) return p.replace(/\/+$/, '');
        return p.replace(/^\/+/, '');
      })
      .join('/');
  }
  const baseName = path
    .basename(page)
    .replace(/\.html$/, '')
    .replace(/[^A-Za-z0-9]/g, '-')
    .toUpperCase();
  function pageKey(k) {
    if (['TITLE', 'DESCRIPTION', 'KEYWORDS', 'ROBOTS', 'CANONICAL_URL', 'OG_IMAGE', 'OG_URL', 'OG_TYPE', 'TWITTER_CARD', 'TWITTER_TITLE', 'TWITTER_DESCRIPTION', 'GOOGLE_FONTS_LINK', 'SCHEMA_JSON', 'SUBTITLE', 'NAV_CONFIG', 'BREADCRUMB_CATEGORY', 'BREADCRUMB_CATEGORY_URL', 'PAGE_NAME'].includes(k)) {
      return `${baseName}_${k}`;
    }
    return k;
  }
  if (key === pageKey('NAV_CONFIG')) return 'main,about,portfolio,contact';
  if (key === pageKey('BREADCRUMB_CATEGORY')) {
    if (page.includes('about')) return 'General';
    if (page.includes('portfolio')) return 'Portfolio';
    if (page.includes('contact')) return 'General';
    if (page.includes('new-page')) return 'New Page';
    return 'General';
  }
  if (key === pageKey('BREADCRUMB_CATEGORY_URL')) {
    if (page.includes('about')) return '/category/general';
    if (page.includes('portfolio')) return '/category/portfolio';
    if (page.includes('contact')) return '/category/general';
    if (page.includes('new-page')) return '/category/new-page';
    return '/category/general';
  }
  if (key === pageKey('DESCRIPTION')) return `${page} page description for ${env.prod ? 'production' : 'development'}`;
  if (key === pageKey('TITLE')) return `${page} | I Knit the Web`;
  if (key === pageKey('KEYWORDS')) return `web, development, ${page}`;
  if (key === pageKey('ROBOTS')) return 'index,follow';
  if (key === pageKey('CANONICAL_URL')) return urlJoin(env.url, `${page}.html`);
  if (key === pageKey('OG_IMAGE') || key === pageKey('TWITTER_IMAGE')) return urlJoin(env.asset, 'branding/logo.png');
  if (key === pageKey('OG_URL')) return urlJoin(env.url, `${page}.html`);
  if (key === pageKey('OG_TYPE')) return 'website';
  if (key === pageKey('TWITTER_CARD')) return 'summary_large_image';
  if (key === pageKey('ASSET_URL')) return env.asset.replace(/\/+$/, '/');
  if (key === pageKey('BASE_URL')) return env.url.replace(/\/+$/, '/');
  if (key === pageKey('PAGE_NAME')) return baseName.toLowerCase();
  return '';
}

// =====================================================================
// 5. OUTPUT: Write env files
// =====================================================================
envFiles.forEach((env) => {
  const envPath = path.join(process.cwd(), env.name);
  let existing = '';
  try {
    existing = fs.readFileSync(envPath, 'utf8');
  } catch (e) {
    existing = header + '\n';
  }

  // Parse existing file into sections by base page name
  const sections = {};
  let lastSection = null;
  let lines = existing.split(/\r?\n/);
  lines.forEach((line) => {
    const secMatch = line.match(/^#\s*([A-Za-z0-9_-]+)\s*$/);
    if (secMatch) {
      lastSection = secMatch[1];
      if (!sections[lastSection]) sections[lastSection] = [];
      sections[lastSection].push(line);
    } else if (lastSection) {
      sections[lastSection].push(line);
    }
  });

  // For each template, add missing keys to its section
  Object.entries(placeholderMap).forEach(([baseSection, keys]) => {
    const page = baseSection;
    if (!sections[baseSection]) {
      // Section doesn't exist, create it
      sections[baseSection] = [`# ${baseSection}`];
    }
    const existingKeys = new Set(sections[baseSection].filter((l) => l.match(/^([A-Z0-9_]+)=/)).map((l) => l.split('=')[0]));
    keys.forEach((key) => {
      if (key === 'HEADER' || key === 'FOOTER') return;
      const pageSpecificKey = (() => {
        const baseName = page.replace(/[^A-Za-z0-9]/g, '-').toUpperCase();
        if (['TITLE', 'DESCRIPTION', 'KEYWORDS', 'ROBOTS', 'CANONICAL_URL', 'OG_IMAGE', 'OG_URL', 'OG_TYPE', 'TWITTER_CARD', 'TWITTER_TITLE', 'TWITTER_DESCRIPTION', 'GOOGLE_FONTS_LINK', 'SCHEMA_JSON', 'SUBTITLE', 'NAV_CONFIG', 'BREADCRUMB_CATEGORY', 'BREADCRUMB_CATEGORY_URL', 'PAGE_NAME'].includes(key)) {
          return `${baseName}_${key}`;
        }
        return key;
      })();
      if (!existingKeys.has(pageSpecificKey)) {
        sections[baseSection].push(`${pageSpecificKey}=${autoValue(pageSpecificKey, page, env)}`);
      }
    });
  });

  // Rebuild output: preserve header/comments, then all sections
  let outputLines = [];
  let headerDone = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#') && lines[i].includes('.template.html')) {
      headerDone = true;
      break;
    }
    outputLines.push(lines[i]);
  }
  if (!headerDone) outputLines.push('');
  Object.values(sections).forEach((section) => {
    outputLines.push(...section);
    outputLines.push('');
  });
  fs.writeFileSync(envPath, outputLines.join('\n'), 'utf8');
});
