/* AS6 V165 crossing-strip diagnostics. Diagnostic only. */
(function () {
  function styleOf(el) {
    const cs = getComputedStyle(el);
    const before = getComputedStyle(el, '::before');
    const after = getComputedStyle(el, '::after');
    const r = el.getBoundingClientRect();

    return {
      tag: el.tagName,
      id: el.id || '',
      className: String(el.className || ''),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      rect: {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      style: {
        position: cs.position,
        zIndex: cs.zIndex,
        display: cs.display,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage,
        borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
        boxShadow: cs.boxShadow,
        outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
        transform: cs.transform
      },
      before: {
        content: before.content,
        display: before.display,
        position: before.position,
        zIndex: before.zIndex,
        width: before.width,
        height: before.height,
        backgroundColor: before.backgroundColor,
        backgroundImage: before.backgroundImage,
        borderTop: `${before.borderTopWidth} ${before.borderTopStyle} ${before.borderTopColor}`,
        borderBottom: `${before.borderBottomWidth} ${before.borderBottomStyle} ${before.borderBottomColor}`,
        boxShadow: before.boxShadow
      },
      after: {
        content: after.content,
        display: after.display,
        position: after.position,
        zIndex: after.zIndex,
        width: after.width,
        height: after.height,
        backgroundColor: after.backgroundColor,
        backgroundImage: after.backgroundImage,
        borderTop: `${after.borderTopWidth} ${after.borderTopStyle} ${after.borderTopColor}`,
        borderBottom: `${after.borderBottomWidth} ${after.borderBottomStyle} ${after.borderBottomColor}`,
        boxShadow: after.boxShadow
      }
    };
  }

  window.AS6_SCAN_STRIP_Y = function (y) {
    const all = Array.from(document.querySelectorAll('*'));
    const crossing = all
      .map(styleOf)
      .filter(x => x.rect.width > 200 && x.rect.top <= y && x.rect.bottom >= y)
      .sort((a, b) => {
        const az = parseInt(a.style.zIndex || '0', 10) || 0;
        const bz = parseInt(b.style.zIndex || '0', 10) || 0;
        return (bz - az) || (a.rect.height - b.rect.height);
      });

    const result = {
      url: location.href,
      y,
      viewport: { width: innerWidth, height: innerHeight },
      timestamp: new Date().toISOString(),
      crossing
    };

    window.AS6_SCAN_STRIP_Y_RESULT = result;
    console.group('AS6_SCAN_STRIP_Y_RESULT');
    console.table(crossing.map((x, i) => ({
      n: i,
      tag: x.tag,
      id: x.id,
      className: x.className,
      top: x.rect.top,
      bottom: x.rect.bottom,
      width: x.rect.width,
      height: x.rect.height,
      z: x.style.zIndex,
      bg: x.style.backgroundImage,
      borderTop: x.style.borderTop,
      borderBottom: x.style.borderBottom,
      shadow: x.style.boxShadow,
      before: x.before.content,
      beforeBg: x.before.backgroundImage,
      after: x.after.content,
      afterBg: x.after.backgroundImage
    })));
    console.log(JSON.stringify(result, null, 2));
    console.groupEnd();

    return result;
  };

  console.info('AS6 V165 ready. Run: AS6_SCAN_STRIP_Y(905) or another Y coordinate.');
})();
