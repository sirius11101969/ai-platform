import { createCrmActivityRuntime } from "./crmActivityRuntime";

export function resolveCrmActivityFoundation() {
  const runtime = createCrmActivityRuntime();

  return Object.freeze({
    id: "crm.activities.tasks.resolver",
    runtime,
    resolved: runtime.mode === "declarative-foundation-only",
    links: runtime.contract.links,
    capabilities: Object.freeze(runtime.registry ? ["registry", "runtime", "domain-contract"] : []),
  });
}
