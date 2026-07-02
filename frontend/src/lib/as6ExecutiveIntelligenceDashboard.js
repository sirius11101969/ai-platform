export const AS6_EXECUTIVE_INTELLIGENCE_DASHBOARD_STAGE = 'AS6_EPIC008_PR8_EXECUTIVE_INTELLIGENCE_DASHBOARD';

const text = (value) => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value : [];
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value) => Math.max(0, Math.min(100, Math.round(num(value))));

const moduleStatus = (key, label, source = {}) => ({
  key,
  label,
  status: text(source.status || source.state || 'ready'),
  score: clamp(source.qualityScore ?? source.readiness ?? source.predictionAccuracy ?? source.score ?? 80),
  decisionId: text(source.decisionId || 'as6-decision-current'),
});

export function createAS6ExecutiveIntelligenceDashboard({
  decisionId = 'as6-decision-current',
  recommendation = {},
  scenario = {},
  prediction = {},
  execution = {},
  auditTrail = {},
  feedbackLoop = {},
  decisionQualityScore = {},
} = {}) {
  const id = text(decisionId || auditTrail.decisionId || feedbackLoop.decisionId || decisionQualityScore.decisionId || 'as6-decision-current');
  const modules = [
    moduleStatus('recommendation', 'Recommendation Engine', { ...recommendation, decisionId: id }),
    moduleStatus('scenario', 'Scenario Planner', { ...scenario, decisionId: id }),
    moduleStatus('prediction', 'Predictive Execution', { ...prediction, decisionId: id }),
    moduleStatus('execution', 'Execution Engine', { ...execution, decisionId: id }),
    moduleStatus('audit', 'Executive Audit Trail', { ...auditTrail, decisionId: id }),
    moduleStatus('feedback', 'Executive Feedback Loop', { ...feedbackLoop, decisionId: id }),
    moduleStatus('quality', 'Decision Quality Score', { ...decisionQualityScore, decisionId: id }),
  ];
  const aggregationScore = clamp(modules.reduce((sum, item) => sum + item.score, 0) / Math.max(1, modules.length));
  return {
    id: `${id}-executive-intelligence-dashboard`,
    decisionId: id,
    stage: AS6_EXECUTIVE_INTELLIGENCE_DASHBOARD_STAGE,
    mode: 'visualization-and-aggregation-only',
    storagePolicy: 'no-new-persistent-storage',
    mutationPolicy: 'no-executive-module-mutation',
    aggregationScore,
    modules,
    moduleCount: modules.length,
    readyCount: modules.filter((item) => item.status === 'ready' || item.status === 'pass').length,
    trace: list(modules).map((item) => ({ key: item.key, decisionId: item.decisionId, score: item.score })),
    explanation: 'Executive Intelligence Dashboard aggregates and displays the complete executive decision chain without creating storage or mutating analytical modules.',
  };
}

export const AS6_EXECUTIVE_INTELLIGENCE_DASHBOARD_INVARIANTS = Object.freeze({
  visualizationAggregationOnly: true,
  usesDecisionId: true,
  noPersistentStorage: true,
  noRecommendationMutation: true,
  noScenarioMutation: true,
  noPredictionMutation: true,
  noExecutionMutation: true,
  noAuditMutation: true,
  noFeedbackMutation: true,
  noQualityScoreMutation: true,
});
