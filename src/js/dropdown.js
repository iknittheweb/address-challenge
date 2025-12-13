// -------------------------------------------------------------
// Dropdown Menu Handler (ES module)
// -------------------------------------------------------------
// Purpose: Handles dropdown menu logic for portfolio and other sections.
// Features:
//   - Keyboard and mouse interaction for dropdown menus
//   - ARIA accessibility roles and attributes
//   - Focus trapping for keyboard navigation
//   - Cypress test state exposure
// Usage:
initializeDropdown();
//   - ARIA accessibility
//   - Focus management
//   - Cypress testing hooks
// -------------------------------------------------------------

function initializeDropdown() {
  const dropdowns = document.querySelectorAll('.dropdown');
  if (window.dropdownInitialized) return;
  window.dropdownInitialized = true;
  window.dropdownTestState = { isOpen: false, focusTrapActive: false };
  dropdowns.forEach((dropdown, idx) => {
    const dropdownTitleGroup = dropdown.querySelector('.dropdown__title-group');
    const dropdownContent = dropdown.querySelector('.dropdown__content');
    if (!dropdownTitleGroup || !dropdownContent) return;
    // ARIA roles and relationships (unique IDs for test-friendliness)
    const titleId = dropdownTitleGroup.id || `dropdown-title-group-${idx}`;
    const contentId = dropdownContent.id || `dropdown-content-${idx}`;
    dropdownTitleGroup.setAttribute('role', 'button');
    dropdownTitleGroup.setAttribute('aria-controls', contentId);
    dropdownTitleGroup.setAttribute('tabindex', '0');
    dropdownTitleGroup.setAttribute('id', titleId);
    dropdownTitleGroup.setAttribute('aria-expanded', 'false');
    dropdownContent.setAttribute('role', 'menu');
    dropdownContent.setAttribute('id', contentId);
    dropdownContent.setAttribute('aria-labelledby', titleId);
    dropdownContent.setAttribute('aria-hidden', 'true');
    let lastTrigger = null;
    function openDropdown() {
      dropdownContent.classList.add('show');
      dropdownContent.setAttribute('aria-hidden', 'false');
      dropdownTitleGroup.classList.add('dropdown-open');
      dropdownTitleGroup.setAttribute('aria-expanded', 'true');
      lastTrigger = dropdownTitleGroup;
      trapFocus(dropdownContent, closeDropdown);
      window.dropdownTestState.isOpen = true;
      window.dropdownTestState.focusTrapActive = true;
      // Focus first item synchronously for test-friendliness
      const items = dropdownContent.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (items.length) {
        items[0].focus();
      }
    }
    function closeDropdown() {
      dropdownContent.classList.remove('show');
      dropdownContent.setAttribute('aria-hidden', 'true');
      dropdownTitleGroup.classList.remove('dropdown-open');
      dropdownTitleGroup.setAttribute('aria-expanded', 'false');
      window.dropdownTestState.isOpen = false;
      window.dropdownTestState.focusTrapActive = false;
      if (lastTrigger) lastTrigger.focus();
    }
    function toggleDropdown(forceOpen) {
      const isOpen = dropdownContent.classList.contains('show');
      if (forceOpen === true || !isOpen) {
        openDropdown();
      } else {
        closeDropdown();
      }
    }
    dropdownTitleGroup.addEventListener('click', () => {
      lastTrigger = document.activeElement;
      toggleDropdown();
    });
    dropdownTitleGroup.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastTrigger = document.activeElement;
        toggleDropdown();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      }
    });
    // Trap focus inside dropdown when open
    dropdownContent.addEventListener('keydown', (e) => {
      if (!dropdownContent.classList.contains('show')) return;
      if (e.key === 'Tab') {
        const focusable = dropdownContent.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
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
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      }
    });
  });

  // Trap focus within dropdown menu
  function trapFocus(container, onClose) {
    const focusableSelectors = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'];
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
      if (e.key === 'Escape') {
        if (typeof onClose === 'function') onClose();
      }
    }
    container.addEventListener('keydown', focusHandler);
    container.dataset.focusTrap = 'true';
    window.dropdownTestState.focusTrapActive = true;
    // Remove trap on close
    function cleanupTrap() {
      container.removeEventListener('keydown', focusHandler);
      delete container.dataset.focusTrap;
      window.dropdownTestState.focusTrapActive = false;
    }
    const observer = new MutationObserver(() => {
      if (container.getAttribute('aria-hidden') === 'true') {
        cleanupTrap();
        observer.disconnect();
      }
    });
    observer.observe(container, { attributes: true });
  }
}

export { initializeDropdown };
