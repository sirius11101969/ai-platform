(function () {
  if (location.pathname !== "/command-center") return;

  const started = performance.now();
  const samples = [];

  function style(el, pseudo) {
    const cs = getComputedStyle(el, pseudo || null);
    return {
      pseudo: pseudo || "element",
      content: cs.content,
      display: cs.display,
      position: cs.position,
      zIndex: cs.zIndex,
      top: cs.top,
      left: cs.left,
      right: cs.right,
      bottom: cs.bottom,
      width: cs.width,
      height: cs.height,
      background: cs.background,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      borderTop: cs.borderTop,
      borderBottom: cs.borderBottom,
      boxShadow: cs.boxShadow,
      filter: cs.filter,
      opacity: cs.opacity,
      transform: cs.transform,
      overflow: cs.overflow
    };
  }

  function info(el) {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      id: el.id || "",
      className: String(el.className || ""),
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
      rect: {
        top: Math.round(r.top),
        left: Math.round(r.left),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      style: style(el),
      before: style(el, "::before"),
      after: style(el, "::after")
    };
  }

  function findRules() {
    const out = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try { rules = sheet.cssRules; } catch (_) { continue; }
      for (const rule of Array.from(rules || [])) {
        const txt = rule.cssText || "";
        if (
          /position:\s*fixed|top:\s*0|z-index:\s*[0-9]{3,}|height:\s*(1px|2px|3px|4px|5px|6px|7px|8px|[0-9]+px)|linear-gradient|radial-gradient|box-shadow|filter:\s*blur|::before|::after/i.test(txt) &&
          /command|workspace|sidebar|shell|health|global|body|html|root|as6|stat|metric|dashboard|fixed|palette|stream|live/i.test(txt)
        ) {
          out.push({
            href: sheet.href || "inline",
            selector: rule.selectorText || "",
            css: txt.slice(0, 900)
          });
        }
      }
    }
    return out.slice(0, 300);
  }

  function scan(label) {
    const suspicious = [];
    const topStack = [];

    for (const y of [0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120, 160, 220]) {
      for (const x of [8, Math.round(innerWidth * .25), Math.round(innerWidth * .5), Math.round(innerWidth * .75), innerWidth - 8]) {
        topStack.push({
          x, y,
          stack: document.elementsFromPoint(x, y).slice(0, 10).map(info)
        });
      }
    }

    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom < 0 || r.top > Math.min(innerHeight, 260)) return;

      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, "::before");
      const after = getComputedStyle(el, "::after");

      const wide = r.width >= innerWidth * 0.45;
      const fixed = cs.position === "fixed" || cs.position === "sticky";
      const thin = r.height <= 32;
      const pseudo = before.content !== "none" || after.content !== "none";
      const visual =
        cs.backgroundImage !== "none" ||
        cs.boxShadow !== "none" ||
        cs.filter !== "none" ||
        cs.borderTopWidth !== "0px" ||
        cs.borderBottomWidth !== "0px";

      if ((wide && thin) || fixed || pseudo || visual) {
        suspicious.push(info(el));
      }
    });

    const sample = {
      label,
      ms: Math.round(performance.now() - started),
      viewport: { width: innerWidth, height: innerHeight },
      url: location.href,
      documentClass: document.documentElement.className,
      bodyClass: document.body.className,
      topStack,
      suspicious: suspicious.slice(0, 180),
      cssRules: findRules()
    };

    samples.push(sample);
    window.AS6_COMMAND_CENTER_FLASH_SOURCE_V195 = samples;
    console.log("AS6_COMMAND_CENTER_FLASH_SOURCE_V195", sample);
  }

  scan("immediate");
  requestAnimationFrame(() => scan("raf1"));
  requestAnimationFrame(() => requestAnimationFrame(() => scan("raf2")));
  setTimeout(() => scan("t100"), 100);
  setTimeout(() => scan("t300"), 300);
  setTimeout(() => scan("t800"), 800);
  setTimeout(() => scan("t1500"), 1500);
  setTimeout(() => scan("t2500"), 2500);
  setTimeout(() => scan("t4000"), 4000);
})();
