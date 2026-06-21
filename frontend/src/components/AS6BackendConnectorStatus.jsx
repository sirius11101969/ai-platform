import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { getAS6OperationalStoreStatus } from "../data/as6OperationalStore.js";
import "../styles/as6-backend-data-connectors.css";

function AS6BackendConnectorStatus() {
  const status = useMemo(() => getAS6OperationalStoreStatus(), []);
  return (
    <aside className="as6-backend-connector-status" aria-label="AS6 Backend Connector Status">
      <strong>Backend Data</strong>
      <span>{status.status} · {status.connectorHealth}</span>
      <small>{status.connectorCount} connectors · cache guarded</small>
    </aside>
  );
}

function mountAS6BackendConnectorStatus() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-backend-connector-status-root")) return;
  const root = document.createElement("div");
  root.id = "as6-backend-connector-status-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6BackendConnectorStatus />);
}

mountAS6BackendConnectorStatus();

export default AS6BackendConnectorStatus;
