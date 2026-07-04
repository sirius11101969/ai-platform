import { resolveCrmAnalyticsDomain } from './analyticsResolver.js'
import { createCrmAnalyticsHealthSnapshot } from './analyticsHealthSnapshot.js'

export function runCrmAnalyticsDiagnostics() {
  const resolution = resolveCrmAnalyticsDomain()
  const health = createCrmAnalyticsHealthSnapshot({
    manifestRegistered: resolution.ok,
  })
  return Object.freeze({
    diagnostic: 'AS6_CRM_ANALYTICS_FOUNDATION',
    result: resolution.ok ? 'PASS' : 'FAIL',
    resolution,
    health,
  })
}
