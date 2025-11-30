// fouc-fix.js
// Removes .no-js class ASAP to prevent FOUC
if (document && document.documentElement) {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('css-loaded');
}
