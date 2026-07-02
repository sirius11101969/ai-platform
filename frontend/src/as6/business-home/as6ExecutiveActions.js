export const AS6_EXECUTIVE_ACTIONS_VERSION = "EPIC003_PR1";

export const AS6_EXECUTIVE_ACTION_TARGETS = {
  businessHome: "/business-home",
  crm: "/crm-workspace",
  dashboard: "/dashboard",
  workspace: "/as6-workspace",
  executiveDashboard: "/ai-executive-dashboard",
  commandCenter: "/command-center",
};

export function createAS6ExecutiveFallbackAction(reason = "Безопасное действие не определено") {
  return {
    type: "suggest-next-step",
    label: "Показать следующий шаг",
    target: AS6_EXECUTIVE_ACTION_TARGETS.businessHome,
    reason,
    safe: true,
  };
}

export function resolveAS6ExecutiveActionTarget(actionText = "") {
  const value = String(actionText).toLowerCase();
  if (value.includes("crm") || value.includes("revenue")) return AS6_EXECUTIVE_ACTION_TARGETS.crm;
  if (value.includes("dashboard") || value.includes("live data")) return AS6_EXECUTIVE_ACTION_TARGETS.dashboard;
  if (value.includes("workspace")) return AS6_EXECUTIVE_ACTION_TARGETS.workspace;
  if (value.includes("command")) return AS6_EXECUTIVE_ACTION_TARGETS.commandCenter;
  if (value.includes("executive")) return AS6_EXECUTIVE_ACTION_TARGETS.executiveDashboard;
  return AS6_EXECUTIVE_ACTION_TARGETS.businessHome;
}

export function createAS6ExecutiveAction(insight) {
  if (!insight) return createAS6ExecutiveFallbackAction();
  const target = resolveAS6ExecutiveActionTarget(insight.action || insight.title || insight.reason);
  return {
    type: "navigate",
    label: insight.action || "Открыть связанный модуль",
    target,
    reason: insight.reason || "AS6 Executive recommendation",
    safe: Object.values(AS6_EXECUTIVE_ACTION_TARGETS).includes(target),
  };
}

export function executeAS6ExecutiveAction(action) {
  const safeAction = action?.safe ? action : createAS6ExecutiveFallbackAction("Action target failed safety validation");
  if (safeAction.type === "navigate" && safeAction.target) {
    window.location.assign(safeAction.target);
    return { ok: true, action: safeAction };
  }
  return { ok: false, action: safeAction };
}
