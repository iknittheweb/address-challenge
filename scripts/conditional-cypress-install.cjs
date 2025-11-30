if (process.env.SKIP_CYPRESS_BINARY_DOWNLOAD !== '1') {
  require('child_process').execSync('npx cypress install', { stdio: 'inherit' });
} else {
  console.log('Skipping Cypress binary download due to SKIP_CYPRESS_BINARY_DOWNLOAD=1');
}
