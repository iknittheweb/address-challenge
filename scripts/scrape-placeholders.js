// =====================================================================
// scrape-placeholders.js
// =====================================================================
// This script scans all .template.html files for {{PLACEHOLDER}} variables and prints them per file.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. IMPORTS
// =====================================================================
import fs from 'fs';
import path from 'path';

// =====================================================================
// 2. CONSTANTS: Directory and file list
// =====================================================================
const templateDir = path.join(process.cwd(), 'src', 'templates');
const files = fs.readdirSync(templateDir).filter((f) => f.endsWith('.template.html'));

// =====================================================================
// 3. MAIN LOGIC: Find placeholders in each file
// =====================================================================
const placeholderMap = {};
files.forEach((file) => {
  const content = fs.readFileSync(path.join(templateDir, file), 'utf8');
  const matches = [...content.matchAll(/{{([A-Z0-9_]+)}}/g)];
  const placeholders = matches.map((m) => m[1]);
  placeholderMap[file] = Array.from(new Set(placeholders));
});

// =====================================================================
// 4. OUTPUT: Print results
// =====================================================================
console.log('Placeholders per template:');
Object.entries(placeholderMap).forEach(([file, placeholders]) => {
  console.log(`\n${file}:`);
  placeholders.forEach((ph) => console.log(`  ${ph}`));
});
