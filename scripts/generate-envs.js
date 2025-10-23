import fs from 'fs';
import path from 'path';

const templateDir = path.join(process.cwd(), 'src', 'templates');
const envFiles = [
  { name: '.env.example', url: 'http://localhost:3000/', asset: '/src/img/', prod: false },
  { name: '.env', url: 'http://localhost:3000/', asset: '/src/img/', prod: false },
  { name: '.env.production', url: 'https://iknittheweb.com/', asset: 'https://iknittheweb.com/src/img/', prod: true },
  { name: '.env.alt', url: 'http://localhost:4000/', asset: '/src/img/', prod: false },
  {
    name: '.env.netlify-alt',
    url: 'https://iknittheweb-alt.netlify.app/',
    asset: 'https://iknittheweb-alt.netlify.app/src/img/',
    prod: true,
  },
];

const header = `# Add more keys as needed for other templates/pages
# .env.example
#
# Copy this file to .env (for development) or .env.production (for production) and fill in your values.
# These variables are loaded automatically by the build scripts.

# Development environment:
# BASE_URL=/
# ASSET_URL=/
# CSS_FILE=styles.css

# Alternate environment:
# BASE_URL=https://iknittheweb.github.io
# ASSET_URL=
# CSS_FILE=styles.min.css

# For production, create .env.production:
# BASE_URL=https://iknittheweb.com
# ASSET_URL=https://iknittheweb.com/src/img
# CSS_FILE=styles.min.css
`;

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

const workspaceDir = process.cwd();
const files = findAllTemplateFiles(workspaceDir);
const placeholderMap = {};

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(/{{([A-Z0-9_]+)}}/g)];
  const placeholders = matches.map((m) => m[1]);
  // Use relative file path for output clarity
  const relFile = path.relative(workspaceDir, filePath);
  placeholderMap[relFile] = Array.from(new Set(placeholders));
});

function autoValue(key, page, env) {
  // Helper to join URL segments safely
  function urlJoin(...parts) {
    return parts
      .map((p, i) => {
        if (i === 0) return p.replace(/\/+$/, '');
        return p.replace(/^\/+/, '');
      })
      .join('/');
  }
  if (key.includes('DESCRIPTION')) return `${page} page description for ${env.prod ? 'production' : 'development'}`;
  if (key.includes('TITLE')) return `${page} | I Knit the Web`;
  if (key.includes('KEYWORDS')) return `web, development, ${page}`;
  if (key.includes('ROBOTS')) return 'index,follow';
  if (key.includes('CANONICAL_URL')) return urlJoin(env.url, 'dist/pages', `${page}.html`);
  if (key.includes('OG_IMAGE') || key.includes('TWITTER_IMAGE')) return urlJoin(env.asset, 'branding/logo.png');
  if (key.includes('OG_URL')) return urlJoin(env.url, 'dist/pages', `${page}.html`);
  if (key.includes('OG_TYPE')) return 'website';
  if (key.includes('TWITTER_CARD')) return 'summary_large_image';
  if (key.includes('ASSET_URL')) return env.asset.replace(/\/+$/, '/');
  if (key.includes('BASE_URL')) return env.url.replace(/\/+$/, '/');
  return '';
}

envFiles.forEach((env) => {
  let output = header + '\n';
  Object.entries(placeholderMap).forEach(([file, keys]) => {
    const page = file.replace('.template.html', '');
    output += `\n# ${file}\n`;
    keys.forEach((key) => {
      output += `${key}=${autoValue(key, page, env)}\n`;
    });
  });
  fs.writeFileSync(path.join(process.cwd(), env.name), output, 'utf8');
});
