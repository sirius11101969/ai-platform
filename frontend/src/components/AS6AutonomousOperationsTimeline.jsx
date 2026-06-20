import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-autonomous-operations-timeline.css";

function AS6AutonomousOperationsTimeline() {
  const [open, setOpen] = useState(false);
  const operations = [
    ["Deployments", "Production build validated", "PASS", "critical"],
    ["Diagnostics", "AS6 controls and registries passing", "PASS", "good"],
    ["Governance", "Autonomous governance enforcement active", "PASS", "good"],
    ["CRM", "Pipeline monitored by AI", "LIVE", "info"],
    ["AI Workforce", "Agents and execution loops normal", "LIVE", "info"],
    ["Revenue", "Forecast and opportunity stream stable", "OK", "good"],
    ["Approvals", "Priority queue observed", "WATCH", "warn"],
    ["Incidents", "No active incident detected", "CLEAR", "good"]
  ];

  return (
    <div className={`as6-ops-timeline ${open ? "as6-ops-timeline-open" : ""}`} aria-label="AS6 Autonomous Operations Timeline">
      <button type="button" className="as6-ops-timeline-tab" onClick={() => setOpen((value) => !value)}>
        Operations Timeline
      </button>
      {open && (
        <section className="as6-ops-timeline-panel">
          <header>
            <span>AS6 Operations</span>
            <strong>Unified Timeline</strong>
          </header>
          <div className="as6-ops-timeline-list">
            {operations.map(([source, title, status, tone], index) => (
              <article className={`as6-ops-timeline-row as6-ops-${tone}`} key={`${source}-${title}`}>
                <i aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <small>{source} · T+{index * 3}m</small>
                </div>
                <em>{status}</em>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function mountAS6AutonomousOperationsTimeline() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-autonomous-operations-timeline-root")) return;
  const root = document.createElement("div");
  root.id = "as6-autonomous-operations-timeline-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6AutonomousOperationsTimeline />);
}

mountAS6AutonomousOperationsTimeline();

export default AS6AutonomousOperationsTimeline;
