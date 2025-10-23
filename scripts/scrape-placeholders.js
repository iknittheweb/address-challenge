import fs from 'fs';
import path from 'path';

const templateDir = path.join(process.cwd(), 'src', 'templates');
const files = fs.readdirSync(templateDir).filter((f) => f.endsWith('.template.html'));

const placeholderMap = {};

files.forEach((file) => {
  const content = fs.readFileSync(path.join(templateDir, file), 'utf8');
  const matches = [...content.matchAll(/{{([A-Z0-9_]+)}}/g)];
  const placeholders = matches.map((m) => m[1]);
  placeholderMap[file] = Array.from(new Set(placeholders));
});

console.log('Placeholders per template:');
Object.entries(placeholderMap).forEach(([file, placeholders]) => {
  console.log(`\n${file}:`);
  placeholders.forEach((ph) => console.log(`  ${ph}`));
});
