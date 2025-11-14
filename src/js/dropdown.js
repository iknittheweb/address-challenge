// dropdown.js
// Handles dropdown menu logic for portfolio and other sections
// dropdown.js (ES module)

function initializeDropdown() {
  const dropdownTitleGroup = document.querySelector('.dropdown__title-group');
  const dropdownContent = document.querySelector('.dropdown__content');
  if (window.dropdownInitialized) return;
  window.dropdownInitialized = true;
  if (dropdownTitleGroup) dropdownTitleGroup.setAttribute('data-cy', 'dropdown-trigger');
  if (dropdownContent) dropdownContent.setAttribute('data-cy', 'dropdown-content');
  // Expose dropdown state for Cypress
  window.dropdownTestState = {
    isOpen: false,
    focusTrapActive: false,
  };
  if (dropdownTitleGroup && dropdownContent) {
    // ARIA roles and relationships
    dropdownTitleGroup.setAttribute('role', 'button');
    dropdownTitleGroup.setAttribute('aria-controls', 'dropdown-content');
    dropdownTitleGroup.setAttribute('tabindex', '0');
    dropdownTitleGroup.setAttribute('id', 'dropdown-title-group');
    dropdownContent.setAttribute('role', 'menu');
    dropdownContent.setAttribute('id', 'dropdown-content');
    dropdownContent.setAttribute('aria-labelledby', 'dropdown-title-group');
    dropdownContent.setAttribute('aria-hidden', 'true');

    let lastTrigger = null;

    dropdownTitleGroup.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = dropdownContent.classList.contains('show');
      toggleDropdown();
      // Diagnostic: log after toggling
      setTimeout(() => {
        const nowOpen = dropdownContent.classList.contains('show');
      }, 0);
    });
    // Outside click-to-close logic
    document.addEventListener('click', function (e) {
      // Only act if dropdown is open
      if (!dropdownContent.classList.contains('show')) return;
      // If click is inside dropdown or trigger, do nothing
      if (dropdownContent.contains(e.target) || dropdownTitleGroup.contains(e.target)) return;
      // Otherwise, close dropdown
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
      // Arrow key navigation for dropdown menu
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && dropdownContent.classList.contains('show')) {
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
      const isOpen = dropdownContent.classList.contains('show');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }
    function openDropdown() {
      dropdownContent.classList.add('show');
      dropdownContent.setAttribute('aria-hidden', 'false');
      dropdownTitleGroup.classList.add('dropdown-open');
      dropdownTitleGroup.setAttribute('aria-expanded', 'true');
      lastTrigger = dropdownTitleGroup;
      trapFocus(dropdownContent, closeDropdown);
      window.dropdownTestState.isOpen = true;
      window.dropdownTestState.focusTrapActive = true;
      // Focus first item for keyboard users
      setTimeout(() => {
        const items = dropdownContent.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (items.length) {
          items[0].focus();
          items[0].setAttribute('data-cy', 'dropdown-first-item');
        }
        // Ensure dropdown is visible for Cypress tests
        dropdownContent.style.opacity = '1';
      }, 10);
    }
    function closeDropdown() {
      dropdownContent.classList.remove('show');
      dropdownContent.setAttribute('aria-hidden', 'true');
      dropdownTitleGroup.classList.remove('dropdown-open');
      dropdownTitleGroup.setAttribute('aria-expanded', 'false');
      // Reset dropdown visibility for Cypress tests
      dropdownContent.removeAttribute('style');
      window.dropdownTestState.isOpen = false;
      window.dropdownTestState.focusTrapActive = false;
      if (lastTrigger) lastTrigger.focus();
    }
  }

  // Trap focus within dropdown menu
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
