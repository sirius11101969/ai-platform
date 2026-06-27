import React from 'react';

export const AS6_CORE_PROMISE = 'Всегда знает следующий лучший шаг.';
export const AS6_CORE_ACTION = 'Спросить AS6';

export function AS6CoreShell({ children, className = '', status = 'ready' }) {
  return (
    <section className={className} data-as6-core="v228" data-as6-core-status={status} aria-label="AS6 Core">
      {children}
    </section>
  );
}

export function AS6CoreMark({ className = '', label = 'AS6 Core' }) {
  return (
    <div className={className} data-as6-core-mark="v228" aria-label={label}>
      <span aria-hidden="true">AS6</span>
    </div>
  );
}

export function AS6CorePromise({ children = AS6_CORE_PROMISE, className = '' }) {
  return (
    <p className={className} data-as6-core-promise="v228">
      {children}
    </p>
  );
}

export function AS6CoreAction({ children = AS6_CORE_ACTION, className = '', onClick, type = 'button' }) {
  return (
    <button className={className} type={type} onClick={onClick} data-as6-core-action="v228">
      {children}
    </button>
  );
}

export function AS6CoreSignal({ label, value, tone = 'neutral', className = '' }) {
  return (
    <div className={className} data-as6-core-signal="v228" data-as6-core-signal-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default AS6CoreShell;
