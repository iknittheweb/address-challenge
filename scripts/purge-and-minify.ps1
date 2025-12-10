<#
=====================================================================
 purge-and-minify.ps1
=====================================================================
This script purges unused CSS from built HTML files and optionally minifies CSS.
BEGINNER-FRIENDLY: Each section is commented for clarity.
#>

# =====================================================================
# 1. SETUP: Error handling and directory variables
# =====================================================================
$ErrorActionPreference = "Stop"

# Directory containing built HTML
$DIST_DIR = "dist"

# CSS input pattern (relative to dist/css)
$CSS_DIR = "$DIST_DIR/css"
$CSS_GLOB = "*.css"

# Content globs for HTML
$CONTENT_GLOBS = "$DIST_DIR/**/*.html"

# =====================================================================
# 2. FILE CHECK: Ensure HTML exists before purging
# =====================================================================
$hasHtml = Get-ChildItem -Path $DIST_DIR -Filter *.html -Recurse -ErrorAction SilentlyContinue
if (-not $hasHtml) {
    Write-Host "No HTML files found under $DIST_DIR. Skipping purgecss."
    exit 0
}

# =====================================================================
# 3. PURGE LOGIC: Run PurgeCSS
# =====================================================================
Write-Host "Running purgecss on $CSS_DIR/$CSS_GLOB with content $CONTENT_GLOBS"
# Change to dist/css so purgecss outputs to current dir, avoiding dist/css/dist/css
Push-Location $CSS_DIR
npx purgecss --css "$CSS_GLOB" --content "../**/*.html" --output .
Pop-Location

# =====================================================================
# 4. OPTIONAL MINIFICATION
# =====================================================================
# Optionally run a CSS minifier here (e.g. csso or clean-css)
# npx csso "$DIST_DIR/css/styles.css" --output "$DIST_DIR/css/styles.min.css"

# =====================================================================
# 5. DONE
# =====================================================================
Write-Host "Purge and optional minify finished."