import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-global-event-stream.css";

function AS6GlobalEventStream() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const events = [
    ["CRM", "Pipeline reviewed", "AI checked lead priority"],
    ["Diagnostics", "Controls passing", "Registry and governance enforced"],
    ["Revenue", "Forecast stable", "No revenue anomaly detected"],
    ["Workforce", "AI agents active", "Execution queue normal"],
    ["Approvals", "Priority queue monitored", "No critical blocker"],
    ["Deploy", "Production healthy", "Health endpoint OK"]
  ];

  return (
    <div className={`as6-global-event-stream ${open ? "as6-global-event-stream-open" : ""}`} aria-label="AS6 Global Event Stream">
      <button type="button" className="as6-global-event-stream-tab" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true" /> Events
      </button>
      {open && (
        <section className="as6-global-event-stream-panel">
          <header>
            <span>Autonomous Event Stream</span>
            <strong>{events.length} sources</strong>
          </header>
          <div className="as6-global-event-stream-list">
            {events.map(([source, title, detail], index) => (
              <article key={`${source}-${title}-${tick}`}>
                <i aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <small>{source} · {detail}</small>
                </div>
                <em>{index === 0 ? "now" : `${index + 1}m`}</em>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function mountAS6GlobalEventStream() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-global-event-stream-root")) return;
  const root = document.createElement("div");
  root.id = "as6-global-event-stream-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6GlobalEventStream />);
}

mountAS6GlobalEventStream();

export default AS6GlobalEventStream;
