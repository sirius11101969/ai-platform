import { createAS6ExecutiveIntelligenceDashboard } from '../../lib/as6ExecutiveIntelligenceDashboard';

export default function AS6ExecutiveIntelligenceDashboardPanel({
  decisionId = 'as6-decision-current',
  recommendation = { score: 84 },
  scenario = { readiness: 82 },
  prediction = { predictionAccuracy: 78 },
  execution = { score: 80 },
  auditTrail = { score: 90 },
  feedbackLoop = { predictionAccuracy: 79 },
  decisionQualityScore = { qualityScore: 83 },
}) {
  const dashboard = createAS6ExecutiveIntelligenceDashboard({
    decisionId,
    recommendation,
    scenario,
    prediction,
    execution,
    auditTrail,
    feedbackLoop,
    decisionQualityScore,
  });

  return (
    <section className="as6-card as6-executive-intelligence-dashboard-panel" aria-label="AS6 Executive Intelligence Dashboard">
      <div className="as6-card__header">
        <div>
          <p className="as6-eyebrow">Executive Intelligence</p>
          <h2>Executive Intelligence Dashboard</h2>
        </div>
        <span className="as6-badge">{dashboard.aggregationScore}% complete</span>
      </div>
      <p className="as6-muted">{dashboard.explanation}</p>
      <div className="as6-scenario-step">
        <div className="as6-scenario-step__meta">
          <span>decisionId</span>
          <strong>{dashboard.mode}</strong>
        </div>
        <p>{dashboard.decisionId}</p>
      </div>
      <div className="as6-scenario-steps">
        {dashboard.modules.map((item) => (
          <article key={item.key} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>{item.status}</span>
              <strong>{item.score}%</strong>
            </div>
            <h3>{item.label}</h3>
            <p>Trace: {item.decisionId}</p>
          </article>
        ))}
      </div>
      <footer className="as6-panel-footer">
        <span>Modules: {dashboard.moduleCount}</span>
        <span>Mutation: {dashboard.mutationPolicy}</span>
      </footer>
    </section>
  );
}
