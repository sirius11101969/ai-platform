import { getAS6LivingStateList } from "../states/livingStates.js";

export const AS6_GOLDEN_MASTER_VALIDATION_VERSION = "SPRINT_4_GOLDEN_MASTER_VALIDATION";

export function validateLivingStateRegistry() {
  const states = getAS6LivingStateList();
  const stateIds = states.map((state) => state.id);
  const requiredIds = [
    "living",
    "focus",
    "thinking",
    "analytics",
    "strategy",
    "decision",
    "automation",
    "knowledge",
    "growth",
    "harmony",
  ];

  const missing = requiredIds.filter((id) => !stateIds.includes(id));
  const invalidLanguage = states.filter((state) => /focus|thinking|analytics|strategy|decision|growth|harmony/i.test(state.title));
  const invalidCapsule = states.filter((state) => state.subtitle !== "Живое пространство");
  const missingMessage = states.filter((state) => !state.message?.title || !state.message?.action);

  return {
    version: AS6_GOLDEN_MASTER_VALIDATION_VERSION,
    pass: missing.length === 0 && invalidLanguage.length === 0 && invalidCapsule.length === 0 && missingMessage.length === 0,
    checks: {
      requiredStatesPresent: missing.length === 0,
      russianStateNames: invalidLanguage.length === 0,
      livingSpaceSecondaryLabel: invalidCapsule.length === 0,
      siriusMessagePresent: missingMessage.length === 0,
    },
    evidence: {
      totalStates: states.length,
      missing,
      invalidLanguage: invalidLanguage.map((state) => state.id),
      invalidCapsule: invalidCapsule.map((state) => state.id),
      missingMessage: missingMessage.map((state) => state.id),
    },
  };
}
