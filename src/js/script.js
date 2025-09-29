/**
 * NAVIGATION SYSTEM
 * This file handles the mobile hamburger menu and responsive navigation
 * It works with both static pages (like home) and dynamic component-injected pages
 */

// =============================================================================
// DOM ELEMENT REFERENCES
// =============================================================================

// Get references to main page sections (these stay constant)
const main = document.querySelector('#main-content'); // Main content area
const footer = document.querySelector('footer'); // Footer element

// Get navigation elements (these might be injected dynamically, so we use 'let')
let btnOpen = document.querySelector('#btnOpen'); // Hamburger menu button
let btnClose = document.querySelector('#btnClose'); // Close menu button (X)
let menuTopNav = document.querySelector('#menuTopNav'); // The mobile menu container
let overlay = document.querySelector('#overlay'); // Dark overlay behind mobile menu

// =============================================================================
// RESPONSIVE BREAKPOINT SETUP
// =============================================================================

// Create a media query object to detect when we're in mobile view
// 43.75em = 700px - this matches our CSS breakpoints
const breakpoint = window.matchMedia('(width < 43.75em)');

// Flag to prevent setting up navigation twice (important for component injection)
let navigationInitialized = false;

// =============================================================================
// NAVIGATION ACCESSIBILITY SETUP
// =============================================================================

/**
 * Sets up navigation accessibility based on current screen size
 * The 'inert' attribute prevents elements from being focusable or interactive
 */
const setupTopNav = () => {
  // Safety check: make sure menu exists before trying to modify it
  if (!menuTopNav) return;

  if (breakpoint.matches) {
    // MOBILE VIEW: Hide navigation from screen readers and keyboard users
    // The mobile menu should be hidden by default until opened
    menuTopNav.setAttribute('inert', '');
  } else {
    // DESKTOP VIEW: Make navigation accessible
    // Desktop navigation should always be available
    menuTopNav.removeAttribute('inert');
  }
};

// =============================================================================
// NAVIGATION INITIALIZATION (Can be called from external files)
// =============================================================================

/**
 * Main navigation setup function
 * This can be called from components.js after header injection
 * or immediately for static pages like the home page
 */
window.initializeNavigation = function () {
  // STEP 1: Get fresh references to navigation elements
  // This is important because elements might be injected dynamically
  btnOpen = document.querySelector('#btnOpen'); // Hamburger button
  btnClose = document.querySelector('#btnClose'); // Close (X) button
  menuTopNav = document.querySelector('#menuTopNav'); // Mobile menu
  overlay = document.querySelector('#overlay'); // Background overlay

  // STEP 2: Safety check - make sure all elements exist
  // If any are missing, return false so components.js can retry later
  if (!btnOpen || !btnClose || !menuTopNav || !overlay) {
    return false; // Failed - elements not ready yet
  }

  // STEP 3: Clean up any existing event listeners
  // This prevents duplicate listeners if function is called multiple times
  if (btnOpen) btnOpen.removeEventListener('click', openMobileMenu);
  if (btnClose) btnClose.removeEventListener('click', closeMobileMenu);

  // STEP 4: Set up the main menu buttons
  btnOpen.addEventListener('click', openMobileMenu); // Open menu when hamburger clicked
  btnClose.addEventListener('click', closeMobileMenu); // Close menu when X clicked

  // STEP 5: Set up navigation links
  // Each navigation link gets a click handler that intelligently closes mobile menu
  menuTopNav.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleNavLinkClick); // Remove old listener
    link.addEventListener('click', handleNavLinkClick); // Add new listener
  });

  // STEP 6: Set up initial accessibility state
  setupTopNav();

  // STEP 7: Mark as initialized and return success
  navigationInitialized = true;
  return true; // Success - navigation is ready
};

// =============================================================================
// APP INITIALIZATION (for static pages like home page)
// =============================================================================

/**
 * Initialize the app for pages with static navigation (like index.html)
 * For component-injected pages, initialization happens in components.js
 */
const initializeApp = () => {
  // Try to set up navigation immediately
  // This works for static pages where navigation HTML already exists
  window.initializeNavigation();

  // Set up responsive behavior
  // Listen for screen size changes (desktop ↔ mobile)
  breakpoint.addEventListener('change', () => {
    setupTopNav(); // Update accessibility when screen size changes
  });
};

// =============================================================================
// MOBILE MENU FUNCTIONS
// =============================================================================

/**
 * Opens the mobile hamburger menu
 * This function handles all the accessibility and visual changes needed
 */
function openMobileMenu() {
  // Safety check: make sure all required elements exist
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay || !btnClose) return;

  // STEP 1: Update ARIA attributes for screen readers
  btnOpen.setAttribute('aria-expanded', 'true'); // Tell screen readers menu is open

  // STEP 2: Hide main content from keyboard/screen reader access
  // This forces focus to stay within the mobile menu
  main.setAttribute('inert', ''); // Main content becomes non-interactive
  footer.setAttribute('inert', ''); // Footer becomes non-interactive

  // STEP 3: Make mobile menu accessible
  menuTopNav.removeAttribute('inert'); // Menu becomes interactive

  // STEP 4: Set up smooth animations
  menuTopNav.style.transitionDuration = '400ms'; // Menu slide animation
  overlay.style.transitionDuration = '400ms'; // Overlay fade animation

  // STEP 5: Prevent body scrolling while menu is open (if library is loaded)
  if (window.bodyScrollLock) window.bodyScrollLock.disableBodyScroll(menuTopNav);

  // STEP 6: Move keyboard focus to close button for accessibility
  btnClose.focus(); // User can immediately press Enter to close menu
}

/**
 * Handles clicks on navigation links (About, Contact, Portfolio, etc.)
 * This is smart - it only closes the mobile menu when actually in mobile view
 */
function handleNavLinkClick() {
  // Check current screen size using our media query
  if (breakpoint.matches) {
    // MOBILE VIEW: User clicked a nav link, close the mobile menu
    closeMobileMenu();
  }
  // DESKTOP VIEW: Do nothing - let the link work normally
  // This prevents desktop navigation from being interfered with
}

/**
 * Closes the mobile hamburger menu
 * This reverses all the changes made by openMobileMenu()
 */
function closeMobileMenu() {
  // Safety check: make sure all required elements exist
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay) return;

  // STEP 1: Update ARIA attributes for screen readers
  btnOpen.setAttribute('aria-expanded', 'false'); // Tell screen readers menu is closed

  // STEP 2: Restore accessibility to main content
  main.removeAttribute('inert'); // Main content becomes interactive again
  footer.removeAttribute('inert'); // Footer becomes interactive again

  // STEP 3: Hide mobile menu from accessibility
  menuTopNav.setAttribute('inert', ''); // Menu becomes non-interactive

  // STEP 4: Re-enable body scrolling (if library is loaded)
  if (window.bodyScrollLock) window.bodyScrollLock.enableBodyScroll(menuTopNav);

  // STEP 5: Clean up animations after menu closes
  // We wait 500ms to let the close animation finish, then remove inline styles
  setTimeout(() => {
    menuTopNav.removeAttribute('style'); // Remove animation duration
    overlay.removeAttribute('style'); // Remove animation duration
  }, 500);

  // NOTE: We don't call btnOpen.focus() here because it interferes with
  // hash navigation (About/Contact links). The user's focus naturally
  // goes where they clicked.
}

// =============================================================================
// START THE APPLICATION
// =============================================================================

// Initialize the app immediately for static pages
initializeApp();

// =============================================================================
// DROPDOWN FUNCTIONALITY (for portfolio page)
// =============================================================================

/**
 * Set up dropdown menus once the DOM is fully loaded
 * This is separate from navigation and handles expandable content sections
 */
document.addEventListener('DOMContentLoaded', function () {
  // Find dropdown elements (used on portfolio page for project categories)
  const dropdownTitle = document.querySelector('.dropdown__title');
  const dropdownContent = document.querySelector('.dropdown__content');

  // Only set up dropdown if elements exist (not all pages have dropdowns)
  if (dropdownTitle && dropdownContent) {
    dropdownTitle.addEventListener('click', function () {
      // Toggle the 'show' class to expand/collapse dropdown content
      dropdownContent.classList.toggle('show');
    });
  }
});
