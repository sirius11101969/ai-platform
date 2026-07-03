import { resolveCrmContactFoundation } from "./crmContactResolver";

export function createCrmContactRuntime() {
  const foundation = resolveCrmContactFoundation();
  return Object.freeze({
    foundation,
    mode: "declarative-foundation-only",
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
  });
}
