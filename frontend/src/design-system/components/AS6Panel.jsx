import React from 'react'

export function AS6Panel({ title, subtitle, children, footer, className = '' }) {
  return (
    <section className={`as6-panel ${className}`.trim()}>
      {(title || subtitle) && (
        <header className="as6-panel__header">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      <div className="as6-panel__body">{children}</div>
      {footer && <footer className="as6-panel__footer">{footer}</footer>}
    </section>
  )
}

export default AS6Panel
