import { validateAS6AIActionEnginePolicy } from "./AS6AIActionEngine";

export const AS6_AI_ACTION_POLICY_VERSION = "P5";

export function validateAS6AIActionPolicy() {
  const engineValidation = validateAS6AIActionEnginePolicy();

  return {
    ok: engineValidation.ok,
    failures: engineValidation.failures,
    version: AS6_AI_ACTION_POLICY_VERSION,
  };
}
