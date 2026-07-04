import React from "react";
import { getActivitiesUiHealthSnapshot } from "./ActivitiesUiHealthSnapshot";

export function ActivitiesDiagnosticsPanel() {
  const health = getActivitiesUiHealthSnapshot();

  return (
    <aside className="as6-crm-activities-diagnostics" aria-label="Activities diagnostics">
      <strong>Diagnostics: {health.diagnostic.status}</strong>
      <span>{health.trace.event}</span>
    </aside>
  );
}
