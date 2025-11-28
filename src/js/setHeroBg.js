export async function setHeroBg() {
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

  // Default hero background logic
  // Background image is now set via CSS only for .hero.
  // Remove JS override to allow CSS to control image selection and fallback.

  // Alien Abduction Form page background logic
  const mainContent = document.getElementById('main-content');
  if (
    mainContent &&
    window.location.pathname.includes('alien-abduction-form')
  ) {
    let abductionUrl = '/dist/img/pages/galaxy.jpg';
    if (await supportsFormat('avif')) {
      abductionUrl = '/dist/img/pages/galaxy.avif';
    } else if (await supportsFormat('webp')) {
      abductionUrl = '/dist/img/pages/galaxy.webp';
    }
    mainContent.style.backgroundImage = `url('${abductionUrl}')`;
  }
}
