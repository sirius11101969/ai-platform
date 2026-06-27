import React from 'react';

export function AS6HeaderShell({ children, className = '' }) {
  return (
    <header className={className} data-as6-header="v226">
      {children}
    </header>
  );
}

export function AS6HeaderTitle({ eyebrow, title, children, className = '' }) {
  return (
    <div className={className} data-as6-header-title="v226">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
}

export function AS6HeaderToolbar({ children, className = '' }) {
  return (
    <div className={className} data-as6-header-toolbar="v226">
      {children}
    </div>
  );
}

export function AS6WorkspaceSelector({ workspaces = [], value = '', onChange, error = '', className = '' }) {
  return (
    <div className={className} data-as6-workspace-selector="v226">
      <span>Пространство</span>
      <select value={value} onChange={onChange} aria-label="Выбор рабочего пространства">
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
        ))}
      </select>
      {error && <small>{error}</small>}
    </div>
  );
}

export function AS6ProfilePill({ name, meta, className = '' }) {
  return (
    <div className={className} data-as6-profile-pill="v226">
      <strong>{name}</strong>
      <span>{meta}</span>
    </div>
  );
}

export function AS6HeaderAction({ children, className = '', onClick, type = 'button' }) {
  return (
    <button className={className} type={type} onClick={onClick} data-as6-header-action="v226">
      {children}
    </button>
  );
}

export default AS6HeaderShell;
