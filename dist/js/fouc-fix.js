// -------------------------------------------------------------
// FOUC Fixer Script
// -------------------------------------------------------------
// Purpose: Removes .no-js class ASAP to prevent Flash of Unstyled Content (FOUC)
// Features:
//   - Ensures CSS loads immediately for users with JavaScript enabled
//   - Adds .css-loaded class for downstream scripts/styles
// Usage:
//   - Include as the first script in <head> to minimize FOUC
// Key Concepts:
//   - FOUC prevention
//   - Progressive enhancement
// -------------------------------------------------------------
if (document && document.documentElement) {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('css-loaded');
}
