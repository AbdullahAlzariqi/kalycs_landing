// Mobile nav toggle and small helpers
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('primary-menu');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
})();

// Hero image animated swap for CTA buttons (chaos -> calm)
(function () {
  const wrap = document.querySelector('.hero__image-wrap');
  const ctaButtons = document.querySelectorAll('.hero .cta .btn');
  if (!wrap || !ctaButtons.length) return;

  // Preload calm image to avoid flicker
  const preload = new Image();
  preload.src = 'assets/hero_image_2.png';

  const onEnter = () => { wrap.classList.add('is-organizing'); };
  const onLeave = () => { wrap.classList.remove('is-organizing'); };

  ctaButtons.forEach((btn) => {
    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    // Improve keyboard accessibility
    btn.addEventListener('focus', onEnter);
    btn.addEventListener('blur', onLeave);
  });
})();

// Scroll-triggered navbar changes
(function () {
  const header = document.querySelector('.site-header');
  const pill = document.querySelector('.nav__pill');
  const logo = document.querySelector('.brand__logo');
  const nav = document.querySelector('.nav');
  
  if (!header || !pill || !logo || !nav) return;

  // Create and add buy now button (desktop/top-right)
  const buyButton = document.createElement('a');
  buyButton.href = '#buy';
  buyButton.className = 'btn btn--primary nav__buy-btn';
  buyButton.textContent = 'Buy Now';
  nav.appendChild(buyButton);

  // Direction-aware navbar state
  let lastY = window.scrollY;
  let collapsed = false; // collapsed => header has 'is-scrolled'
  const DELTA = 10; // minimal movement to toggle

  function setCollapsed(next) {
    if (collapsed === next) return;
    collapsed = next;
    header.classList.toggle('is-scrolled', collapsed);
  }

  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;

    // Always expand when near top
    if (y < 10) {
      setCollapsed(false);
      lastY = y;
      return;
    }

    // Collapse on downward intent, expand on slight upward intent
    if (dy > DELTA) {
      setCollapsed(true);
    } else if (dy < -DELTA) {
      setCollapsed(false);
    }

    lastY = y;
  }

  // rAF for smoothness
  let ticking = false;
  function onScrollRAF() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScrollRAF, { passive: true });

  // Also react to user intent even when window scrollY doesn't change
  window.addEventListener('wheel', (e) => {
    if (e.deltaY < -2) {
      setCollapsed(false);
    } else if (e.deltaY > 2 && window.scrollY > 10) {
      setCollapsed(true);
    }
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    const upKeys = ['ArrowUp', 'PageUp', 'Home'];
    const downKeys = ['ArrowDown', 'PageDown', 'End', ' '];
    if (upKeys.includes(e.key)) setCollapsed(false);
    if (downKeys.includes(e.key) && window.scrollY > 10) setCollapsed(true);
  });

  let touchStartY = null;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches && e.touches.length ? e.touches[0].clientY : null;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (touchStartY == null) return;
    const y = e.touches && e.touches.length ? e.touches[0].clientY : touchStartY;
    const dy = y - touchStartY; // finger downwards => positive dy
    if (dy > 8) setCollapsed(false);
    if (dy < -8 && window.scrollY > 10) setCollapsed(true);
  }, { passive: true });

  onScroll(); // Initial check
})();

// Features: rotate sample queries in the search demo
(function(){
  const input = document.querySelector('.feature-search input');
  if(!input) return;

  const phrases = [
    "What’s our plan?",
    "Summarize the Q3 report",
    "Find the invoice for Acme",
    "Show tasks due this week"
  ];
  let i = 0;

  setInterval(()=>{
    i = (i + 1) % phrases.length;
    input.value = phrases[i];
  }, 3000);
})();

// Tutorials: lightweight carousel + YouTube thumb/link wiring
(function(){
  const carousels = document.querySelectorAll('.tutorials-section .t-carousel');
  if (!carousels.length) return;

  // Simple modal manager for YouTube videos
  function createVideoModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return null;
    const content = modal.querySelector('.video-content');
    const aspect = modal.querySelector('.video-aspect');
    const closeButtons = modal.querySelectorAll('[data-close="video-modal"]');
    let lastActive = null;

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      // Stop the video by clearing the iframe
      if (aspect) aspect.innerHTML = '';
      document.removeEventListener('keydown', onKey);
      if (lastActive && typeof lastActive.focus === 'function') {
        lastActive.focus();
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    function open({ id, title }) {
      if (!aspect || !id) return;
      lastActive = document.activeElement;
      const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      aspect.innerHTML = `<iframe src="${src}" title="${title || 'Video'}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      if (content) content.setAttribute('aria-label', title || 'Video player');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const closeBtn = modal.querySelector('.video-close');
      if (closeBtn) closeBtn.focus();
      // Bind ephemeral listeners
      document.addEventListener('keydown', onKey, { once: false });
    }

    // Static listeners
    closeButtons.forEach((btn) => btn.addEventListener('click', close));
    modal.addEventListener('click', (e) => {
      if (e.target && e.target.getAttribute('data-close') === 'video-modal') close();
    });

    return { open, close };
  }

  const videoModal = createVideoModal();

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector('.t-carousel-viewport');
    const track = carousel.querySelector('.t-carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.t-slide'));
    const prev = carousel.querySelector('.t-c-prev');
    const next = carousel.querySelector('.t-c-next');
    if (!viewport || !track || !slides.length) return;

    // Wire YouTube links and thumbnails when IDs are present
    slides.forEach((slide) => {
      const a = slide.querySelector('.t-video-thumb');
      const img = slide.querySelector('img');
      const card = slide.querySelector('.t-slide-card');
      if (!a || !img || !card) return;
      const id = ((a.getAttribute('data-video-id') || card.getAttribute('data-video-id') || '')).trim();

      if (id) {
        // Make entire card interactive and accessible
        card.classList.add('t-slide-card--clickable');
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

        // Update link target and thumbnail
        a.href = `https://www.youtube.com/watch?v=${id}`;
        img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

        function openFromSlide() {
          if (!videoModal) return;
          const titleEl = slide.querySelector('.t-slide-title');
          const title = titleEl ? titleEl.textContent.trim() : 'Video';
          videoModal.open({ id, title });
        }

        // Anchor click opens modal and doesn't bubble to card
        a.addEventListener('click', (e) => {
          if (!videoModal) return; // fallback: let link navigate
          e.preventDefault();
          e.stopPropagation();
          openFromSlide();
        });

        // Clicking anywhere on the card opens the modal
        card.addEventListener('click', (e) => {
          // If a nested actionable element (like a link) was clicked, let its handler run
          // The anchor handler above already stops propagation, so this is primarily for non-link areas
          openFromSlide();
        });

        // Keyboard support when card has focus
        card.addEventListener('keydown', (e) => {
          const isEnter = e.key === 'Enter';
          const isSpace = e.key === ' ' || e.key === 'Spacebar';
          if (isEnter || isSpace) {
            e.preventDefault();
            openFromSlide();
          }
        });
      }
    });

    function getStep() {
      if (slides.length < 1) return 0;
      const r0 = slides[0].getBoundingClientRect();
      const r1 = slides[1] ? slides[1].getBoundingClientRect() : r0;
      const gap = Math.max(0, r1.left - r0.right);
      return Math.round(r0.width + gap);
    }

    function updateArrows() {
      if (!prev || !next) return;
      const max = viewport.scrollWidth - viewport.clientWidth - 1;
      prev.disabled = viewport.scrollLeft <= 1;
      next.disabled = viewport.scrollLeft >= max;
    }

    function scrollByStep(dir) {
      const step = getStep() || viewport.clientWidth * 0.9;
      viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
      // Update arrows after animation frame
      requestAnimationFrame(() => setTimeout(updateArrows, 220));
    }

    prev && prev.addEventListener('click', () => scrollByStep(-1));
    next && next.addEventListener('click', () => scrollByStep(1));
    viewport.addEventListener('scroll', () => { requestAnimationFrame(updateArrows); }, { passive: true });

    // Keyboard nav on focused viewport
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByStep(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByStep(1); }
    });

    // Initial state
    updateArrows();
    window.addEventListener('resize', () => requestAnimationFrame(updateArrows));
  });
})();
