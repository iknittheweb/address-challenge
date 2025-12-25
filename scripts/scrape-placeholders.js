// =====================================================================
// scrape-placeholders.js
// =====================================================================
// This script scans all .template.html files for {{PLACEHOLDER}} variables and prints them per file.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. IMPORTS
// =====================================================================
import fs from 'fs'; // Node.js file system module for reading files
import path from 'path'; // Node.js path module for handling file paths

// =====================================================================
// 2. CONSTANTS: Directory and file list
// =====================================================================
const templateDir = path.join(process.cwd(), 'src', 'templates'); // Path to the templates directory
const files = fs.readdirSync(templateDir).filter((f) => f.endsWith('.template.html')); // List all .template.html files

// =====================================================================
// 3. MAIN LOGIC: Find unique placeholders per template, in order of appearance
// =====================================================================
const templatePlaceholders = {};
files.forEach((file) => {
  const content = fs.readFileSync(path.join(templateDir, file), 'utf8');
  const matches = [...content.matchAll(/{{([a-zA-Z0-9_]+)}}/g)];
  const seen = new Set();
  const ordered = [];
  matches.forEach((m) => {
    const ph = m[1];
    if (!seen.has(ph)) {
      seen.add(ph);
      ordered.push(ph);
    }
  });
  // Split into non-page-specific and page-specific
  const base = file.replace(/\..*$/, '');
  const nonPageSpecific = ordered.filter((ph) => !ph.startsWith(base + '_')).sort();
  const pageSpecific = ordered.filter((ph) => ph.startsWith(base + '_'));
  templatePlaceholders[file] = [...nonPageSpecific, ...pageSpecific];
});

// =====================================================================
// 4. OUTPUT: Print results
// =====================================================================

// Prepare markdown output: separate list for each template
let md = '# Handlebars Placeholders Per Template (in order of appearance, no duplicates)\n';
Object.entries(templatePlaceholders).forEach(([file, placeholders]) => {
  md += `\n## ${file}\n`;
  placeholders.forEach((ph) => {
    md += `- \\{\\{${ph}\\}\\}\n`;
  });
});

// Create output directory if it doesn't exist
const outDir = path.join(process.cwd(), 'placeholders');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}
// Generate timestamped filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(outDir, `placeholders-scraped-${timestamp}.md`);
// Write markdown to file
fs.writeFileSync(outFile, md, 'utf8');
console.log(`Placeholders written to ${outFile}`);
