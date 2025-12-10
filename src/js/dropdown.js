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
//   - Used on pages with interactive dropdown menus
// Key Concepts:
//   - Event listeners
//   - ARIA accessibility
//   - Focus management
//   - Cypress testing hooks
// -------------------------------------------------------------

function initializeDropdown() {
  const dropdowns = document.querySelectorAll('.dropdown');
  if (window.dropdownInitialized) return;
  window.dropdownInitialized = true;
  window.dropdownTestState = { isOpen: false, focusTrapActive: false };
  dropdowns.forEach((dropdown) => {
    const dropdownTitleGroup = dropdown.querySelector('.dropdown__title-group');
    const dropdownContent = dropdown.querySelector('.dropdown__content');
    if (!dropdownTitleGroup || !dropdownContent) return;
    dropdownTitleGroup.setAttribute('data-cy', 'dropdown-trigger');
    dropdownContent.setAttribute('data-cy', 'dropdown-content');
    // ARIA roles and relationships
    dropdownTitleGroup.setAttribute('role', 'button');
    dropdownTitleGroup.setAttribute('aria-controls', 'dropdown-content');
    dropdownTitleGroup.setAttribute('tabindex', '0');
    dropdownTitleGroup.setAttribute('id', 'dropdown-title-group');
    dropdownContent.setAttribute('role', 'menu');
    dropdownContent.setAttribute('id', 'dropdown-content');
    dropdownContent.setAttribute('aria-labelledby', 'dropdown-title-group');
    dropdownContent.setAttribute('aria-hidden', 'true');
    dropdownTitleGroup.setAttribute('data-open', 'false');
    dropdownContent.setAttribute('data-open', 'false');
    let lastTrigger = null;

    dropdownTitleGroup.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = dropdownContent.getAttribute('data-open') === 'true';
      toggleDropdown();
    });
    document.addEventListener('click', function (e) {
      if (dropdownContent.getAttribute('data-open') !== 'true') return;
      if (dropdownContent.contains(e.target) || dropdownTitleGroup.contains(e.target)) return;
      closeDropdown();
    });
    dropdownTitleGroup.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      if (e.key === 'Escape') {
        closeDropdown();
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && dropdownContent.getAttribute('data-open') === 'true') {
        e.preventDefault();
        const items = dropdownContent.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (items.length) {
          if (e.key === 'ArrowDown') {
            items[0].focus();
          } else {
            items[items.length - 1].focus();
          }
        }
      }
    });
    function toggleDropdown() {
      const isOpen = dropdownContent.getAttribute('data-open') === 'true';
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }
    function openDropdown() {
      dropdownContent.setAttribute('data-open', 'true');
      dropdownContent.setAttribute('aria-hidden', 'false');
      dropdownTitleGroup.setAttribute('data-open', 'true');
      dropdownTitleGroup.setAttribute('aria-expanded', 'true');
      lastTrigger = dropdownTitleGroup;
      trapFocus(dropdownContent, closeDropdown);
      window.dropdownTestState.isOpen = true;
      window.dropdownTestState.focusTrapActive = true;
      setTimeout(() => {
        const items = dropdownContent.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (items.length) {
          items[0].focus();
          items[0].setAttribute('data-cy', 'dropdown-first-item');
        }
        dropdownContent.style.opacity = '1';
      }, 10);
    }
    function closeDropdown() {
      dropdownContent.setAttribute('data-open', 'false');
      dropdownContent.setAttribute('aria-hidden', 'true');
      dropdownTitleGroup.setAttribute('data-open', 'false');
      dropdownTitleGroup.setAttribute('aria-expanded', 'false');
      dropdownContent.removeAttribute('style');
      window.dropdownTestState.isOpen = false;
      window.dropdownTestState.focusTrapActive = false;
      if (lastTrigger) lastTrigger.focus();
    }
  });

  // Trap focus within dropdown menu
  function trapFocus(container, onClose) {
    const focusableSelectors = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'];
    const focusableEls = container.querySelectorAll(focusableSelectors.join(','));
    if (!focusableEls.length) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    firstEl.setAttribute('data-cy', 'dropdown-first-item');
    lastEl.setAttribute('data-cy', 'dropdown-last-item');
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
      // Arrow key navigation inside dropdown
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
