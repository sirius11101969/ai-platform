import React from 'react'

export function AS6Toolbar({ title, description, actions, children, className = '' }) {
  return (
    <div className={`as6-toolbar ${className}`.trim()}>
      <div className="as6-toolbar__main">
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
        {children}
      </div>
      {actions && <div className="as6-toolbar__actions">{actions}</div>}
    </div>
  )
}

export default AS6Toolbar
