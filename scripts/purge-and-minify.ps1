# PowerShell version of purge-and-minify.sh

$ErrorActionPreference = "Stop"

# directory containing built HTML
$DIST_DIR = "dist"

# css input pattern (relative to dist/css)
$CSS_DIR = "$DIST_DIR/css"
$CSS_GLOB = "*.css"

# content globs for html
$CONTENT_GLOBS = "$DIST_DIR/**/*.html"

# If there is no HTML in dist, skip purge to avoid purgecss help dump and errors.
$hasHtml = Get-ChildItem -Path $DIST_DIR -Filter *.html -Recurse -ErrorAction SilentlyContinue
if (-not $hasHtml) {
    Write-Host "No HTML files found under $DIST_DIR. Skipping purgecss."
    exit 0
}

Write-Host "Running purgecss on $CSS_DIR/$CSS_GLOB with content $CONTENT_GLOBS"
# Change to dist/css so purgecss outputs to current dir, avoiding dist/css/dist/css
Push-Location $CSS_DIR
npx purgecss --css "$CSS_GLOB" --content "../**/*.html" --output .
Pop-Location

# Optionally run a CSS minifier here (e.g. csso or clean-css)
# npx csso "$DIST_DIR/css/styles.css" --output "$DIST_DIR/css/styles.min.css"

Write-Host "Purge and optional minify finished."