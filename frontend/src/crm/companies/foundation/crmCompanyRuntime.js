import { resolveCrmCompanyFoundation } from "./crmCompanyResolver";

export function createCrmCompanyRuntime() {
  const foundation = resolveCrmCompanyFoundation();

  return Object.freeze({
    foundation,
    mode: "declarative-foundation-only",
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    platformMutation: false,
  });
}
