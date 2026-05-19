function routeExecution({ executionType, payload }) {
  return { worker: executionType === 'ai_worker_assignment' ? 'ai_worker' : 'default_execution_worker', route: 'sync_foundation', payload }
}

module.exports = { routeExecution }
