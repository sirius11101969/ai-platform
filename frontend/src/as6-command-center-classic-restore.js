import "./styles/as6-command-center-classic-restore.css";

const AS6_COMMAND_CENTER_OVERLAY_ROOT_IDS = [
  "as6-global-health-bar-root",
  "as6-revenue-crm-fusion-status-root",
  "as6-crm-live-data-status-root",
  "as6-dashboard-live-data-status-root",
  "as6-backend-connector-status-root",
  "as6-live-operational-data-root",
  "as6-executive-control-tower-completion-root",
  "as6-executive-command-dashboard-root",
  "as6-autonomous-operations-timeline-root",
  "as6-global-event-stream-root",
  "as6-ai-copilot-rail-root",
  "as6-mission-control-layout-engine-root",
  "as6-global-command-palette-root"
];

function as6IsCommandCenter() {
  return typeof window !== "undefined" && window.location.pathname.includes("command-center");
}

function as6CleanupCommandCenterOverlays() {
  if (!as6IsCommandCenter() || typeof document === "undefined") return;
  document.body.classList.add("as6-command-center-classic");
  for (const id of AS6_COMMAND_CENTER_OVERLAY_ROOT_IDS) {
    const node = document.getElementById(id);
    if (!node) continue;
    node.setAttribute("data-as6-command-center-overlay-hidden", "true");
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("opacity", "0", "important");
    node.style.setProperty("pointer-events", "none", "important");
    node.style.setProperty("width", "0", "important");
    node.style.setProperty("height", "0", "important");
    node.style.setProperty("overflow", "hidden", "important");
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("load", as6CleanupCommandCenterOverlays);
  window.addEventListener("popstate", as6CleanupCommandCenterOverlays);
  setTimeout(as6CleanupCommandCenterOverlays, 0);
  setTimeout(as6CleanupCommandCenterOverlays, 100);
  setTimeout(as6CleanupCommandCenterOverlays, 400);
  setTimeout(as6CleanupCommandCenterOverlays, 900);
  setTimeout(as6CleanupCommandCenterOverlays, 1800);
  setTimeout(as6CleanupCommandCenterOverlays, 3000);
  new MutationObserver(as6CleanupCommandCenterOverlays).observe(document.documentElement, { childList: true, subtree: true });
}
