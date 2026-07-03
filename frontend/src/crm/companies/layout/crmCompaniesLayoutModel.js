import { crmCompaniesCrmLayoutBridge } from "./crmCompaniesCrmLayoutBridge";
import { traceCrmCompaniesLayout } from "./crmCompaniesLayoutTracer";

export function createCrmCompaniesLayoutModel() {
  const integration = crmCompaniesCrmLayoutBridge.integration();

  return Object.freeze({
    id: "crm.companies.layout.model",
    bridgeId: crmCompaniesCrmLayoutBridge.id,
    title: crmCompaniesCrmLayoutBridge.panel.title,
    route: crmCompaniesCrmLayoutBridge.navigation.route,
    breadcrumbs: crmCompaniesCrmLayoutBridge.breadcrumbs,
    activeSection: crmCompaniesCrmLayoutBridge.activeSection,
    state: integration.state,
    component: crmCompaniesCrmLayoutBridge.panel.component,
    diagnostics: integration.foundationSnapshot,
    uiDiagnostics: integration.uiSnapshot,
    trace: traceCrmCompaniesLayout(),
  });
}
