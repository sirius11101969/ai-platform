import React from 'react';
import './AS6ExecutiveAutomationPolicyPanel.css';
import { executiveAutomationPolicyExplanations } from './as6ExecutiveAutomationPolicyExplanations.js';

const policyRows = [
  { label: 'Runtime policy', value: 'Active' },
  { label: 'Safety guard', value: 'Enabled' },
  { label: 'Unknown actionId', value: 'Blocked' },
  { label: 'Unsafe chain', value: 'Fallback required' }
];

export default function AS6ExecutiveAutomationPolicyPanel() {
  return (
    <section className="as6-policy-ui" data-as6-component="executive-automation-policy-ui">
      <div className="as6-policy-ui__header">
        <span className="as6-policy-ui__eyebrow">Governance Policy</span>
        <h2>Проверка автоматизации перед запуском</h2>
        <p>AS6 показывает точную причину разрешения или блокировки по каждому actionId, безопасный следующий шаг и fallback до выполнения сценария.</p>
      </div>
      <div className="as6-policy-ui__grid">
        {policyRows.map((row) => (
          <article className="as6-policy-ui__card" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </article>
        ))}
      </div>
      <div className="as6-policy-ui__explanations">
        {executiveAutomationPolicyExplanations.map((item) => (
          <article className="as6-policy-ui__explanation-card" key={item.actionId} data-policy-status={item.status}>
            <div className="as6-policy-ui__explanation-topline">
              <span>{item.actionId}</span>
              <strong>{item.status === 'allowed' ? 'Allowed' : 'Blocked'}</strong>
            </div>
            <h3>{item.label}</h3>
            <p><b>Причина:</b> {item.reason}</p>
            <p><b>Статус шагов:</b> {item.stepStatus}</p>
            <p><b>Следующий безопасный шаг:</b> {item.safeNextStep}</p>
            <p><b>Fallback:</b> {item.fallback}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
