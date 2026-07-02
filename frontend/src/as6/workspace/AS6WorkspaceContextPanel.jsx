import React from 'react';
import { useAS6WorkspaceContext } from './AS6WorkspaceContext.jsx';

export default function AS6WorkspaceContextPanel() {
  const { state, activateModule, setFocusContext, setRightRail, registerWorkspaceAction } = useAS6WorkspaceContext();

  return (
    <section className="as6-workspace-context-panel" data-as6-component="workspace-context-panel">
      <div className="as6-workspace-context-panel__header">
        <span>Workspace Context</span>
        <h2>Единый runtime-контекст Workspace</h2>
        <p>Active Module, Focus Context, Right Rail, Actions и Events работают без persistent storage.</p>
      </div>

      <div className="as6-workspace-context-panel__grid">
        <article>
          <span>Active Module</span>
          <strong>{state.activeModule}</strong>
          <button type="button" onClick={() => activateModule('crm')}>Activate CRM</button>
        </article>

        <article>
          <span>Focus Context</span>
          <strong>{state.focusContext.mode}</strong>
          <button type="button" onClick={() => setFocusContext({ mode: 'module-focus', targetId: state.activeModule, reason: 'User requested module focus.' })}>Set Focus</button>
        </article>

        <article>
          <span>Right Rail</span>
          <strong>{state.rightRail.isOpen ? 'Open' : 'Closed'}</strong>
          <button type="button" onClick={() => setRightRail({ isOpen: !state.rightRail.isOpen, view: 'workspace-context', reason: 'User toggled right rail.' })}>Toggle Rail</button>
        </article>

        <article>
          <span>Workspace Actions</span>
          <strong>{state.actions.length}</strong>
          <button type="button" onClick={() => registerWorkspaceAction({ id: 'workspace.ask-as6', label: 'Спросить AS6', source: 'workspace-context' })}>Register Action</button>
        </article>
      </div>

      <div className="as6-workspace-context-panel__events">
        <strong>Workspace Events</strong>
        {state.events.length === 0 ? (
          <p>Событий пока нет.</p>
        ) : (
          <ol>
            {state.events.map((event) => (
              <li key={event.id}>
                <span>{event.sourceType}</span>
                <small>{event.createdAt}</small>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
