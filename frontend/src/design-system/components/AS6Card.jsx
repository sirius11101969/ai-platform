import React from 'react'

export function AS6Card({ title, subtitle, children, actions, className = '' }) {
  return (
    <section className={`as6-card ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="as6-card__header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="as6-card__actions">{actions}</div>}
        </header>
      )}
      <div className="as6-card__body">{children}</div>
    </section>
  )
}

export default AS6Card
