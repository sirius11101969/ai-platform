import React from "react";
import "../styles/as6-unified-page-shell.css";

export function AS6UnifiedPageShell({ eyebrow = "AS6 Mission Control", title, subtitle, metrics = [], children }) {
  return (
    <main className="as6-unified-page-shell">
      <section className="as6-unified-page-hero">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </section>
      {metrics.length > 0 && (
        <section className="as6-unified-kpi-strip">
          {metrics.map((metric) => (
            <article key={metric.label} className="as6-unified-kpi-card">
              <small>{metric.label}</small>
              <strong>{metric.value}</strong>
              {metric.detail && <span>{metric.detail}</span>}
            </article>
          ))}
        </section>
      )}
      <section className="as6-unified-page-content">{children}</section>
    </main>
  );
}

export function AS6UnifiedGlassCard({ title, children, actions }) {
  return <article className="as6-unified-glass-card">{title && <header><strong>{title}</strong>{actions}</header>}<div>{children}</div></article>;
}

export function AS6UnifiedState({ type = "empty", title, detail }) {
  return <section className={`as6-unified-state as6-unified-state-${type}`}><strong>{title}</strong>{detail && <p>{detail}</p>}</section>;
}

export default AS6UnifiedPageShell;
