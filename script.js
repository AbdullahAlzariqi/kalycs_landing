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
    document.body.classList.toggle('no-scroll', open);

  });
  // Close menu on link click
  menu.addEventListener('click', (e) => {
    const link = e.target && e.target.closest('a');
    if (!link) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  });

  // Ensure menu resets when resizing to desktop
  const MQ = 821;
  function syncMenuOnResize() {
    if (window.innerWidth >= MQ && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  }
  window.addEventListener('resize', syncMenuOnResize);
})();

// PostHog tracking events for Kalycs
/*
(function(){
  // Track button clicks
  document.addEventListener('DOMContentLoaded', function() {
    // Track hero CTA button clicks
    const heroCtaButtons = document.querySelectorAll('.hero .cta .btn');
    heroCtaButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        if (typeof posthog !== 'undefined') {
          posthog.capture('cta_clicked', {
            section: 'hero',
            button_text: buttonText,
            href: button.getAttribute('href')
          });
        }
      });
    });

    // Track navigation clicks
    const navLinks = document.querySelectorAll('.nav__links a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (typeof posthog !== 'undefined') {
          posthog.capture('nav_clicked', {
            section: link.textContent.trim(),
            href: link.getAttribute('href')
          });
        }
      });
    });

    // Track pricing button clicks
    const pricingButton = document.querySelector('.pricing__cta');
    if (pricingButton) {
      pricingButton.addEventListener('click', () => {
        if (typeof posthog !== 'undefined') {
          posthog.capture('pricing_clicked', {
            section: 'pricing',
            button_text: pricingButton.textContent.trim()
          });
        }
      });
    }

    // Track tutorial video views (when YouTube modals open)
    const videoThumbs = document.querySelectorAll('.t-video-thumb');
    videoThumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        const videoId = this.getAttribute('data-video-id');
        const slideCard = this.closest('.t-slide-card');
        const titleEl = slideCard ? slideCard.querySelector('.t-slide-title') : null;
        const title = titleEl ? titleEl.textContent.trim() : 'Unknown Tutorial';

        if (typeof posthog !== 'undefined') {
          posthog.capture('tutorial_video_opened', {
            video_id: videoId,
            title: title
          });
        }
      });
    });

    // Track section scrolls (when user views different sections)
    let currentSection = '';
    const sections = ['hero', 'preview', 'features', 'tutorials', 'buy', 'faqs'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (currentSection !== sectionId && sections.includes(sectionId)) {
            currentSection = sectionId;
            if (typeof posthog !== 'undefined') {
              posthog.capture('section_viewed', {
                section: sectionId
              });
            }
          }
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });
  });
})();
*/

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

    // Helpers to compute precise targets and indices
    const getTargetLeftForSlide = (slide) => {
      const vRect = viewport.getBoundingClientRect();
      const sRect = slide.getBoundingClientRect();
      return sRect.left - vRect.left + viewport.scrollLeft;
    };

    const getNearestIndex = () => {
      const current = viewport.scrollLeft;
      let best = 0;
      let bestDelta = Infinity;
      for (let i = 0; i < slides.length; i++) {
        const left = getTargetLeftForSlide(slides[i]);
        const d = Math.abs(left - current);
        if (d < bestDelta) { best = i; bestDelta = d; }
      }
      return best;
    };

    function updateArrows() {
      if (!prev || !next) return;
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const x = viewport.scrollLeft;
      const atStart = x <= 1;
      const atEnd = x >= (max - 1);
      prev.disabled = atStart;
      next.disabled = atEnd;
    }

    function scrollToIndex(nextIndex) {
      const i = Math.max(0, Math.min(slides.length - 1, nextIndex));
      const left = getTargetLeftForSlide(slides[i]);
      viewport.scrollTo({ left, behavior: 'smooth' });
      requestAnimationFrame(() => setTimeout(updateArrows, 250));
    }

    function step(dir) {
      const i = getNearestIndex();
      scrollToIndex(i + (dir < 0 ? -1 : 1));
    }

    prev && prev.addEventListener('click', () => step(-1));
    next && next.addEventListener('click', () => step(1));
    viewport.addEventListener('scroll', () => { requestAnimationFrame(updateArrows); }, { passive: true });

    // Keyboard nav on focused viewport
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });

    // Initial state
    updateArrows();
    window.addEventListener('resize', () => requestAnimationFrame(updateArrows));
  });
})();

// Contact modal + Netlify form submission
(function(){
  const contactLink = document.getElementById('contact-link') || document.querySelector('.footer__link[href="#contact"]');
  const modal = document.getElementById('contact-modal');
  if (!modal) return;

  const content = modal.querySelector('.contact-content');
  const closeButtons = modal.querySelectorAll('[data-close="contact-modal"]');
  const form = modal.querySelector('form[name="contact"]');
  const status = modal.querySelector('.contact-status');
  let lastActive = null;

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastActive && typeof lastActive.focus === 'function') {
      lastActive.focus();
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function open() {
    lastActive = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = modal.querySelector('#contact-name') || modal.querySelector('input, textarea, button');
    if (firstField) firstField.focus();
    document.addEventListener('keydown', onKey, { once: false });
  }

  // Wire open triggers
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }

  // Close behaviors
  closeButtons.forEach((btn) => btn.addEventListener('click', close));
  modal.addEventListener('click', (e) => {
    if (e.target && e.target.getAttribute('data-close') === 'contact-modal') close();
  });

  // Netlify AJAX submission to avoid page reload
  if (form) {
    form.addEventListener('submit', async (e) => {
      try {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (status) status.textContent = 'Sending…';
        if (submitBtn) submitBtn.disabled = true;

        const formData = new FormData(form);
        // Ensure form-name exists for Netlify parsing
        if (!formData.get('form-name') && form.getAttribute('name')) {
          formData.set('form-name', form.getAttribute('name'));
        }

        const body = new URLSearchParams(formData).toString();
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });

        if (!res.ok) throw new Error('Network error');

        if (typeof posthog !== 'undefined') {
          try { posthog.capture('contact_submitted'); } catch (_) {}
        }

        if (status) status.textContent = 'Thanks! Your message has been sent.';
        form.reset();
        // Optionally close after a delay
        setTimeout(() => { close(); if (status) status.textContent = ''; }, 1800);
      } catch (err) {
        if (status) status.textContent = 'Something went wrong. Please try again.';
        // Fallback: let Netlify handle full page POST if desired
        // setTimeout(() => form.submit(), 800);
      } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
