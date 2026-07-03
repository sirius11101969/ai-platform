import React, { useMemo } from "react";
import { createWorkspacePanelRuntime } from "./panelRuntime.js";

export default function AS6WorkspacePanels() {
  const snapshot = useMemo(() => {
    const runtime = createWorkspacePanelRuntime();
    runtime.start();
    return runtime.snapshot();
  }, []);

  return (
    <aside className="as6-workspace-panels" aria-label="AS6 Workspace Panels">
      {snapshot.tree.map((region) => (
        <section key={region.id} className="as6-workspace-panels__region">
          <h3>{region.label}</h3>
          {region.slots.map((slot) => (
            <div key={slot.id} className="as6-workspace-panels__slot">
              <strong>{slot.label}</strong>
              {slot.panels.map((panel) => (
                <article key={panel.id} className="as6-workspace-panels__panel">
                  {panel.label}
                </article>
              ))}
            </div>
          ))}
        </section>
      ))}
    </aside>
  );
}
