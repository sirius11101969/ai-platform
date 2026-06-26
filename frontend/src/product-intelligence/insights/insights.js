import { getFirstActionEvents } from '../metrics/metrics'

export function buildProductInsights(events = []) {
  const firstActions = getFirstActionEvents(events)

  return {
    firstActionCount: firstActions.length,
    hasFirstActionEvidence: firstActions.length > 0,
    summary: firstActions.length
      ? 'AS6 has first-action evidence available.'
      : 'AS6 has no first-action evidence yet.',
  }
}
