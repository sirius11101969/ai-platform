/* AS6 V160 pixel picker for real strip source. Diagnostic only. */
(function () {
  const PAGE_SELECTOR = '.command-center-page[data-command-center-visual="premium-as6"]';

  function compactStyle(el, pseudo) {
    const cs = window.getComputedStyle(el, pseudo || null);
    return {
      pseudo: pseudo || 'element',
      display: cs.display,
      position: cs.position,
      zIndex: cs.zIndex,
      width: cs.width,
      height: cs.height,
      opacity: cs.opacity,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      borderRight: `${cs.borderRightWidth} ${cs.borderRightStyle} ${cs.borderRightColor}`,
      borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
      borderLeft: `${cs.borderLeftWidth} ${cs.borderLeftStyle} ${cs.borderLeftColor}`,
      boxShadow: cs.boxShadow,
      outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
      transform: cs.transform,
      content: pseudo ? cs.content : ''
    };
  }

  function nodeInfo(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      id: el.id || '',
      className: String(el.className || ''),
      role: el.getAttribute('role') || '',
      aria: el.getAttribute('aria-label') || '',
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140),
      rect: {
        top: Math.round(r.top),
        left: Math.round(r.left),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      style: compactStyle(el),
      before: compactStyle(el, '::before'),
      after: compactStyle(el, '::after')
    };
  }

  function chainForPoint(x, y) {
    const original = [];
    let safety = 0;

    while (safety++ < 25) {
      const el = document.elementFromPoint(x, y);
      if (!el || original.includes(el)) break;
      original.push(el);

      const prev = el.style.pointerEvents;
      el.setAttribute('data-as6-v160-picked', String(safety));
      el.style.setProperty('pointer-events', 'none', 'important');

      if (el === document.documentElement || el === document.body) break;

      setTimeout(() => {
        if (prev) el.style.pointerEvents = prev;
        else el.style.removeProperty('pointer-events');
        el.removeAttribute('data-as6-v160-picked');
      }, 800);
    }

    return original.map(nodeInfo);
  }

  function scanHorizontalAtY(y) {
    const hits = [];
    const xs = [];
    for (let x = 260; x < window.innerWidth - 20; x += 80) xs.push(x);

    for (const x of xs) {
      const el = document.elementFromPoint(x, y);
      if (!el) continue;
      const info = nodeInfo(el);
      hits.push({ x, y, info });
    }

    const unique = [];
    const keys = new Set();
    for (const h of hits) {
      const key = `${h.info.tag}|${h.info.id}|${h.info.className}|${h.info.rect.top}|${h.info.rect.height}`;
      if (keys.has(key)) continue;
      keys.add(key);
      unique.push(h);
    }
    return unique;
  }

  window.AS6_PICK_STRIP = function (x, y) {
    const result = {
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      point: { x, y },
      elementChainAtPoint: chainForPoint(x, y),
      horizontalScanAtY: scanHorizontalAtY(y),
      timestamp: new Date().toISOString()
    };
    window.AS6_PICK_STRIP_RESULT = result;
    console.group('AS6_PICK_STRIP_RESULT');
    console.log(JSON.stringify(result, null, 2));
    console.groupEnd();
    return result;
  };

  window.addEventListener('click', function (event) {
    const page = document.querySelector(PAGE_SELECTOR);
    if (!page) return;
    if (!event.altKey) return;

    event.preventDefault();
    event.stopPropagation();

    const result = window.AS6_PICK_STRIP(event.clientX, event.clientY);
    console.log('AS6 ALT+CLICK STRIP PICKED. Copy AS6_PICK_STRIP_RESULT JSON above.', result);
  }, true);

  console.info('AS6 V160 ready. Use Alt+Click exactly on the strip OR run AS6_PICK_STRIP(x,y) in Console.');
})();
