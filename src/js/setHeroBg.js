// -------------------------------------------------------------
// Hero Background Image Handler (ES module)
// -------------------------------------------------------------
// Purpose: Dynamically sets the hero background image for special pages, using modern formats if supported.
// Features:
//   - Checks browser support for AVIF and WebP images
//   - Sets background image for Alien Abduction Form page
//   - Allows CSS to control default hero backgrounds
// Usage:
//   - Used on pages with dynamic hero backgrounds (e.g., alien-abduction-form)
// Key Concepts:
//   - Feature detection
//   - Progressive enhancement
//   - Async image format support
// -------------------------------------------------------------
export async function setHeroBg() {
  // Helper: Checks if browser supports a given image format
  function supportsFormat(format) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src =
        format === 'avif'
          ? 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFhdmlmAAACAGF2aWZtaWYx'
          : 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4TAYAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
    });
  }

  // Default hero background is set via CSS for .hero
  // JS override only for special pages

  // Alien Abduction Form page: set galaxy background in best format
  const mainContent = document.getElementById('main-content');
  if (mainContent && window.location.pathname.includes('alien-abduction-form')) {
    let abductionUrl = '/dist/img/pages/galaxy.jpg';
    if (await supportsFormat('avif')) {
      abductionUrl = '/dist/img/pages/galaxy.avif';
    } else if (await supportsFormat('webp')) {
      abductionUrl = '/dist/img/pages/galaxy.webp';
    }
    mainContent.style.backgroundImage = `url('${abductionUrl}')`;
  }
}
