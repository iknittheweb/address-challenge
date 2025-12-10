// =====================================================================
// conditional-cypress-install.cjs
// =====================================================================
// This script conditionally installs the Cypress binary based on an environment variable.
// BEGINNER-FRIENDLY: Each section is commented for clarity.

// =====================================================================
// 1. ENVIRONMENT CHECK
// =====================================================================
// If SKIP_CYPRESS_BINARY_DOWNLOAD is not set to '1', install Cypress.
if (process.env.SKIP_CYPRESS_BINARY_DOWNLOAD !== '1') {
  // =====================================================================
  // 2. CYPRESS INSTALL LOGIC
  // =====================================================================
  // Runs 'npx cypress install' and shows output in the terminal.
  require('child_process').execSync('npx cypress install', { stdio: 'inherit' });
} else {
  // =====================================================================
  // 3. SKIP LOGIC
  // =====================================================================
  // Skips Cypress binary download and prints a message for clarity.
  console.log('Skipping Cypress binary download due to SKIP_CYPRESS_BINARY_DOWNLOAD=1');
}
