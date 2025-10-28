// optimize-images.js
// Automatically compresses and optimizes images in src/img and subfolders
// Usage: node optimize-images.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.join(__dirname, 'src/img');
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png'];
const QUALITY = 80; // Adjust as needed
const OUTPUT_DIR = path.join(__dirname, 'dist/img');

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

async function optimizeImage(file) {
  const ext = path.extname(file).toLowerCase();
  const relPath = path.relative(IMG_DIR, file);
  const outDir = path.join(OUTPUT_DIR, path.dirname(relPath));
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const baseName = path.basename(file, ext);
  const outJpeg = path.join(outDir, `${baseName}.jpg`);
  const outWebp = path.join(outDir, `${baseName}.webp`);
  try {
    // Optimize JPEG/PNG
    await sharp(file).toFormat('jpeg', { quality: QUALITY }).toFile(outJpeg);
    // Generate WebP
    await sharp(file).webp({ quality: QUALITY }).toFile(outWebp);
    console.log(`Optimized: ${file} -> ${outJpeg}, ${outWebp}`);
  } catch (err) {
    console.error(`Error optimizing ${file}:`, err.message);
  }
}

async function main() {
  const files = getAllFiles(IMG_DIR);
  if (files.length === 0) {
    console.log('No files found in src/img.');
    return;
  }
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const relPath = path.relative(IMG_DIR, file);
    const outPath = path.join(OUTPUT_DIR, relPath);
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    // Copy all files as-is
    fs.copyFileSync(file, outPath);
    // Optimize only supported image types
    if (SUPPORTED_EXT.includes(ext)) {
      await optimizeImage(file);
    }
    console.log(`Copied: ${file} -> ${outPath}`);
  }
  console.log('All files copied to dist/img/. JPEG/PNG/WebP optimized as usual.');
}

main();
