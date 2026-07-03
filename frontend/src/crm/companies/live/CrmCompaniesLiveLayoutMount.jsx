import React from "react";
import { CompaniesUiFoundation, createCrmCompaniesLayoutSnapshot } from "../index";

export function CrmCompaniesLiveLayoutMount({ crmLayoutMountMode = "live" }) {
  const snapshot = createCrmCompaniesLayoutSnapshot();

  return (
    <section
      className="as6-crm-companies-live-layout-mount"
      data-as6-companies-live-layout-mount={crmLayoutMountMode}
      data-as6-companies-layout-state={snapshot.state}
      data-as6-companies-active-section={snapshot.activeSection}
      aria-label="CRM Companies Live Layout Mount"
    >
      <header className="as6-crm-companies-live-layout-mount__header" aria-label="CRM Companies live mount header">
        <span>{snapshot.breadcrumbs.join(" / ")}</span>
        <strong>{snapshot.diagnosticStatus}</strong>
      </header>
      <CompaniesUiFoundation />
    </section>
  );
}
