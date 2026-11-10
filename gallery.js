(() => {
  const gallery = document.querySelector('.photo-gallery');
  if (!gallery) return;

  const track = gallery.querySelector('.photo-track');
  const slides = [...gallery.querySelectorAll('.photo-slide')];
  const controls = gallery.querySelector('.photo-controls');
  const previous = gallery.querySelector('[data-photo-previous]');
  const next = gallery.querySelector('[data-photo-next]');
  const counter = gallery.querySelector('[data-photo-current]');
  const total = gallery.querySelector('[data-photo-total]');
  const status = gallery.querySelector('[data-photo-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let settleTimer;

  function reflect(index, announce = true) {
    current = index;
    counter.textContent = String(index + 1);
    slides.forEach((slide, position) => {
      slide.setAttribute('aria-hidden', String(position !== index));
    });
    if (announce) {
      status.textContent = `Photo ${index + 1} of ${slides.length}.`;
    }
  }

  function show(index) {
    const destination = (index + slides.length) % slides.length;
    const wraps = Math.abs(destination - current) > 1;
    reflect(destination);
    track.scrollTo({
      left: slides[destination].offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion.matches || wraps ? 'auto' : 'smooth',
    });
  }

  function reflectScroll() {
    const index = Math.max(0, Math.min(slides.length - 1,
      Math.round(track.scrollLeft / track.clientWidth)));
    if (index !== current) reflect(index);
  }

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));

  gallery.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destinations = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    show(destinations[event.key]);
  });

  track.addEventListener('scroll', () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(reflectScroll, 150);
  }, { passive: true });

  // Keep the same photograph when the responsive layout changes width.
  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(settleTimer);
    track.scrollTo({
      left: slides[current].offsetLeft - slides[0].offsetLeft,
      behavior: 'auto',
    });
  });
  resizeObserver.observe(track);

  total.textContent = String(slides.length);
  slides.forEach((slide, index) => {
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
  });
  reflect(0, false);
  controls.hidden = false;
})();
