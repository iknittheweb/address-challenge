// =====================================================================
// Image Optimization Script (Beginner-Friendly)
// =====================================================================
// Purpose: Compress and optimize images in src/img and subfolders for web use.
// Usage: Run with: node optimize-images.cjs
// Key Concepts:
//   - Image optimization for performance
//   - Automation of JPEG/PNG/WebP/AVIF/SVG processing
//   - Output to dist/img for deployment
// =====================================================================

// -------------------------------------------------------------
// 1. Import required modules
// -------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { optimize: svgoOptimize } = require('svgo');

// -------------------------------------------------------------
// 2. Define constants for directories, extensions, and quality
// -------------------------------------------------------------
const IMG_DIR = path.join(__dirname, 'src/img');
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png'];
const SVG_EXT = '.svg';
const QUALITY = 80; // Adjust as needed
const OUTPUT_DIR = path.join(__dirname, 'dist/img');

// -------------------------------------------------------------
// 3. Recursively get all files in IMG_DIR
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
// 4. Optimize raster images (JPEG/PNG)
// -------------------------------------------------------------
async function optimizeImage(file) {
  const ext = path.extname(file).toLowerCase();
  const relPath = path.relative(IMG_DIR, file);
  const outDir = path.join(OUTPUT_DIR, path.dirname(relPath));
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const baseName = path.basename(file, ext);
  const outJpeg = path.join(outDir, `${baseName}.jpg`);
  const outWebp = path.join(outDir, `${baseName}.webp`);
  const outAvif = path.join(outDir, `${baseName}.avif`);
  try {
    // Optimize JPEG/PNG
    await sharp(file).toFormat('jpeg', { quality: QUALITY }).toFile(outJpeg);
    // Generate WebP
    await sharp(file).webp({ quality: QUALITY }).toFile(outWebp);
    // Generate AVIF
    await sharp(file).avif({ quality: QUALITY }).toFile(outAvif);
    console.log(`Optimized: ${file} -> ${outJpeg}, ${outWebp}, ${outAvif}`);
  } catch (err) {
    console.error(`Error optimizing ${file}:`, err.message);
  }
}

// -------------------------------------------------------------
// 5. Optimize SVG files
// -------------------------------------------------------------
function optimizeSvg(file, outPath) {
  try {
    const svgData = fs.readFileSync(file, 'utf8');
    const result = svgoOptimize(svgData, { path: file });
    if (result.error) {
      console.error(`SVGO error optimizing ${file}:`, result.error);
      fs.copyFileSync(file, outPath); // fallback: just copy
    } else {
      fs.writeFileSync(outPath, result.data, 'utf8');
      console.log(`Optimized SVG: ${file} -> ${outPath}`);
    }
  } catch (err) {
    console.error(`Error optimizing SVG ${file}:`, err.message);
    fs.copyFileSync(file, outPath); // fallback: just copy
  }
}

// -------------------------------------------------------------
// 6. Main process: copy, optimize, and log each file
// -------------------------------------------------------------
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
    if (ext === SVG_EXT) {
      // Optimize SVG
      optimizeSvg(file, outPath);
    } else {
      // Copy all other files as-is
      fs.copyFileSync(file, outPath);
      // Optimize only supported raster image types
      if (SUPPORTED_EXT.includes(ext)) {
        await optimizeImage(file);
      }
    }
    console.log(`Copied: ${file} -> ${outPath}`);
  }
  console.log('All files copied to dist/img/. JPEG/PNG/WebP/AVIF optimized as usual.');
}

// -------------------------------------------------------------
// 7. Run the main process
// -------------------------------------------------------------
main();
