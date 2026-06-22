import "./styles/as6-command-center-reference-guard.css";
import "./styles/as6-command-center-visual-etalon-v134.css";

const REFERENCE_HIDDEN_IDS = [
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
  "as6-global-command-palette-root",
];

const removedReferenceNodes = new Map();

function removeReferenceNode(node) {
  if (!node || !node.parentNode || !node.id || removedReferenceNodes.has(node.id)) return;
  removedReferenceNodes.set(node.id, {
    node,
    parent: node.parentNode,
    next: node.nextSibling,
  });
  node.parentNode.removeChild(node);
}

function restoreReferenceNode(nodeId) {
  const entry = removedReferenceNodes.get(nodeId);
  if (!entry || !entry.parent || !entry.node) return;

  if (entry.next && entry.next.parentNode === entry.parent) {
    entry.parent.insertBefore(entry.node, entry.next);
  } else {
    entry.parent.appendChild(entry.node);
  }

  removedReferenceNodes.delete(nodeId);
}

function removeAllReferenceNodes() {
  REFERENCE_HIDDEN_IDS.forEach((id) => {
    removeReferenceNode(document.getElementById(id));
  });

  document
    .querySelectorAll('[data-as6-command-center-reference-hidden="true"], [id^="as6-"][id$="-root"]')
    .forEach(removeReferenceNode);
}

export function activateCommandCenterReferenceGuard() {
  if (typeof document === "undefined") return () => {};

  document.body.classList.add("as6-command-center-reference-guard-active");
  removeAllReferenceNodes();

  const observer = new MutationObserver(removeAllReferenceNodes);
  observer.observe(document.body, { childList: true, subtree: false });

  return () => {
    observer.disconnect();
    document.body.classList.remove("as6-command-center-reference-guard-active");
    REFERENCE_HIDDEN_IDS.forEach(restoreReferenceNode);
  };
}

export default activateCommandCenterReferenceGuard;
