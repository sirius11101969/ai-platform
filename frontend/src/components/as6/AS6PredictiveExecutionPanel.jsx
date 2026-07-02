import { createAS6PredictiveExecutionModel } from '../../lib/as6PredictiveExecution';
export default function AS6PredictiveExecutionPanel({ scenarioPlan = {}, executionEngine = {}, auditTrail = [] }) {
  const model = createAS6PredictiveExecutionModel({ scenarioPlan, executionEngine, auditTrail });
  return (
    <section className="as6-card as6-predictive-execution-panel" aria-label="AS6 Predictive Execution">
      <div className="as6-card__header">
        <div>
          <p className="as6-eyebrow">Executive Intelligence</p>
          <h2>Predictive Execution</h2>
        </div>
        <span className="as6-badge">{model.readiness}% ready</span>
      </div>
      <p className="as6-muted">{model.explanation}</p>
      <div className="as6-scenario-steps">
        {model.simulations.map((item) => (
          <article key={item.id} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>{item.expectedImpact} impact</span>
              <strong>{item.confidence}%</strong>
            </div>
            <h3>{item.title}</h3>
            <p>Risk: {item.risk}%. Recommendation: {item.recommendation}.</p>
          </article>
        ))}
      </div>
      <footer className="as6-panel-footer">
        <span>Mode: {model.mode}</span>
        <span>Storage: {model.storagePolicy}</span>
      </footer>
    </section>
  );
}
