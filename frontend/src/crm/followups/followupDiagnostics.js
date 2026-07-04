import { resolveCrmFollowupDomain } from './followupResolver.js'
import { createCrmFollowupHealthSnapshot } from './followupHealthSnapshot.js'

export function runCrmFollowupDiagnostics() {
  const resolution = resolveCrmFollowupDomain()
  const health = createCrmFollowupHealthSnapshot({
    manifestRegistered: resolution.ok,
  })
  return Object.freeze({
    diagnostic: 'AS6_CRM_FOLLOWUPS_FOUNDATION',
    result: resolution.ok ? 'PASS' : 'FAIL',
    resolution,
    health,
  })
}
