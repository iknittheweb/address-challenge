// -------------------------------------------------------------
// CSS Loader Script
// -------------------------------------------------------------
// Purpose: Ensures all <link rel="stylesheet" media="print"> tags are activated after loading
// Features:
//   - Sets media='all' for print-only stylesheets after they load
//   - Handles browsers that don't fire load on already loaded links
// Usage:
//   - Use for async CSS loading to prevent FOUC and improve performance
// Key Concepts:
//   - Async CSS loading
//   - FOUC prevention
//   - Cross-browser compatibility
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('link[rel="stylesheet"][media="print"]').forEach(function (link) {
    link.addEventListener('load', function () {
      link.media = 'all';
    });
    // For browsers that don't fire load on already loaded links
    if (link.sheet) {
      link.media = 'all';
    }
  });
});
