#!/usr/bin/env bash
set -euo pipefail
# comment for debugging
# Enable ** globbing and nullglob so non-matching globs expand to nothing
shopt -s globstar nullglob

# Change this to your build output directory if not `dist`
DIST_DIR="dist"

# Gather files
files=( "$DIST_DIR"/**/*.html )

if [ ${#files[@]} -eq 0 ]; then
  echo "No HTML files to format in ${DIST_DIR}. Skipping prettier."
  exit 0
fi

echo "Formatting ${#files[@]} HTML file(s)..."
# Use npx so CI uses project-installed prettier
npx prettier --write "${files[@]}"