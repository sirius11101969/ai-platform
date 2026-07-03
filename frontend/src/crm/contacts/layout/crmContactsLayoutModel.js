import { crmContactsCrmLayoutBridge } from "./crmContactsCrmLayoutBridge";

export function createCrmContactsLayoutModel() {
  const integration = crmContactsCrmLayoutBridge.integration();
  return Object.freeze({
    id: "crm.contacts.layout.model",
    bridgeId: crmContactsCrmLayoutBridge.id,
    title: crmContactsCrmLayoutBridge.panel.title,
    route: crmContactsCrmLayoutBridge.navigation.route,
    breadcrumbs: crmContactsCrmLayoutBridge.breadcrumbs,
    activeSection: crmContactsCrmLayoutBridge.activeSection,
    state: integration.state,
    component: crmContactsCrmLayoutBridge.panel.component,
    diagnostics: integration.snapshot,
  });
}
