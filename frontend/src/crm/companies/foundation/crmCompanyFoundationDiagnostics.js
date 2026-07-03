import { crmCompanyManifest } from "./crmCompanyManifest";
import { crmCompanyRegistry } from "./crmCompanyRegistry";
import { createCrmCompanyRuntime } from "./crmCompanyRuntime";
import { crmCompanyNavigation } from "./crmCompanyNavigation";
import { crmCompanyPanels } from "./crmCompanyPanels";
import { traceCrmCompanyFoundation } from "./crmCompanyFoundationTracer";

export function diagnoseCrmCompanyFoundation() {
  const runtime = createCrmCompanyRuntime();
  const checks = [
    ["CRM_COMPANIES_FOUNDATION_ONLY", crmCompanyManifest.invariants.CRM_COMPANIES_FOUNDATION_ONLY === true],
    ["REGISTRY_PRESENT", crmCompanyRegistry.key === "crm.companies"],
    ["MANIFEST_PRESENT", crmCompanyManifest.module === "CRM_COMPANIES_ACCOUNTS"],
    ["RUNTIME_DECLARATIVE_ONLY", runtime.mode === "declarative-foundation-only"],
    ["NAVIGATION_PRESENT", crmCompanyNavigation.route === "/crm/companies"],
    ["PANELS_PRESENT", crmCompanyPanels.length >= 4],
    ["NO_STORAGE", runtime.storageEnabled === false],
    ["NO_API_CALLS", runtime.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", runtime.workflowEnabled === false],
    ["CONTACTS_LINK_DECLARATIVE_ONLY", crmCompanyManifest.invariants.CONTACTS_LINK_DECLARATIVE_ONLY === true],
    ["PLATFORM_MUTATION_FALSE", runtime.platformMutation === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmCompanyFoundation(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
