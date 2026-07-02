export const AS6_EXECUTIVE_AUDIT_TRAIL_STAGE = 'AS6_EPIC008_PR5_EXECUTIVE_AUDIT_TRAIL';

const clean = (value) => String(value ?? '').trim();
const safeList = (value) => Array.isArray(value) ? value : [];
const stablePart = (value, fallback) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;

export function createAS6DecisionId({ recommendation = {}, scenario = {}, prediction = {}, execution = {} } = {}) {
  const recommendationPart = stablePart(recommendation.id || recommendation.title || recommendation.name, 'recommendation');
  const scenarioPart = stablePart(scenario.id || scenario.title || scenario.stepId, 'scenario');
  const predictionPart = stablePart(prediction.id || prediction.title || prediction.stepId, 'prediction');
  const executionPart = stablePart(execution.id || execution.title || execution.status, 'execution');
  return `as6-decision-${recommendationPart}-${scenarioPart}-${predictionPart}-${executionPart}`;
}

export function createAS6ExecutiveAuditTrail({
  recommendation = {},
  scenario = {},
  prediction = {},
  execution = {},
  reasonTrace = [],
  decisionHistory = [],
} = {}) {
  const decisionId = createAS6DecisionId({ recommendation, scenario, prediction, execution });
  const normalizedReasonTrace = safeList(reasonTrace).map((reason, index) => ({
    id: `${decisionId}-reason-${index + 1}`,
    order: index + 1,
    reason: clean(reason.reason || reason.title || reason),
    source: clean(reason.source || 'executive-intelligence'),
  })).filter((item) => item.reason);
  const normalizedDecisionHistory = safeList(decisionHistory).map((item, index) => ({
    id: `${decisionId}-history-${index + 1}`,
    order: index + 1,
    title: clean(item.title || item.action || item.status || `Decision checkpoint ${index + 1}`),
    explanation: clean(item.explanation || item.reason || 'Decision checkpoint recorded for explainability.'),
    source: clean(item.source || 'executive-intelligence'),
  }));
  const predictionExecutionLink = {
    decisionId,
    predictionId: clean(prediction.id || prediction.stepId || 'prediction-unset'),
    executionId: clean(execution.id || execution.stepId || 'execution-unset'),
    status: clean(execution.status || 'linked-for-explainability'),
    mutationPolicy: 'no-mutation',
  };
  return {
    id: `${decisionId}-audit-trail`,
    decisionId,
    stage: AS6_EXECUTIVE_AUDIT_TRAIL_STAGE,
    mode: 'explainability-only',
    storagePolicy: 'no-new-persistent-storage',
    mutationPolicy: 'read-only-linking',
    links: {
      recommendationId: clean(recommendation.id || recommendation.title || 'recommendation-unset'),
      scenarioId: clean(scenario.id || scenario.stepId || 'scenario-unset'),
      predictionId: predictionExecutionLink.predictionId,
      executionId: predictionExecutionLink.executionId,
    },
    predictionExecutionLink,
    decisionHistory: normalizedDecisionHistory,
    reasonTrace: normalizedReasonTrace,
    explanation: 'Executive Audit Trail links recommendation, scenario, prediction and execution into explainable decision history without mutating upstream results.',
  };
}

export const AS6_EXECUTIVE_AUDIT_TRAIL_INVARIANTS = Object.freeze({
  explainabilityOnly: true,
  noPersistentStorage: true,
  noExecutionMutation: true,
  noPredictionMutation: true,
  requiresDecisionId: true,
  linksPredictionToExecution: true,
});
