// -------------------------------------------------------------
// Skills Chart Handler (ES module)
// -------------------------------------------------------------
// Purpose: Handles interactive skills chart functionality for portfolio pages.
// Features:
//   - Tabbed navigation for skill categories
//   - Accessible ARIA roles and keyboard navigation
//   - Animated progress bars for skill levels
//   - Screen reader announcements for expanded sections
// Usage:
//   - Used on portfolio pages with interactive skills charts
// Key Concepts:
//   - Tablist accessibility
//   - ARIA roles and attributes
//   - Keyboard navigation
//   - Animated progress bars
// -------------------------------------------------------------
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
function initializeSkillsChart() {
  if (window.skillsChartInitialized) return;
  window.skillsChartInitialized = true;
  const skillsChart = document.getElementById('skills-chart');
  if (!skillsChart) {
    return;
  }
  const tabs = skillsChart.querySelectorAll('.skills-chart__tab');
  const categories = skillsChart.querySelectorAll('.skills-chart__category');
  const progressBars = skillsChart.querySelectorAll('.skills-chart__progress-fill');

  // ARIA roles for tablist, tab, tabpanel
  skillsChart.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', tab.getAttribute('data-active') === 'true' ? 'true' : 'false');
    tab.setAttribute('tabindex', tab.getAttribute('data-active') === 'true' ? '0' : '-1');
    tab.setAttribute('aria-controls', `skills-category-${index}`);
    categories[index].setAttribute('role', 'tabpanel');
    categories[index].setAttribute('id', `skills-category-${index}`);
    categories[index].setAttribute('aria-labelledby', tab.id || `skills-tab-${index}`);
    if (!tab.id) tab.id = `skills-tab-${index}`;
    // Set initial state
    tab.setAttribute('data-active', 'false');
    categories[index].setAttribute('data-active', 'false');
    categories[index].setAttribute('aria-hidden', 'true');
  });

  // ARIA for progress bars
  skillsChart.querySelectorAll('.skills-chart__progress-bar').forEach((bar) => {
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    const fill = bar.querySelector('.skills-chart__progress-fill');
    if (fill) {
      const level = fill.getAttribute('data-level');
      bar.setAttribute('aria-valuenow', level);
    }
  });

  // Tab click and keyboard navigation
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Toggle open/close for this tab, only one open at a time
      if (tab.getAttribute('data-active') === 'true') {
        closeAllTabs();
      } else {
        closeAllTabs();
        activateTab(index);
      }
    });
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (tab.getAttribute('data-active') === 'true') {
          closeAllTabs();
        } else {
          closeAllTabs();
          activateTab(index);
        }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (index + 1) % tabs.length;
        tabs[next].focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (index - 1 + tabs.length) % tabs.length;
        tabs[prev].focus();
      }
    });
  });

  // Close all tabs when clicking outside the skills chart
  document.addEventListener('click', function (e) {
    if (!skillsChart.contains(e.target)) {
      closeAllTabs();
    }
  });

  function closeAllTabs() {
    tabs.forEach((tab, i) => {
      tab.setAttribute('data-active', 'false');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '0');
      tab.setAttribute('aria-expanded', 'false');
      categories[i].setAttribute('data-active', 'false');
      categories[i].setAttribute('aria-hidden', 'true');
    });
  }

  function activateTab(activeIndex) {
    tabs.forEach((tab, i) => {
      if (i === activeIndex) {
        tab.setAttribute('data-active', 'true');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('aria-expanded', 'true');
        categories[i].setAttribute('data-active', 'true');
        categories[i].setAttribute('aria-hidden', 'false');
        announceToScreenReader(`${tab.querySelector('.skills-chart__tab-text').textContent} section expanded`);
        // Animate progress bars
        const progressBars = categories[i].querySelectorAll('.skills-chart__progress-bar[role="progressbar"]');
        progressBars.forEach((bar) => {
          const fill = bar.querySelector('.skills-chart__progress-fill');
          const level = fill.getAttribute('data-level');
          bar.setAttribute('aria-valuenow', level);
        });
        const activeBars = categories[i].querySelectorAll('.skills-chart__progress-fill');
        setTimeout(() => {
          activeBars.forEach((bar) => {
            const level = bar.getAttribute('data-level');
            bar.style.width = level + '%';
          });
        }, 100);
      } else {
        tab.setAttribute('data-active', 'false');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('aria-expanded', 'false');
        categories[i].setAttribute('data-active', 'false');
        categories[i].setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Intersection observer for progress bars
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeBars = entry.target.querySelectorAll('.skills-chart__category--active .skills-chart__progress-fill');
          activeBars.forEach((bar) => {
            const level = bar.getAttribute('data-level');
            bar.style.width = level + '%';
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
  );
  observer.observe(skillsChart);
}
// Initialize on DOM ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeSkillsChart();
} else {
  document.addEventListener('DOMContentLoaded', initializeSkillsChart);
}

export { initializeSkillsChart };
