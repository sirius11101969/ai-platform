import { validateAS6AIContextEnginePolicy } from "./AS6AIContextEngine";

export const AS6_AI_CONTEXT_POLICY_VERSION = "P4";

export function validateAS6AIContextPolicy() {
  const engineValidation = validateAS6AIContextEnginePolicy();
  const failures = [...engineValidation.failures];

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_AI_CONTEXT_POLICY_VERSION,
  };
}
