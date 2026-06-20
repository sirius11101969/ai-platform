import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-executive-command-dashboard.css";

function AS6ExecutiveCommandDashboard() {
  const [open, setOpen] = useState(false);
  const pulses = [
    ["Revenue", "Stable", "Forecast normal"],
    ["CRM", "Live", "Pipeline monitored"],
    ["Workforce", "Active", "AI agents online"],
    ["Governance", "Pass", "No drift"],
    ["Diagnostics", "Pass", "Controls green"],
    ["Incidents", "Clear", "No active incident"],
    ["Deploy", "Healthy", "Production OK"],
    ["Autonomy", "L9", "Full control"]
  ];

  return (
    <div className={`as6-executive-command-dashboard ${open ? "as6-executive-command-dashboard-open" : ""}`} aria-label="AS6 Executive Command Dashboard">
      <button type="button" className="as6-exec-dashboard-tab" onClick={() => setOpen((value) => !value)}>
        Executive Command
      </button>
      {open && (
        <section className="as6-exec-dashboard-panel">
          <header>
            <span>AS6 Executive Layer</span>
            <strong>Control Tower</strong>
          </header>
          <div className="as6-exec-kpi-grid">
            {pulses.map(([label, value, detail]) => (
              <article key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
                <span>{detail}</span>
              </article>
            ))}
          </div>
          <div className="as6-exec-alert-strip">
            <b>Executive Alert</b>
            <span>Platform healthy. Next focus: revenue intelligence and CRM automation.</span>
          </div>
        </section>
      )}
    </div>
  );
}

function mountAS6ExecutiveCommandDashboard() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-executive-command-dashboard-root")) return;
  const root = document.createElement("div");
  root.id = "as6-executive-command-dashboard-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6ExecutiveCommandDashboard />);
}

mountAS6ExecutiveCommandDashboard();

export default AS6ExecutiveCommandDashboard;
