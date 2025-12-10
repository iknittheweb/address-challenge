// =====================================================================
// Sync Docs Script (Beginner-Friendly)
// =====================================================================
// Purpose: Scan templates and components, then update documentation files automatically.
// Usage: Run with: node sync-docs.cjs
// Key Concepts:
//   - Recursively scan directories for files
//   - Update placeholder guide with template info
//   - Update changelog with latest component changes
// =====================================================================

// -------------------------------------------------------------
// 1. Import required modules
// -------------------------------------------------------------
const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------
// 2. Define important paths and directories
// -------------------------------------------------------------
const TEMPLATE_PATH = path.join(__dirname, 'src/templates/new-page.template.html');
const GUIDE_PATH = path.join(__dirname, 'docs/new-page-placeholder-replacement-guide.txt');
const CHANGELOG_PATH = path.join(__dirname, 'CHANGELOG.md');
const COMPONENTS_DIRS = [path.join(__dirname, 'src/js'), path.join(__dirname, 'src/scss')];

// -------------------------------------------------------------
// 3. Helper: Recursively get all files in a directory
// -------------------------------------------------------------
function getAllFiles(dir) {
  let results = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

// -------------------------------------------------------------
// 4. Update placeholder guide from template
// -------------------------------------------------------------
function updatePlaceholderGuide() {
  const templateLines = fs.readFileSync(TEMPLATE_PATH, 'utf8').split(/\r?\n/);
  const placeholderRegex = /\{\{([A-Z0-9_\-]+)\}\}/g;
  const placeholders = {};
  templateLines.forEach((line, idx) => {
    let match;
    while ((match = placeholderRegex.exec(line)) !== null) {
      placeholders[match[1]] = idx + 1;
    }
  });
  let guide = fs.readFileSync(GUIDE_PATH, 'utf8');
  Object.entries(placeholders).forEach(([name, lineNum]) => {
    const guideRegex = new RegExp(`(\{\{${name}\}\} — line )\d+`, 'g');
    guide = guide.replace(guideRegex, `$1${lineNum}`);
  });
  Object.entries(placeholders).forEach(([name, lineNum]) => {
    if (!guide.includes(`{{${name}}}`)) {
      guide += `\n{{${name}}} — line ${lineNum}`;
    }
  });
  fs.writeFileSync(GUIDE_PATH, guide, 'utf8');
  console.log('Placeholder guide updated.');
}

// -------------------------------------------------------------
// 5. Update changelog with latest component changes
// -------------------------------------------------------------
function updateChangelog() {
  let changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  let changes = [];
  COMPONENTS_DIRS.forEach((dir) => {
    getAllFiles(dir).forEach((file) => {
      const stats = fs.statSync(file);
      const lastModified = stats.mtime.toISOString().split('T')[0];
      changes.push(`- ${path.relative(__dirname, file)} (last modified: ${lastModified})`);
    });
  });
  const marker = '## Latest Component Changes';
  const newSection = `${marker}\n${changes.join('\n')}`;
  if (changelog.includes(marker)) {
    changelog = changelog.replace(new RegExp(`${marker}[\s\S]*?(?=^## |\Z)`, 'm'), newSection);
  } else {
    changelog += `\n\n${newSection}`;
  }
  fs.writeFileSync(CHANGELOG_PATH, changelog, 'utf8');
  console.log('Changelog updated with latest component changes.');
}

// -------------------------------------------------------------
// 6. Main process: update docs and changelog
// -------------------------------------------------------------
function main() {
  updatePlaceholderGuide();
  updateChangelog();
}

// -------------------------------------------------------------
// 7. Run the main process
// -------------------------------------------------------------
main();
