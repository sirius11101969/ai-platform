import React from "react";
import { DealsUiFoundation } from "../ui";
import { createCrmDealsLayoutSnapshot, getCrmDealsLayoutHealthSnapshot } from "../layout";
import "./crmDealsLiveLayoutMount.css";

export function CrmDealsLiveLayoutMount() {
  const snapshot = createCrmDealsLayoutSnapshot();
  const health = getCrmDealsLayoutHealthSnapshot();

  return (
    <section
      className="as6-crm-deals-live-layout-mount"
      data-as6-crm-deals-live-layout-mount="true"
      data-as6-crm-deals-mounted-in-production-layout="true"
      data-as6-crm-deals-active-section={snapshot.activeSection}
      aria-label="CRM Deals live layout mount"
    >
      <header className="as6-crm-deals-live-layout-mount__header" aria-label="CRM Deals live mount header">
        <div>
          <p>{snapshot.breadcrumbs.join(" / ")}</p>
          <h2>Deals в рабочем CRM Layout</h2>
        </div>
        <strong>{health.diagnostic.status}</strong>
      </header>
      <DealsUiFoundation />
    </section>
  );
}
