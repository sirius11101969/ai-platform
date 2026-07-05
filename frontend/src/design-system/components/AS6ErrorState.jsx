import React from 'react'

export function AS6ErrorState({
  title = 'Что-то пошло не так',
  description = 'AS6 зафиксировал ошибку. Повторите действие или проверьте диагностику.',
  action,
}) {
  return (
    <div className="as6-error-state" role="alert">
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="as6-error-state__action">{action}</div>}
    </div>
  )
}

export default AS6ErrorState
