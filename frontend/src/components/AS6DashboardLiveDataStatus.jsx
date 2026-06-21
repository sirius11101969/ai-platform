import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { getAS6DashboardLiveDataStatus } from "../data/as6DashboardLiveData.js";
import "../styles/as6-dashboard-live-data.css";

function AS6DashboardLiveDataStatus() {
  const status = useMemo(() => getAS6DashboardLiveDataStatus(), []);
  return (
    <aside className="as6-dashboard-live-data-status" aria-label="AS6 Dashboard Live Data">
      <strong>Dashboard Data</strong>
      <span>{status.status} · {status.connectorHealth}</span>
      <small>{status.widgetCount} widgets · {status.source}</small>
    </aside>
  );
}

function mountAS6DashboardLiveDataStatus() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-dashboard-live-data-status-root")) return;
  const root = document.createElement("div");
  root.id = "as6-dashboard-live-data-status-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6DashboardLiveDataStatus />);
}

mountAS6DashboardLiveDataStatus();

export default AS6DashboardLiveDataStatus;
