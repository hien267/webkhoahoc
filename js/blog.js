/**
 * EDUBLOG — Trang Bài viết:
 * - blog.html (<body data-page="blog" data-blog="list">): bài nổi bật + lưới thẻ, lọc chuyên mục (?cm=<id>), tìm kiếm không dấu.
 * - post.html?p=<slug> (data-blog="post"): hero xanh đậm, ảnh bìa lớn, nội dung, Mục lục bên phải (tô sáng mục đang đọc),
 *   thanh tiến độ đọc, nút Sao chép câu lệnh mẫu, chia sẻ, bài trước/sau, bài liên quan.
 * Phụ thuộc: js/blog-data.js (BLOG_POSTS, BLOG_CATEGORIES, BLOG_AUTHOR), js/store.js (escapeHtml, track).
 */
(function () {
  'use strict';

  const Store = window.EduStore;
  const esc = Store.escapeHtml;
  const $ = id => document.getElementById(id);
  let svgSeq = 0;

  const posts = BLOG_POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));

  function categoryOf(id) {
    return BLOG_CATEGORIES.find(c => c.id === id) || { id, label: 'Bài viết', icon: 'fa-newspaper' };
  }

  function postUrl(post) {
    return 'post.html?p=' + encodeURIComponent(post.slug);
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function stripTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  }

  function readMinutes(post) {
    const words = stripTags(post.content).trim().split(/\s+/).length;
    return Math.max(3, Math.round(words / 220));
  }

  function normalize(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }

  function slugify(str) {
    return normalize(str).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'muc';
  }

  // Ảnh bìa SVG: nền gradient theo màu bài + hoa văn chấm + hình minh họa riêng (post.art). id gradient không trùng giữa các thẻ.
  function coverSVG(post) {
    const n = ++svgSeq;
    const [c1, c2] = post.theme;
    return `
      <svg class="cover-svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ảnh minh họa: ${esc(post.title)}">
        <defs>
          <linearGradient id="bg-${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
          <pattern id="dot-${n}" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill="#fff" opacity=".2"/></pattern>
        </defs>
        <rect width="800" height="450" fill="url(#bg-${n})"/>
        <rect width="800" height="450" fill="url(#dot-${n})"/>
        <circle cx="720" cy="40" r="170" fill="#fff" opacity=".07"/>
        <circle cx="40" cy="440" r="130" fill="#fff" opacity=".06"/>
        ${post.art}
      </svg>`;
  }

  function cardHTML(post, featured) {
    const cat = categoryOf(post.category);
    return `
      <article class="blog-card${featured ? ' is-featured' : ''}">
        <a class="blog-card-media" href="${postUrl(post)}" tabindex="-1" aria-hidden="true">
          ${coverSVG(post)}
          <span class="blog-code">[${esc(post.code)}]</span>
        </a>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="blog-cat"><i class="fa-solid ${cat.icon}"></i> ${esc(cat.label)}</span>
            <span><i class="fa-regular fa-clock"></i> ${readMinutes(post)} phút đọc</span>
          </div>
          <h3 class="blog-card-title"><a href="${postUrl(post)}">[${esc(post.code)}] ${esc(post.title)}</a></h3>
          <p class="blog-card-excerpt">${esc(post.excerpt)}</p>
          <div class="blog-card-foot">
            <span><i class="fa-regular fa-calendar"></i> ${formatDate(post.date)}</span>
            <a href="${postUrl(post)}" class="blog-readmore">Đọc bài <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </article>`;
  }

  function bindCommon(root) {
    root.addEventListener('click', e => {
      const copyBtn = e.target.closest('[data-copy]');
      if (copyBtn) {
        const pre = copyBtn.closest('.prompt-box').querySelector('pre');
        copyText(pre.textContent.trim()).then(ok => {
          copyBtn.innerHTML = ok ? '<i class="fa-solid fa-check"></i> Đã chép' : '<i class="fa-solid fa-xmark"></i> Lỗi';
          copyBtn.classList.toggle('is-done', ok);
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Sao chép';
            copyBtn.classList.remove('is-done');
          }, 1800);
          if (ok) Store.track('blog_copy_prompt', { post: currentSlug() });
        });
        return;
      }
      if (e.target.closest('[data-open-ai]')) {
        const fab = $('ai-fab');
        if (fab && !fab.classList.contains('is-active')) fab.click();
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }

  function currentSlug() {
    return new URLSearchParams(location.search).get('p') || '';
  }

  // ==========================================
  // DANH MỤC BÀI VIẾT (blog.html)
  // ==========================================

  function initList() {
    const params = new URLSearchParams(location.search);
    const state = {
      cat: BLOG_CATEGORIES.some(c => c.id === params.get('cm')) ? params.get('cm') : 'all',
      q: ''
    };

    const filters = $('blog-filters');
    const counts = id => posts.filter(p => id === 'all' || p.category === id).length;
    filters.innerHTML = [{ id: 'all', label: 'Tất cả', icon: 'fa-grip' }].concat(BLOG_CATEGORIES).map(c => `
      <button type="button" class="blog-chip" data-cat="${c.id}" aria-pressed="false">
        <i class="fa-solid ${c.icon}"></i> ${esc(c.label)} <span>${counts(c.id)}</span>
      </button>`).join('');

    filters.addEventListener('click', e => {
      const chip = e.target.closest('[data-cat]');
      if (!chip) return;
      state.cat = chip.dataset.cat;
      const url = state.cat === 'all' ? 'blog.html' : 'blog.html?cm=' + state.cat;
      history.replaceState(null, '', url);
      render();
    });

    let timer;
    $('blog-search').addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.q = e.target.value; render(); }, 120);
    });

    function render() {
      filters.querySelectorAll('[data-cat]').forEach(btn => {
        const on = btn.dataset.cat === state.cat;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
      const q = normalize(state.q.trim());
      const list = posts.filter(p =>
        (state.cat === 'all' || p.category === state.cat) &&
        (!q || normalize([p.code, p.title, p.excerpt, p.tags.join(' ')].join(' ')).includes(q))
      );
      const grid = $('blog-grid');
      const showFeatured = state.cat === 'all' && !q && list.length > 2;
      grid.classList.toggle('has-featured', showFeatured);
      grid.innerHTML = list.length
        ? list.map((p, i) => cardHTML(p, showFeatured && i === 0)).join('')
        : `<div class="blog-empty"><i class="fa-regular fa-face-meh"></i><p>Chưa có bài viết phù hợp. Thầy/Cô thử từ khóa khác nhé!</p></div>`;
      $('blog-count').textContent = `${list.length} bài viết`;
    }

    render();
  }

  // ==========================================
  // CHI TIẾT BÀI VIẾT (post.html?p=<slug>)
  // ==========================================

  function initPost() {
    const slug = currentSlug();
    const idx = posts.findIndex(p => p.slug === slug);
    if (idx < 0) {
      $('post-hero-inner').innerHTML = `
        <nav class="post-crumbs" aria-label="Đường dẫn"><a href="index.html">Trang chủ</a><i class="fa-solid fa-chevron-right"></i><a href="blog.html">Bài viết</a></nav>
        <h1 class="post-title">Không tìm thấy bài viết</h1>
        <p class="post-excerpt">Đường dẫn có thể đã thay đổi. Mời Thầy/Cô quay lại danh mục để xem các bài mới nhất.</p>
        <a href="blog.html" class="btn btn-outline-white"><i class="fa-solid fa-arrow-left"></i> Về danh mục bài viết</a>`;
      $('post-body-wrap').hidden = true;
      return;
    }

    const post = posts[idx];
    const cat = categoryOf(post.category);
    document.title = `[${post.code}] ${post.title} — EduAI Teacher Hub`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

    $('post-hero-inner').innerHTML = `
      <nav class="post-crumbs" aria-label="Đường dẫn">
        <a href="index.html">Trang chủ</a><i class="fa-solid fa-chevron-right"></i>
        <a href="blog.html">Bài viết</a><i class="fa-solid fa-chevron-right"></i>
        <a href="blog.html?cm=${cat.id}">${esc(cat.label)}</a>
      </nav>
      <div class="post-badges">
        <span class="post-badge"><i class="fa-solid ${cat.icon}"></i> ${esc(cat.label)}</span>
        <span class="post-badge is-code">[${esc(post.code)}]</span>
        <span class="post-badge is-format"><i class="fa-regular fa-file-lines"></i> ${esc(post.format)}</span>
      </div>
      <h1 class="post-title">${esc(post.title)}</h1>
      <p class="post-excerpt">${esc(post.excerpt)}</p>
      <div class="post-meta">
        <span class="post-author"><span class="post-avatar">${esc(BLOG_AUTHOR.initials)}</span><span><strong>${esc(BLOG_AUTHOR.name)}</strong><small>${esc(BLOG_AUTHOR.role)}</small></span></span>
        <span><i class="fa-regular fa-calendar"></i> Đăng ngày ${formatDate(post.date)}</span>
        <span><i class="fa-regular fa-clock"></i> ${readMinutes(post)} phút đọc</span>
      </div>`;

    $('post-cover').innerHTML = coverSVG(post);

    const article = $('post-content');
    article.innerHTML = post.content;
    article.querySelectorAll('table').forEach(t => {
      if (!t.parentElement.classList.contains('table-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        t.replaceWith(wrap);
        wrap.appendChild(t);
      }
    });

    $('post-tags').innerHTML = post.tags.map(t => `<span class="post-tag">#${esc(t)}</span>`).join('');

    buildToc(article);
    renderShare(post);
    renderNeighbors(idx);
    renderRelated(post);
    initProgress(article);
    Store.track('blog_view', { post: post.slug });

    // Vào thẳng 1 mục (post.html?p=...#muc) → cuộn tới sau khi nội dung đã render
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) requestAnimationFrame(() => target.scrollIntoView());
    }
  }

  function buildToc(article) {
    const heads = Array.from(article.querySelectorAll('h2, h3'));
    const used = new Set();
    heads.forEach(h => {
      let id = slugify(h.textContent);
      while (used.has(id)) id += '-2';
      used.add(id);
      h.id = id;
    });

    const html = heads.length ? `<ol class="toc-list">${heads.map(h => `
      <li class="toc-${h.tagName.toLowerCase()}"><a href="#${h.id}" data-toc="${h.id}">${esc(h.textContent)}</a></li>`).join('')}</ol>` : '<p class="toc-empty">Bài viết ngắn, không có mục con.</p>';
    $('toc-desktop').innerHTML = html;
    $('toc-mobile').innerHTML = html;

    document.querySelectorAll('.toc-list').forEach(list => {
      list.addEventListener('click', e => {
        const a = e.target.closest('a[data-toc]');
        if (!a) return;
        e.preventDefault();
        const target = $(a.dataset.toc);
        if (!target) return;
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        history.replaceState(null, '', '#' + a.dataset.toc);
        const details = a.closest('details');
        if (details) details.open = false;
      });
    });

    if (!heads.length) return;
    const links = Array.from(document.querySelectorAll('[data-toc]'));
    const box = $('toc-desktop');
    let activeId = null;
    const setActive = id => {
      if (id === activeId) return;
      activeId = id;
      links.forEach(a => a.classList.toggle('is-active', a.dataset.toc === id));
      const active = box.querySelector('[data-toc].is-active');
      if (active && box.scrollHeight > box.clientHeight) {
        box.scrollTo({ top: Math.max(0, active.offsetTop - box.clientHeight / 2) });
      }
    };
    // Mục đang đọc = tiêu đề cuối cùng đã cuộn qua vạch đọc (khoảng 1/3 màn hình từ trên xuống)
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = Math.min(260, window.innerHeight * 0.35);
      let current = heads[0].id;
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActive(current);
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initProgress(article) {
    const bar = $('read-progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const pct = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      bar.style.transform = `scaleX(${pct})`;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function renderShare(post) {
    const box = $('post-share');
    const url = location.origin && location.origin !== 'null'
      ? location.origin + location.pathname + '?p=' + encodeURIComponent(post.slug)
      : location.href;
    box.innerHTML = `
      <span>Chia sẻ bài viết:</span>
      <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Chia sẻ lên Facebook"><i class="fa-brands fa-facebook-f"></i></a>
      <button type="button" class="share-btn" id="share-copy" aria-label="Sao chép liên kết"><i class="fa-solid fa-link"></i> <span>Sao chép liên kết</span></button>`;
    $('share-copy').addEventListener('click', () => {
      copyText(url).then(ok => {
        if (window.EduSite && EduSite.toast) EduSite.toast(ok ? 'Đã sao chép liên kết bài viết' : 'Không sao chép được, Thầy/Cô thử lại nhé', ok ? 'success' : 'error');
      });
    });
  }

  function renderNeighbors(idx) {
    const newer = posts[idx - 1];
    const older = posts[idx + 1];
    const link = (p, label, cls) => p ? `
      <a class="post-nav-link ${cls}" href="${postUrl(p)}">
        <small>${label}</small><strong>[${esc(p.code)}] ${esc(p.title)}</strong>
      </a>` : '<span></span>';
    $('post-nav').innerHTML = link(older, '<i class="fa-solid fa-arrow-left"></i> Bài trước', 'prev') + link(newer, 'Bài tiếp theo <i class="fa-solid fa-arrow-right"></i>', 'next');
  }

  function renderRelated(post) {
    const others = posts.filter(p => p.slug !== post.slug)
      .map(p => ({ p, score: (p.category === post.category ? 2 : 0) + p.tags.filter(t => post.tags.includes(t)).length }))
      .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
      .slice(0, 3)
      .map(x => x.p);
    $('related-grid').innerHTML = others.map(p => cardHTML(p, false)).join('');
  }

  function init() {
    const mode = document.body.dataset.blog;
    bindCommon(document.body);
    if (mode === 'list') initList();
    else if (mode === 'post') initPost();
  }

  init();
})();
