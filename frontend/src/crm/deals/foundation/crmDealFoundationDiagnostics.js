import { crmDealManifest } from "./crmDealManifest";
import { crmDealRegistry } from "./crmDealRegistry";
import { createCrmDealRuntime } from "./crmDealRuntime";
import { crmDealNavigation } from "./crmDealNavigation";
import { crmDealPanels } from "./crmDealPanels";
import { traceCrmDealFoundation } from "./crmDealFoundationTracer";

export function diagnoseCrmDealFoundation() {
  const runtime = createCrmDealRuntime();
  const checks = [
    ["CRM_DEALS_FOUNDATION_ONLY", crmDealManifest.invariants.CRM_DEALS_FOUNDATION_ONLY === true],
    ["REGISTRY_PRESENT", crmDealRegistry.key === "crm.deals"],
    ["MANIFEST_PRESENT", crmDealManifest.module === "CRM_DEALS_OPPORTUNITIES"],
    ["RUNTIME_DECLARATIVE_ONLY", runtime.mode === "declarative-foundation-only"],
    ["PIPELINE_PREVIEW_ONLY", runtime.pipelineMode === "declarative-preview-only"],
    ["NAVIGATION_PRESENT", crmDealNavigation.route === "/crm/deals"],
    ["PANELS_PRESENT", crmDealPanels.length >= 6],
    ["REUSE_CONTACTS_FOUNDATION", crmDealManifest.invariants.REUSE_CONTACTS_FOUNDATION === true],
    ["REUSE_COMPANIES_FOUNDATION", crmDealManifest.invariants.REUSE_COMPANIES_FOUNDATION === true],
    ["COMPANY_LINK_DECLARATIVE_ONLY", runtime.companyLink === "declarative-only"],
    ["CONTACT_LINK_DECLARATIVE_ONLY", runtime.contactLink === "declarative-only"],
    ["USE_EXISTING_CRM_WORKSPACE", crmDealManifest.invariants.USE_EXISTING_CRM_WORKSPACE === true],
    ["USE_EXISTING_CRM_LAYOUT", crmDealManifest.invariants.USE_EXISTING_CRM_LAYOUT === true],
    ["NO_PARALLEL_SHELL", crmDealManifest.invariants.NO_PARALLEL_SHELL === true],
    ["NO_OWN_ROUTER", runtime.ownRouter === false],
    ["NO_OWN_STORE", runtime.ownStore === false],
    ["NO_STORAGE", runtime.storageEnabled === false],
    ["NO_API_CALLS", runtime.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", runtime.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", runtime.platformMutation === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealFoundation(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
