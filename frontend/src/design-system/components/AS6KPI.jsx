import React from 'react'

export function AS6KPI({ label, value, hint, trend, className = '' }) {
  return (
    <article className={`as6-kpi ${className}`.trim()}>
      <span className="as6-kpi__label">{label}</span>
      <strong className="as6-kpi__value">{value}</strong>
      {(hint || trend) && (
        <p className="as6-kpi__meta">
          {trend && <span>{trend}</span>}
          {hint && <span>{hint}</span>}
        </p>
      )}
    </article>
  )
}

export default AS6KPI
