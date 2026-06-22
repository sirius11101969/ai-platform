/* AS6 V155 Command Center real overlay strip guard. Source JS only. */
(function () {
  const PAGE_SELECTOR = ".command-center-page[data-command-center-visual=\"premium-as6\"]";
  const SAFE_TEXT = /progress|chart|graph|funnel|button|logo|avatar|icon|input|select|textarea|canvas|svg/i;

  function isVisibleLine(el, page) {
    if (!el || !page) return false;
    if (el === page || el === document.body || el === document.documentElement) return false;
    const name = `${el.className || ""} ${el.id || ""} ${el.tagName || ""}`;
    if (SAFE_TEXT.test(name)) return false;
    const r = el.getBoundingClientRect();
    if (!r || r.width <= 0 || r.height <= 0) return false;
    const pageRect = page.getBoundingClientRect();
    const wideEnough = r.width >= Math.min(window.innerWidth * 0.42, pageRect.width * 0.55);
    const thinEnough = r.height <= 12;
    const insidePageY = r.top >= pageRect.top - 20 && r.top <= pageRect.bottom + 20;
    if (!wideEnough || !thinEnough || !insidePageY) return false;
    const cs = window.getComputedStyle(el);
    const positioned = ["fixed", "absolute", "sticky"].includes(cs.position);
    const z = Number.parseInt(cs.zIndex || "0", 10) || 0;
    const hasVisual = cs.backgroundImage !== "none" || cs.boxShadow !== "none" || cs.borderTopWidth !== "0px" || cs.borderBottomWidth !== "0px";
    return hasVisual && (positioned || z >= 1 || r.width >= pageRect.width * 0.75);
  }

  function removeOverlayStrips() {
    const page = document.querySelector(PAGE_SELECTOR);
    if (!page) return;
    const nodes = Array.from(document.body.querySelectorAll("*"));
    for (const el of nodes) {
      if (!page.contains(el) && !el.closest(".workspace,.app-shell,.command-shell")) continue;
      if (!isVisibleLine(el, page)) continue;
      el.setAttribute("data-as6-v155-strip-removed", "true");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("height", "0", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("max-height", "0", "important");
      el.style.setProperty("border", "0", "important");
      el.style.setProperty("box-shadow", "none", "important");
      el.style.setProperty("background", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
    }
  }

  function boot() {
    removeOverlayStrips();
    setTimeout(removeOverlayStrips, 100);
    setTimeout(removeOverlayStrips, 500);
    setTimeout(removeOverlayStrips, 1500);
    const observer = new MutationObserver(removeOverlayStrips);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener("resize", removeOverlayStrips);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}());
