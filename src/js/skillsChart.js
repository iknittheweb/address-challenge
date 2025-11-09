// skillsChart.js
// Handles interactive skills chart functionality
// skillsChart.js (ES module)
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
  const skillsChart = document.getElementById('skills-chart');
  if (!skillsChart) return;
  const tabs = skillsChart.querySelectorAll('.skills-chart__tab');
  const categories = skillsChart.querySelectorAll('.skills-chart__category');
  const progressBars = skillsChart.querySelectorAll('.skills-chart__progress-fill');

  // ARIA roles for tablist, tab, tabpanel
  skillsChart.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', tab.classList.contains('skills-chart__tab--active') ? 'true' : 'false');
    tab.setAttribute('tabindex', tab.classList.contains('skills-chart__tab--active') ? '0' : '-1');
    tab.setAttribute('aria-controls', `skills-category-${index}`);
    categories[index].setAttribute('role', 'tabpanel');
    categories[index].setAttribute('id', `skills-category-${index}`);
    categories[index].setAttribute('aria-labelledby', tab.id || `skills-tab-${index}`);
    if (!tab.id) tab.id = `skills-tab-${index}`;
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
      activateTab(index);
    });
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(index);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (index + 1) % tabs.length;
        tabs[next].focus();
        activateTab(next);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (index - 1 + tabs.length) % tabs.length;
        tabs[prev].focus();
        activateTab(prev);
      }
    });
  });

  function activateTab(activeIndex) {
    tabs.forEach((tab, i) => {
      if (i === activeIndex) {
        tab.classList.add('skills-chart__tab--active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        tab.setAttribute('aria-expanded', 'true');
        categories[i].classList.add('skills-chart__category--active');
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
        tab.classList.remove('skills-chart__tab--active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        tab.setAttribute('aria-expanded', 'false');
        categories[i].classList.remove('skills-chart__category--active');
        categories[i].setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Intersection observer for progress bars
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
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
// Export for dynamic import compatibility
export function initializeDropdown() {
  // This stub is for dynamic import. Real logic is already executed on load.
}
// adding a comment to test
