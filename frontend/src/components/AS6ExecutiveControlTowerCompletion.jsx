import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-executive-control-tower-completion.css";

function AS6ExecutiveControlTowerCompletion() {
  const [open, setOpen] = useState(false);
  const signals = [
    ["Decision", "Next best action ready", "READY"],
    ["Risk", "No active executive risk", "LOW"],
    ["Revenue", "Growth focus active", "LIVE"],
    ["AI", "Autonomous recommendations enabled", "L9"],
    ["Control", "Governance and diagnostics enforced", "PASS"]
  ];

  return (
    <div className={`as6-exec-tower-completion ${open ? "as6-exec-tower-completion-open" : ""}`} aria-label="AS6 Executive Control Tower Completion">
      <button type="button" className="as6-exec-tower-tab" onClick={() => setOpen((value) => !value)}>
        Control Tower 100%
      </button>
      {open && (
        <section className="as6-exec-tower-panel">
          <header>
            <span>Executive Control Tower</span>
            <strong>100% Operational View</strong>
          </header>
          <div className="as6-exec-risk-radar">
            {signals.map(([label, title, status]) => (
              <article key={label}>
                <small>{label}</small>
                <strong>{title}</strong>
                <em>{status}</em>
              </article>
            ))}
          </div>
          <div className="as6-exec-action-queue">
            <b>Action Queue</b>
            <span>Focus CRM growth, inspect revenue intelligence, keep autonomous controls enabled.</span>
          </div>
        </section>
      )}
    </div>
  );
}

function mountAS6ExecutiveControlTowerCompletion() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-executive-control-tower-completion-root")) return;
  const root = document.createElement("div");
  root.id = "as6-executive-control-tower-completion-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6ExecutiveControlTowerCompletion />);
}

mountAS6ExecutiveControlTowerCompletion();

export default AS6ExecutiveControlTowerCompletion;
