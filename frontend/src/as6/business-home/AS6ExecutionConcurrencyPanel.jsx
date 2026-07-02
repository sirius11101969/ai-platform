import React from 'react';
import './AS6ExecutionConcurrencyPanel.css';
import { evaluateExecutiveConcurrency, executiveConcurrencyLocks } from './as6ExecutionConcurrencyControl.js';

const demoConcurrencyScenarios = [
  { scenarioId: 'executive.summary.refresh', label: 'Refresh executive summary' },
  { scenarioId: 'executive.automation.launchApproved', label: 'Launch approved automation' },
  { scenarioId: 'executive.unsafe.chain', label: 'Unsafe chain review' }
];

export default function AS6ExecutionConcurrencyPanel() {
  const decisions = evaluateExecutiveConcurrency(demoConcurrencyScenarios);
  return (
    <section className="as6-concurrency" data-as6-component="execution-concurrency-control">
      <div className="as6-concurrency__header">
        <span className="as6-concurrency__eyebrow">Runtime Concurrency Control</span>
        <h2>Контроль параллельных запусков</h2>
        <p>AS6 использует runtime lock, чтобы не запускать несовместимые сценарии одновременно. Решение не записывается в storage.</p>
      </div>
      <div className="as6-concurrency__locks">
        {executiveConcurrencyLocks.map((lock) => (
          <article className="as6-concurrency__lock" key={lock.lockId} data-lock-status={lock.status}>
            <div className="as6-concurrency__topline">
              <span>{lock.lockId}</span>
              <strong>{lock.status}</strong>
            </div>
            <p><b>Owner:</b> {lock.ownerScenarioId}</p>
            <p><b>Conflicts:</b> {lock.conflictsWith.length ? lock.conflictsWith.join(', ') : 'None'}</p>
            <p><b>Reason:</b> {lock.reason}</p>
          </article>
        ))}
      </div>
      <div className="as6-concurrency__decisions">
        {decisions.map((item) => (
          <article className="as6-concurrency__decision" key={item.scenarioId} data-concurrency-status={item.status}>
            <div className="as6-concurrency__topline">
              <span>{item.scenarioId}</span>
              <strong>{item.status}</strong>
            </div>
            <p><b>Conflict reason:</b> {item.conflictReason}</p>
            <p><b>Wait decision:</b> {item.waitDecision}</p>
            <p><b>Fallback:</b> {item.fallback}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
