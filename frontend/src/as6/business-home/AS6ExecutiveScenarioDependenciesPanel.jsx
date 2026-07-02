import React from 'react';
import './AS6ExecutiveScenarioDependenciesPanel.css';
import { validateExecutiveScenarioDependencies, hasExecutiveScenarioDependencyCycle } from './as6ExecutiveScenarioDependencies.js';

const demoCompletedScenarios = ['executive.summary.refresh'];

export default function AS6ExecutiveScenarioDependenciesPanel() {
  const dependencyRows = validateExecutiveScenarioDependencies(demoCompletedScenarios);
  const hasCycle = hasExecutiveScenarioDependencyCycle();
  return (
    <section className="as6-dependencies" data-as6-component="executive-scenario-dependencies">
      <div className="as6-dependencies__header">
        <span className="as6-dependencies__eyebrow">Runtime Dependencies</span>
        <h2>Зависимости между сценариями</h2>
        <p>AS6 проверяет dependsOn перед запуском сценария и объясняет, почему сценарий готов, ожидает или заблокирован. Модель остаётся runtime-only.</p>
      </div>
      <div className="as6-dependencies__summary">
        <strong>Cycle check:</strong> {hasCycle ? 'Blocked — dependency cycle detected' : 'PASS — no dependency cycles'}
      </div>
      <div className="as6-dependencies__list">
        {dependencyRows.map((item) => (
          <article className="as6-dependencies__card" key={item.scenarioId} data-dependency-status={item.dependencyStatus}>
            <div className="as6-dependencies__topline">
              <span>{item.scenarioId}</span>
              <strong>{item.dependencyStatus}</strong>
            </div>
            <p><b>Depends on:</b> {item.dependsOn.length ? item.dependsOn.join(', ') : 'None'}</p>
            <p><b>Missing:</b> {item.missingDependencies.length ? item.missingDependencies.join(', ') : 'None'}</p>
            <p><b>Wait reason:</b> {item.waitReason}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
