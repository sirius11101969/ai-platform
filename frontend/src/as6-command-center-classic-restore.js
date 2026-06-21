import "./styles/as6-command-center-classic-restore.css";

const AS6_ALLOWED_ROOT_IDS = new Set(["root"]);

function as6IsCommandCenter() {
  return typeof window !== "undefined" && window.location.pathname.includes("command-center");
}

function as6HideNode(node) {
  if (!node || node.id === "root") return;
  node.setAttribute("data-as6-command-center-overlay-hidden", "true");
  node.style.setProperty("display", "none", "important");
  node.style.setProperty("visibility", "hidden", "important");
  node.style.setProperty("opacity", "0", "important");
  node.style.setProperty("pointer-events", "none", "important");
  node.style.setProperty("width", "0", "important");
  node.style.setProperty("height", "0", "important");
  node.style.setProperty("max-width", "0", "important");
  node.style.setProperty("max-height", "0", "important");
  node.style.setProperty("overflow", "hidden", "important");
}

function as6CleanupCommandCenterOverlays() {
  if (!as6IsCommandCenter() || typeof document === "undefined") return;
  document.body.classList.add("as6-command-center-classic");

  for (const child of Array.from(document.body.children)) {
    if (AS6_ALLOWED_ROOT_IDS.has(child.id)) continue;
    const id = child.id || "";
    const cls = child.className || "";
    const text = (child.textContent || "").replace(/\s+/g, " ").trim();
    const isAs6OverlayRoot = id.startsWith("as6-") || String(cls).includes("as6-");
    const isKnownOverlayText = text.includes("Revenue × CRM") || text.includes("Backend Data") || text.includes("Dashboard Data") || text.includes("CRM Data") || text.includes("Live Data") || text.includes("Control Tower") || text.includes("Executive Command") || text.includes("Operations Timeline") || text.includes("Events") || text.includes("AI Copilot") || text.includes("⌘K");
    if (isAs6OverlayRoot || isKnownOverlayText) as6HideNode(child);
  }

  for (const node of Array.from(document.querySelectorAll("[id^='as6-']:not(#root), [class*='as6-global-health'], [class*='as6-layout-engine'], [class*='as6-revenue-crm-fusion'], [class*='as6-crm-live-data'], [class*='as6-dashboard-live-data'], [class*='as6-backend-connector-status'], [class*='as6-live-operational-data'], [class*='as6-exec-tower'], [class*='as6-executive-command-dashboard'], [class*='as6-ops-timeline'], [class*='as6-global-event-stream'], [class*='as6-ai-copilot-rail'], [class*='as6-command-palette-trigger']"))) {
    if (node.closest("#root")) continue;
    as6HideNode(node);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("load", as6CleanupCommandCenterOverlays);
  window.addEventListener("popstate", as6CleanupCommandCenterOverlays);
  setTimeout(as6CleanupCommandCenterOverlays, 0);
  setTimeout(as6CleanupCommandCenterOverlays, 100);
  setTimeout(as6CleanupCommandCenterOverlays, 300);
  setTimeout(as6CleanupCommandCenterOverlays, 700);
  setTimeout(as6CleanupCommandCenterOverlays, 1200);
  setTimeout(as6CleanupCommandCenterOverlays, 2500);
  new MutationObserver(as6CleanupCommandCenterOverlays).observe(document.documentElement, { childList: true, subtree: true });
}
