// navigation.js
const bodyScrollLock = window.bodyScrollLock;
// Handles navigation, mobile menu, header auto-hide, and accessibility
// navigation.js (ES module)
// Utility: Wait for DOM and CSS
function waitForCSSAndDOM(callback) {
  function checkReady() {
    const domReady =
      document.readyState === 'complete' ||
      document.readyState === 'interactive';
    const cssReady =
      document.documentElement.classList.contains('css-loaded') ||
      window.mainCSSLoaded;
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

// Accessibility helper
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

// Navigation logic
let btnOpen, btnClose, menuTopNav, overlay, main, footer;
let lastScrollY = 0,
  isScrolling = false,
  navigationInitialized = false;

// Expose navigation state for Cypress tests
window.navigationTestState = {
  menuOpen: false,
  focusTrapActive: false,
  initialized: false,
};

// Replace all usage of disableBodyScroll/enableBodyScroll with bodyScrollLock.disableBodyScroll and bodyScrollLock.enableBodyScroll

const breakpoint = window.matchMedia('(width < 43.75em)');

function setupTopNav() {
  if (!menuTopNav) return;
  if (breakpoint.matches) {
    menuTopNav.setAttribute('inert', '');
    menuTopNav.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
  } else {
    menuTopNav.removeAttribute('inert');
    menuTopNav.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
  }
}

export function initializeNavigation() {
  console.log('Initializing navigation...');
  btnOpen = document.querySelector('#btnOpen');
  btnClose = document.querySelector('#btnClose');
  const toggleContainer = btnOpen?.closest('.topnav__toggle');
  menuTopNav = document.querySelector('#menuTopNav');
  overlay = document.querySelector('#overlay');
  main = document.querySelector('#main-content');
  footer = document.querySelector('footer');
  if (!btnOpen || !btnClose || !menuTopNav || !overlay) return false;
  // Remove existing open/close logic
  btnOpen.removeEventListener('click', openMobileMenu);
  btnClose.removeEventListener('click', closeMobileMenu);
  btnOpen.addEventListener('click', function () {
    menuTopNav.classList.add('menu--open');
    btnOpen.style.display = 'none';
    btnClose.style.display = 'block';
  });
  btnClose.addEventListener('click', function () {
    menuTopNav.classList.remove('menu--open');
    btnOpen.style.display = 'block';
    btnClose.style.display = 'none';
  });
  // Initial state: menu hidden, open button visible, close button hidden
  menuTopNav.classList.remove('menu--open');
  btnOpen.style.display = 'block';
  btnClose.style.display = 'none';
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keydown', handleGlobalKeydown);
  menuTopNav.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleNavLinkClick);
    link.addEventListener('click', handleNavLinkClick);
  });
  setupTopNav();
  navigationInitialized = true;
  window.navigationTestState.initialized = true;
  // Removed header auto-hide scroll logic
  return true;
}

function openMobileMenu() {
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay || !btnClose)
    return;
  // Removed all logic for aria/data/inert/logo hiding
  // This function is now handled by the new event listeners in initializeNavigation
}

function handleNavLinkClick() {
  if (breakpoint.matches) closeMobileMenu();
}

function closeMobileMenu() {
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay) return;
  // This function is now handled by the new event listeners in initializeNavigation
}

function initializeApp() {
  initializeNavigation();
  breakpoint.addEventListener('change', () => {
    setupTopNav();
  });
  // Removed scroll event listener and onScroll reference (no longer needed)
}

// Start app for static pages
initializeApp();

// Trap focus within a container (menu) while open
function trapFocus(container, onClose) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  const focusableEls = container.querySelectorAll(focusableSelectors.join(','));
  if (!focusableEls.length) return;
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];
  window.navigationTestState.focusTrapActive = true;
  function focusHandler(e) {
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
    // Arrow key navigation inside menu
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = Array.from(
        container.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
      );
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
    // Escape closes menu
    if (e.key === 'Escape') {
      if (typeof onClose === 'function') onClose();
      btnOpen.focus();
    }
  }
  container.addEventListener('keydown', focusHandler);
  container.dataset.focusTrap = 'true';
  // Remove trap on close
  function cleanupTrap() {
    container.removeEventListener('keydown', focusHandler);
    delete container.dataset.focusTrap;
    window.navigationTestState.focusTrapActive = false;
  }
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

// Handle Escape key globally for closing menu
function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    if (btnOpen && btnOpen.getAttribute('aria-expanded') === 'true') {
      closeMobileMenu();
      btnOpen.focus();
    }
  }
}
