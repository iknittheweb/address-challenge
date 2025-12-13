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
  btnOpen = document.querySelector('#btnOpen');
  btnClose = document.querySelector('#btnClose');
  menuTopNav = document.querySelector('#menuTopNav');
  main = document.querySelector('#main-content');
  footer = document.querySelector('footer');
  const overlay = document.getElementById('overlay');
  if (!btnOpen || !btnClose || !menuTopNav) return false;
  // Add all event listeners only after menuTopNav is defined
  // Focus trap inside menu when open
  menuTopNav.addEventListener('keydown', function (e) {
    if (btnOpen && btnOpen.style.display === 'none') {
      const focusable = menuTopNav.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
  });
  const logo = document.querySelector('.topnav__logo');
  // Set initial ARIA attributes
  btnOpen.setAttribute('aria-expanded', 'false');
  btnClose.setAttribute('aria-expanded', 'false');
  menuTopNav.setAttribute('aria-hidden', 'true');
  menuTopNav.setAttribute('inert', '');
  if (overlay) overlay.setAttribute('aria-hidden', 'true');
  // Open menu
  btnOpen.addEventListener('click', function () {
    menuTopNav.setAttribute('data-open', 'true');
    menuTopNav.removeAttribute('inert');
    menuTopNav.setAttribute('aria-hidden', 'false');
    btnOpen.style.display = 'none';
    btnClose.style.display = 'block';
    if (logo) logo.classList.add('logo--hidden');
    btnOpen.setAttribute('aria-expanded', 'true');
    btnClose.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
    if (typeof disableBodyScroll === 'function') disableBodyScroll(menuTopNav);
    announceToScreenReader('Menu opened');
    trapFocus(menuTopNav, closeMenu);
  });
  // Close menu
  function closeMenu() {
    menuTopNav.removeAttribute('data-open');
    menuTopNav.setAttribute('inert', '');
    menuTopNav.setAttribute('aria-hidden', 'true');
    btnOpen.style.display = 'block';
    btnClose.style.display = 'none';
    if (logo) logo.classList.remove('logo--hidden');
    btnOpen.setAttribute('aria-expanded', 'false');
    btnClose.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    if (typeof enableBodyScroll === 'function') enableBodyScroll(menuTopNav);
    btnOpen.focus();
    announceToScreenReader('Menu closed');
  }
  btnClose.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  // Set initial state
  menuTopNav.removeAttribute('data-open');
  btnOpen.style.display = 'block';
  btnClose.style.display = 'none';
  if (overlay) overlay.setAttribute('aria-hidden', 'true');
  // Remove any previous global keydown listeners, then add new one for Escape key
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keydown', function (e) {
    if (btnOpen.style.display === 'none' && e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  });
  // Add click listeners to each nav link to close menu on mobile
  menuTopNav.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleNavLinkClick);
    link.addEventListener('click', handleNavLinkClick);
  });
  // Set up accessibility attributes for menu (inert, aria-hidden)
  setupTopNav();
  navigationInitialized = true;
  window.navigationTestState.initialized = true;
  return true;
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
