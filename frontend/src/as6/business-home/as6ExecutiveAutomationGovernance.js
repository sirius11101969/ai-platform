import { AS6_EXECUTIVE_ACTION_REGISTRY } from "./as6ExecutiveActionRegistry.js";

export const AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_VERSION = "EPIC005_PR1";

export const AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_POLICY = {
  version: AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_VERSION,
  runtimeOnly: true,
  maxSteps: 8,
  allowedActionIds: Object.keys(AS6_EXECUTIVE_ACTION_REGISTRY),
  blockedActionIds: [],
  requireSafeActions: true,
  requireRegisteredActions: true,
};

export function validateAS6ExecutiveAutomationGovernance(scenario = {}) {
  const steps = Array.isArray(scenario.steps) ? scenario.steps : [];
  const actionIds = steps.map((step) => step.actionId).filter(Boolean);
  const failures = [];

  if (!steps.length) failures.push("AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_GAP");
  if (steps.length > AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_POLICY.maxSteps) failures.push("AS6_EXECUTIVE_AUTOMATION_SAFETY_POLICY_GAP");

  const unknownActions = actionIds.filter((actionId) => !AS6_EXECUTIVE_ACTION_REGISTRY[actionId]);
  if (unknownActions.length) failures.push("AS6_EXECUTIVE_AUTOMATION_UNSAFE_CHAIN_DRIFT");

  const unsafeActions = actionIds.filter((actionId) => AS6_EXECUTIVE_ACTION_REGISTRY[actionId]?.safe !== true);
  if (unsafeActions.length) failures.push("AS6_EXECUTIVE_AUTOMATION_UNSAFE_CHAIN_DRIFT");

  return {
    ok: failures.length === 0,
    allowed: failures.length === 0,
    failures,
    actionIds,
    unknownActions,
    version: AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_VERSION,
  };
}

export function explainAS6ExecutiveAutomationDecision(decision = {}) {
  if (decision.allowed) return "Сценарий разрешён: все действия зарегистрированы, безопасны и соответствуют runtime policy.";
  if (decision.failures?.includes("AS6_EXECUTIVE_AUTOMATION_UNSAFE_CHAIN_DRIFT")) return "Сценарий заблокирован: обнаружена неизвестная или небезопасная цепочка действий.";
  if (decision.failures?.includes("AS6_EXECUTIVE_AUTOMATION_SAFETY_POLICY_GAP")) return "Сценарий заблокирован: превышены ограничения runtime safety policy.";
  return "Сценарий заблокирован: governance validation не прошла.";
}

export function createAS6ExecutiveAutomationGovernanceFallback(reason = "Scenario blocked by governance policy") {
  return {
    ok: false,
    allowed: false,
    blocked: true,
    status: "blocked",
    reason,
    explanation: reason,
    fallback: true,
    version: AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_VERSION,
  };
}

export function guardAS6ExecutiveAutomationScenario(scenario = {}) {
  const decision = validateAS6ExecutiveAutomationGovernance(scenario);
  const explanation = explainAS6ExecutiveAutomationDecision(decision);
  if (!decision.allowed) return createAS6ExecutiveAutomationGovernanceFallback(explanation);
  return {
    ok: true,
    allowed: true,
    blocked: false,
    status: "allowed",
    decision,
    explanation,
    version: AS6_EXECUTIVE_AUTOMATION_GOVERNANCE_VERSION,
  };
}
