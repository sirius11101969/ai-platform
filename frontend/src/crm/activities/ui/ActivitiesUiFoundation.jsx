import React from "react";
import { ActivitiesHeader } from "./ActivitiesHeader";
import { ActivitiesActions } from "./ActivitiesActions";
import { ActivitiesReadyState } from "./ActivitiesReadyState";
import { ActivitiesDiagnosticsPanel } from "./ActivitiesDiagnosticsPanel";
import "./activitiesUiFoundation.css";

export function ActivitiesUiFoundation() {
  return (
    <section className="as6-crm-activities-ui" aria-label="CRM Activities UI Foundation" data-as6-crm-activities-ui-foundation="true">
      <ActivitiesHeader />
      <ActivitiesActions />
      <ActivitiesReadyState />
      <ActivitiesDiagnosticsPanel />
    </section>
  );
}
