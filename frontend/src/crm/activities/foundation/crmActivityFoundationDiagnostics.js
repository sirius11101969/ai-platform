import { crmActivityManifest } from "./crmActivityManifest";
import { crmActivityRegistry } from "./crmActivityRegistry";
import { crmActivityNavigation } from "./crmActivityNavigation";
import { crmActivityPanels } from "./crmActivityPanels";
import { createCrmActivityRuntime } from "./crmActivityRuntime";
import { resolveCrmActivityFoundation } from "./crmActivityResolver";
import { traceCrmActivityFoundation } from "./crmActivityFoundationTracer";

export function diagnoseCrmActivityFoundation() {
  const runtime = createCrmActivityRuntime();
  const resolver = resolveCrmActivityFoundation();

  const checks = [
    ["CRM_ACTIVITIES_TASKS_FOUNDATION_ONLY", crmActivityManifest.invariants.CRM_ACTIVITIES_TASKS_FOUNDATION_ONLY === true],
    ["MANIFEST_PRESENT", crmActivityManifest.module === "CRM_ACTIVITIES_TASKS"],
    ["REGISTRY_PRESENT", crmActivityRegistry.key === "crm.activities.tasks"],
    ["RUNTIME_DECLARATIVE_ONLY", runtime.mode === "declarative-foundation-only"],
    ["RESOLVER_PRESENT", resolver.resolved === true],
    ["NAVIGATION_PRESENT", crmActivityNavigation.route === "/crm/activities"],
    ["PANELS_PRESENT", crmActivityPanels.length === 3],
    ["TIMELINE_PREVIEW_ONLY", runtime.timelineMode === "declarative-preview-only"],
    ["TASK_PREVIEW_ONLY", runtime.taskMode === "declarative-preview-only"],
    ["REUSE_CONTACTS_FOUNDATION", crmActivityManifest.invariants.REUSE_CONTACTS_FOUNDATION === true],
    ["REUSE_COMPANIES_FOUNDATION", crmActivityManifest.invariants.REUSE_COMPANIES_FOUNDATION === true],
    ["REUSE_DEALS_FOUNDATION", crmActivityManifest.invariants.REUSE_DEALS_FOUNDATION === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmActivityManifest.invariants.USE_EXISTING_CRM_WORKSPACE === true],
    ["USE_EXISTING_CRM_LAYOUT", crmActivityManifest.invariants.USE_EXISTING_CRM_LAYOUT === true],
    ["NO_PARALLEL_SHELL", crmActivityManifest.invariants.NO_PARALLEL_SHELL === true],
    ["NO_OWN_ROUTER", runtime.ownRouter === false],
    ["NO_OWN_STORE", runtime.ownStore === false],
    ["NO_STORAGE", runtime.storageEnabled === false],
    ["NO_API_CALLS", runtime.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", runtime.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", runtime.platformMutation === false],
    ["FOUNDATION_TRACER_PRESENT", traceCrmActivityFoundation().event === "CRM_ACTIVITY_FOUNDATION_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmActivityFoundation(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
