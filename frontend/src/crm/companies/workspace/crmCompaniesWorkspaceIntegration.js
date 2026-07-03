import { getCrmCompanyHealthSnapshot } from "../foundation";
import { getCrmCompaniesUiHealthSnapshot } from "../ui";
import { CRM_WORKSPACE_MODULE_PATTERN } from "../../shared/workspace";
import { crmCompaniesWorkspacePanel } from "./crmCompaniesWorkspacePanel";
import { crmCompaniesWorkspaceNavigation } from "./crmCompaniesWorkspaceNavigation";
import { resolveCrmCompaniesWorkspaceState } from "./crmCompaniesWorkspaceState";
import { traceCrmCompaniesWorkspace } from "./crmCompaniesWorkspaceTracer";

export function createCrmCompaniesWorkspaceIntegration() {
  const foundationSnapshot = getCrmCompanyHealthSnapshot();
  const uiSnapshot = getCrmCompaniesUiHealthSnapshot();

  return Object.freeze({
    id: "crm.companies.workspace.integration",
    stage: "AS6_EPIC013_SLICE04_CRM_COMPANIES_WORKSPACE_INTEGRATION",
    pattern: CRM_WORKSPACE_MODULE_PATTERN,
    panel: crmCompaniesWorkspacePanel,
    navigation: crmCompaniesWorkspaceNavigation,
    foundationSnapshot,
    uiSnapshot,
    state: resolveCrmCompaniesWorkspaceState(foundationSnapshot),
    trace: traceCrmCompaniesWorkspace(),
    useExistingCrmWorkspace: true,
    useExistingCrmLayout: true,
    noParallelShell: true,
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    platformMutation: false,
  });
}
