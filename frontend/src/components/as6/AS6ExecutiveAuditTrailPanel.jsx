import { createAS6ExecutiveAuditTrail } from '../../lib/as6ExecutiveAuditTrail';

const fallbackRecommendation = { id: 'recommendation-current', title: 'Highest-impact recommendation' };
const fallbackScenario = { id: 'scenario-current', title: 'Selected scenario plan' };
const fallbackPrediction = { id: 'prediction-current', title: 'Predicted execution outcome' };
const fallbackExecution = { id: 'execution-current', status: 'ready-for-handoff' };

export default function AS6ExecutiveAuditTrailPanel({
  recommendation = fallbackRecommendation,
  scenario = fallbackScenario,
  prediction = fallbackPrediction,
  execution = fallbackExecution,
  reasonTrace = [],
  decisionHistory = [],
}) {
  const audit = createAS6ExecutiveAuditTrail({
    recommendation,
    scenario,
    prediction,
    execution,
    reasonTrace: reasonTrace.length ? reasonTrace : [
      { reason: 'Recommendation was selected by Executive Intelligence.', source: 'recommendation-engine' },
      { reason: 'Scenario Planner converted recommendation into an execution-ready plan.', source: 'scenario-planner' },
      { reason: 'Predictive Execution simulated expected outcome before handoff.', source: 'predictive-execution' },
    ],
    decisionHistory: decisionHistory.length ? decisionHistory : [
      { title: 'Recommendation selected', explanation: 'Initial executive recommendation entered the decision chain.' },
      { title: 'Scenario planned', explanation: 'Scenario Planner created a planning-only execution path.' },
      { title: 'Prediction linked', explanation: 'Predictive Execution result was linked to execution handoff.' },
    ],
  });

  return (
    <section className="as6-card as6-executive-audit-trail-panel" aria-label="AS6 Executive Audit Trail">
      <div className="as6-card__header">
        <div>
          <p className="as6-eyebrow">Executive Intelligence</p>
          <h2>Executive Audit Trail</h2>
        </div>
        <span className="as6-badge">Explainable</span>
      </div>
      <p className="as6-muted">{audit.explanation}</p>
      <div className="as6-scenario-step">
        <div className="as6-scenario-step__meta">
          <span>decisionId</span>
          <strong>{audit.mode}</strong>
        </div>
        <p>{audit.decisionId}</p>
      </div>
      <div className="as6-scenario-steps">
        {audit.decisionHistory.map((item) => (
          <article key={item.id} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>History {item.order}</span>
              <strong>{item.source}</strong>
            </div>
            <h3>{item.title}</h3>
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>
      <div className="as6-scenario-steps">
        {audit.reasonTrace.map((item) => (
          <article key={item.id} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>Reason {item.order}</span>
              <strong>{item.source}</strong>
            </div>
            <p>{item.reason}</p>
          </article>
        ))}
      </div>
      <footer className="as6-panel-footer">
        <span>Prediction: {audit.predictionExecutionLink.predictionId}</span>
        <span>Execution: {audit.predictionExecutionLink.executionId}</span>
      </footer>
    </section>
  );
}
