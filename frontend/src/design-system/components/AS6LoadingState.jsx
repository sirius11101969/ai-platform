import React from 'react'

export function AS6LoadingState({ title = 'Загрузка', description = 'AS6 подготавливает данные.' }) {
  return (
    <div className="as6-loading-state" role="status" aria-live="polite">
      <div className="as6-loading-state__spinner" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default AS6LoadingState
