import React from 'react'

export function AS6Badge({ children, tone = 'neutral' }) {
  return <span className={`as6-badge as6-badge--${tone}`}>{children}</span>
}

export default AS6Badge
