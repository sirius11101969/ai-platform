import assert from 'node:assert/strict'
import {
  fetchAiWorkforceAgents,
  fetchAiWorkforceTasks,
  fetchAiWorkforceAssignments,
  fetchAiWorkforceExecutionPlans,
  fetchAiWorkforceMetrics,
  fetchAiWorkforceCommandGraph,
} from '../src/services/api.js'

const expectedRoutes = [
  '/api/ai/workforce/agents',
  '/api/ai/workforce/tasks',
  '/api/ai/workforce/assignments',
  '/api/ai/workforce/execution-plans',
  '/api/ai/workforce/metrics',
  '/api/ai/workforce/command-graph',
]

const calls = []
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url, options })
  return {
    ok: true,
    status: 200,
    json: async () => ({ ok: true }),
  }
}

await fetchAiWorkforceAgents()
await fetchAiWorkforceTasks()
await fetchAiWorkforceAssignments()
await fetchAiWorkforceExecutionPlans()
await fetchAiWorkforceMetrics()
await fetchAiWorkforceCommandGraph()

assert.deepEqual(
  calls.map((entry) => entry.url),
  expectedRoutes,
  'AI Workforce API clients must request the /api/ai/workforce/* endpoints only'
)

for (const disallowed of ['/api/aiworkforce/', '/aiworkforce/']) {
  assert.equal(
    calls.some(({ url }) => url.includes(disallowed)),
    false,
    `Disallowed route prefix detected: ${disallowed}`
  )
}

console.log('aiWorkforce API route generation tests passed')
