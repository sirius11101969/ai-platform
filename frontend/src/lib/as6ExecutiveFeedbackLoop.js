export const AS6_EXECUTIVE_FEEDBACK_LOOP_STAGE = 'AS6_EPIC008_PR6_EXECUTIVE_FEEDBACK_LOOP';

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value) => Math.max(0, Math.min(100, Math.round(toNumber(value))));
const text = (value) => String(value ?? '').trim();
const list = (value) => Array.isArray(value) ? value : [];

export function createAS6PredictionAccuracy({ predicted = 0, actual = 0 } = {}) {
  const p = clamp(predicted);
  const a = clamp(actual);
  return clamp(100 - Math.abs(p - a));
}

export function createAS6ExecutiveFeedbackLoop({
  auditTrail = {},
  outcome = {},
  feedback = [],
  recommendation = {},
  scenario = {},
} = {}) {
  const decisionId = text(auditTrail.decisionId || outcome.decisionId || recommendation.decisionId || scenario.decisionId || 'as6-decision-unset');
  const predictedScore = clamp(outcome.predictedScore ?? auditTrail.predictedScore ?? 0);
  const actualScore = clamp(outcome.actualScore ?? outcome.score ?? 0);
  const predictionAccuracy = createAS6PredictionAccuracy({ predicted: predictedScore, actual: actualScore });
  const normalizedFeedback = list(feedback).map((item, index) => ({
    id: `${decisionId}-feedback-${index + 1}`,
    order: index + 1,
    signal: text(item.signal || item.title || item.type || 'feedback-signal'),
    impact: clamp(item.impact ?? item.score ?? predictionAccuracy),
    source: text(item.source || 'executive-feedback-loop'),
  }));
  const recommendationQualityDelta = clamp((predictionAccuracy + normalizedFeedback.reduce((sum, item) => sum + item.impact, 0)) / Math.max(1, normalizedFeedback.length + 1));
  return {
    id: `${decisionId}-executive-feedback-loop`,
    decisionId,
    stage: AS6_EXECUTIVE_FEEDBACK_LOOP_STAGE,
    mode: 'analytical-improvement-only',
    storagePolicy: 'no-new-persistent-storage',
    mutationPolicy: 'no-completed-decision-mutation',
    links: {
      decisionId,
      outcomeId: text(outcome.id || 'outcome-unset'),
      recommendationId: text(recommendation.id || recommendation.title || 'recommendation-unset'),
      scenarioId: text(scenario.id || scenario.title || 'scenario-unset'),
    },
    outcomeTrace: {
      decisionId,
      predictedScore,
      actualScore,
      status: text(outcome.status || 'outcome-linked'),
    },
    predictionAccuracy,
    recommendationQualityDelta,
    feedback: normalizedFeedback,
    explanation: 'Executive Feedback Loop links decision outcomes to analytical feedback and prediction accuracy without mutating completed decisions or execution state.',
  };
}

export const AS6_EXECUTIVE_FEEDBACK_LOOP_INVARIANTS = Object.freeze({
  analyticalImprovementOnly: true,
  noPersistentStorage: true,
  noCompletedDecisionMutation: true,
  noExecutionEngineMutation: true,
  usesDecisionId: true,
  linksOutcomeFeedbackPredictionAccuracy: true,
});
