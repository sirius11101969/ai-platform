import React from "react";
import { crmDealPanels } from "../foundation";

export function DealsDiagnosticsPanel({ trace }) {
  return (
    <aside className="as6-crm-deals-ui__diagnostics" data-as6-deals-diagnostics-panel="true" aria-label="CRM Deals diagnostics panel">
      <h3>UI Diagnostics</h3>
      <span>{trace.event}</span>
      {crmDealPanels.map((panel) => <small key={panel.id}>{panel.title}</small>)}
    </aside>
  );
}
