import { useEffect } from "react";
import "../styles/as6-command-center-classic-restore.css";

function isCommandCenter() {
  return typeof window !== "undefined" && window.location.pathname.includes("command-center");
}

function hideOverlayNodes() {
  if (!isCommandCenter() || typeof document === "undefined") return;
  document.body.classList.add("as6-command-center-classic");
  const nodes = Array.from(document.querySelectorAll("header, aside, section, div"));
  for (const node of nodes) {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const isTopStatus = text.includes("AS6 Mission Control") && text.includes("Production") && text.includes("Governance") && text.includes("Autonomy");
    const isCockpit = text.includes("AUTONOMOUS COCKPIT") || (text.includes("Mission Context") && text.includes("AS6 COPILOT") && text.includes("LIVE STREAM"));
    if (isTopStatus || isCockpit) {
      node.setAttribute("data-as6-classic-hidden", "true");
    }
  }
}

export default function AS6CommandCenterClassicRestore() {
  useEffect(() => {
    if (!isCommandCenter()) return undefined;
    hideOverlayNodes();
    const observer = new MutationObserver(hideOverlayNodes);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
