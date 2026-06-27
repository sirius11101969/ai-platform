import React from 'react';

export const AS6_FOCUS_TITLE = 'Следующий лучший шаг';
export const AS6_FOCUS_PROMISE = 'AS6 показывает, что важно сделать сейчас.';

export function AS6FocusShell({ children, className = '', priority = 'normal' }) {
  return (
    <section className={className} data-as6-focus="v230" data-as6-focus-priority={priority} aria-label="AS6 Focus">
      {children}
    </section>
  );
}

export function AS6FocusHeader({ title = AS6_FOCUS_TITLE, subtitle = AS6_FOCUS_PROMISE, className = '' }) {
  return (
    <header className={className} data-as6-focus-header="v230">
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
    </header>
  );
}

export function AS6FocusStep({ number = 1, title, children, className = '' }) {
  return (
    <article className={className} data-as6-focus-step="v230">
      <span>{number}</span>
      <div>
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </article>
  );
}

export function AS6FocusAction({ children = 'Выполнить шаг', className = '', onClick, type = 'button' }) {
  return (
    <button className={className} type={type} onClick={onClick} data-as6-focus-action="v230">
      {children}
    </button>
  );
}

export function AS6FocusSignal({ label, value, tone = 'neutral', className = '' }) {
  return (
    <div className={className} data-as6-focus-signal="v230" data-as6-focus-signal-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AS6FocusEmpty({ children = 'AS6 готов определить следующий лучший шаг.', className = '' }) {
  return <p className={className} data-as6-focus-empty="v230">{children}</p>;
}

export default AS6FocusShell;
