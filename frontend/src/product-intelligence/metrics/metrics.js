export function countProductEvents(events = []) {
  return events.reduce((metrics, item) => {
    if (!item || !item.event) return metrics
    metrics[item.event] = (metrics[item.event] || 0) + 1
    return metrics
  }, {})
}

export function getFirstActionEvents(events = []) {
  return events.filter((item) => item?.category === 'first_action')
}
