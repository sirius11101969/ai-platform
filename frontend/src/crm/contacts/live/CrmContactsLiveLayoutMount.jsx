import React from "react";
import { CrmContactsUiFoundation, createCrmContactsLayoutSnapshot } from "../index";

export function CrmContactsLiveLayoutMount({ crmLayoutMountMode = "live" }) {
  const snapshot = createCrmContactsLayoutSnapshot();
  return (
    <section className="as6-crm-contacts-live-layout-mount" data-as6-contacts-live-layout-mount={crmLayoutMountMode} data-as6-contacts-layout-state={snapshot.state} aria-label="CRM Contacts Live Layout Mount">
      <header className="as6-crm-contacts-live-layout-mount__header">
        <span>{snapshot.breadcrumbs.join(" / ")}</span>
        <strong>{snapshot.diagnosticStatus}</strong>
      </header>
      <CrmContactsUiFoundation />
    </section>
  );
}
