import "./AS6ExperienceSystem.css";

export function AS6ExperienceShell({ children }) {
  return <main className="as6x-shell">{children}</main>;
}

export function AS6ExperiencePanel({ children, className = "" }) {
  return <section className={"as6x-panel " + className}>{children}</section>;
}

export function AS6ExperienceCard({ title, eyebrow, children, action, className = "" }) {
  return (
    <article className={"as6x-card " + className}>
      {(eyebrow || title || action) && (
        <header className="as6x-card__header">
          <div>
            {eyebrow && <p className="as6x-eyebrow">{eyebrow}</p>}
            {title && <h3>{title}</h3>}
          </div>
          {action}
        </header>
      )}
      {children}
    </article>
  );
}

export function AS6ExperienceButton({ children, variant = "primary", ...props }) {
  return <button className={"as6x-button as6x-button--" + variant} type="button" {...props}>{children}</button>;
}

export function AS6ExperienceMetric({ label, value, trend }) {
  return (
    <div className="as6x-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && <small>{trend}</small>}
    </div>
  );
}
