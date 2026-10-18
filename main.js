(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');

  // ── Theme toggle (preference kept per browser) ──
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = root.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ── Header shadow on scroll ──
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile menu ──
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menuBtn && nav) {
    const setOpen = open => {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
    });
  }

  // ── Reveal on scroll ──
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // ── Count-up stats ──
  const nums = document.querySelectorAll('[data-count]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / 1100, 1);
          el.firstChild.nodeValue = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: .6 });
    nums.forEach(el => io.observe(el));
  }

  // ── Alumni filter ──
  const table = document.querySelector('.alumni');
  if (table) {
    const input = document.querySelector('#alumni-search');
    const buttons = document.querySelectorAll('[data-degree]');
    const counter = document.querySelector('#alumni-count');
    const empty = document.querySelector('#alumni-empty');
    let degree = 'all';

    const apply = () => {
      const q = (input.value || '').trim().toLowerCase();
      let shown = 0;
      table.querySelectorAll('tbody').forEach(group => {
        let groupShown = 0;
        group.querySelectorAll('tr:not(.year-row)').forEach(row => {
          const ok = (degree === 'all' || row.dataset.deg === degree) &&
                     (!q || row.textContent.toLowerCase().includes(q) || group.dataset.year.includes(q));
          row.hidden = !ok;
          if (ok) groupShown++;
        });
        group.hidden = groupShown === 0;
        shown += groupShown;
      });
      counter.textContent = shown;
      empty.classList.toggle('show', shown === 0);
    };

    input.addEventListener('input', apply);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      degree = btn.dataset.degree;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      apply();
    }));
    apply();
  }

  // ── Lightbox ──
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const img = lightbox.querySelector('img');
    const cap = lightbox.querySelector('p');
    const close = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-lightbox]').forEach(btn => {
      btn.addEventListener('click', () => {
        img.src = btn.dataset.lightbox;
        img.alt = btn.dataset.caption || '';
        cap.textContent = btn.dataset.caption || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.icon-btn').focus();
      });
    });
    lightbox.addEventListener('click', e => { if (e.target !== img) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // ── Footer year ──
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
