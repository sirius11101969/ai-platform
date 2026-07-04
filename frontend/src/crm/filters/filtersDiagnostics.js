import { resolveCrmFiltersDomain } from './filtersResolver.js'
import { createCrmFiltersHealthSnapshot } from './filtersHealthSnapshot.js'

export function runCrmFiltersDiagnostics() {
  const resolution = resolveCrmFiltersDomain()
  const health = createCrmFiltersHealthSnapshot({
    manifestRegistered: resolution.ok,
  })
  return Object.freeze({
    diagnostic: 'AS6_CRM_FILTERS_FOUNDATION',
    result: resolution.ok ? 'PASS' : 'FAIL',
    resolution,
    health,
  })
}
