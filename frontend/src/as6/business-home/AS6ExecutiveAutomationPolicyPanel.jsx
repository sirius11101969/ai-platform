import React from 'react';
import './AS6ExecutiveAutomationPolicyPanel.css';

const policyRows = [
  { label: 'Runtime policy', value: 'Active' },
  { label: 'Safety guard', value: 'Enabled' },
  { label: 'Unknown actionId', value: 'Blocked' },
  { label: 'Unsafe chain', value: 'Fallback required' }
];

const statusRows = [
  { status: 'Allowed', text: 'Scenario passed governance policy and can be launched.' },
  { status: 'Blocked', text: 'Scenario failed governance policy. Reason and fallback are shown before execution.' }
];

export default function AS6ExecutiveAutomationPolicyPanel() {
  return (
    <section className="as6-policy-ui" data-as6-component="executive-automation-policy-ui">
      <div className="as6-policy-ui__header">
        <span className="as6-policy-ui__eyebrow">Governance Policy</span>
        <h2>Проверка автоматизации перед запуском</h2>
        <p>AS6 показывает статус safety-проверки, причину блокировки и безопасный fallback до выполнения сценария.</p>
      </div>
      <div className="as6-policy-ui__grid">
        {policyRows.map((row) => (
          <article className="as6-policy-ui__card" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </article>
        ))}
      </div>
      <div className="as6-policy-ui__status">
        {statusRows.map((row) => (
          <article className="as6-policy-ui__status-card" key={row.status} data-policy-status={row.status.toLowerCase()}>
            <strong>{row.status}</strong>
            <p>{row.text}</p>
          </article>
        ))}
      </div>
      <div className="as6-policy-ui__fallback">
        <strong>Fallback:</strong> если actionId неизвестен или цепочка действий небезопасна, сценарий не запускается, а пользователь получает объяснение и следующий безопасный шаг.
      </div>
    </section>
  );
}
