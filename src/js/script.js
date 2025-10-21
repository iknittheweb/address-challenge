/**
 * NAVIGATION SYSTEM
 * This file handles the mobile hamburger menu and responsive navigation
 * It works with both static pages (like home) and dynamic component-injected pages
 */
// ------------------------------------------------------------
//     BEGINNER-FRIENDLY EXPLANATORY COMMENTS
// ------------------------------------------------------------
//     This file controls the navigation system for your website.
//     It manages the mobile hamburger menu, responsive navigation, and accessibility features.
//     It works for both static pages (like the homepage) and pages built from components.
//         @==================
//         @BOOKMARK: header
//         @==================
//     Header navigation and auto-hide logic are managed below.
//     Key concepts:
//     - Responsive navigation: Adapts menu for mobile and desktop users.
//     - Hamburger menu: Shows/hides navigation on small screens.
//     - Accessibility: Ensures navigation is usable for everyone, including screen readers.
//     - DOM/CSS readiness: Waits for the page and styles to fully load before running scripts.
// ------------------------------------------------------------

//     DEBUG: Test if script is loading
// Main entry for Vite. Import all modules and initialize Sentry.
import * as Sentry from '@sentry/browser';
import { initializeNavigation } from './navigation.js';
import * as bodyScrollLock from './bodyScrollLock.min.js';

// Initialize navigation (for static pages)
initializeNavigation();

// Dynamically import dropdown functionality only on portfolio page
if (document.body.classList.contains('portfolio')) {
  import('./dropdown.js').then((module) => {
    if (module.initializeDropdown) module.initializeDropdown();
  });
}

// Dynamically import contact form functionality only on contact page
if (document.body.classList.contains('contact')) {
  import('./contactForm.js').then((module) => {
    if (module.initializeContactForm) module.initializeContactForm();
  });
}

// Dynamically import skills chart functionality only if #skills-chart exists
if (document.getElementById('skills-chart')) {
  import('./skillsChart.js').then((module) => {
    if (module.initializeSkillsChart) module.initializeSkillsChart();
  });
}

// Sentry error tracking
Sentry.init({ dsn: 'https://a1fa50cd94e090dd1ef4446510f2ea55@o4510218279256064.ingest.us.sentry.io/4510218286006272' });

//     Initialize the app immediately for static pages
initializeApp();

// ;=============================================================================
//     DROPDOWN FUNCTIONALITY (for portfolio page)
// ;=============================================================================

// ------------------------------------------------------------
//     CSS AND DOM READY UTILITIES
// ------------------------------------------------------------

/**
 * Wait for both the DOM (HTML structure) and CSS (styles) to be fully loaded before running code.
 * This helps prevent layout issues and "flash of unstyled content" (FOUC).
 */
//     Example usage:
//     waitForCSSAndDOM(function() {
//       //     your code here
//     });
//     Example usage:
//     waitForCSSAndDOM(function() {
//       //     your code here
//     });
function waitForCSSAndDOM(callback) {
  function checkReady() {
    const domReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const cssReady = document.documentElement.classList.contains('css-loaded') || window.mainCSSLoaded;

    if (domReady && cssReady) {
      //     Add small delay to ensure all rendering is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(callback);
      });
    } else {
      requestAnimationFrame(checkReady);
    }
  }
  checkReady();
}

// ;=============================================================================
//     ACCESSIBILITY HELPER FUNCTIONS
// ;=============================================================================

//     Helper function to announce messages to screen readers
// ------------------------------------------------------------
//     ACCESSIBILITY HELPER FUNCTIONS
// ------------------------------------------------------------

/**
 * Helper function to announce messages to screen readers for accessibility.
 * Usage: announceToScreenReader('Menu opened');
 */
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  //     Remove the announcement after a brief delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ;=============================================================================
//     DOM ELEMENT REFERENCES
//     BOOKMARK: header
//     Auto-hide header logic.
// ;=============================================================================

//     Get references to main page sections (these stay constant)
const main = document.querySelector('#main-content'); //     Main content area
const footer = document.querySelector('footer'); //     Footer element

//     Get navigation elements (these might be injected dynamically, so we use 'let')
let btnOpen = document.querySelector('#btnOpen'); //     Hamburger menu button
let btnClose = document.querySelector('#btnClose'); //     Close menu button (X)
let menuTopNav = document.querySelector('#menuTopNav'); //     The mobile menu container
let overlay = document.querySelector('#overlay'); //     Dark overlay behind mobile menu

// ;=============================================================================
//     RESPONSIVE BREAKPOINT SETUP
// ;=============================================================================

//     Create a media query object to detect when we're in mobile view
//     43.75em = 700px - this matches our CSS breakpoints
const breakpoint = window.matchMedia('(width < 43.75em)');

//     Flag to prevent setting up navigation twice (important for component injection)
let navigationInitialized = false;

//     BOOKMARK: nav
//     Navigation accessibility setup.
// ;=============================================================================
//     AUTO-HIDE HEADER FUNCTIONALITY
// ;=============================================================================

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

  //     Always show header at the very top
  if (currentScrollY <= 10) {
    header.classList.remove('header-hidden');
    return;
  }

  //     Hide when scrolling down, show when scrolling up
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    //     Scrolling down - hide header
    header.classList.add('header-hidden');
  } else if (currentScrollY < lastScrollY) {
    //     Scrolling up - show header
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

// ;=============================================================================
//     NAVIGATION ACCESSIBILITY SETUP
// ;=============================================================================

/**
 * Sets up navigation accessibility based on current screen size
 * The 'inert' attribute prevents elements from being focusable or interactive
 */
const setupTopNav = () => {
  //     Safety check: make sure menu exists before trying to modify it
  if (!menuTopNav) return;

  if (breakpoint.matches) {
    //     MOBILE VIEW: Hide navigation from screen readers and keyboard users
    //     The mobile menu should be hidden by default until opened
    menuTopNav.setAttribute('inert', '');
  } else {
    //     DESKTOP VIEW: Make navigation accessible
    //     Desktop navigation should always be available
    menuTopNav.removeAttribute('inert');
  }
};

// ;=============================================================================
//     NAVIGATION INITIALIZATION (Can be called from external files)
// ;=============================================================================

/**
 * Main navigation setup function
 * This can be called from components.js after header injection
 * or immediately for static pages like the home page
 */
window.initializeNavigation = function () {
  //     STEP 1: Get fresh references to navigation elements
  //     This is important because elements might be injected dynamically
  btnOpen = document.querySelector('#btnOpen'); //     Hamburger button
  btnClose = document.querySelector('#btnClose'); //     Close (X) button
  menuTopNav = document.querySelector('#menuTopNav'); //     Mobile menu
  overlay = document.querySelector('#overlay'); //     Background overlay

  //     STEP 2: Safety check - make sure all elements exist
  //     If any are missing, return false so components.js can retry later
  if (!btnOpen || !btnClose || !menuTopNav || !overlay) {
    return false; //     Failed - elements not ready yet
  }

  //     STEP 3: Clean up any existing event listeners
  //     This prevents duplicate listeners if function is called multiple times
  if (btnOpen) btnOpen.removeEventListener('click', openMobileMenu);
  if (btnClose) btnClose.removeEventListener('click', closeMobileMenu);

  //     STEP 4: Set up the main menu buttons
  btnOpen.addEventListener('click', openMobileMenu); //     Open menu when hamburger clicked
  btnClose.addEventListener('click', closeMobileMenu); //     Close menu when X clicked

  //     STEP 5: Set up navigation links
  //     Each navigation link gets a click handler that intelligently closes mobile menu
  menuTopNav.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleNavLinkClick); //     Remove old listener
    link.addEventListener('click', handleNavLinkClick); //     Add new listener
  });

  //     STEP 6: Set up initial accessibility state
  setupTopNav();

  //     STEP 7: Mark as initialized and return success
  navigationInitialized = true;

  //     Set up auto-hide header for this page if not already done
  if (!window.autoHideInitialized) {
    window.addEventListener('scroll', onScroll, { passive: true });
    lastScrollY = window.scrollY;
    window.autoHideInitialized = true;
  }

  return true; //     Success - navigation is ready
};

// ;=============================================================================
//     APP INITIALIZATION (for static pages like home page)
// ;=============================================================================

/**
 * Initialize the app for pages with static navigation (like index.html)
 * For component-injected pages, initialization happens in components.js
 */
const initializeApp = () => {
  //     Try to set up navigation immediately
  //     This works for static pages where navigation HTML already exists
  window.initializeNavigation();

  //     Set up responsive behavior
  //     Listen for screen size changes (desktop ↔ mobile)
  breakpoint.addEventListener('change', () => {
    setupTopNav(); //     Update accessibility when screen size changes
  });

  //     Initialize auto-hide header functionality
  window.addEventListener('scroll', onScroll, { passive: true });

  //     Initialize scroll position
  lastScrollY = window.scrollY;
};

// ;=============================================================================
//     MOBILE MENU FUNCTIONS
// ;=============================================================================

/**
 * Opens the mobile hamburger menu
 * This function handles all the accessibility and visual changes needed
 */
function openMobileMenu() {
  //     Safety check: make sure all required elements exist
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay || !btnClose) return;

  //     STEP 1: Update ARIA attributes for screen readers
  btnOpen.setAttribute('aria-expanded', 'true'); //     Tell screen readers menu is open

  //     STEP 2: Hide main content from keyboard/screen reader access
  //     This forces focus to stay within the mobile menu
  main.setAttribute('inert', ''); //     Main content becomes non-interactive
  footer.setAttribute('inert', ''); //     Footer becomes non-interactive

  //     STEP 3: Make mobile menu accessible
  menuTopNav.removeAttribute('inert'); //     Menu becomes interactive

  //     STEP 4: Set up smooth animations
  menuTopNav.style.transitionDuration = '400ms'; //     Menu slide animation
  overlay.style.transitionDuration = '400ms'; //     Overlay fade animation

  //     STEP 5: Prevent body scrolling while menu is open (if library is loaded)
  if (window.bodyScrollLock) window.bodyScrollLock.disableBodyScroll(menuTopNav);

  //     STEP 6: Move keyboard focus to close button for accessibility
  btnClose.focus(); //     User can immediately press Enter to close menu
}

/**
 * Handles clicks on navigation links (About, Contact, Portfolio, etc.)
 * This is smart - it only closes the mobile menu when actually in mobile view
 */
function handleNavLinkClick() {
  //     Check current screen size using our media query
  if (breakpoint.matches) {
    //     MOBILE VIEW: User clicked a nav link, close the mobile menu
    closeMobileMenu();
  }
  //     DESKTOP VIEW: Do nothing - let the link work normally
  //     This prevents desktop navigation from being interfered with
}

/**
 * Closes the mobile hamburger menu
 * This reverses all the changes made by openMobileMenu()
 */
function closeMobileMenu() {
  //     Safety check: make sure all required elements exist
  if (!btnOpen || !main || !footer || !menuTopNav || !overlay) return;

  //     STEP 1: Update ARIA attributes for screen readers
  btnOpen.setAttribute('aria-expanded', 'false'); //     Tell screen readers menu is closed

  //     STEP 2: Restore accessibility to main content
  main.removeAttribute('inert'); //     Main content becomes interactive again
  footer.removeAttribute('inert'); //     Footer becomes interactive again

  //     STEP 3: Hide mobile menu from accessibility
  menuTopNav.setAttribute('inert', ''); //     Menu becomes non-interactive

  //     STEP 4: Re-enable body scrolling (if library is loaded)
  if (window.bodyScrollLock) window.bodyScrollLock.enableBodyScroll(menuTopNav);

  //     STEP 5: Clean up animations after menu closes
  //     We wait 500ms to let the close animation finish, then remove inline styles
  setTimeout(() => {
    menuTopNav.removeAttribute('style'); //     Remove animation duration
    overlay.removeAttribute('style'); //     Remove animation duration
  }, 500);

  //     NOTE: We don't call btnOpen.focus() here because it interferes with
  //     hash navigation (About/Contact links). The user's focus naturally
  //     goes where they clicked.
}

// ;=============================================================================
//     START THE APPLICATION
// ;=============================================================================

//     Initialize the app immediately for static pages
initializeApp();

// ;=============================================================================
//     DROPDOWN FUNCTIONALITY (for portfolio page)
// ;=============================================================================

/**
 * Set up dropdown menus once DOM and CSS are fully loaded
 * This is separate from navigation and handles expandable content sections
 */
waitForCSSAndDOM(function () {
  //     Find dropdown elements (used on portfolio page for project categories)
  const dropdownTitleGroup = document.querySelector('.dropdown__title-group');
  const dropdownContent = document.querySelector('.dropdown__content');

  //     Only set up dropdown if elements exist (not all pages have dropdowns)
  if (dropdownTitleGroup && dropdownContent) {
    //     Click handler
    dropdownTitleGroup.addEventListener('click', function () {
      toggleDropdown();
    });

    //     Keyboard handler
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
      //     Remove focus to prevent hover/focus styles from sticking
      dropdownTitleGroup.blur();
    }
  }
});

// ;=============================================================================
//     CONTACT FORM VALIDATION & SUBMISSION
// ;=============================================================================

/**
 * This section handles the contact form's validation, error feedback, and AJAX submission to Formspree.
 * It ensures users fill out the form correctly, provides helpful error messages, and sends the data without reloading the page.
 * All logic is wrapped in waitForCSSAndDOM to ensure the DOM and CSS are loaded before running.
 */
waitForCSSAndDOM(() => {
  //     Select the contact form by its class name
  const contactForm = document.querySelector('.contact__form');

  //     If the form isn't found (e.g., on other pages), exit early
  if (!contactForm) return;

  //     Get references to each input field
  const nameInput = document.getElementById('name'); //     User's name
  const emailInput = document.getElementById('email'); //     User's email
  const messageInput = document.getElementById('message'); //     User's message
  const submitButton = contactForm.querySelector('.contact__submit'); //     Submit button

  //     Get references to error message containers for each field
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  /**
   * Validation rules for each field, including requirements, patterns, and error messages.
   * These rules are used to check user input and display helpful feedback.
   */
  const validationRules = {
    name: {
      required: true, //     Must be filled in
      minLength: 2, //     At least 2 characters
      maxLength: 100, //     No more than 100 characters
      pattern: /^[a-zA-Z\s\-'.]+$/, //     Only letters, spaces, hyphens, apostrophes, periods
      messages: {
        required: 'Please tell me your name so I know how to address you!',
        minLength: 'Your name should be at least 2 characters long.',
        maxLength: 'Please keep your name under 100 characters.',
        pattern: 'Please use only letters, spaces, hyphens, apostrophes, and periods in your name.',
      },
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, //     Basic email format
      maxLength: 254,
      messages: {
        required: 'I need your email address to get back to you!',
        pattern: 'Please enter a valid email address (like: you@example.com).',
        maxLength: 'Please keep your email address under 254 characters.',
      },
    },
    message: {
      required: true,
      minLength: 10, //     At least 10 characters
      maxLength: 1000, //     No more than 1000 characters
      messages: {
        required: 'Please share your project ideas or questions with me!',
        minLength: 'Could you tell me a bit more? At least 10 characters would be helpful.',
        maxLength: 'Please keep your message under 1000 characters for now. We can discuss details later!',
      },
    },
  };

  /**
   * Validates a single form field based on its rules.
   * Shows error messages if invalid, or marks as valid if correct.
   * @param {HTMLElement} input - The input element to validate
   * @param {string} fieldName - The field name in validationRules
   * @returns {boolean} - True if valid, false if invalid
   */
  function validateField(input, fieldName) {
    const rules = validationRules[fieldName];
    const value = input.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);

    //     Remove any previous error or success state
    clearFieldError(input, errorElement);

    //     Check if field is required and empty
    if (rules.required && !value) {
      showFieldError(input, errorElement, rules.messages.required);
      return false;
    }

    //     If not required and empty, skip further checks
    if (!value) return true;

    //     Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
      showFieldError(input, errorElement, rules.messages.minLength);
      return false;
    }

    //     Check maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      showFieldError(input, errorElement, rules.messages.maxLength);
      return false;
    }

    //     Check pattern (e.g., valid email or name characters)
    if (rules.pattern && !rules.pattern.test(value)) {
      showFieldError(input, errorElement, rules.messages.pattern);
      return false;
    }

    //     If all checks pass, mark field as valid
    showFieldSuccess(input);
    return true;
  }

  /**
   * Shows error state for a field: highlights the input and displays a message.
   * @param {HTMLElement} input - The input field
   * @param {HTMLElement} errorElement - The error message container
   * @param {string} message - The error message to show
   */
  function showFieldError(input, errorElement, message) {
    input.setAttribute('aria-invalid', 'true'); //     Accessibility: mark as invalid
    input.classList.add('contact__input--error'); //     Add error styling
    errorElement.textContent = message; //     Show error message
    errorElement.classList.add('contact__error--visible'); //     Make error visible
  }

  /**
   * Shows success state for a field: highlights the input as valid.
   * @param {HTMLElement} input - The input field
   */
  function showFieldSuccess(input) {
    input.setAttribute('aria-invalid', 'false'); //     Accessibility: mark as valid
    input.classList.add('contact__input--valid'); //     Add valid styling
    input.classList.remove('contact__input--error'); //     Remove error styling
  }

  /**
   * Clears error and success state for a field, hiding any error message.
   * @param {HTMLElement} input - The input field
   * @param {HTMLElement} errorElement - The error message container
   */
  function clearFieldError(input, errorElement) {
    input.removeAttribute('aria-invalid'); //     Remove accessibility attribute
    input.classList.remove('contact__input--error', 'contact__input--valid'); //     Remove all styling
    errorElement.textContent = ''; //     Clear error message
    errorElement.classList.remove('contact__error--visible'); //     Hide error
  }

  /**
   * Validates the entire form by checking all fields.
   * @returns {boolean} - True if all fields are valid
   */
  function validateForm() {
    const nameValid = validateField(nameInput, 'name');
    const emailValid = validateField(emailInput, 'email');
    const messageValid = validateField(messageInput, 'message');

    //     Only return true if all fields are valid
    return nameValid && emailValid && messageValid;
  }

  /**
   * Handles form submission: validates fields, sends AJAX request to Formspree, and shows feedback.
   * Prevents default browser submission so we can handle everything in JavaScript.
   * @param {Event} event - The submit event
   */
  function handleFormSubmit(event) {
    event.preventDefault(); //     Stop browser from reloading the page

    //     Validate all fields before sending
    const isFormValid = validateForm();

    if (isFormValid) {
      //     Collect form data using FormData API
      const formData = new FormData(contactForm);

      //     Send the data to Formspree using fetch (AJAX)
      fetch('https://formspree.io/f/mpwyyeaa', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      })
        .then((response) => {
          //     If Formspree returns success, show thank you message
          if (response.ok) {
            showSubmissionSuccess();
          } else {
            //     If Formspree returns error, show error message
            return response.json().then((data) => {
              throw new Error(data.error || 'Submission failed. Please try again later.');
            });
          }
        })
        .catch((error) => {
          //     Network or server error: show error message
          showSubmissionError(error.message);
        });
    } else {
      //     If validation fails, focus the first invalid field for accessibility
      const firstInvalidField = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
  }

  /**
   * Shows a success message after the form is submitted and accepted by Formspree.
   * Hides the form, displays a thank you, then resets the form after a few seconds.
   */
  function showSubmissionSuccess() {
    //     Create a new div for the success message
    const successMessage = document.createElement('div');
    successMessage.className = 'contact__success';
    successMessage.setAttribute('role', 'status'); //     Accessibility: announce to screen readers
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.innerHTML = `
      <p><strong>Thank you for reaching out!</strong></p>
      <p>I've received your message and I'm excited to learn about your project. I'll get back to you within 24 hours to start our conversation!</p>
    `;

    //     Insert the success message before the form
    contactForm.parentNode.insertBefore(successMessage, contactForm);

    //     Hide the form so only the message is visible
    contactForm.style.display = 'none';

    //     Scroll to the success message for user visibility
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

    //     After 5 seconds, reset the form and remove the message
    setTimeout(() => {
      contactForm.reset(); //     Clear all fields
      clearAllFieldStates(); //     Remove validation states
      contactForm.style.display = 'block'; //     Show form again
      successMessage.remove(); //     Remove message
    }, 5000);
  }

  /**
   * Shows an error message if the form submission fails (network/server error).
   * Displays the error above the form and removes it after a few seconds.
   * @param {string} message - The error message to show
   */
  function showSubmissionError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'contact__error contact__error--visible';
    errorMessage.setAttribute('role', 'alert'); //     Accessibility: announce error
    errorMessage.setAttribute('aria-live', 'assertive');
    errorMessage.innerHTML = `<p><strong>Sorry, something went wrong:</strong></p><p>${message}</p>`;
    contactForm.parentNode.insertBefore(errorMessage, contactForm);
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      errorMessage.remove();
    }, 7000);
  }

  /**
   * Clears all validation states (errors/success) for all fields in the form.
   * Useful after resetting the form.
   */
  function clearAllFieldStates() {
    [nameInput, emailInput, messageInput].forEach((input) => {
      const fieldName = input.name;
      const errorElement = document.getElementById(`${fieldName}-error`);
      clearFieldError(input, errorElement);
    });
  }

  //     Add event listeners for real-time validation and error clearing

  //     Validate each field when it loses focus (blur)
  nameInput.addEventListener('blur', () => validateField(nameInput, 'name'));
  emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
  messageInput.addEventListener('blur', () => validateField(messageInput, 'message'));

  //     Clear error when user starts typing in a field
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

  //     When the form is submitted, run our custom handler
  contactForm.addEventListener('submit', handleFormSubmit);

  //     🎯 SKILLS CHART FUNCTIONALITY (Easy removal: delete this section)
  initializeSkillsChart();
});

/*! =================================================================
 * 🎯 INTERACTIVE SKILLS CHART FUNCTIONALITY
 * =================================================================
 * EASY REMOVAL: Delete this entire section to remove skills chart
 * ================================================================= */
function initializeSkillsChart() {
  const skillsChart = document.getElementById('skills-chart');
  if (!skillsChart) return; //     Exit if skills chart doesn't exist

  const tabs = skillsChart.querySelectorAll('.skills-chart__tab');
  const categories = skillsChart.querySelectorAll('.skills-chart__category');
  const progressBars = skillsChart.querySelectorAll('.skills-chart__progress-fill');

  //     Dropdown toggle functionality - only one open at a time
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const isActive = tab.classList.contains('skills-chart__tab--active');
      const category = categories[index];

      if (isActive) {
        //     Close the current dropdown
        tab.classList.remove('skills-chart__tab--active');
        tab.setAttribute('aria-expanded', 'false');
        category.classList.remove('skills-chart__category--active');

        //     Announce to screen readers
        announceToScreenReader(`${tab.querySelector('.skills-chart__tab-text').textContent} section collapsed`);

        //     Blur the tab to remove focus
        tab.blur();
      } else {
        //     Close all other dropdowns first
        tabs.forEach((otherTab, otherIndex) => {
          otherTab.classList.remove('skills-chart__tab--active');
          otherTab.setAttribute('aria-expanded', 'false');
          categories[otherIndex].classList.remove('skills-chart__category--active');
        });

        //     Open the clicked dropdown
        tab.classList.add('skills-chart__tab--active');
        tab.setAttribute('aria-expanded', 'true');
        category.classList.add('skills-chart__category--active');

        //     Announce to screen readers
        announceToScreenReader(`${tab.querySelector('.skills-chart__tab-text').textContent} section expanded`);

        //     Update progress bar ARIA values when opened
        const progressBars = category.querySelectorAll('.skills-chart__progress-bar[role="progressbar"]');
        progressBars.forEach((bar) => {
          const fill = bar.querySelector('.skills-chart__progress-fill');
          const level = fill.getAttribute('data-level');
          bar.setAttribute('aria-valuenow', level);
        });

        //     Animate progress bars in the active category
        const activeBars = category.querySelectorAll('.skills-chart__progress-fill');
        setTimeout(() => {
          activeBars.forEach((bar) => {
            const level = bar.getAttribute('data-level');
            bar.style.width = level + '%';
          });
        }, 100);
      }
    });

    //     Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  //     No initial progress bar animation needed since all tabs start closed

  //     Intersection Observer for scroll-triggered animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          //     Trigger animations when skills chart comes into view
          const activeBars = entry.target.querySelectorAll(
            '.skills-chart__category--active .skills-chart__progress-fill'
          );
          activeBars.forEach((bar) => {
            const level = bar.getAttribute('data-level');
            bar.style.width = level + '%';
          });
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  observer.observe(skillsChart);
}
//     🎯 END SKILLS CHART FUNCTIONALITY
