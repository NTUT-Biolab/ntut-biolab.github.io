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

  // ── Hero network animation (home page) ──
  const hero = document.querySelector('.hero');
  if (hero && !reduce) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);
    hero.classList.add('has-canvas');
    const ctx = canvas.getContext('2d');
    const LINK = 150;
    let w = 0, h = 0, nodes = [], running = false, visible = true, raf = 0;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Denser on the right, behind the PI card; fewer nodes on small screens
      const count = Math.round(Math.min(90, w * h / 11000));
      nodes = Array.from({ length: count }, () => {
        const right = Math.random() < .7;
        return {
          x: right ? w * (.45 + Math.random() * .55) : Math.random() * w * .45,
          y: Math.random() * h,
          vx: (Math.random() - .5) * .25,
          vy: (Math.random() - .5) * .25,
          r: Math.random() < .2 ? 2.6 : 1.6,
        };
      });
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        // Gentle pull toward the pointer
        const dx = pointer.x - n.x, dy = pointer.y - n.y, d2 = dx * dx + dy * dy;
        if (d2 < 32000) { n.vx += dx * 8e-5; n.vy += dy * 8e-5; }
        n.vx *= .985; n.vy *= .985;
        const sp = Math.hypot(n.vx, n.vy);
        if (sp > .9) { n.vx *= .9 / sp; n.vy *= .9 / sp; }
        n.vx += (Math.random() - .5) * .01; n.vy += (Math.random() - .5) * .01;
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(95,211,218,${(1 - d / LINK) * .38})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(138,230,236,.85)';
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill(); }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    start();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(hero);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  // ── Subtle 3D tilt on research cards (mouse only) ──
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.research-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // ── Reading progress bar ──
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  let ticking = false;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  // ── Footer year ──
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
