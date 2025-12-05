# PowerShell version of format-html.sh

$ErrorActionPreference = "Stop"

# Change this to your build output directory if not `dist`
$DIST_DIR = "dist"

# Gather all HTML files recursively
$htmlFiles = Get-ChildItem -Path $DIST_DIR -Recurse -Filter *.html

if (-not $htmlFiles) {
    Write-Host "No HTML files to format in $DIST_DIR. Skipping prettier."
    exit 0
}

Write-Host ("Formatting {0} HTML file(s)..." -f $htmlFiles.Count)

# Use npx so CI uses project-installed prettier
$htmlFilesPaths = $htmlFiles | ForEach-Object { $_.FullName }
npx prettier --write -- $htmlFilesPaths
