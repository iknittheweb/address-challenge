/**
 * NAVIGATION SYSTEM
 * This file handles the mobile hamburger menu and responsive navigation
 * It works with both static pages (like home) and dynamic component-injected pages
 */

// =============================================================================
// CSS AND DOM READY UTILITIES
// =============================================================================

/**
 * Wait for both DOM and CSS to be fully loaded before initializing
 * This prevents layout thrashing and FOUC issues
 */
function waitForCSSAndDOM(callback) {
  function checkReady() {
    const domReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const cssReady = document.documentElement.classList.contains('css-loaded') || window.mainCSSLoaded;
    
    if (domReady && cssReady) {
      // Add small delay to ensure all rendering is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
    } else {
      requestAnimationFrame(checkReady);
    }
  }
  checkReady();
}

// =============================================================================
// ACCESSIBILITY HELPER FUNCTIONS
// =============================================================================

// Helper function to announce messages to screen readers
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove the announcement after a brief delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

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
// AUTO-HIDE HEADER FUNCTIONALITY
// =============================================================================

/**
 * Auto-hide header implementation
 * Hides header when scrolling down, shows when scrolling up or at top
 */
let lastScrollY = 0;
let isScrolling = false;

function handleHeaderAutoHide() {
  const header = document.querySelector('.topnav');
  if (!header) return;

  const currentScrollY = window.scrollY;
  
  // Always show header at the very top
  if (currentScrollY <= 10) {
    header.classList.remove('header-hidden');
    return;
  }
  
  // Hide when scrolling down, show when scrolling up
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    // Scrolling down - hide header
    header.classList.add('header-hidden');
  } else if (currentScrollY < lastScrollY) {
    // Scrolling up - show header
    header.classList.remove('header-hidden');
  }
  
  lastScrollY = currentScrollY;
}

/**
 * Throttled scroll handler for better performance
 */
function onScroll() {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      handleHeaderAutoHide();
      isScrolling = false;
    });
    isScrolling = true;
  }
}

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
  
  // Set up auto-hide header for this page if not already done
  if (!window.autoHideInitialized) {
    window.addEventListener('scroll', onScroll, { passive: true });
    lastScrollY = window.scrollY;
    window.autoHideInitialized = true;
  }
  
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
  
  // Initialize auto-hide header functionality
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Initialize scroll position
  lastScrollY = window.scrollY;
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
 * Set up dropdown menus once DOM and CSS are fully loaded
 * This is separate from navigation and handles expandable content sections
 */
waitForCSSAndDOM(function () {
  // Find dropdown elements (used on portfolio page for project categories)
  const dropdownTitleGroup = document.querySelector('.dropdown__title-group');
  const dropdownContent = document.querySelector('.dropdown__content');

  // Only set up dropdown if elements exist (not all pages have dropdowns)
  if (dropdownTitleGroup && dropdownContent) {
    
    // Click handler
    dropdownTitleGroup.addEventListener('click', function () {
      toggleDropdown();
    });
    
    // Keyboard handler
    dropdownTitleGroup.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      if (e.key === 'Escape') {
        closeDropdown();
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
      dropdownTitleGroup.classList.add('dropdown-open');
      dropdownTitleGroup.setAttribute('aria-expanded', 'true');
    }
    
    function closeDropdown() {
      dropdownContent.classList.remove('show');
      dropdownTitleGroup.classList.remove('dropdown-open');
      dropdownTitleGroup.setAttribute('aria-expanded', 'false');
      // Remove focus to prevent hover/focus styles from sticking
      dropdownTitleGroup.blur();
    }
  }
});

// =============================================================================
// CONTACT FORM VALIDATION
// =============================================================================

/**
 * Contact form validation and user feedback system
 * Provides real-time validation, accessible error messages, and form submission handling
 */
waitForCSSAndDOM(() => {
  const contactForm = document.querySelector('.contact__form');
  
  // Only initialize if contact form exists on the page
  if (!contactForm) return;

  // Get form elements
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const submitButton = contactForm.querySelector('.contact__submit');
  
  // Get error display elements
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  // Validation rules and error messages
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-'\.]+$/,
      messages: {
        required: 'Please tell me your name so I know how to address you!',
        minLength: 'Your name should be at least 2 characters long.',
        maxLength: 'Please keep your name under 100 characters.',
        pattern: 'Please use only letters, spaces, hyphens, apostrophes, and periods in your name.'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254,
      messages: {
        required: 'I need your email address to get back to you!',
        pattern: 'Please enter a valid email address (like: you@example.com).',
        maxLength: 'Please keep your email address under 254 characters.'
      }
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      messages: {
        required: 'Please share your project ideas or questions with me!',
        minLength: 'Could you tell me a bit more? At least 10 characters would be helpful.',
        maxLength: 'Please keep your message under 1000 characters for now. We can discuss details later!'
      }
    }
  };

  /**
   * Validates a single form field
   * @param {HTMLElement} input - The input element to validate
   * @param {string} fieldName - The field name in validationRules
   * @returns {boolean} - True if valid, false if invalid
   */
  function validateField(input, fieldName) {
    const rules = validationRules[fieldName];
    const value = input.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    // Clear previous error state
    clearFieldError(input, errorElement);
    
    // Required field check
    if (rules.required && !value) {
      showFieldError(input, errorElement, rules.messages.required);
      return false;
    }
    
    // Skip other validations if field is empty and not required
    if (!value) return true;
    
    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      showFieldError(input, errorElement, rules.messages.minLength);
      return false;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      showFieldError(input, errorElement, rules.messages.maxLength);
      return false;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      showFieldError(input, errorElement, rules.messages.pattern);
      return false;
    }
    
    // Field is valid
    showFieldSuccess(input);
    return true;
  }

  /**
   * Shows error state for a field
   */
  function showFieldError(input, errorElement, message) {
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('contact__input--error');
    errorElement.textContent = message;
    errorElement.classList.add('contact__error--visible');
  }

  /**
   * Shows success state for a field
   */
  function showFieldSuccess(input) {
    input.setAttribute('aria-invalid', 'false');
    input.classList.add('contact__input--valid');
    input.classList.remove('contact__input--error');
  }

  /**
   * Clears error/success state for a field
   */
  function clearFieldError(input, errorElement) {
    input.removeAttribute('aria-invalid');
    input.classList.remove('contact__input--error', 'contact__input--valid');
    errorElement.textContent = '';
    errorElement.classList.remove('contact__error--visible');
  }

  /**
   * Validates entire form
   * @returns {boolean} - True if all fields are valid
   */
  function validateForm() {
    const nameValid = validateField(nameInput, 'name');
    const emailValid = validateField(emailInput, 'email');
    const messageValid = validateField(messageInput, 'message');
    
    return nameValid && emailValid && messageValid;
  }

  /**
   * Handles form submission
   */
  function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    const isFormValid = validateForm();
    
    if (isFormValid) {
      // Show success message (since we don't have an API)
      showSubmissionSuccess();
    } else {
      // Focus first invalid field
      const firstInvalidField = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
  }

  /**
   * Shows success message after form validation passes
   */
  function showSubmissionSuccess() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'contact__success';
    successMessage.setAttribute('role', 'status');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.innerHTML = `
      <p><strong>Thank you for reaching out!</strong></p>
      <p>I've received your message and I'm excited to learn about your project. I'll get back to you within 24 hours to start our conversation!</p>
    `;
    
    // Insert success message before form
    contactForm.parentNode.insertBefore(successMessage, contactForm);
    
    // Hide form temporarily
    contactForm.style.display = 'none';
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Reset form after a moment
    setTimeout(() => {
      contactForm.reset();
      clearAllFieldStates();
      contactForm.style.display = 'block';
      successMessage.remove();
    }, 5000);
  }

  /**
   * Clears all field validation states
   */
  function clearAllFieldStates() {
    [nameInput, emailInput, messageInput].forEach(input => {
      const fieldName = input.name;
      const errorElement = document.getElementById(`${fieldName}-error`);
      clearFieldError(input, errorElement);
    });
  }

  // Event listeners for real-time validation
  nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
  emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
  messageInput.addEventListener('blur', () => validateField(messageInput, 'message'));
  
  // Clear errors when user starts typing
  nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('contact__input--error')) {
      clearFieldError(nameInput, nameError);
    }
  });
  
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('contact__input--error')) {
      clearFieldError(emailInput, emailError);
    }
  });
  
  messageInput.addEventListener('input', () => {
    if (messageInput.classList.contains('contact__input--error')) {
      clearFieldError(messageInput, messageError);
    }
  });

  // Form submission
  contactForm.addEventListener('submit', handleFormSubmit);
  
  // 🎯 SKILLS CHART FUNCTIONALITY (Easy removal: delete this section)
  initializeSkillsChart();
});

/*! =================================================================
 * 🎯 INTERACTIVE SKILLS CHART FUNCTIONALITY
 * =================================================================
 * EASY REMOVAL: Delete this entire section to remove skills chart
 * ================================================================= */
function initializeSkillsChart() {
  const skillsChart = document.getElementById('skills-chart');
  if (!skillsChart) return; // Exit if skills chart doesn't exist

  const tabs = skillsChart.querySelectorAll('.skills-chart__tab');
  const categories = skillsChart.querySelectorAll('.skills-chart__category');
  const progressBars = skillsChart.querySelectorAll('.skills-chart__progress-fill');

  // Dropdown toggle functionality - only one open at a time
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const isActive = tab.classList.contains('skills-chart__tab--active');
      const category = categories[index];
      
      if (isActive) {
        // Close the current dropdown
        tab.classList.remove('skills-chart__tab--active');
        tab.setAttribute('aria-expanded', 'false');
        category.classList.remove('skills-chart__category--active');
        
        // Announce to screen readers
        announceToScreenReader(`${tab.querySelector('.skills-chart__tab-text').textContent} section collapsed`);
        
        // Blur the tab to remove focus
        tab.blur();
      } else {
        // Close all other dropdowns first
        tabs.forEach((otherTab, otherIndex) => {
          otherTab.classList.remove('skills-chart__tab--active');
          otherTab.setAttribute('aria-expanded', 'false');
          categories[otherIndex].classList.remove('skills-chart__category--active');
        });
        
        // Open the clicked dropdown
        tab.classList.add('skills-chart__tab--active');
        tab.setAttribute('aria-expanded', 'true');
        category.classList.add('skills-chart__category--active');

        // Announce to screen readers
        announceToScreenReader(`${tab.querySelector('.skills-chart__tab-text').textContent} section expanded`);

        // Update progress bar ARIA values when opened
        const progressBars = category.querySelectorAll('.skills-chart__progress-bar[role="progressbar"]');
        progressBars.forEach(bar => {
          const fill = bar.querySelector('.skills-chart__progress-fill');
          const level = fill.getAttribute('data-level');
          bar.setAttribute('aria-valuenow', level);
        });

        // Animate progress bars in the active category
        const activeBars = category.querySelectorAll('.skills-chart__progress-fill');
        setTimeout(() => {
          activeBars.forEach(bar => {
            const level = bar.getAttribute('data-level');
            bar.style.width = level + '%';
          });
        }, 100);
      }
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // No initial progress bar animation needed since all tabs start closed

  // Intersection Observer for scroll-triggered animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger animations when skills chart comes into view
        const activeBars = entry.target.querySelectorAll('.skills-chart__category--active .skills-chart__progress-fill');
        activeBars.forEach(bar => {
          const level = bar.getAttribute('data-level');
          bar.style.width = level + '%';
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  observer.observe(skillsChart);
}
// 🎯 END SKILLS CHART FUNCTIONALITY
