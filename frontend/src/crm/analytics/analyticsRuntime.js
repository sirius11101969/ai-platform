import { registerCrmAnalyticsManifest } from './analyticsRegistry.js'
import { runCrmAnalyticsDiagnostics } from './analyticsDiagnostics.js'
import { traceCrmAnalyticsRuntime } from './analyticsTracer.js'

export function createCrmAnalyticsRuntime() {
  const manifest = registerCrmAnalyticsManifest()
  const diagnostics = runCrmAnalyticsDiagnostics()
  const trace = traceCrmAnalyticsRuntime('runtime.created')
  return Object.freeze({
    domain: manifest.domain,
    manifest,
    diagnostics,
    trace,
  })
}
