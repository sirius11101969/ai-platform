import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { getAS6CrmLiveDataStatus } from "../data/as6CrmLiveData.js";
import "../styles/as6-crm-live-data.css";

function AS6CrmLiveDataStatus() {
  const status = useMemo(() => getAS6CrmLiveDataStatus(), []);
  return (
    <aside className="as6-crm-live-data-status" aria-label="AS6 CRM Live Data">
      <strong>CRM Data</strong>
      <span>{status.status} · {status.connectorHealth}</span>
      <small>{status.widgetCount} widgets · {status.source}</small>
    </aside>
  );
}

function mountAS6CrmLiveDataStatus() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-crm-live-data-status-root")) return;
  const root = document.createElement("div");
  root.id = "as6-crm-live-data-status-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6CrmLiveDataStatus />);
}

mountAS6CrmLiveDataStatus();

export default AS6CrmLiveDataStatus;
