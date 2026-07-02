import { createAS6ExecutiveFeedbackLoop } from '../../lib/as6ExecutiveFeedbackLoop';

export default function AS6ExecutiveFeedbackLoopPanel({
  auditTrail = { decisionId: 'as6-decision-current', predictedScore: 80 },
  outcome = { id: 'outcome-current', actualScore: 76, status: 'completed' },
  feedback = [],
  recommendation = { id: 'recommendation-current', title: 'Current recommendation' },
  scenario = { id: 'scenario-current', title: 'Current scenario' },
}) {
  const model = createAS6ExecutiveFeedbackLoop({
    auditTrail,
    outcome,
    feedback: feedback.length ? feedback : [
      { signal: 'Outcome matched predicted direction', impact: 82, source: 'audit-trail' },
      { signal: 'Scenario assumptions remain useful for next recommendation', impact: 78, source: 'scenario-planner' },
    ],
    recommendation,
    scenario,
  });

  return (
    <section className="as6-card as6-executive-feedback-loop-panel" aria-label="AS6 Executive Feedback Loop">
      <div className="as6-card__header">
        <div>
          <p className="as6-eyebrow">Executive Intelligence</p>
          <h2>Executive Feedback Loop</h2>
        </div>
        <span className="as6-badge">{model.predictionAccuracy}% accurate</span>
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
        {model.feedback.map((item) => (
          <article key={item.id} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>Feedback {item.order}</span>
              <strong>{item.impact}%</strong>
            </div>
            <h3>{item.signal}</h3>
            <p>Source: {item.source}</p>
          </article>
        ))}
      </div>
      <footer className="as6-panel-footer">
        <span>Prediction accuracy: {model.predictionAccuracy}%</span>
        <span>Next quality delta: {model.recommendationQualityDelta}%</span>
      </footer>
    </section>
  );
}
