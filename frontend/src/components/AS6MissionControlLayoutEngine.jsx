import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-mission-control-layout-engine.css";

function AS6MissionControlLayoutEngine() {
  const [visible, setVisible] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 45000);
    return () => window.clearInterval(timer);
  }, []);

  const events = [
    ["Production", "Health OK", "now"],
    ["Diagnostics", "All controls pass", "auto"],
    ["Governance", "Enforced", "L9"],
    ["UX", "Mission layer active", "97%"]
  ];

  if (!visible) {
    return <button className="as6-layout-engine-reopen" type="button" onClick={() => setVisible(true)}>Mission</button>;
  }

  return (
    <aside className="as6-layout-engine" aria-label="AS6 Mission Control Layout Engine">
      <div className="as6-layout-engine-head">
        <div>
          <span className="as6-layout-engine-kicker">Autonomous Cockpit</span>
          <strong>Mission Context</strong>
        </div>
        <button type="button" onClick={() => setVisible(false)} aria-label="Hide Mission Control panel">×</button>
      </div>

      <section className="as6-executive-summary">
        <div>
          <span>Objective</span>
          <strong>Revenue OS</strong>
        </div>
        <div>
          <span>Risk</span>
          <strong>Low</strong>
        </div>
        <div>
          <span>Autonomy</span>
          <strong>L9</strong>
        </div>
        <div>
          <span>Updated</span>
          <strong>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
        </div>
      </section>

      <section className="as6-copilot-rail">
        <span className="as6-layout-engine-kicker">AS6 Copilot</span>
        <p>Платформа в рабочем состоянии. Следующий лучший шаг: анализ pipeline и AI-рекомендации.</p>
        <button type="button" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}>Open Command</button>
      </section>

      <section className="as6-event-stream">
        <span className="as6-layout-engine-kicker">Live Stream</span>
        {events.map(([source, title, meta]) => (
          <div className="as6-event-stream-row" key={`${source}-${title}`}>
            <i aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <small>{source} · {meta}</small>
            </span>
          </div>
        ))}
      </section>
    </aside>
  );
}

function mountAS6MissionControlLayoutEngine() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-mission-control-layout-engine-root")) return;
  const root = document.createElement("div");
  root.id = "as6-mission-control-layout-engine-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6MissionControlLayoutEngine />);
}

mountAS6MissionControlLayoutEngine();

export default AS6MissionControlLayoutEngine;
