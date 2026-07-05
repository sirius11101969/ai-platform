import React from 'react'

export function AS6EmptyState({
  title = 'Нет данных',
  description = 'Здесь появятся данные, когда они будут доступны.',
  action,
}) {
  return (
    <div className="as6-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="as6-empty-state__action">{action}</div>}
    </div>
  )
}

export default AS6EmptyState
