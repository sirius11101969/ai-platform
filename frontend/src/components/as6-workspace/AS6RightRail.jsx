import React from 'react';

export function AS6RightRailShell({ children, className = '', hidden = false }) {
  if (hidden) return null;
  return (
    <aside className={className} data-as6-right-rail="v227" aria-label="AS6 Right Rail">
      {children}
    </aside>
  );
}

export function AS6RightRailSection({ title, children, className = '' }) {
  return (
    <section className={className} data-as6-right-rail-section="v227">
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

export function AS6RightRailCard({ eyebrow, title, children, className = '' }) {
  return (
    <article className={className} data-as6-right-rail-card="v227">
      {eyebrow && <span>{eyebrow}</span>}
      {title && <strong>{title}</strong>}
      {children}
    </article>
  );
}

export function AS6RightRailMetric({ label, value, hint, className = '' }) {
  return (
    <div className={className} data-as6-right-rail-metric="v227">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function AS6RightRailAction({ children, className = '', onClick, type = 'button' }) {
  return (
    <button className={className} type={type} onClick={onClick} data-as6-right-rail-action="v227">
      {children}
    </button>
  );
}

export default AS6RightRailShell;
