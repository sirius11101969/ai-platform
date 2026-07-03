import { crmContactsCrmLayoutBridge } from "./crmContactsCrmLayoutBridge";
import { createCrmContactsLayoutModel } from "./crmContactsLayoutModel";
import { createCrmContactsLayoutSnapshot } from "./crmContactsLayoutState";

export function diagnoseCrmContactsCrmLayoutBridge() {
  const model = createCrmContactsLayoutModel();
  const snapshot = createCrmContactsLayoutSnapshot();
  const checks = [
    ["CRM_LAYOUT_BRIDGE_REGISTERED", crmContactsCrmLayoutBridge.id === "crm.contacts.crm-layout.bridge"],
    ["USE_EXISTING_WORKSPACE_PANEL", crmContactsCrmLayoutBridge.panel.id === "crm.contacts.workspace.panel"],
    ["USE_EXISTING_NAVIGATION", crmContactsCrmLayoutBridge.navigation.route === "/crm/contacts"],
    ["BREADCRUMBS_SYNCED", snapshot.breadcrumbs.join("/") === "CRM/Contacts"],
    ["ACTIVE_SECTION_SYNCED", snapshot.activeSection === "contacts"],
    ["UNIFIED_STATE_READY", ["loading", "empty", "ready", "error"].includes(snapshot.state)],
    ["NO_ISOLATED_CONTAINER", crmContactsCrmLayoutBridge.isolatedContainer === false],
    ["NO_STORAGE", crmContactsCrmLayoutBridge.storageEnabled === false],
    ["NO_API_CALLS", crmContactsCrmLayoutBridge.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmContactsCrmLayoutBridge.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmContactsCrmLayoutBridge.platformMutation === false],
    ["MODEL_COMPONENT_CONNECTED", Boolean(model.component)],
  ];
  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
