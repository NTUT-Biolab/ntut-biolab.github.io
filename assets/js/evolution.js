(function () {
  const root = document.querySelector('.evo');
  const dataEl = document.getElementById('evo-data');
  if (!root || !dataEl) return;

  const data = JSON.parse(dataEl.textContent);
  const en = root.dataset.lang === 'en';
  const topics = data.topics;
  const chart = root.querySelector('.evo-chart');
  const tip = root.querySelector('.evo-tip');
  const NS = 'http://www.w3.org/2000/svg';

  // ── Aggregate theses per academic year (ROC) and topic ──
  const byYear = new Map();
  data.years.forEach(([year, list]) => {
    const row = byYear.get(year) || Object.fromEntries(topics.map(t => [t.key, 0]));
    list.forEach(k => { row[k in row ? k : 'other']++; });
    byYear.set(year, row);
  });
  const years = [...byYear.keys()];
  const minY = Math.min(...years), maxY = Math.max(...years);
  const cols = [];
  for (let y = minY; y <= maxY; y++) {
    const row = byYear.get(y) || Object.fromEntries(topics.map(t => [t.key, 0]));
    cols.push({ year: y, row, total: topics.reduce((s, t) => s + row[t.key], 0) });
  }
  const peak = Math.max(...cols.map(c => c.total));

  const ayLabel = y => {
    const start = y + 1911, end = String((start + 1) % 100).padStart(2, '0');
    return en ? `AY ${start}–${end}` : `${y} 學年度（${start}–${end}）`;
  };
  const el = (name, attrs) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  // Bar segment with rounded top corners only (data end), square at the baseline side
  const topRounded = (x, y, w, h, r) => {
    r = Math.min(r, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  };

  function render() {
    const W = chart.clientWidth;
    if (!W) return;
    const H = W < 560 ? 220 : 300;
    const m = { t: 10, r: 4, b: 26, l: 26 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const step = 4, top = Math.ceil(peak / step) * step;
    const yPx = v => m.t + ih - (v / top) * ih;
    const band = iw / cols.length;
    const bw = Math.max(3, Math.min(band * 0.7, 28));
    const gap = 2;

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true' });

    // Recessive grid + y labels
    for (let v = 0; v <= top; v += step) {
      const y = yPx(v);
      svg.append(el('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: v === 0 ? 'evo-base' : 'evo-grid' }));
      const t = el('text', { x: m.l - 8, y: y + 4, class: 'evo-axis', 'text-anchor': 'end' });
      t.textContent = v;
      svg.append(t);
    }

    cols.forEach((c, i) => {
      const cx = m.l + band * i + band / 2;
      const x = cx - bw / 2;
      const g = el('g', { class: 'evo-col', style: `--i:${i};transform-origin:0 ${yPx(0)}px` });
      let acc = 0;
      const live = topics.filter(t => c.row[t.key] > 0);
      live.forEach((t, j) => {
        const v = c.row[t.key];
        const y0 = yPx(acc), y1 = yPx(acc + v);
        const h = Math.max(1, y0 - y1 - (j > 0 ? gap : 0));
        const yTop = y1;
        const isTop = j === live.length - 1;
        g.append(isTop
          ? el('path', { d: topRounded(x, yTop, bw, h, 4), class: `seg t-${t.key}` })
          : el('rect', { x, y: yTop, width: bw, height: h, class: `seg t-${t.key}` }));
        acc += v;
      });
      svg.append(g);

      // X labels: first year and every 5th calendar year
      const ad = c.year + 1911;
      if (i === 0 || ad % 5 === 0) {
        const t = el('text', { x: cx, y: H - 6, class: 'evo-axis', 'text-anchor': 'middle' });
        t.textContent = ad;
        svg.append(t);
      }

      // Hit target: the whole column, wider than the bar
      const hit = el('rect', { x: m.l + band * i, y: m.t, width: band, height: ih, class: 'evo-hit', 'data-i': i });
      svg.append(hit);
    });

    chart.replaceChildren(svg);
    bindHover(svg, cols, m.l, band);
  }

  function bindHover(svg, cols, left, band) {
    const show = (i, evt) => {
      const c = cols[i];
      svg.querySelectorAll('.evo-col').forEach((g, j) => g.classList.toggle('dim', j !== i));
      const rows = topics.filter(t => c.row[t.key] > 0)
        .reverse()
        .map(t => `<li><span class="evo-swatch" data-topic="${t.key}"></span>${t.label}<b>${c.row[t.key]}</b></li>`).join('');
      tip.innerHTML = `<strong>${ayLabel(c.year)}</strong><span class="evo-tip-total">${en ? `${c.total} ${c.total === 1 ? 'thesis' : 'theses'}` : `${c.total} 篇論文`}</span>${rows ? `<ul>${rows}</ul>` : ''}`;
      tip.hidden = false;
      const box = root.getBoundingClientRect();
      const chartBox = chart.getBoundingClientRect();
      let x = chartBox.left - box.left + left + band * (i + 0.5) + 14;
      const tw = tip.offsetWidth;
      if (x + tw > box.width - 8) x -= tw + 28;
      const y = evt && evt.clientY ? evt.clientY - box.top - tip.offsetHeight / 2 : chartBox.top - box.top + 20;
      tip.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
    };
    const hide = () => {
      tip.hidden = true;
      svg.querySelectorAll('.evo-col').forEach(g => g.classList.remove('dim'));
    };
    svg.querySelectorAll('.evo-hit').forEach(h => {
      h.addEventListener('pointermove', e => show(+h.dataset.i, e));
      h.addEventListener('pointerenter', e => show(+h.dataset.i, e));
    });
    svg.addEventListener('pointerleave', hide);
  }

  // ── Table view (accessible alternative to the chart) ──
  const table = document.createElement('table');
  table.className = 'evo-tbl';
  table.innerHTML = `<thead><tr><th scope="col">${en ? 'Academic year' : '學年度'}</th>${topics.map(t => `<th scope="col">${t.label}</th>`).join('')}<th scope="col">${en ? 'Total' : '合計'}</th></tr></thead><tbody>${
    cols.filter(c => c.total).reverse().map(c => `<tr><th scope="row">${ayLabel(c.year)}</th>${topics.map(t => `<td>${c.row[t.key] || '–'}</td>`).join('')}<td>${c.total}</td></tr>`).join('')
  }</tbody>`;
  root.querySelector('.evo-table-wrap').append(table);

  render();
  if ('ResizeObserver' in window) {
    let w = chart.clientWidth;
    new ResizeObserver(() => { if (chart.clientWidth !== w) { w = chart.clientWidth; render(); } }).observe(chart);
  }
})();
