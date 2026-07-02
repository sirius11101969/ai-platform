import { createAS6ScenarioPlan } from '../../lib/as6ScenarioPlanner';

const fallbackRecommendations = [
  {
    title: 'Review the highest-impact workspace recommendation',
    reason: 'AS6 should turn the strongest recommendation into the first planned scenario step.',
    priority: 90,
  },
  {
    title: 'Check governance and execution readiness',
    reason: 'AS6 must verify conflicts before handing a plan to Execution Engine.',
    priority: 82,
  },
  {
    title: 'Prepare explainable execution handoff',
    reason: 'The plan must remain transparent and auditable before execution.',
    priority: 76,
  },
];

export default function AS6ScenarioPlannerPanel({ context = {}, recommendations = [], governance = {} }) {
  const plan = createAS6ScenarioPlan({
    context,
    recommendations: recommendations.length ? recommendations : fallbackRecommendations,
    governance,
  });

  return (
    <section className="as6-card as6-scenario-planner-panel" aria-label="AS6 Scenario Planner">
      <div className="as6-card__header">
        <div>
          <p className="as6-eyebrow">Executive Intelligence</p>
          <h2>Scenario Planner</h2>
        </div>
        <span className="as6-badge">{plan.readiness}% ready</span>
      </div>
      <p className="as6-muted">{plan.explanation}</p>
      <ol className="as6-scenario-steps">
        {plan.steps.map((step) => (
          <li key={step.id} className="as6-scenario-step">
            <div className="as6-scenario-step__meta">
              <span>Step {step.order}</span>
              <strong>{step.priority}%</strong>
            </div>
            <h3>{step.title}</h3>
            <p>{step.reason}</p>
          </li>
        ))}
      </ol>
      {plan.conflicts.length > 0 && (
        <div className="as6-alert" role="status">
          {plan.conflicts.map((conflict) => (
            <p key={conflict}>{conflict}</p>
          ))}
        </div>
      )}
      <footer className="as6-panel-footer">
        <span>Mode: {plan.mode}</span>
        <span>Target: {plan.executionTarget}</span>
      </footer>
    </section>
  );
}
