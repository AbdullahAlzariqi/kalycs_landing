// Client-side blog: index + post renderer (no server required)
(function(){
  const isIndex = !!document.getElementById('blog-list');
  const isPost = !!document.getElementById('blog-post');
  const MANIFEST_URL = './posts/index.json';

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      if (!isFinite(d)) return iso;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return iso; }
  }

  async function loadManifest() {
    const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load blog manifest');
    return await res.json();
  }

  function uniqueTags(posts) {
    const s = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => s.add((t||'').trim())));
    return Array.from(s).filter(Boolean).sort((a,b)=>a.localeCompare(b));
  }

  function getParams() {
    return new URLSearchParams(window.location.search || '');
  }

  function setParam(key, val) {
    const p = getParams();
    if (!val) p.delete(key); else p.set(key, val);
    const q = p.toString();
    const url = window.location.pathname + (q ? ('?' + q) : '');
    history.replaceState(null, '', url);
  }

  function createTagChip(tag, isActive) {
    const a = document.createElement('button');
    a.type = 'button';
    a.className = 'chip' + (isActive ? ' is-active' : '');
    a.textContent = tag;
    a.setAttribute('data-tag', tag);
    return a;
  }

  function renderPostCard(p) {
    const el = document.createElement('article');
    el.className = 'blog-card';
    const href = `post.html?slug=${encodeURIComponent(p.slug)}`;
    const img = p.image ? `<div class="blog-card__media"><img src="${p.image}" alt="" loading="lazy"></div>` : '';
    const tags = (p.tags || []).map(t => `<span class="chip" data-chip="tag">${t}</span>`).join('');
    el.innerHTML = `
      <a class="blog-card__wrap" href="${href}">
        ${img}
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <time datetime="${p.date}">${fmtDate(p.date)}</time>
          </div>
          <h3 class="blog-card__title">${p.title}</h3>
          ${p.excerpt ? `<p class="blog-card__excerpt">${p.excerpt}</p>` : ''}
          <div class="blog-card__tags">${tags}</div>
        </div>
      </a>
    `;
    return el;
  }

  async function initIndex() {
    const list = document.getElementById('blog-list');
    const empty = document.getElementById('blog-empty');
    const tagBar = document.getElementById('blog-tags');
    const search = document.getElementById('blog-search');

    try {
      const manifest = await loadManifest();
      manifest.sort((a,b) => (new Date(b.date)) - (new Date(a.date)));

      const params = getParams();
      const q0 = (params.get('q') || '').trim();
      const t0 = (params.get('tag') || '').trim();
      if (q0) search.value = q0;

      // Render tag chips
      const tags = uniqueTags(manifest);
      const allChip = createTagChip('All', !t0);
      allChip.addEventListener('click', () => { setParam('tag', ''); render(); });
      tagBar.appendChild(allChip);
      tags.forEach(tag => {
        const chip = createTagChip(tag, t0 && tag.toLowerCase() === t0.toLowerCase());
        chip.addEventListener('click', () => { setParam('tag', tag); render(); });
        tagBar.appendChild(chip);
      });

      function filterPosts() {
        const q = (search.value || '').trim().toLowerCase();
        const t = (getParams().get('tag') || '').toLowerCase();
        return manifest.filter(p => {
          const inTag = !t || (p.tags||[]).some(x => (x||'').toLowerCase() === t);
          if (!q) return inTag;
          const hay = `${p.title}\n${p.excerpt||''}\n${(p.tags||[]).join(' ')}`.toLowerCase();
          return inTag && hay.includes(q);
        });
      }

      function render() {
        // sync URL with search
        const q = (search.value || '').trim();
        setParam('q', q || '');

        // active tag styles
        const t = (getParams().get('tag') || '').toLowerCase();
        tagBar.querySelectorAll('.chip').forEach(ch => {
          const label = (ch.textContent || '').trim().toLowerCase();
          const active = (t ? label === t : label === 'all');
          ch.classList.toggle('is-active', active);
        });

        const posts = filterPosts();
        list.innerHTML = '';
        posts.forEach(p => list.appendChild(renderPostCard(p)));
        empty.style.display = posts.length ? 'none' : '';
      }

      search.addEventListener('input', render);
      render();
    } catch (err) {
      console.error(err);
      if (window.showToast) try { window.showToast('Failed to load blog.', { type: 'error' }); } catch(_){}
      const msg = document.createElement('p');
      msg.className = 'tiny muted';
      msg.textContent = 'Unable to load posts. If running locally, use a local server (fetch() is blocked on file://).';
      list && list.replaceChildren(msg);
    }
  }

  async function initPost() {
    const params = getParams();
    const slug = (params.get('slug') || '').trim();
    const elTitle = document.getElementById('post-title');
    const elDate = document.getElementById('post-date');
    const elTags = document.getElementById('post-tags');
    const elDot = document.getElementById('post-dot');
    const elRead = document.getElementById('post-read');
    const elDotRT = document.getElementById('post-dot-rt');
    const elHero = document.getElementById('post-hero');
    const elContent = document.getElementById('post-content');
    const elNav = document.getElementById('post-nav');
    const elError = document.getElementById('post-error');

    if (!slug) {
      elError.style.display = '';
      elTitle.textContent = 'Post not found';
      return;
    }

    try {
      const manifest = await loadManifest();
      manifest.sort((a,b) => (new Date(b.date)) - (new Date(a.date)));
      const meta = manifest.find(p => p.slug === slug);
      if (!meta) throw new Error('Missing post');

      // Meta + header
      document.title = `${meta.title} — Kalycs`;
      const t = document.getElementById('html-title'); if (t) t.textContent = `${meta.title} — Kalycs`;
      const d = document.getElementById('html-desc'); if (d) d.setAttribute('content', meta.excerpt || '');
      const ogt = document.getElementById('og-title'); if (ogt) ogt.setAttribute('content', meta.title || '');
      const ogd = document.getElementById('og-desc'); if (ogd) ogd.setAttribute('content', meta.excerpt || '');
      const ogi = document.getElementById('og-image'); if (ogi && meta.image) ogi.setAttribute('content', meta.image);

      elTitle.textContent = meta.title;
      elDate.textContent = fmtDate(meta.date);
      elDate.setAttribute('datetime', meta.date);
      elTags.innerHTML = (meta.tags||[]).map(t => `<a class="chip" href="./?tag=${encodeURIComponent(t)}">${t}</a>`).join('');
      if ((meta.tags||[]).length) elDot.style.display = '';
      if (meta.image) { elHero.src = meta.image; elHero.alt = ''; elHero.style.display = ''; }

      // Content
      const res = await fetch(`./posts/${encodeURIComponent(slug)}.html`, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load post content');
      const html = await res.text();
      elContent.innerHTML = html;

      // Estimate read time
      const text = (elContent.textContent || '').trim();
      const words = (text.match(/\S+/g) || []).length;
      const minutes = Math.max(1, Math.ceil(words / 220));
      if (elRead) {
        elRead.textContent = `${minutes} min read`;
        elRead.style.display = '';
        if (elDotRT) elDotRT.style.display = '';
      }

      // Prev/Next navigation
      if (elNav && Array.isArray(manifest) && manifest.length > 1) {
        const i = manifest.findIndex(p => p.slug === slug);
        const prev = manifest[i - 1];
        const next = manifest[i + 1];
        const makeCard = (p) => `
          <a class="blog-card" href="post.html?slug=${encodeURIComponent(p.slug)}">
            ${p.image ? `<div class=\"blog-card__media\"><img src=\"${p.image}\" alt=\"\" loading=\"lazy\"></div>` : ''}
            <div class="blog-card__body">
              <div class="blog-card__meta"><time datetime="${p.date}">${fmtDate(p.date)}</time></div>
              <h3 class="blog-card__title">${p.title}</h3>
            </div>
          </a>`;
        const items = [];
        if (prev) items.push(`<div class="post-nav__item"><div class="post-nav__label">Newer</div>${makeCard(prev)}</div>`);
        if (next) items.push(`<div class="post-nav__item"><div class="post-nav__label">Older</div>${makeCard(next)}</div>`);
        elNav.innerHTML = items.join('');
      }
    } catch (err) {
      console.error(err);
      elError.style.display = '';
      elTitle.textContent = 'Post not found';
      elContent.innerHTML = '';
      if (window.showToast) try { window.showToast('Failed to load post.', { type: 'error' }); } catch(_){}
    }
  }

  if (isIndex) initIndex();
  if (isPost) initPost();
})();
