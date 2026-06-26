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

import { buildFirstActionMetrics } from '../metrics/metrics'

export function getTopMetricEntry(metricGroup = {}) {
  const entries = Object.entries(metricGroup)

  if (!entries.length) {
    return null
  }

  return entries
    .sort((left, right) => right[1] - left[1])
    .map(([name, count]) => ({ name, count }))[0]
}

export function buildFirstActionInsights(events = []) {
  const metrics = buildFirstActionMetrics(events)
  const topAction = getTopMetricEntry(metrics.byAction)
  const topDestination = getTopMetricEntry(metrics.byDestination)

  if (!metrics.hasFirstActionEvidence) {
    return {
      status: 'no_evidence',
      summary: 'AS6 has no first-action evidence yet.',
      recommendation: 'Collect first-action events before making product decisions.',
      metrics,
      topAction,
      topDestination,
    }
  }

  if (metrics.firstActionCount === 1) {
    return {
      status: 'single_evidence_point',
      summary: 'AS6 has one first-action evidence point.',
      recommendation: 'Continue collecting evidence before changing the product.',
      metrics,
      topAction,
      topDestination,
    }
  }

  return {
    status: 'evidence_available',
    summary: 'AS6 has first-action evidence available for product review.',
    recommendation: 'Use the leading action and destination as input for the next Product Decision History cycle.',
    metrics,
    topAction,
    topDestination,
  }
}
