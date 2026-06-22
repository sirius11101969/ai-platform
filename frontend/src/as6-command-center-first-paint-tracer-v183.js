(function () {
  if (location.pathname !== '/command-center') return;

  const startedAt = performance.now();
  const samples = [];

  function cssInfo(el, pseudo) {
    const s = getComputedStyle(el, pseudo);
    return {
      pseudo: pseudo || 'element',
      display: s.display,
      position: s.position,
      zIndex: s.zIndex,
      content: s.content,
      width: s.width,
      height: s.height,
      top: s.top,
      left: s.left,
      right: s.right,
      bottom: s.bottom,
      backgroundColor: s.backgroundColor,
      backgroundImage: s.backgroundImage,
      borderTop: s.borderTop,
      borderBottom: s.borderBottom,
      boxShadow: s.boxShadow,
      opacity: s.opacity,
      filter: s.filter,
      transform: s.transform,
      overflow: s.overflow
    };
  }

  function describe(el) {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      id: el.id || '',
      className: String(el.className || ''),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90),
      rect: {
        top: Math.round(r.top),
        left: Math.round(r.left),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      style: cssInfo(el, null),
      before: cssInfo(el, '::before'),
      after: cssInfo(el, '::after')
    };
  }

  function scan(label) {
    const yPoints = [70, 100, 130, 160, 190, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580, 620, 660];
    const xPoints = [80, Math.round(innerWidth * .25), Math.round(innerWidth * .5), Math.round(innerWidth * .75), innerWidth - 80];

    const hits = [];
    for (const y of yPoints) {
      for (const x of xPoints) {
        const stack = document.elementsFromPoint(x, y).slice(0, 12).map(describe);
        hits.push({ x, y, stack });
      }
    }

    const suspicious = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.width < innerWidth * .35) return;
      if (r.top > innerHeight || r.bottom < 0) return;

      const st = getComputedStyle(el);
      const b = getComputedStyle(el, '::before');
      const a = getComputedStyle(el, '::after');

      const thin = r.height <= 8;
      const visual =
        st.backgroundImage !== 'none' ||
        st.boxShadow !== 'none' ||
        st.borderTopWidth !== '0px' ||
        st.borderBottomWidth !== '0px' ||
        b.content !== 'none' ||
        a.content !== 'none';

      if (thin || visual) suspicious.push(describe(el));
    });

    samples.push({
      label,
      t: Math.round(performance.now() - startedAt),
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      hits,
      suspicious: suspicious.slice(0, 120)
    });

    window.AS6_FIRST_PAINT_FLASH_TRACE_V183 = samples;
    console.log('AS6_FIRST_PAINT_FLASH_TRACE_V183', samples);
  }

  scan('immediate');
  requestAnimationFrame(() => scan('raf1'));
  setTimeout(() => scan('t300'), 300);
  setTimeout(() => scan('t800'), 800);
  setTimeout(() => scan('t1500'), 1500);
  setTimeout(() => scan('t2500'), 2500);
  setTimeout(() => scan('t4000'), 4000);
})();
