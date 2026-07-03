import { crmContactManifest } from "./crmContactManifest";

export function diagnoseCrmContactFoundation() {
  const checks = [
    ["CRM_CONTACTS_FOUNDATION_ONLY", crmContactManifest.invariants.CRM_CONTACTS_FOUNDATION_ONLY === true],
    ["NO_STORAGE", crmContactManifest.invariants.NO_STORAGE === true],
    ["NO_API_CALLS", crmContactManifest.invariants.NO_API_CALLS === true],
    ["NO_BUSINESS_WORKFLOW", crmContactManifest.invariants.NO_BUSINESS_WORKFLOW === true],
    ["PLATFORM_MUTATION_FALSE", crmContactManifest.invariants.PLATFORM_MUTATION === false],
  ];
  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
