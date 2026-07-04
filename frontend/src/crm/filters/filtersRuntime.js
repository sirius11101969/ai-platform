import { registerCrmFiltersManifest } from './filtersRegistry.js'
import { runCrmFiltersDiagnostics } from './filtersDiagnostics.js'
import { traceCrmFiltersRuntime } from './filtersTracer.js'

export function createCrmFiltersRuntime() {
  const manifest = registerCrmFiltersManifest()
  const diagnostics = runCrmFiltersDiagnostics()
  const trace = traceCrmFiltersRuntime('runtime.created')
  return Object.freeze({
    domain: manifest.domain,
    manifest,
    diagnostics,
    trace,
  })
}
