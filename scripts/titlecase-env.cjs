// scripts/titlecase-env.js
// Formats TITLE values in .env* files to title case and replaces dashes in filenames with spaces

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Simple title case function (for English)
function titleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Replace dashes with spaces in filenames
function filenameToTitle(str) {
  return str.replace(/-/g, ' ');
}

// Process all .env* files in the root directory
const envFiles = glob.sync(path.join(__dirname, '../.env*'));

envFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace TITLE values
  content = content.replace(/TITLE=(.*)/g, (match, p1) => {
    // If the title contains a filename, replace dashes with spaces first
    let newTitle = p1.replace(/([\w-]+)\.template\.html/, (m) => filenameToTitle(m.replace('.template.html', '')));
    // Now apply title case
    newTitle = titleCase(newTitle);
    // Restore suffix if present
    if (!newTitle.toLowerCase().includes('i knit the web')) {
      newTitle += ' | I Knit The Web';
    }
    return `TITLE=${newTitle}`;
  });
  fs.writeFileSync(file, content);
  console.log(`Updated TITLE values in ${file}`);
});
