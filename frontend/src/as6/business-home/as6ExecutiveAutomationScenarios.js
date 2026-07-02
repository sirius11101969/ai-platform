import { guardAS6ExecutiveAutomationScenario } from "./as6ExecutiveAutomationGovernance.js";
import { getAS6ExecutiveActionById, validateAS6ExecutiveActionRegistry } from "./as6ExecutiveActionRegistry.js";
import { executeAS6ExecutiveAction } from "./as6ExecutiveActions.js";

export const AS6_EXECUTIVE_AUTOMATION_SCENARIOS_VERSION = "EPIC004_PR2";

export const AS6_EXECUTIVE_AUTOMATION_SCENARIOS = {
  dashboardHealthExecutive: {
    scenarioId: "dashboardHealthExecutive",
    title: "Dashboard → Health → Executive Dashboard",
    actionIds: ["openDashboard", "openCommandCenter", "openExecutiveDashboard"],
  },
  crmRevenueFusion: {
    scenarioId: "crmRevenueFusion",
    title: "CRM → Revenue CRM Fusion",
    actionIds: ["openCrm", "openDashboard"],
  },
  workspaceNextStep: {
    scenarioId: "workspaceNextStep",
    title: "Workspace → Next Step",
    actionIds: ["openWorkspace", "showNextStep"],
  },
  businessHomeInsights: {
    scenarioId: "businessHomeInsights",
    title: "Business Home → Executive Insights",
    actionIds: ["openBusinessHome", "showNextStep"],
  },
};

export function createAS6ExecutiveAutomationFallbackPlan(reason = "Unknown automation scenario") {
  return {
    scenarioId: "fallback",
    title: "Fallback Automation Plan",
    reason,
    actions: [getAS6ExecutiveActionById("showNextStep")],
    runtimeOnly: true,
  };
}

export function validateAS6ExecutiveAutomationScenario(scenario) {
  const registry = validateAS6ExecutiveActionRegistry();
  const failures = [];
  if (!scenario?.scenarioId || !Array.isArray(scenario?.actionIds)) failures.push("AS6_EXECUTIVE_AUTOMATION_SCENARIO_GAP");
  const actions = (scenario?.actionIds || []).map((actionId) => getAS6ExecutiveActionById(actionId));
  if (!actions.every((action) => action?.actionId && action?.safe)) failures.push("AS6_EXECUTIVE_AUTOMATION_UNKNOWN_ACTION_GAP");
  if (!registry.ok) failures.push("AS6_EXECUTIVE_AUTOMATION_ACTION_SEQUENCE_DRIFT");
  return { ok: failures.length === 0, failures, actions, registry };
}

export function createAS6ExecutiveAutomationPlan(scenarioId = "businessHomeInsights") {
  const scenario = AS6_EXECUTIVE_AUTOMATION_SCENARIOS[scenarioId];
  if (!scenario) return createAS6ExecutiveAutomationFallbackPlan("Unknown scenarioId: " + scenarioId);
  const validation = validateAS6ExecutiveAutomationScenario(scenario);
  if (!validation.ok) return createAS6ExecutiveAutomationFallbackPlan(validation.failures.join(", "));
  return {
    scenarioId: scenario.scenarioId,
    title: scenario.title,
    actions: validation.actions,
    runtimeOnly: true,
    validation,
  };
}

export function executeAS6ExecutiveAutomationScenario(scenarioId = "businessHomeInsights") {
  const governance = guardAS6ExecutiveAutomationScenario(scenarioId = "businessHomeInsights");
  if (!governance.allowed) return governance;
  const plan = createAS6ExecutiveAutomationPlan(scenarioId);
  const firstAction = plan.actions[0];
  if (!firstAction?.safe) return { ok: false, plan };
  return { ok: true, plan, execution: executeAS6ExecutiveAction(firstAction) };
}


export function createAS6ExecutiveAutomationPipeline(plan) {
  const actions = Array.isArray(plan?.actions) ? plan.actions : [];
  return {
    scenarioId: plan?.scenarioId || "fallback",
    title: plan?.title || "Fallback Automation Pipeline",
    status: actions.length ? "idle" : "failed",
    currentStep: 0,
    totalSteps: actions.length,
    progress: actions.length ? 0 : 100,
    reason: actions.length ? null : "AS6_EXECUTIVE_AUTOMATION_PIPELINE_GAP",
    actions,
    runtimeOnly: true,
  };
}

export function executeAS6ExecutiveAutomationPipeline(plan) {
  const pipeline = createAS6ExecutiveAutomationPipeline(plan);
  const completed = [];
  if (!pipeline.actions.length) return { ...pipeline, status: "failed", completed, reason: "No actions in pipeline" };
  for (let index = 0; index < pipeline.actions.length; index += 1) {
    const action = pipeline.actions[index];
    if (!action?.safe) {
      return { ...pipeline, status: "failed", currentStep: index + 1, progress: Math.round((index / pipeline.totalSteps) * 100), completed, reason: "Unsafe action: " + (action?.actionId || "unknown") };
    }
    completed.push(action.actionId);
  }
  return { ...pipeline, status: "completed", currentStep: pipeline.totalSteps, progress: 100, completed, reason: null };
}
