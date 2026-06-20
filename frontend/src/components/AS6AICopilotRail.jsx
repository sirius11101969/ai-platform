import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-ai-copilot-rail.css";

function AS6AICopilotRail() {
  const [open, setOpen] = useState(false);
  const recommendations = [
    ["High", "Review hot CRM leads", "Pipeline opportunity detected"],
    ["Medium", "Inspect approval queue", "Keep execution latency low"],
    ["Low", "Run UX visual review", "Confirm Mission Control density"],
    ["Auto", "Governance protected", "No registry drift detected"]
  ];

  return (
    <div className={`as6-ai-copilot-rail ${open ? "as6-ai-copilot-rail-open" : ""}`} aria-label="AS6 AI Copilot Rail">
      <button type="button" className="as6-ai-copilot-rail-tab" onClick={() => setOpen((value) => !value)}>
        AI Copilot
      </button>
      {open && (
        <section className="as6-ai-copilot-rail-panel">
          <header>
            <span>AS6 Copilot</span>
            <strong>Next Best Actions</strong>
          </header>
          <div className="as6-ai-priority-queue">
            {recommendations.map(([priority, title, detail]) => (
              <article key={`${priority}-${title}`}> 
                <em>{priority}</em>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
              </article>
            ))}
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}>Open Command Palette</button>
        </section>
      )}
    </div>
  );
}

function mountAS6AICopilotRail() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-ai-copilot-rail-root")) return;
  const root = document.createElement("div");
  root.id = "as6-ai-copilot-rail-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6AICopilotRail />);
}

mountAS6AICopilotRail();

export default AS6AICopilotRail;
