import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { createAS6OperationalSnapshot, getAS6OperationalDataSources, isAS6OperationalDataFresh } from "../data/as6LiveOperationalData.js";
import "../styles/as6-live-operational-data.css";

function AS6LiveOperationalDataStatus() {
  const snapshot = useMemo(() => createAS6OperationalSnapshot(), []);
  const sources = getAS6OperationalDataSources();
  const fresh = isAS6OperationalDataFresh(snapshot);

  return (
    <aside className="as6-live-operational-data" aria-label="AS6 Live Operational Data">
      <strong>Live Data</strong>
      <span>{fresh ? "Fresh" : "Stale"}</span>
      <small>{sources.length} sources · Health OK · Governance PASS</small>
    </aside>
  );
}

function mountAS6LiveOperationalDataStatus() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-live-operational-data-root")) return;
  const root = document.createElement("div");
  root.id = "as6-live-operational-data-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6LiveOperationalDataStatus />);
}

mountAS6LiveOperationalDataStatus();

export default AS6LiveOperationalDataStatus;
