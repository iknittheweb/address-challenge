// scripts/titlecase-env.cjs
// -------------------------------------------------------------
// Titlecase .env TITLE values script
// -------------------------------------------------------------
// Purpose: Formats TITLE values in .env* files to title case and replaces dashes in filenames with spaces.
// Usage: Run this script to update TITLE values in all .env* files in the project root.
// -------------------------------------------------------------

// ------------------------------
// Imports
// ------------------------------
const fs = require('fs'); // File system module for reading/writing files
const path = require('path'); // Path utilities
const glob = require('glob'); // File pattern matching

// ------------------------------
// Helper Functions
// ------------------------------

// Converts a string to title case (for English)
function titleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Replaces dashes with spaces in filenames
function filenameToTitle(str) {
  return str.replace(/-/g, ' ');
}

// ------------------------------
// Main Script Logic
// ------------------------------

// Find all .env* files in the project root
const envFiles = glob.sync(path.join(__dirname, '../.env*'));

// Loop through each .env* file and update TITLE values
envFiles.forEach((file) => {
  // Read file contents
  let content = fs.readFileSync(file, 'utf8');

  // Replace TITLE values using regex
  content = content.replace(/TITLE=(.*)/g, (match, p1) => {
    // If the title contains a filename, replace dashes with spaces first
    let newTitle = p1.replace(/([\w-]+)\.template\.html/, (m) => filenameToTitle(m.replace('.template.html', '')));
    // Apply title case formatting
    newTitle = titleCase(newTitle);
    // Add site suffix if missing
    if (!newTitle.toLowerCase().includes('i knit the web')) {
      newTitle += ' | I Knit The Web';
    }
    return `TITLE=${newTitle}`;
  });

  // Write updated content back to file
  fs.writeFileSync(file, content);
  console.log(`Updated TITLE values in ${file}`);
});

// ------------------------------
// End of script
// ------------------------------
