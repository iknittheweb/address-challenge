<#
=====================================================================
 format-html.ps1
=====================================================================
This script formats all HTML files in the build output directory using Prettier.
BEGINNER-FRIENDLY: Each section is commented for clarity.
#>

# =====================================================================
# 1. SETUP: Error handling and directory
# =====================================================================
$ErrorActionPreference = "Stop"

# Change this to your build output directory if not 'dist'
$DIST_DIR = "dist"

# =====================================================================
# 2. GATHER HTML FILES
# =====================================================================
# Recursively find all HTML files in the build output directory
$htmlFiles = Get-ChildItem -Path $DIST_DIR -Recurse -Filter *.html

# =====================================================================
# 3. EXIT IF NO FILES
# =====================================================================
if (-not $htmlFiles) {
    Write-Host "No HTML files to format in $DIST_DIR. Skipping prettier."
    exit 0
}

# =====================================================================
# 4. FORMAT FILES WITH PRETTIER
# =====================================================================
Write-Host ("Formatting {0} HTML file(s)..." -f $htmlFiles.Count)

# Use npx so CI uses project-installed prettier
$htmlFilesPaths = $htmlFiles | ForEach-Object { $_.FullName }
npx prettier --write -- $htmlFilesPaths