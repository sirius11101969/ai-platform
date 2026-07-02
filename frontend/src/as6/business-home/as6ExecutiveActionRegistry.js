export const AS6_EXECUTIVE_ACTION_REGISTRY_VERSION = "EPIC003_PR2";

export const AS6_EXECUTIVE_ACTION_REGISTRY = {
  openBusinessHome: { actionId: "openBusinessHome", type: "navigate", label: "Открыть Business Home", target: "/business-home", safe: true },
  openCrm: { actionId: "openCrm", type: "navigate", label: "Открыть CRM", target: "/crm-workspace", safe: true },
  openDashboard: { actionId: "openDashboard", type: "navigate", label: "Открыть Dashboard", target: "/dashboard", safe: true },
  openWorkspace: { actionId: "openWorkspace", type: "navigate", label: "Открыть Workspace", target: "/as6-workspace", safe: true },
  openExecutiveDashboard: { actionId: "openExecutiveDashboard", type: "navigate", label: "Открыть Executive Dashboard", target: "/ai-executive-dashboard", safe: true },
  openCommandCenter: { actionId: "openCommandCenter", type: "navigate", label: "Открыть Command Center", target: "/command-center", safe: true },
  showNextStep: { actionId: "showNextStep", type: "navigate", label: "Показать следующий шаг", target: "/business-home", safe: true },
};

export function getAS6ExecutiveActionById(actionId = "showNextStep") {
  return AS6_EXECUTIVE_ACTION_REGISTRY[actionId] || AS6_EXECUTIVE_ACTION_REGISTRY.showNextStep;
}

export function validateAS6ExecutiveActionRegistry() {
  const actions = Object.values(AS6_EXECUTIVE_ACTION_REGISTRY);
  const ids = new Set(actions.map((action) => action.actionId));
  const routes = new Set(["/business-home", "/crm-workspace", "/dashboard", "/as6-workspace", "/ai-executive-dashboard", "/command-center"]);
  const failures = [];
  if (ids.size !== actions.length) failures.push("AS6_EXECUTIVE_ACTION_REGISTRY_DUPLICATION_DRIFT");
  if (!actions.every((action) => action.actionId && action.type && action.target)) failures.push("AS6_EXECUTIVE_ACTION_ID_BINDING_GAP");
  if (!actions.every((action) => routes.has(action.target))) failures.push("AS6_EXECUTIVE_ACTION_ROUTE_VALIDATION_GAP");
  if (!AS6_EXECUTIVE_ACTION_REGISTRY.showNextStep) failures.push("AS6_EXECUTIVE_ACTION_ORCHESTRATION_FALLBACK_GAP");
  return { ok: failures.length === 0, failures, count: actions.length, version: AS6_EXECUTIVE_ACTION_REGISTRY_VERSION };
}

export function resolveAS6ExecutiveRegisteredAction(actionId = "showNextStep") {
  const action = getAS6ExecutiveActionById(actionId);
  return action?.safe ? action : AS6_EXECUTIVE_ACTION_REGISTRY.showNextStep;
}
