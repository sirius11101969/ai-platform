import React from 'react';

export const AS6_ASSISTANT_NAME = 'AS6 Assistant';
export const AS6_ASSISTANT_PRIMARY_ACTION = 'Спросить AS6';
export const AS6_ASSISTANT_PROMISE = 'Всегда знает следующий лучший шаг.';

export function AS6AssistantShell({ children, className = '', status = 'ready' }) {
  return (
    <section className={className} data-as6-assistant="v229" data-as6-assistant-status={status} aria-label={AS6_ASSISTANT_NAME}>
      {children}
    </section>
  );
}

export function AS6AssistantHeader({ title = AS6_ASSISTANT_NAME, subtitle = AS6_ASSISTANT_PROMISE, className = '' }) {
  return (
    <header className={className} data-as6-assistant-header="v229">
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
    </header>
  );
}

export function AS6AssistantMessage({ children, role = 'assistant', className = '' }) {
  return (
    <div className={className} data-as6-assistant-message="v229" data-as6-assistant-role={role}>
      {children}
    </div>
  );
}

export function AS6AssistantAction({ children = AS6_ASSISTANT_PRIMARY_ACTION, className = '', onClick, type = 'button' }) {
  return (
    <button className={className} type={type} onClick={onClick} data-as6-assistant-action="v229">
      {children}
    </button>
  );
}

export function AS6AssistantStatus({ label = 'Готов помочь', className = '' }) {
  return <span className={className} data-as6-assistant-status-pill="v229">{label}</span>;
}

export function AS6AssistantComposer({ placeholder = 'Спросить AS6...', value = '', onChange, onSubmit, className = '' }) {
  return (
    <form className={className} data-as6-assistant-composer="v229" onSubmit={onSubmit}>
      <input value={value} onChange={onChange} placeholder={placeholder} aria-label="Спросить AS6" />
      <AS6AssistantAction type="submit" />
    </form>
  );
}

export default AS6AssistantShell;
