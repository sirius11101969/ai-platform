import React from "react";
import { ActivitiesUiFoundation } from "../ui";
import { resolveCrmActivitiesLayoutState, getCrmActivitiesLayoutHealthSnapshot } from "../layout";
import "./crmActivitiesLiveLayoutMount.css";

export function CrmActivitiesLiveLayoutMount() {
  const state = resolveCrmActivitiesLayoutState();
  const health = getCrmActivitiesLayoutHealthSnapshot();

  return (
    <section
      className="as6-crm-activities-live-layout-mount"
      aria-label="CRM Activities live layout mount"
      data-as6-crm-activities-live-layout-mount="true"
      data-as6-crm-activities-mounted-in-production-layout="true"
    >
      <header className="as6-crm-activities-live-layout-mount__header" aria-label="CRM Activities live mount header">
        <div>
          <p>{state.breadcrumbs.join(" / ")}</p>
          <h2>Activities / Tasks</h2>
        </div>
        <span aria-label="Activities live layout diagnostics">{health.diagnostic.status}</span>
      </header>
      <ActivitiesUiFoundation />
    </section>
  );
}
