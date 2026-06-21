import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { getAS6RevenueCrmFusionStatus } from "../data/as6RevenueCrmFusion.js";
import "../styles/as6-revenue-crm-fusion.css";

function AS6RevenueCrmFusionStatus() {
  const status = useMemo(() => getAS6RevenueCrmFusionStatus(), []);
  return (
    <aside className="as6-revenue-crm-fusion-status" aria-label="AS6 Revenue CRM Fusion">
      <strong>Revenue × CRM</strong>
      <span>{status.status} · {status.connectorHealth}</span>
      <small>{status.feedCount} feeds · Executive Pulse</small>
    </aside>
  );
}

function mountAS6RevenueCrmFusionStatus() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-revenue-crm-fusion-status-root")) return;
  const root = document.createElement("div");
  root.id = "as6-revenue-crm-fusion-status-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6RevenueCrmFusionStatus />);
}

mountAS6RevenueCrmFusionStatus();

export default AS6RevenueCrmFusionStatus;
