// scripts/copy-scss-to-dist.cjs
// Copies all SCSS source files to dist/src/scss (preserving folder structure)

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const srcDir = path.join(__dirname, '../src/scss');
const destDir = path.join(__dirname, '../dist/src/scss');

function copyFileSync(source, target) {
  const targetDir = path.dirname(target);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, target);
}

const scssFiles = glob.sync('**/*.scss', { cwd: srcDir, nodir: true });

scssFiles.forEach((file) => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  copyFileSync(srcFile, destFile);
  console.log(`Copied ${srcFile} -> ${destFile}`);
});
