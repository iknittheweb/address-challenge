// navigation.js
import { disableBodyScroll, enableBodyScroll } from './bodyScrollLock.min.js';
// Handles navigation, mobile menu, header auto-hide, and accessibility
// navigation.js (ES module)
// Utility: Wait for DOM and CSS
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
const breakpoint = window.matchMedia('(width < 43.75em)');

function handleHeaderAutoHide() {
  const header = document.querySelector('.topnav');
  if (!header) return;
  const currentScrollY = window.scrollY;
  if (currentScrollY <= 10) {
    header.classList.remove('header-hidden');
    return;
  }
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    header.classList.add('header-hidden');
  } else if (currentScrollY < lastScrollY) {
    header.classList.remove('header-hidden');
  }
  lastScrollY = currentScrollY;
}

function onScroll() {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      handleHeaderAutoHide();
      isScrolling = false;
    });
    isScrolling = true;
  }
}

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
  btnOpen = document.querySelector('#btnOpen');
  btnClose = document.querySelector('#btnClose');
  menuTopNav = document.querySelector('#menuTopNav');
  overlay = document.querySelector('#overlay');
  main = document.querySelector('#main-content');
  footer = document.querySelector('footer');
  if (!btnOpen || !btnClose || !menuTopNav || !overlay) return false;
  btnOpen.removeEventListener('click', openMobileMenu);
  btnClose.removeEventListener('click', closeMobileMenu);
  btnOpen.addEventListener('click', openMobileMenu);
  btnClose.addEventListener('click', closeMobileMenu);
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keydown', handleGlobalKeydown);
  menuTopNav.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleNavLinkClick);
    link.addEventListener('click', handleNavLinkClick);
  });
  setupTopNav();
  navigationInitialized = true;
  if (!window.autoHideInitialized) {
    window.addEventListener('scroll', onScroll, { passive: true });
    lastScrollY = window.scrollY;
    window.autoHideInitialized = true;
  }
  return true;
}

function openMobileMenu() {
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay || !btnClose) return;
  if (btnOpen.hasAttribute('aria-disabled') || btnOpen.classList.contains('topnav__open--disabled')) return;
  btnOpen.setAttribute('aria-expanded', 'true');
  main.setAttribute('inert', '');
  footer.setAttribute('inert', '');
  menuTopNav.removeAttribute('inert');
  menuTopNav.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  menuTopNav.setAttribute('tabindex', '-1');
  menuTopNav.style.transitionDuration = '400ms';
  overlay.style.transitionDuration = '400ms';
  disableBodyScroll(menuTopNav);
  btnClose.focus();
  trapFocus(menuTopNav, closeMobileMenu);
  // Focus first nav link for keyboard users
  setTimeout(() => {
    const items = menuTopNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (items.length) items[0].focus();
  }, 10);
}

function handleNavLinkClick() {
  if (breakpoint.matches) closeMobileMenu();
}

function closeMobileMenu() {
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay) return;
  if (btnOpen.hasAttribute('aria-disabled') || btnOpen.classList.contains('topnav__open--disabled')) return;
  btnOpen.setAttribute('aria-expanded', 'false');
  main.removeAttribute('inert');
  footer.removeAttribute('inert');
  menuTopNav.setAttribute('inert', '');
  menuTopNav.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  enableBodyScroll(menuTopNav);
  setTimeout(() => {
    menuTopNav.removeAttribute('style');
    overlay.removeAttribute('style');
  }, 500);
}

function initializeApp() {
  initializeNavigation();
  breakpoint.addEventListener('change', () => {
    setupTopNav();
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  lastScrollY = window.scrollY;
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
