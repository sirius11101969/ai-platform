import "./styles/as6-command-center-reference-guard.css";
import "./styles/as6-command-center-reference-polish-v123c.css";
import "./styles/as6-command-center-arrow-fix-v126.css";

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

function injectFinalStyle() {
  let style = document.getElementById("as6-command-center-final-runtime-style-v127");
  if (!style) {
    style = document.createElement("style");
    style.id = "as6-command-center-final-runtime-style-v127";
    document.head.appendChild(style);
  }

  style.textContent = `
body.as6-command-center-reference-guard-active{background:#030814!important;overflow:hidden!important}
body.as6-command-center-reference-guard-active #root,
body.as6-command-center-reference-guard-active .app-shell.command-shell,
body.as6-command-center-reference-guard-active .workspace{
  background:#030814!important;border:0!important;box-shadow:none!important;outline:0!important;margin:0!important;padding-top:0!important;overflow:hidden!important
}
body.as6-command-center-reference-guard-active .command-center-page{
  background:#030814!important;border:0!important;box-shadow:none!important;outline:0!important;overflow:hidden!important;padding-bottom:0!important;max-height:100vh!important
}
body.as6-command-center-reference-guard-active .command-center-page::before,
body.as6-command-center-reference-guard-active .command-center-page::after,
body.as6-command-center-reference-guard-active .workspace::before,
body.as6-command-center-reference-guard-active .workspace::after,
body.as6-command-center-reference-guard-active .command-main-grid::before,
body.as6-command-center-reference-guard-active .command-main-grid::after{
  display:none!important;content:none!important;border:0!important;box-shadow:none!important;background:none!important
}
body.as6-command-center-reference-guard-active .command-hero{
  margin:0 0 12px!important;padding:24px 30px 20px!important;border:0!important;border-bottom:0!important;box-shadow:none!important;outline:0!important;border-radius:0 0 22px 22px!important
}
body.as6-command-center-reference-guard-active .command-hero::before,
body.as6-command-center-reference-guard-active .command-hero::after{display:none!important;content:none!important}
body.as6-command-center-reference-guard-active .command-sidebar{
  background:#030814!important;border-top:0!important;border-left:0!important;border-bottom:0!important;border-right:1px solid rgba(70,130,170,.22)!important;box-shadow:none!important;outline:0!important
}
body.as6-command-center-reference-guard-active .command-sidebar::before,
body.as6-command-center-reference-guard-active .command-sidebar::after,
body.as6-command-center-reference-guard-active .sidebar-scroll::before,
body.as6-command-center-reference-guard-active .sidebar-scroll::after{display:none!important;content:none!important}
body.as6-command-center-reference-guard-active .command-side-nav{border-bottom:0!important;box-shadow:none!important}
body.as6-command-center-reference-guard-active .sidebar-favorites{border-top:1px solid rgba(80,120,160,.16)!important;box-shadow:none!important;background:transparent!important;margin-top:12px!important;padding-top:10px!important}
body.as6-command-center-reference-guard-active .as6-sidebar-brand,
body.as6-command-center-reference-guard-active .as6-sidebar-brand-top,
body.as6-command-center-reference-guard-active .as6-real-logo-image{border:0!important;box-shadow:none!important;outline:0!important;background:transparent!important}
body.as6-command-center-reference-guard-active .quick-actions-primary,
body.as6-command-center-reference-guard-active .quick-actions-primary>div{background:transparent!important;border:0!important;box-shadow:none!important;outline:0!important;padding:0!important}
body.as6-command-center-reference-guard-active .quick-actions-primary h2{display:none!important}
body.as6-command-center-reference-guard-active .copilot-hero{
  border:0!important;box-shadow:none!important;outline:0!important;background:linear-gradient(135deg,rgba(94,41,155,.76),rgba(37,17,84,.84))!important
}
body.as6-command-center-reference-guard-active .copilot-hero::before,
body.as6-command-center-reference-guard-active .copilot-hero::after,
body.as6-command-center-reference-guard-active .copilot-inline-layout::before,
body.as6-command-center-reference-guard-active .copilot-inline-layout::after{display:none!important;content:none!important}
body.as6-command-center-reference-guard-active .copilot-inline-layout,
body.as6-command-center-reference-guard-active .as6-copilot-inline-logo,
body.as6-command-center-reference-guard-active .copilot-action-link{box-shadow:none!important;outline:0!important}
body.as6-command-center-reference-guard-active .command-recommendations{display:none!important}
`;
}

function applyCommandCenterGuard() {
  if (!isCommandCenterRoute()) {
    restoreHiddenNodes();
    return;
  }

  document.body.classList.add("as6-command-center-reference-guard-active");
  injectFinalStyle();

  AS6_COMMAND_CENTER_EXTERNAL_ROOTS.forEach((id) => hideNode(document.getElementById(id)));
  Array.from(document.body.children).forEach((node) => {
    if (node.id === "root") return;
    if (node.id && node.id.startsWith("as6-")) hideNode(node);
  });
}

function patchHistoryMethod(name) {
  const original = window.history[name];
  if (original.__as6CommandCenterGuardPatched) return;
  const patched = function patchedHistoryMethod() {
    const result = original.apply(this, arguments);
    [0, 100, 400, 1000].forEach((ms) => window.setTimeout(applyCommandCenterGuard, ms));
    return result;
  };
  patched.__as6CommandCenterGuardPatched = true;
  window.history[name] = patched;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
  window.addEventListener("popstate", applyCommandCenterGuard);
  window.addEventListener("load", applyCommandCenterGuard);
  const observer = new MutationObserver(applyCommandCenterGuard);
  observer.observe(document.body, { childList: true, subtree: true });
  [0, 50, 150, 400, 900, 1800, 3500, 6000].forEach((ms) => window.setTimeout(applyCommandCenterGuard, ms));
}
