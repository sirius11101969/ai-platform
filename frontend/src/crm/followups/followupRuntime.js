import { registerCrmFollowupManifest } from './followupRegistry.js'
import { runCrmFollowupDiagnostics } from './followupDiagnostics.js'
import { traceCrmFollowupRuntime } from './followupTracer.js'

export function createCrmFollowupRuntime() {
  const manifest = registerCrmFollowupManifest()
  const diagnostics = runCrmFollowupDiagnostics()
  const trace = traceCrmFollowupRuntime('runtime.created')
  return Object.freeze({
    domain: manifest.domain,
    manifest,
    diagnostics,
    trace,
  })
}
