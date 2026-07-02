import React, { useMemo } from 'react';
import './AS6AIWorkspace.css';
import { useAS6WorkspaceContext } from './AS6WorkspaceContext.jsx';

export const AS6_AI_WORKSPACE_VERSION = 'EPIC007_PR3';

export function createAS6WorkspaceRecommendations(state) {
  const activeModule = state.activeModule || 'business-home';
  const focusMode = state.focusContext?.mode || 'overview';
  return [
    {
      id: 'workspace.recommend.next-best-action',
      title: 'Следующий лучший шаг',
      text: 'AS6 рекомендует продолжить работу в модуле ' + activeModule + ' с учётом текущего фокуса: ' + focusMode + '.',
      source: 'workspace-context',
    },
    {
      id: 'workspace.recommend.open-right-rail',
      title: 'Открыть контекстную панель',
      text: state.rightRail?.isOpen ? 'Right Rail уже открыт и готов показывать контекст.' : 'Right Rail закрыт. AS6 рекомендует открыть его для контекстной работы.',
      source: 'right-rail-state',
    },
  ];
}

export function createAS6ContextSuggestions(state) {
  return [
    {
      id: 'workspace.suggestion.context-aware',
      label: 'Context Awareness',
      text: 'AI использует Workspace Context: activeModule=' + state.activeModule + ', focus=' + state.focusContext?.mode + '.',
    },
    {
      id: 'workspace.suggestion.events',
      label: 'Workspace Events',
      text: 'Зарегистрировано runtime-событий: ' + state.events.length + '.',
    },
  ];
}

export function AS6Assistant() {
  const { state, publishWorkspaceEvent } = useAS6WorkspaceContext();
  return (
    <section className="as6-ai-assistant" data-as6-component="ai-assistant">
      <span>AS6 Assistant</span>
      <h2>Всегда знает следующий лучший шаг</h2>
      <p>Активный модуль: {state.activeModule}. Фокус: {state.focusContext.mode}.</p>
      <button type="button" onClick={() => publishWorkspaceEvent({ source: 'ai-assistant', intent: 'ask-as6', activeModule: state.activeModule })}>Спросить AS6</button>
    </section>
  );
}

export function AS6AIActionBar() {
  const { state, registerWorkspaceAction, setRightRail } = useAS6WorkspaceContext();
  const actions = [
    { id: 'ai.action.open-right-rail', label: 'Открыть Right Rail' },
    { id: 'ai.action.register-next-step', label: 'Зарегистрировать следующий шаг' },
    { id: 'ai.action.focus-module', label: 'Фокус на модуль' },
  ];
  function runAction(actionId) {
    if (actionId === 'ai.action.open-right-rail') {
      setRightRail({ isOpen: true, view: 'ai-workspace', reason: 'AI Action Bar opened Right Rail.' });
    }
    registerWorkspaceAction({ id: actionId, label: 'AI action for ' + state.activeModule, source: 'ai-workspace' });
  }
  return (
    <section className="as6-ai-action-bar" data-as6-component="ai-action-bar">
      {actions.map((action) => (
        <button key={action.id} type="button" onClick={() => runAction(action.id)}>{action.label}</button>
      ))}
    </section>
  );
}

export function AS6WorkspaceRecommendations() {
  const { state } = useAS6WorkspaceContext();
  const recommendations = useMemo(() => createAS6WorkspaceRecommendations(state), [state]);
  return (
    <section className="as6-ai-recommendations" data-as6-component="workspace-recommendations">
      <div className="as6-ai-section-title">
        <span>Recommendations</span>
        <h3>Рекомендации Workspace</h3>
      </div>
      <div className="as6-ai-card-grid">
        {recommendations.map((item) => (
          <article key={item.id}>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
            <small>{item.source}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AS6ContextSuggestions() {
  const { state } = useAS6WorkspaceContext();
  const suggestions = useMemo(() => createAS6ContextSuggestions(state), [state]);
  return (
    <section className="as6-ai-suggestions" data-as6-component="context-suggestions">
      <div className="as6-ai-section-title">
        <span>Context Suggestions</span>
        <h3>Контекстные подсказки</h3>
      </div>
      <div className="as6-ai-card-grid">
        {suggestions.map((item) => (
          <article key={item.id}>
            <strong>{item.label}</strong>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AS6QuickActions() {
  const { state, registerWorkspaceAction } = useAS6WorkspaceContext();
  const quickActions = [
    { id: 'quick.open-executive', label: 'Executive' },
    { id: 'quick.open-automation', label: 'Automation' },
    { id: 'quick.open-audit', label: 'Audit' },
  ];
  return (
    <section className="as6-ai-quick-actions" data-as6-component="quick-actions">
      {quickActions.map((action) => (
        <button key={action.id} type="button" onClick={() => registerWorkspaceAction({ id: action.id, label: action.label, source: 'quick-actions:' + state.activeModule })}>{action.label}</button>
      ))}
    </section>
  );
}

export function AS6AIRuntimePanel() {
  const { state } = useAS6WorkspaceContext();
  return (
    <section className="as6-ai-runtime-panel" data-as6-component="ai-runtime-panel">
      <div className="as6-ai-section-title">
        <span>AI Runtime Panel</span>
        <h3>Диагностика AI Workspace</h3>
      </div>
      <dl>
        <dt>Active Module</dt><dd>{state.activeModule}</dd>
        <dt>Focus Mode</dt><dd>{state.focusContext.mode}</dd>
        <dt>Right Rail</dt><dd>{state.rightRail.isOpen ? 'open' : 'closed'}</dd>
        <dt>Actions</dt><dd>{state.actions.length}</dd>
        <dt>Events</dt><dd>{state.events.length}</dd>
      </dl>
    </section>
  );
}

export default function AS6AIWorkspace() {
  return (
    <section className="as6-ai-workspace" data-as6-component="ai-workspace">
      <AS6Assistant />
      <AS6AIActionBar />
      <AS6WorkspaceRecommendations />
      <AS6ContextSuggestions />
      <AS6QuickActions />
      <AS6AIRuntimePanel />
    </section>
  );
}
