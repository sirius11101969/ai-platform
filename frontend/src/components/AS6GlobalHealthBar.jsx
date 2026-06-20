import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-global-health-bar.css";

function AS6GlobalHealthBar() {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const time = clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const items = [
    ["Production", "Healthy", "good"],
    ["Diagnostics", "Pass", "good"],
    ["Governance", "Pass", "good"],
    ["Registry", "Enforced", "good"],
    ["UX", "93%", "info"],
    ["Autonomy", "L9", "info"]
  ];

  return (
    <div className="as6-global-health-bar" role="status" aria-label="AS6 global platform status">
      <div className="as6-global-health-brand">
        <span className="as6-global-health-orb" aria-hidden="true" />
        <span>AS6 Mission Control</span>
      </div>
      <div className="as6-global-health-items">
        {items.map(([label, value, tone]) => (
          <div className={`as6-global-health-item as6-global-health-${tone}`} key={label}>
            <span className="as6-global-health-dot" aria-hidden="true" />
            <span className="as6-global-health-label">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="as6-global-health-tail">
        <span>{time}</span>
        <span className="as6-global-health-command">Ctrl K</span>
      </div>
    </div>
  );
}

function mountAS6GlobalHealthBar() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-global-health-bar-root")) return;
  const root = document.createElement("div");
  root.id = "as6-global-health-bar-root";
  document.body.prepend(root);
  createRoot(root).render(<AS6GlobalHealthBar />);
}

mountAS6GlobalHealthBar();

export default AS6GlobalHealthBar;
