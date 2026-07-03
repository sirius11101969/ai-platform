import React from "react";
import { crmCompanyPanels, getCrmCompanyHealthSnapshot } from "../foundation";

export function CompaniesDiagnosticsPanel() {
  const health = getCrmCompanyHealthSnapshot();

  return (
    <aside className="as6-crm-companies-ui__diagnostics" data-as6-companies-diagnostics-panel="true" aria-label="CRM Companies diagnostics panel">
      <h3>Foundation Diagnostics</h3>
      <strong>{health.diagnostic.status}</strong>
      {crmCompanyPanels.map((panel) => (
        <span key={panel.id}>{panel.title}</span>
      ))}
    </aside>
  );
}
