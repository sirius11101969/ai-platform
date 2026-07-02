import React from 'react';
import './AS6WorkspaceFoundation.css';

export const AS6_WORKSPACE_FOUNDATION_VERSION = 'EPIC007_PR1';

export const AS6_WORKSPACE_MODULES = [
  { id: 'business-home', label: 'Business Home', status: 'ready' },
  { id: 'dashboard', label: 'Dashboard', status: 'ready' },
  { id: 'crm', label: 'CRM', status: 'migration-ready' },
  { id: 'executive', label: 'Executive', status: 'ready' },
  { id: 'automation', label: 'Automation', status: 'ready' },
  { id: 'audit', label: 'Audit', status: 'ready' }
];

export function AS6WorkspaceSidebar({ modules = AS6_WORKSPACE_MODULES, activeModule = 'business-home' }) {
  return (
    <aside className="as6-workspace-sidebar" data-as6-component="workspace-sidebar">
      <div className="as6-workspace-sidebar__brand">AS6</div>
      <nav className="as6-workspace-sidebar__nav" aria-label="AS6 Workspace Navigation">
        {modules.map((module) => (
          <button className="as6-workspace-sidebar__item" data-active={module.id === activeModule ? 'true' : 'false'} key={module.id} type="button">
            <span>{module.label}</span>
            <small>{module.status}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function AS6WorkspaceHeader({ title = 'Unified AI Workspace', subtitle = 'Всегда знает следующий лучший шаг.' }) {
  return (
    <header className="as6-workspace-header" data-as6-component="workspace-header">
      <div>
        <span className="as6-workspace-header__eyebrow">Workspace Evolution</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button className="as6-workspace-header__action" type="button">Спросить AS6</button>
    </header>
  );
}

export function AS6WorkspaceSlot({ activeModule = 'business-home', children }) {
  return (
    <main className="as6-workspace-slot" data-as6-component="workspace-slot" data-active-module={activeModule}>
      {children || (
        <section className="as6-workspace-slot__placeholder">
          <span>Active Module</span>
          <h2>{activeModule}</h2>
          <p>Этот слот является единой областью размещения модулей AS6 Workspace.</p>
        </section>
      )}
    </main>
  );
}

export function AS6WorkspaceRouterContainer({ activeModule = 'business-home', children }) {
  return (
    <section className="as6-workspace-router" data-as6-component="workspace-router-container">
      <AS6WorkspaceSlot activeModule={activeModule}>{children}</AS6WorkspaceSlot>
    </section>
  );
}

export default function AS6WorkspaceFoundation({ activeModule = 'business-home', children }) {
  return (
    <section className="as6-workspace-foundation" data-as6-component="workspace-foundation">
      <AS6WorkspaceSidebar activeModule={activeModule} />
      <div className="as6-workspace-foundation__main">
        <AS6WorkspaceHeader />
        <AS6WorkspaceRouterContainer activeModule={activeModule}>{children}</AS6WorkspaceRouterContainer>
      </div>
    </section>
  );
}
