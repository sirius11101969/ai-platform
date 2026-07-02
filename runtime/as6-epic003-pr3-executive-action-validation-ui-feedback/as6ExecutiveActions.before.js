import { AS6_EXECUTIVE_ACTION_REGISTRY, resolveAS6ExecutiveRegisteredAction } from "./as6ExecutiveActionRegistry.js";

export const AS6_EXECUTIVE_ACTIONS_VERSION = "EPIC003_PR2";

export const AS6_EXECUTIVE_ACTION_TARGETS = Object.fromEntries(Object.entries(AS6_EXECUTIVE_ACTION_REGISTRY).map(([key, action]) => [key, action.target]));

export function createAS6ExecutiveFallbackAction(reason = "Безопасное действие не определено") {
  return {
    ...resolveAS6ExecutiveRegisteredAction("showNextStep"),
    reason,
  };
}

export function resolveAS6ExecutiveActionTarget(actionText = "") {
  const value = String(actionText).toLowerCase();
  if (value.includes("crm") || value.includes("revenue")) return resolveAS6ExecutiveRegisteredAction("openCrm").target;
  if (value.includes("dashboard") || value.includes("live data")) return resolveAS6ExecutiveRegisteredAction("openDashboard").target;
  if (value.includes("workspace")) return resolveAS6ExecutiveRegisteredAction("openWorkspace").target;
  if (value.includes("command")) return resolveAS6ExecutiveRegisteredAction("openCommandCenter").target;
  if (value.includes("executive")) return resolveAS6ExecutiveRegisteredAction("openExecutiveDashboard").target;
  return resolveAS6ExecutiveRegisteredAction("openBusinessHome").target;
}

export function createAS6ExecutiveAction(insight) {
  if (!insight) return createAS6ExecutiveFallbackAction();
  const registeredAction = insight.actionId ? resolveAS6ExecutiveRegisteredAction(insight.actionId) : null;
  if (registeredAction?.safe) return { ...registeredAction, reason: insight.reason || "AS6 Executive recommendation" };
  const fallbackTarget = resolveAS6ExecutiveActionTarget(insight.action || insight.title || insight.reason);
  const fallbackAction = Object.values(AS6_EXECUTIVE_ACTION_REGISTRY).find((action) => action.target === fallbackTarget) || resolveAS6ExecutiveRegisteredAction("showNextStep");
  return { ...fallbackAction, reason: insight.reason || "AS6 Executive recommendation" };
}

export function executeAS6ExecutiveAction(action) {
  const safeAction = action?.safe ? action : createAS6ExecutiveFallbackAction("Action target failed safety validation");
  if (safeAction.type === "navigate" && safeAction.target) {
    window.location.assign(safeAction.target);
    return { ok: true, action: safeAction };
  }
  return { ok: false, action: safeAction };
}
