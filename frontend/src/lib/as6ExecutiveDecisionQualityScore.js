export const AS6_EXECUTIVE_DECISION_QUALITY_SCORE_STAGE = 'AS6_EPIC008_PR7_EXECUTIVE_DECISION_QUALITY_SCORE';

const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value) => Math.max(0, Math.min(100, Math.round(num(value))));
const text = (value) => String(value ?? '').trim();

const componentScore = (value, fallback) => clamp(value?.score ?? value?.quality ?? value?.confidence ?? value?.readiness ?? fallback);

export function createAS6ExecutiveDecisionQualityScore({
  decisionId,
  recommendation = {},
  scenario = {},
  prediction = {},
  execution = {},
  auditTrail = {},
  feedbackLoop = {},
} = {}) {
  const id = text(decisionId || auditTrail.decisionId || feedbackLoop.decisionId || recommendation.decisionId || 'as6-decision-unset');
  const recommendationScore = componentScore(recommendation, 70);
  const scenarioScore = componentScore(scenario, 70);
  const predictionScore = clamp(prediction.predictionAccuracy ?? prediction.confidence ?? prediction.score ?? 70);
  const executionScore = componentScore(execution, 70);
  const auditScore = auditTrail.decisionId || auditTrail.reasonTrace || auditTrail.decisionHistory ? 90 : 40;
  const feedbackScore = clamp(feedbackLoop.predictionAccuracy ?? feedbackLoop.recommendationQualityDelta ?? feedbackLoop.score ?? 70);
  const weights = {
    recommendation: 0.16,
    scenario: 0.14,
    prediction: 0.2,
    execution: 0.16,
    audit: 0.16,
    feedback: 0.18,
  };
  const qualityScore = clamp(
    recommendationScore * weights.recommendation +
    scenarioScore * weights.scenario +
    predictionScore * weights.prediction +
    executionScore * weights.execution +
    auditScore * weights.audit +
    feedbackScore * weights.feedback
  );
  return {
    id: `${id}-decision-quality-score`,
    decisionId: id,
    stage: AS6_EXECUTIVE_DECISION_QUALITY_SCORE_STAGE,
    mode: 'analytical-scoring-only',
    storagePolicy: 'no-new-persistent-storage',
    mutationPolicy: 'no-execution-or-feedback-mutation',
    qualityScore,
    scoreTrace: {
      recommendationScore,
      scenarioScore,
      predictionScore,
      executionScore,
      auditScore,
      feedbackScore,
    },
    explainability: [
      { key: 'recommendation', score: recommendationScore, reason: 'Measures quality of selected recommendation signal.' },
      { key: 'scenario', score: scenarioScore, reason: 'Measures quality of scenario planning readiness.' },
      { key: 'prediction', score: predictionScore, reason: 'Measures prediction accuracy and confidence.' },
      { key: 'execution', score: executionScore, reason: 'Measures execution readiness or completed outcome quality.' },
      { key: 'audit', score: auditScore, reason: 'Measures availability of decision history and reason trace.' },
      { key: 'feedback', score: feedbackScore, reason: 'Measures feedback quality and next recommendation improvement signal.' },
    ],
    explanation: 'Executive Decision Quality Score computes an explainable quality score across recommendation, scenario, prediction, execution, audit and feedback without mutating upstream systems.',
  };
}

export const AS6_EXECUTIVE_DECISION_QUALITY_SCORE_INVARIANTS = Object.freeze({
  analyticalScoringOnly: true,
  usesDecisionId: true,
  noPersistentStorage: true,
  noExecutionEngineMutation: true,
  noFeedbackLoopMutation: true,
  explainableScoreTrace: true,
});
