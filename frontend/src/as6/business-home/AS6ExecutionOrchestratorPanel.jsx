import React from 'react';
import './AS6ExecutionOrchestratorPanel.css';
import { selectNextExecutiveScenario } from './as6ExecutionOrchestrator.js';

const demoScenarios = [
  { scenarioId: 'executive.summary.refresh', actionId: 'executive.summary.refresh', priority: 'critical', label: 'Refresh executive summary' },
  { scenarioId: 'executive.automation.launchApproved', actionId: 'executive.automation.launchApproved', priority: 'high', label: 'Launch approved automation' },
  { scenarioId: 'executive.unsafe.chain', actionId: 'executive.unsafe.chain', priority: 'normal', label: 'Unsafe chain review' }
];

const demoCompletedScenarioIds = ['executive.summary.refresh'];

export default function AS6ExecutionOrchestratorPanel() {
  const result = selectNextExecutiveScenario({ scenarios: demoScenarios, completedScenarioIds: demoCompletedScenarioIds });
  return (
    <section className="as6-orchestrator" data-as6-component="execution-orchestrator">
      <div className="as6-orchestrator__header">
        <span className="as6-orchestrator__eyebrow">Runtime Orchestrator</span>
        <h2>Выбор следующего сценария</h2>
        <p>AS6 выбирает следующий сценарий по priority, dependsOn, dependency status и governance decision. Если выбрать нельзя, показывается fallback.</p>
      </div>
      <div className="as6-orchestrator__result" data-orchestrator-status={result.status}>
        <strong>{result.status === 'selected' ? 'Selected' : 'Fallback'}</strong>
        <p>{result.selectedScenario ? result.selectedScenario.selectionReason : result.fallback.reason}</p>
        {result.selectedScenario && <p><b>Scenario:</b> {result.selectedScenario.scenarioId}</p>}
      </div>
      <div className="as6-orchestrator__list">
        {result.evaluatedScenarios.map((item) => (
          <article className="as6-orchestrator__card" key={item.scenarioId} data-can-select={item.canSelect ? 'yes' : 'no'}>
            <div className="as6-orchestrator__topline">
              <span>{item.scenarioId}</span>
              <strong>{item.canSelect ? 'Selectable' : 'Waiting/Blocked'}</strong>
            </div>
            <p><b>Priority:</b> {item.priority}</p>
            <p><b>Dependency:</b> {item.dependencyStatus}</p>
            <p><b>Governance:</b> {item.governanceStatus}</p>
            <p><b>Reason:</b> {item.selectionReason}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
