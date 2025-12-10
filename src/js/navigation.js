// -------------------------------------------------------------
// Navigation Bar & Mobile Menu Handler (ES module)
// -------------------------------------------------------------
// Purpose: Controls the navigation bar and mobile menu behavior for all pages.
// Features:
//   - Handles menu open/close, ARIA accessibility, and focus management
//   - Supports keyboard and mouse interaction for navigation
//   - Exposes state for Cypress automated testing
// Usage:
//   - Used on all pages with a navigation bar and mobile menu
// Key Concepts:
//   - Event listeners
//   - ARIA accessibility
//   - Focus trapping
//   - Cypress testing hooks
// -------------------------------------------------------------

// Main function to initialize navigation and menu toggle
export function initializeNavigation() {
  // Get references to navigation elements
  btnOpen = document.querySelector('#btnOpen'); // Get the hamburger (open) button by its ID
  btnClose = document.querySelector('#btnClose'); // Get the close button by its ID
  const toggleContainer = btnOpen?.closest('.topnav__toggle'); // Get the container that holds both toggle buttons (not used directly here)
  menuTopNav = document.querySelector('#menuTopNav'); // Get the navigation menu container by its ID
  main = document.querySelector('#main-content'); // Get the main content area by its ID
  footer = document.querySelector('footer'); // Get the footer element
  if (!btnOpen || !btnClose || !menuTopNav) return false; // If any required element is missing, stop initialization

  // Get the logo element (used to hide/show logo when menu is open)
  const logo = document.querySelector('.topnav__logo');

  // Set initial ARIA attributes for accessibility
  btnOpen.setAttribute('aria-expanded', 'false'); // Menu is closed by default
  btnClose.setAttribute('aria-expanded', 'true'); // Close button hidden by default

  // Add event listener to open button: shows menu and hides logo

  btnOpen.addEventListener('click', function () {
    menuTopNav.setAttribute('data-open', 'true'); // Show the menu by data attribute
    menuTopNav.removeAttribute('inert'); // Make menu interactive
    menuTopNav.setAttribute('aria-hidden', 'false');
    btnOpen.style.display = 'none'; // Hide the open (hamburger) button
    btnClose.style.display = 'block'; // Show the close button
    if (logo) logo.classList.add('logo--hidden'); // Hide the logo when menu is open
    btnOpen.setAttribute('aria-expanded', 'true'); // Update ARIA for accessibility
    btnClose.setAttribute('aria-expanded', 'true'); // Update ARIA for accessibility
  });

  // Add event listener to close button: hides menu and shows logo
  btnClose.addEventListener('click', function () {
    menuTopNav.removeAttribute('data-open'); // Hide the menu by removing data attribute
    menuTopNav.setAttribute('inert', ''); // Make menu non-interactive
    menuTopNav.setAttribute('aria-hidden', 'true');
    btnOpen.style.display = 'block'; // Show the open (hamburger) button
    btnClose.style.display = 'none'; // Hide the close button
    if (logo) logo.classList.remove('logo--hidden'); // Show the logo when menu is closed
    btnOpen.setAttribute('aria-expanded', 'false'); // Update ARIA for accessibility
    btnClose.setAttribute('aria-expanded', 'false'); // Update ARIA for accessibility
  });

  // Set initial state: menu hidden, open button visible, close button hidden
  menuTopNav.removeAttribute('data-open'); // Ensure menu is hidden on load
  btnOpen.style.display = 'block'; // Show open button on load
  btnClose.style.display = 'none'; // Hide close button on load

  // Remove any previous global keydown listeners, then add new one for Escape key
  document.removeEventListener('keydown', handleGlobalKeydown); // Cleanup
  document.addEventListener('keydown', handleGlobalKeydown); // Add new listener

  // Add click listeners to each nav link to close menu on mobile
  menuTopNav.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleNavLinkClick); // Cleanup
    link.addEventListener('click', handleNavLinkClick); // Add new listener
  });

  // Set up accessibility attributes for menu (inert, aria-hidden)
  setupTopNav();

  // Mark navigation as initialized for testing and state tracking
  navigationInitialized = true;
  window.navigationTestState.initialized = true;

  // No header auto-hide scroll logic in minimal menu
  return true; // Initialization successful
}

// Get the bodyScrollLock library from the global window object
const bodyScrollLock = window.bodyScrollLock;

// Utility function: Waits for both the DOM and CSS to be loaded before running a callback
function waitForCSSAndDOM(callback) {
  function checkReady() {
    const domReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const cssReady = document.documentElement.classList.contains('css-loaded') || window.mainCSSLoaded;
    if (domReady && cssReady) {
      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
    } else {
      requestAnimationFrame(checkReady);
    }
  }
  checkReady();
}

// Accessibility helper: Announces a message to screen readers
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Navigation logic variables
let btnOpen, btnClose, menuTopNav, main, footer;
let lastScrollY = 0, // Tracks last scroll position (not used in minimal menu)
  isScrolling = false, // Tracks if user is scrolling (not used in minimal menu)
  navigationInitialized = false; // Tracks if navigation is initialized

// Expose navigation state for Cypress tests (for automated testing)
window.navigationTestState = {
  menuOpen: false, // Is the mobile menu open?
  focusTrapActive: false, // Is focus trap active?
  initialized: false, // Is navigation initialized?
};

// Set up a breakpoint for mobile/desktop (matches if width < 700px)
const breakpoint = window.matchMedia('(width < 43.75em)');

// Sets up menu accessibility attributes based on screen size
function setupTopNav() {
  if (!menuTopNav) return; // If menu not found, do nothing
  if (breakpoint.matches) {
    // On mobile: hide menu from screen readers and keyboard
    menuTopNav.setAttribute('inert', '');
    menuTopNav.setAttribute('aria-hidden', 'true');
  } else {
    // On desktop: show menu to screen readers and keyboard
    menuTopNav.removeAttribute('inert');
    menuTopNav.setAttribute('aria-hidden', 'false');
  }
}

// Handles click on nav links: closes menu on mobile
function handleNavLinkClick() {
  // If on mobile (breakpoint matches), close menu when a nav link is clicked
  if (breakpoint.matches) {
    menuTopNav.removeAttribute('data-open'); // Hide menu
    btnOpen.style.display = 'block'; // Show open button
    btnClose.style.display = 'none'; // Hide close button
    const logo = document.querySelector('.topnav__logo'); // Get logo
    if (logo) logo.classList.remove('logo--hidden'); // Show logo
    btnOpen.setAttribute('aria-expanded', 'false'); // Update ARIA
    btnClose.setAttribute('aria-expanded', 'false'); // Update ARIA
  }
}

// Initializes the app: sets up navigation and breakpoint listener
function initializeApp() {
  initializeNavigation(); // Set up navigation
  breakpoint.addEventListener('change', () => {
    setupTopNav(); // Update menu accessibility on screen size change
  });
  // No scroll event listener needed for minimal menu
}

// Start app for static pages
initializeApp();

// Trap focus within a container (menu) while open (for accessibility)
function trapFocus(container, onClose) {
  // Selectors for all focusable elements
  const focusableSelectors = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'];
  // Get all focusable elements in the container
  const focusableEls = container.querySelectorAll(focusableSelectors.join(','));
  if (!focusableEls.length) return;
  const firstEl = focusableEls[0]; // First focusable element
  const lastEl = focusableEls[focusableEls.length - 1]; // Last focusable element
  window.navigationTestState.focusTrapActive = true;
  // Handles keyboard navigation inside the menu
  function focusHandler(e) {
    // Tab key: cycle focus within menu
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
    // Arrow keys: move focus up/down between items
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = Array.from(container.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'));
      const idx = items.indexOf(document.activeElement);
      if (items.length) {
        let nextIdx = idx;
        if (e.key === 'ArrowDown') {
          nextIdx = (idx + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
          nextIdx = (idx - 1 + items.length) % items.length;
        }
        items[nextIdx].focus();
        e.preventDefault();
      }
    }
    // Escape key: close menu
    if (e.key === 'Escape') {
      if (typeof onClose === 'function') onClose();
      btnOpen.focus(); // Return focus to open button
    }
  }
  // Add keydown listener to container
  container.addEventListener('keydown', focusHandler);
  container.dataset.focusTrap = 'true';
  // Remove trap when menu closes
  function cleanupTrap() {
    container.removeEventListener('keydown', focusHandler);
    delete container.dataset.focusTrap;
    window.navigationTestState.focusTrapActive = false;
  }
  // Observe menu for aria-hidden change to clean up trap
  if (typeof onClose === 'function') {
    const observer = new MutationObserver(() => {
      if (container.getAttribute('aria-hidden') === 'true') {
        cleanupTrap();
        observer.disconnect();
      }
    });
    observer.observe(container, { attributes: true });
  }
}

// Handles Escape key globally to close menu
function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    if (btnOpen && btnOpen.style.display === 'none') {
      // If menu is open (open button hidden), close it
      menuTopNav.removeAttribute('data-open');
      btnOpen.style.display = 'block';
      btnClose.style.display = 'none';
      btnOpen.focus();
    }
  }
}
