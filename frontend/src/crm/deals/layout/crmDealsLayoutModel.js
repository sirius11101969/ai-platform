import { crmDealsCrmLayoutBridge } from "./crmDealsCrmLayoutBridge";
import { traceCrmDealsLayout } from "./crmDealsLayoutTracer";

export function createCrmDealsLayoutModel() {
  const integration = crmDealsCrmLayoutBridge.integration();

  return Object.freeze({
    id: "crm.deals.layout.model",
    bridgeId: crmDealsCrmLayoutBridge.id,
    title: crmDealsCrmLayoutBridge.panel.title,
    route: crmDealsCrmLayoutBridge.navigation.route,
    breadcrumbs: crmDealsCrmLayoutBridge.breadcrumbs,
    activeSection: crmDealsCrmLayoutBridge.activeSection,
    states: crmDealsCrmLayoutBridge.states,
    state: integration.state,
    component: crmDealsCrmLayoutBridge.panel.component,
    foundationDiagnostics: integration.foundationSnapshot,
    uiDiagnostics: integration.uiSnapshot,
    workspaceTrace: integration.trace,
    trace: traceCrmDealsLayout(),
  });
}
