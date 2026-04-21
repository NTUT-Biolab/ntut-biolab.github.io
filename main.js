(function () {
  // ── Nav active state ──
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  // ── Mobile bar + drawer ──
  const layout = document.querySelector('.layout');
  const sidebar = document.querySelector('.sidebar');

  const bar = document.createElement('div');
  bar.className = 'mobile-bar';
  bar.innerHTML =
    '<a href="index.html"><img src="images/logo.jpg" alt="NTUT"></a>' +
    '<button class="burger" aria-label="開啟選單">' +
    '<span></span><span></span><span></span>' +
    '</button>';
  layout.parentNode.insertBefore(bar, layout);

  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay';
  document.body.appendChild(overlay);

  function openDrawer() {
    const barH = bar.offsetHeight;
    sidebar.style.top = barH + 'px';
    sidebar.style.height = 'calc(100vh - ' + barH + 'px)';
    sidebar.classList.add('drawer-open');
    overlay.style.top = barH + 'px';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    sidebar.classList.remove('drawer-open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  bar.querySelector('.burger').addEventListener('click', () => {
    sidebar.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  sidebar.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // ── Wrap wide tables so they scroll horizontally on mobile ──
  document.querySelectorAll('.data-table, .alumni-table').forEach(table => {
    if (table.parentNode.classList.contains('table-scroll')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
})();
