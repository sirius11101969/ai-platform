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

export function groupFirstActionsByMetadata(events = [], metadataKey = 'action') {
  return getFirstActionEvents(events).reduce((groups, item) => {
    const key = item?.metadata?.[metadataKey] || 'unknown'
    groups[key] = (groups[key] || 0) + 1
    return groups
  }, {})
}

export function buildFirstActionMetrics(events = []) {
  const firstActions = getFirstActionEvents(events)
  const byAction = groupFirstActionsByMetadata(events, 'action')
  const byDestination = groupFirstActionsByMetadata(events, 'destination')

  return {
    firstActionCount: firstActions.length,
    hasFirstActionEvidence: firstActions.length > 0,
    byAction,
    byDestination,
  }
}
