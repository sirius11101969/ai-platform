import React, { useMemo } from "react";
import { createWorkspaceIntegrationRuntime } from "./integrationRuntime.js";

export default function AS6WorkspaceIntegration() {
  const snapshot = useMemo(() => {
    const runtime = createWorkspaceIntegrationRuntime();
    runtime.start();
    return runtime.snapshot();
  }, []);

  return (
    <section className="as6-workspace-integration" aria-label="AS6 Workspace Integration">
      <h2>AS6 Workspace Integration</h2>
      <ul>
        {snapshot.integration.units.map((unit) => (
          <li key={unit.id}>{unit.label}</li>
        ))}
      </ul>
    </section>
  );
}
