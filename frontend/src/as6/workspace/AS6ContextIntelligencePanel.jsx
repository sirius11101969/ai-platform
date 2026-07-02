import React, { useMemo } from 'react';
import './AS6ContextIntelligencePanel.css';
import { useAS6WorkspaceContext } from './AS6WorkspaceContext.jsx';
import {
  createAS6ContextIntelligenceSnapshot,
  validateAS6ContextIntelligence,
} from './AS6ContextIntelligence.js';

export const AS6_CONTEXT_INTELLIGENCE_PANEL_VERSION = 'EPIC008_PR1';

export default function AS6ContextIntelligencePanel() {
  const { state, publishWorkspaceEvent } = useAS6WorkspaceContext();
  const snapshot = useMemo(() => createAS6ContextIntelligenceSnapshot(state), [state]);
  const validation = useMemo(() => validateAS6ContextIntelligence(snapshot), [snapshot]);

  return (
    <section className="as6-context-intelligence" data-as6-component="context-intelligence">
      <div className="as6-context-intelligence__header">
        <span>Executive Intelligence</span>
        <h2>Context Intelligence</h2>
        <p>AS6 интерпретирует текущий Workspace Context, Module Registry и runtime-сигналы без нового storage и без нового AI Context.</p>
      </div>

      <div className="as6-context-intelligence__summary" data-intelligence-status={snapshot.interpretation.status}>
        <div>
          <span>Interpretation</span>
          <h3>{snapshot.interpretation.summary}</h3>
          <p>{snapshot.interpretation.safeNextStep}</p>
        </div>
        <button
          type="button"
          onClick={() => publishWorkspaceEvent({
            source: 'context-intelligence',
            type: 'context.snapshot.traced',
            activeModule: snapshot.activeModule.id,
            status: snapshot.interpretation.status,
          })}
        >
          Trace Context
        </button>
      </div>

      <div className="as6-context-intelligence__grid">
        {snapshot.contextSignals.map((signal) => (
          <article key={signal.id}>
            <span>{signal.source}</span>
            <strong>{signal.label}</strong>
            <p>{signal.value}</p>
          </article>
        ))}
      </div>

      <div className="as6-context-intelligence__validation">
        <strong>{validation.valid ? 'Validation PASS' : 'Validation FAIL'}</strong>
        <small>
          sources: {snapshot.sources.length}; modules: {snapshot.moduleCount}; missing: {validation.missingSources.length}
        </small>
      </div>
    </section>
  );
}
