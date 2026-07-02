export const AS6_SCENARIO_PLANNER_STAGE = 'AS6_EPIC008_PR3_SCENARIO_PLANNER';

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const normalizeText = (value) => String(value ?? '').trim();

const extractRecommendationPriority = (recommendation) => {
  const raw = recommendation?.priority ?? recommendation?.score ?? recommendation?.rank ?? 0;
  return clampScore(raw);
};

const buildPlanStep = (recommendation, index) => {
  const title = normalizeText(recommendation?.title || recommendation?.name || recommendation?.action || `Scenario step ${index + 1}`);
  const reason = normalizeText(recommendation?.reason || recommendation?.explanation || recommendation?.why || 'Recommendation selected by AS6 Scenario Planner.');
  const priority = extractRecommendationPriority(recommendation);
  return {
    id: `as6-scenario-step-${index + 1}`,
    title,
    reason,
    priority,
    order: index + 1,
    status: 'planned',
    source: 'recommendation-engine',
  };
};

export const createAS6ScenarioPlan = ({ context = {}, recommendations = [], governance = {} } = {}) => {
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const sorted = [...safeRecommendations].sort((a, b) => extractRecommendationPriority(b) - extractRecommendationPriority(a));
  const steps = sorted.slice(0, 6).map(buildPlanStep);
  const contextName = normalizeText(context?.businessHome?.name || context?.workspace?.name || context?.name || 'AS6 Workspace');
  const blocked = Boolean(governance?.blocked || governance?.isBlocked);
  const conflicts = [];
  if (blocked) conflicts.push('Governance blocked scenario execution.');
  if (steps.length === 0) conflicts.push('No recommendations available for scenario planning.');
  const readiness = blocked ? 0 : clampScore(steps.length * 15 + (steps.some((step) => step.priority >= 70) ? 10 : 0));
  return {
    id: 'as6-scenario-plan-current',
    stage: AS6_SCENARIO_PLANNER_STAGE,
    title: `Scenario plan for ${contextName}`,
    mode: 'planning-only',
    readiness,
    steps,
    conflicts,
    canExecute: !blocked && steps.length > 0,
    executionTarget: 'existing-execution-engine',
    storagePolicy: 'no-new-persistent-storage',
    explanation: 'Scenario Planner converts ranked recommendations into an explainable execution-ready plan without executing actions itself.',
  };
};

export const AS6_SCENARIO_PLANNER_INVARIANTS = Object.freeze({
  noExecution: true,
  noPersistentStorage: true,
  usesContextIntelligence: true,
  usesRecommendationEngine: true,
  handsOffToExecutionEngine: true,
});
