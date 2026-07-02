import React from 'react';
import './AS6ExecutiveAutomationAuditTrailPanel.css';
import { executiveAutomationAuditTrail } from './as6ExecutiveAutomationAuditTrail.js';

export default function AS6ExecutiveAutomationAuditTrailPanel() {
  return (
    <section className="as6-audit-trail" data-as6-component="executive-automation-audit-trail">
      <div className="as6-audit-trail__header">
        <span className="as6-audit-trail__eyebrow">Runtime Audit Trail</span>
        <h2>Журнал выполнения Executive Automation</h2>
        <p>AS6 показывает путь выполнения сценария: шаги, статусы, причину остановки, fallback и governance-объяснение. История остаётся runtime-only.</p>
      </div>
      <div className="as6-audit-trail__list">
        {executiveAutomationAuditTrail.map((item) => (
          <article className="as6-audit-trail__card" key={item.executionId} data-final-status={item.finalStatus.toLowerCase()}>
            <div className="as6-audit-trail__topline">
              <span>{item.scenarioId}</span>
              <strong>{item.finalStatus}</strong>
            </div>
            <div className="as6-audit-trail__meta">
              <span>Execution: {item.executionId}</span>
              <span>Duration: {item.duration}</span>
            </div>
            <p><b>Причина остановки:</b> {item.stopReason}</p>
            <p><b>Fallback:</b> {item.fallbackUsed}</p>
            <p><b>Governance:</b> {item.governanceExplanation}</p>
            <ol className="as6-audit-trail__steps">
              {item.steps.map((step) => (
                <li key={item.executionId + "-" + step.order}>
                  <span>{step.order}. {step.label}</span>
                  <strong>{step.status}</strong>
                  <small>{step.actionId}</small>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}
