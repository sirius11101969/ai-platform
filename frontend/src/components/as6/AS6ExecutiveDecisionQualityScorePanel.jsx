import { createAS6ExecutiveDecisionQualityScore } from '../../lib/as6ExecutiveDecisionQualityScore';

export default function AS6ExecutiveDecisionQualityScorePanel({
  decisionId = 'as6-decision-current',
  recommendation = { score: 84 },
  scenario = { readiness: 82 },
  prediction = { predictionAccuracy: 78 },
  execution = { quality: 80 },
  auditTrail = { decisionId: 'as6-decision-current', reasonTrace: true, decisionHistory: true },
  feedbackLoop = { predictionAccuracy: 79, recommendationQualityDelta: 81 },
}) {
  const model = createAS6ExecutiveDecisionQualityScore({
    decisionId,
    recommendation,
    scenario,
    prediction,
    execution,
    auditTrail,
    feedbackLoop,
  });

  return (
    <section className="as6-card as6-executive-decision-quality-score-panel" aria-label="AS6 Executive Decision Quality Score">
      <div className="as6-card__header">
        <div>
          <p className="as6-eyebrow">Executive Intelligence</p>
          <h2>Decision Quality Score</h2>
        </div>
        <span className="as6-badge">{model.qualityScore}% quality</span>
      </div>
      <p className="as6-muted">{model.explanation}</p>
      <div className="as6-scenario-step">
        <div className="as6-scenario-step__meta">
          <span>decisionId</span>
          <strong>{model.mode}</strong>
        </div>
        <p>{model.decisionId}</p>
      </div>
      <div className="as6-scenario-steps">
        {model.explainability.map((item) => (
          <article key={item.key} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>{item.key}</span>
              <strong>{item.score}%</strong>
            </div>
            <p>{item.reason}</p>
          </article>
        ))}
      </div>
      <footer className="as6-panel-footer">
        <span>Storage: {model.storagePolicy}</span>
        <span>Mutation: {model.mutationPolicy}</span>
      </footer>
    </section>
  );
}
