/**
 * COMPONENT INJECTION SYSTEM
 *
 * This file creates reusable header and footer templates that get injected
 * into pages dynamically. This allows us to maintain headers/footers in one
 * place instead of copying HTML to every page.
 *
 * Used by: calculator.html and other component-based pages
 * Not used by: index.html (uses static HTML)
 */

// =============================================================================
// NAVIGATION CONFIGURATION
// =============================================================================

/**
 * Different navigation setups for different types of pages
 * Each config defines what links appear and where they go
 */
const NAV_CONFIGS = {
  // HOME PAGE: Links to internal sections and full portfolio
  home: {
    links: [
      { href: '#main-content', text: 'Home' }, // Jump to top of current page
      { href: '#about', text: 'About' }, // Jump to About section
      { href: '/src/pages/portfolio.html', text: 'Full Portfolio' }, // Go to portfolio page
      { href: '#contact', text: 'Contact' }, // Jump to Contact section
    ],
  },

  // PORTFOLIO PAGE: Similar to home but marks portfolio as current
  portfolio: {
    links: [
      { href: '/#main-content', text: 'Home' }, // Go back to home page
      { href: '/#about', text: 'About' }, // Go to About on home page
      {
        href: '/src/pages/portfolio.html',
        text: 'Full Portfolio',
        current: true, // Mark this as the current page
      },
      { href: '/#contact', text: 'Contact' }, // Go to Contact on home page
    ],
  },

  // PROJECT PAGES: Navigation for individual project pages (like calculator)
  project: {
    links: [
      { href: '/#main-content', text: 'Home' }, // Go back to home page
      { href: '/src/pages/portfolio.html', text: 'Full Portfolio' }, // Go to portfolio
      { href: '/#about', text: 'About' }, // Go to About on home page
      { href: '/#contact', text: 'Contact' }, // Go to Contact on home page
    ],
  },
};

// =============================================================================
// BREADCRUMB NAVIGATION
// =============================================================================

/**
 * Creates breadcrumb navigation (Home > Portfolio > Category > Current Page)
 * This helps users understand where they are in the site hierarchy
 *
 * @param {string} category - The category name (e.g., "Featured Projects")
 * @param {string} categoryUrl - URL to the category page
 * @param {string} currentPage - Name of the current page (e.g., "Calculator")
 * @returns {string} HTML string for breadcrumb navigation
 */
function createBreadcrumbs(category = '', categoryUrl = '', currentPage = '') {
  // If we don't have enough information, don't show breadcrumbs
  if (!category || !currentPage) {
    return ''; // Return empty string - no breadcrumbs will be shown
  }

  // Build the breadcrumb HTML structure
  return `
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <div class="wrapper">
        <ol class="breadcrumb-list">
          <!-- First breadcrumb: Always "Home" -->
          <li class="breadcrumb-item">
            <a href="/" class="breadcrumb-link">Home</a>
          </li>
          <!-- Second breadcrumb: Always "Portfolio" -->
          <li class="breadcrumb-item">
            <a href="/src/pages/portfolio.html" class="breadcrumb-link">Portfolio</a>
          </li>
          ${
            // Third breadcrumb: Category (optional - only if provided)
            category
              ? `
          <li class="breadcrumb-item">
            <a href="${categoryUrl}" class="breadcrumb-link">${category}</a>
          </li>
          `
              : ''
          }
          <!-- Final breadcrumb: Current page (not a link, just text) -->
          <li class="breadcrumb-item breadcrumb-current" aria-current="page">
            <span class="breadcrumb-text">${currentPage}</span>
          </li>
        </ol>
      </div>
    </nav>
  `;
}

// =============================================================================
// HEADER TEMPLATE CREATION
// =============================================================================

/**
 * Creates the complete header HTML with navigation, logo, and optional breadcrumbs
 * This is the main function that builds headers for component-injected pages
 *
 * @param {string} config - Which navigation config to use ('home', 'portfolio', 'project')
 * @param {string} pageTitle - Optional page title to display below header
 * @param {string} pageSubtitle - Optional subtitle to display
 * @param {object} breadcrumbData - Optional data for breadcrumb navigation
 * @returns {string} Complete header HTML
 */
function createHeader(
  config = 'home', // Default to home navigation
  pageTitle = '', // No title by default
  pageSubtitle = '', // No subtitle by default
  breadcrumbData = null // No breadcrumbs by default
) {
  // Get the navigation links for this page type
  const navLinks = NAV_CONFIGS[config];

  // Safety check: make sure the config exists
  if (!navLinks) {
    console.error('No nav links found for config:', config);
    return ''; // Return empty string if config is invalid
  }

  // Build and return the complete header HTML
  return `
    <!-- ACCESSIBILITY: Skip link lets keyboard users jump to main content -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header class="topnav">
      <!-- ACCESSIBILITY: Hidden heading for screen readers -->
      <h1 class="visually-hidden">I Knit The Web Header</h1>
      
      <div class="wrapper topnav__wrapper">
        <!-- LOGO: Clickable logo that goes to homepage -->
        <a href="/" class="topnav__homelink hover-fade">
          <img
            alt="I Knit The Web Homepage"
            class="topnav__logo"
            src="/src/img/branding/logo.png"
            width="250"
            height="250"
          />
        </a>
        
        <!-- NAVIGATION: Mobile hamburger menu system -->
        <nav class="topnav__nav" aria-label="Main navigation">
          <!-- ACCESSIBILITY: Hidden label for screen readers -->
          <span id="nav-label" hidden> Navigation </span>
          
          <!-- MOBILE: Dark overlay that appears behind open mobile menu -->
          <div id="overlay" class="topnav__overlay"></div>
          <!-- Button to open Mobile Menu -->
          <button
            id="btnOpen"
            class="topnav__open"
            aria-expanded="false"
            aria-labelledby="nav-label"
          >
            <img
              alt="Open menu"
              src="/src/img/icons/hamburger.svg"
              width="30"
              height="23"
            />
          </button>
          <!-- Mobile Menu -->
          <div
            id="menuTopNav"
            class="topnav__menu"
            role="dialog"
            aria-labelledby="nav-label"
          >
            <!-- Button to close Mobile Menu -->
            <button id="btnClose" class="topnav__close">
              <img
                alt="Close menu"
                src="/src/img/icons/close-button.svg"
                width="26"
                height="26"
              />
            </button>
            <ul class="topnav__links">
              ${navLinks.links
                .map(
                  (link) => `
                <li class="topnav__item">
                  <a class="topnav__link" href="${link.href}"${
                    link.current ? ' aria-current="page"' : ''
                  }>
                    ${link.text}
                  </a>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        </nav>
      </div>
    </header>
    
    ${
      breadcrumbData
        ? createBreadcrumbs(
            breadcrumbData.category,
            breadcrumbData.categoryUrl,
            breadcrumbData.currentPage
          )
        : ''
    }
    
    ${
      pageTitle
        ? `
    <!-- Page Header Section -->
    <div class="page-header">
      <div class="wrapper">
        <h1 class="page-header__title">${pageTitle}</h1>
        ${
          pageSubtitle
            ? `<p class="page-header__subtitle">${pageSubtitle}</p>`
            : ''
        }
      </div>
    </div>
    `
        : ''
    }
  `;
}

// Universal Footer Template
function createFooter() {
  return `
    <footer class="footer">
      <p class="footer__content">
        &copy; ${new Date().getFullYear()} I Knit The Web<br />All rights reserved
      </p>
    </footer>
  `;
}

// =============================================================================
// COMPONENT INJECTION FUNCTIONS
// =============================================================================

/**
 * Injects the header component into a page
 * This is called from pages like calculator.html to add the navigation
 *
 * @param {string} config - Navigation type ('home', 'portfolio', 'project')
 * @param {string} pageTitle - Optional page title
 * @param {string} pageSubtitle - Optional page subtitle
 * @param {object} breadcrumbData - Optional breadcrumb information
 */
function injectHeader(
  config = 'home', // Default navigation config
  pageTitle = '', // No title by default
  pageSubtitle = '', // No subtitle by default
  breadcrumbData = null // No breadcrumbs by default
) {
  console.log('🏠 injectHeader called with:', {
    config,
    pageTitle,
    pageSubtitle,
    breadcrumbData,
  });

  // STEP 1: Find where to inject the header
  // Look for a specific placeholder element, or use document body as fallback
  const headerContainer =
    document.getElementById('header-placeholder') || document.body;

  // STEP 2: Create the header HTML using our template
  const headerHTML = createHeader(
    config,
    pageTitle,
    pageSubtitle,
    breadcrumbData
  );

  // STEP 3: Inject the HTML into the page
  if (document.getElementById('header-placeholder')) {
    // If there's a specific placeholder, replace its contents
    headerContainer.innerHTML = headerHTML;
  } else {
    // If no placeholder, add header at the beginning of the body
    headerContainer.insertAdjacentHTML('afterbegin', headerHTML);
  }

  // Re-initialize navigation after header injection
  setTimeout(() => {
    if (window.initializeNavigation) {
      const success = window.initializeNavigation();
      if (!success) {
        // Retry if elements weren't ready
        setTimeout(() => {
          if (window.initializeNavigation) {
            window.initializeNavigation();
          }
        }, 100);
      }
    }
  }, 50);
}

function injectFooter() {
  const footerContainer =
    document.getElementById('footer-placeholder') || document.body;
  const footerHTML = createFooter();

  if (document.getElementById('footer-placeholder')) {
    footerContainer.innerHTML = footerHTML;
  } else {
    // Insert at the end of body if no placeholder
    footerContainer.insertAdjacentHTML('beforeend', footerHTML);
  }
}

// Auto-detection based on page context
// =============================================================================
// AUTO-DETECTION AND INJECTION
// =============================================================================

/**
 * Automatically detects page type and injects appropriate components
 * This is the main function called when component-based pages load
 * It figures out what kind of page it is and sets up the right navigation
 */
function autoInjectComponents() {
  console.log('🔄 autoInjectComponents called at:', new Date().toISOString());

  // STEP 1: Determine navigation type
  // First, check if the page explicitly tells us what navigation to use
  let config = document.body.dataset.navConfig || 'home';

  // If no explicit config, try to guess from the URL and page classes
  if (!document.body.dataset.navConfig) {
    const path = window.location.pathname; // Current page URL
    const bodyClass = document.body.className; // CSS classes on body element

    if (path.includes('portfolio') && !path.includes('portfolio-pages')) {
      config = 'portfolio'; // This is the main portfolio page
    } else if (
      path.includes('portfolio-pages') ||
      bodyClass.includes('project-page')
    ) {
      config = 'project'; // This is an individual project page
    }
    // If none of the above match, config stays 'home'
  }

  // STEP 2: Gather page information for header customization
  let pageTitle = ''; // Title to show in page header
  let pageSubtitle = ''; // Subtitle to show under title
  let breadcrumbData = null; // Data for breadcrumb navigation

  // Try to get page title from the HTML <title> element
  const titleElement = document.querySelector('title');
  if (titleElement) {
    // Remove the site suffix to get just the page name
    pageTitle = titleElement.textContent.replace(' - I Knit The Web', '');
  }

  // Look for page data stored in HTML data attributes
  // Pages like calculator.html put info in a hidden div with data attributes
  const pageData = document.querySelector('[data-page-title]');
  if (pageData) {
    // Use the explicit page data if available (overrides title element)
    pageTitle = pageData.dataset.pageTitle;
    pageSubtitle = pageData.dataset.pageSubtitle;

    // STEP 3: Set up breadcrumbs for project pages
    // Only project pages get breadcrumbs (Home > Portfolio > Category > Current Page)
    if (config === 'project' && pageData.dataset.breadcrumbCategory) {
      breadcrumbData = {
        category: pageData.dataset.breadcrumbCategory, // e.g., "Featured Projects"
        categoryUrl:
          pageData.dataset.breadcrumbCategoryUrl || '/src/pages/portfolio.html',
        currentPage: pageTitle,
      };
    }
  }

  injectHeader(config, pageTitle, pageSubtitle, breadcrumbData);
  injectFooter();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInjectComponents);
} else {
  autoInjectComponents();
}

// Export for manual use
window.UIComponents = {
  injectHeader,
  injectFooter,
  autoInjectComponents,
};
