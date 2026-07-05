import { registerCrmKanbanManifest } from './kanbanRegistry.js'
import { runCrmKanbanDiagnostics } from './kanbanDiagnostics.js'
import { traceCrmKanbanRuntime } from './kanbanTracer.js'

export function createCrmKanbanRuntime() {
  const manifest = registerCrmKanbanManifest()
  const diagnostics = runCrmKanbanDiagnostics()
  const trace = traceCrmKanbanRuntime('runtime.created')
  return Object.freeze({
    domain: manifest.domain,
    manifest,
    diagnostics,
    trace,
  })
}
