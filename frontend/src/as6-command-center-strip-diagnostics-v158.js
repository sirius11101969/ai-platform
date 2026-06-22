/* AS6 V158 strip source diagnostics. Diagnostic only. */
(function () {
  const PAGE_SELECTOR = '.command-center-page[data-command-center-visual="premium-as6"]';

  function cssSummary(el) {
    const cs = window.getComputedStyle(el);
    const before = window.getComputedStyle(el, '::before');
    const after = window.getComputedStyle(el, '::after');

    return {
      tag: el.tagName,
      id: el.id || '',
      className: String(el.className || ''),
      position: cs.position,
      zIndex: cs.zIndex,
      display: cs.display,
      width: cs.width,
      height: cs.height,
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      boxShadow: cs.boxShadow,
      beforeContent: before.content,
      beforeDisplay: before.display,
      beforeHeight: before.height,
      beforeBackground: before.backgroundImage !== 'none' ? before.backgroundImage : before.backgroundColor,
      beforeBorderTop: `${before.borderTopWidth} ${before.borderTopStyle} ${before.borderTopColor}`,
      beforeBorderBottom: `${before.borderBottomWidth} ${before.borderBottomStyle} ${before.borderBottomColor}`,
      beforeBoxShadow: before.boxShadow,
      afterContent: after.content,
      afterDisplay: after.display,
      afterHeight: after.height,
      afterBackground: after.backgroundImage !== 'none' ? after.backgroundImage : after.backgroundColor,
      afterBorderTop: `${after.borderTopWidth} ${after.borderTopStyle} ${after.borderTopColor}`,
      afterBorderBottom: `${after.borderBottomWidth} ${after.borderBottomStyle} ${after.borderBottomColor}`,
      afterBoxShadow: after.boxShadow
    };
  }

  function scan() {
    const page = document.querySelector(PAGE_SELECTOR);
    if (!page) return;

    const candidates = [];
    const nodes = Array.from(document.querySelectorAll('body, #root, .app-shell, .command-shell, .workspace, .command-center-page, .command-main-grid, .command-top-grid, .command-second-grid, .command-core, .command-right-rail, .command-card, .daily-goal, .pipeline-card, .employee-performance, .revenue-dynamics, .month-goals, .copilot-hero, *'));

    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (!r || r.width < window.innerWidth * 0.35) continue;

      const cs = window.getComputedStyle(el);
      const before = window.getComputedStyle(el, '::before');
      const after = window.getComputedStyle(el, '::after');

      const ownThin = r.height > 0 && r.height <= 14;
      const hasOwnVisual =
        cs.backgroundImage !== 'none' ||
        cs.boxShadow !== 'none' ||
        cs.borderTopWidth !== '0px' ||
        cs.borderBottomWidth !== '0px';

      const hasBeforeVisual =
        before.content !== 'none' &&
        before.display !== 'none' &&
        (
          before.backgroundImage !== 'none' ||
          before.boxShadow !== 'none' ||
          before.borderTopWidth !== '0px' ||
          before.borderBottomWidth !== '0px'
        );

      const hasAfterVisual =
        after.content !== 'none' &&
        after.display !== 'none' &&
        (
          after.backgroundImage !== 'none' ||
          after.boxShadow !== 'none' ||
          after.borderTopWidth !== '0px' ||
          after.borderBottomWidth !== '0px'
        );

      if (ownThin || hasBeforeVisual || hasAfterVisual || hasOwnVisual) {
        candidates.push({
          rect: {
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            left: Math.round(r.left),
            width: Math.round(r.width),
            height: Math.round(r.height)
          },
          css: cssSummary(el)
        });
      }
    }

    const sorted = candidates
      .filter(x => x.rect.top > 0 && x.rect.top < window.innerHeight)
      .sort((a, b) => {
        const aw = a.rect.width;
        const bw = b.rect.width;
        const ah = a.rect.height;
        const bh = b.rect.height;
        return (bw - aw) || (ah - bh);
      })
      .slice(0, 80);

    window.AS6_STRIP_DIAGNOSTICS_V158 = {
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      timestamp: new Date().toISOString(),
      candidates: sorted
    };

    console.group('AS6_STRIP_DIAGNOSTICS_V158');
    console.table(sorted.map((x, i) => ({
      n: i,
      top: x.rect.top,
      height: x.rect.height,
      width: x.rect.width,
      tag: x.css.tag,
      id: x.css.id,
      className: x.css.className,
      position: x.css.position,
      zIndex: x.css.zIndex,
      borderTop: x.css.borderTop,
      borderBottom: x.css.borderBottom,
      boxShadow: x.css.boxShadow,
      backgroundImage: x.css.backgroundImage
    })));
    console.log(JSON.stringify(window.AS6_STRIP_DIAGNOSTICS_V158, null, 2));
    console.groupEnd();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(scan, 1200));
  } else {
    setTimeout(scan, 1200);
  }

  window.addEventListener('load', () => setTimeout(scan, 1800));
})();
