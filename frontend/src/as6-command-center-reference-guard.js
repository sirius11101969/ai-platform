import "./styles/as6-command-center-reference-guard.css";

const AS6_COMMAND_CENTER_EXTERNAL_ROOTS = [
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

const previousStyles = new Map();

function isCommandCenterRoute() {
  return window.location.pathname.includes("command-center");
}

function hideNode(node) {
  if (!node || node.id === "root") return;
  if (!previousStyles.has(node)) previousStyles.set(node, node.getAttribute("style") || "");
  node.setAttribute("data-as6-command-center-reference-hidden", "true");
  node.style.setProperty("display", "none", "important");
  node.style.setProperty("visibility", "hidden", "important");
  node.style.setProperty("opacity", "0", "important");
  node.style.setProperty("pointer-events", "none", "important");
  node.style.setProperty("width", "0", "important");
  node.style.setProperty("height", "0", "important");
  node.style.setProperty("max-width", "0", "important");
  node.style.setProperty("max-height", "0", "important");
  node.style.setProperty("overflow", "hidden", "important");
  node.style.setProperty("position", "absolute", "important");
  node.style.setProperty("z-index", "-1", "important");
}

function restoreHiddenNodes() {
  previousStyles.forEach((style, node) => {
    if (style) node.setAttribute("style", style);
    else node.removeAttribute("style");
    node.removeAttribute("data-as6-command-center-reference-hidden");
  });
  previousStyles.clear();
  document.body.classList.remove("as6-command-center-reference-guard-active");
}

function applyCommandCenterGuard() {
  if (!isCommandCenterRoute()) {
    restoreHiddenNodes();
    return;
  }
  document.body.classList.add("as6-command-center-reference-guard-active");
  AS6_COMMAND_CENTER_EXTERNAL_ROOTS.forEach((id) => hideNode(document.getElementById(id)));
  Array.from(document.body.children).forEach((node) => {
    if (node.id === "root") return;
    if (node.id && node.id.startsWith("as6-")) hideNode(node);
  });
}

function patchHistoryMethod(name) {
  const original = window.history[name];
  window.history[name] = function patchedHistoryMethod() {
    const result = original.apply(this, arguments);
    window.setTimeout(applyCommandCenterGuard, 0);
    window.setTimeout(applyCommandCenterGuard, 100);
    return result;
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
  window.addEventListener("popstate", applyCommandCenterGuard);
  window.addEventListener("load", applyCommandCenterGuard);
  const observer = new MutationObserver(applyCommandCenterGuard);
  observer.observe(document.body, { childList: true, subtree: false });
  [0, 50, 150, 400, 900, 1800, 3500].forEach((ms) => window.setTimeout(applyCommandCenterGuard, ms));
}
