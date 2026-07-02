export const AS6_EXECUTIVE_SCENARIO_PRIORITIES_VERSION = "EPIC006_PR1";

export const AS6_EXECUTIVE_SCENARIO_PRIORITY_VALUES = {
  critical: { value: "critical", weight: 100, label: "Critical" },
  high: { value: "high", weight: 75, label: "High" },
  normal: { value: "normal", weight: 50, label: "Normal" },
  low: { value: "low", weight: 25, label: "Low" },
};

export const AS6_EXECUTIVE_SCENARIO_PRIORITY_BY_ID = {
  executiveHealthReview: "critical",
  revenueReview: "high",
  workspaceReview: "normal",
  executiveInsightsReview: "normal",
};

export function normalizeAS6ExecutiveScenarioPriority(priority = "normal") {
  return AS6_EXECUTIVE_SCENARIO_PRIORITY_VALUES[priority]?.value || "normal";
}

export function getAS6ExecutiveScenarioPriorityWeight(priority = "normal") {
  return AS6_EXECUTIVE_SCENARIO_PRIORITY_VALUES[normalizeAS6ExecutiveScenarioPriority(priority)].weight;
}

export function getAS6ExecutiveScenarioPriority(scenario = {}) {
  return normalizeAS6ExecutiveScenarioPriority(
    scenario.priority || AS6_EXECUTIVE_SCENARIO_PRIORITY_BY_ID[scenario.id] || "normal"
  );
}

export function explainAS6ExecutiveScenarioPriority(scenario = {}) {
  const priority = getAS6ExecutiveScenarioPriority(scenario);
  const weight = getAS6ExecutiveScenarioPriorityWeight(priority);
  return {
    priority,
    weight,
    explanation: `Scenario "${scenario.title || scenario.id || "unknown"}" is ordered by runtime priority "${priority}" with weight ${weight}.`,
  };
}

export function sortAS6ExecutiveScenariosByPriority(scenarios = []) {
  return [...scenarios].sort((a, b) => {
    const priorityDelta = getAS6ExecutiveScenarioPriorityWeight(getAS6ExecutiveScenarioPriority(b)) - getAS6ExecutiveScenarioPriorityWeight(getAS6ExecutiveScenarioPriority(a));
    if (priorityDelta !== 0) return priorityDelta;
    return String(a.title || a.id || "").localeCompare(String(b.title || b.id || ""));
  });
}

export function validateAS6ExecutiveScenarioPriorities(scenarios = []) {
  const failures = [];
  const priorityValues = Object.keys(AS6_EXECUTIVE_SCENARIO_PRIORITY_VALUES);
  const invalid = scenarios.filter((scenario) => !priorityValues.includes(getAS6ExecutiveScenarioPriority(scenario)));

  if (!priorityValues.includes("critical") || !priorityValues.includes("high") || !priorityValues.includes("normal") || !priorityValues.includes("low")) {
    failures.push("AS6_EXECUTIVE_SCENARIO_PRIORITY_MODEL_GAP");
  }

  if (invalid.length) failures.push("AS6_EXECUTIVE_SCENARIO_PRIORITY_VALUE_DRIFT");

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_EXECUTIVE_SCENARIO_PRIORITIES_VERSION,
    runtimeOnly: true,
  };
}
