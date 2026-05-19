const assert = require('assert')
const guard = require('../src/services/openaiRealtime/realtimeAudioSandboxGuard')

function run() {
  const env = { ...process.env }
  try {
    process.env.OPENAI_REALTIME_AUDIO_SANDBOX_ENABLED = 'false'
    let result = guard.evaluate({ workspaceId: 'w1', confirmAudioStreaming: true })
    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'audio_sandbox_disabled')

    process.env.OPENAI_REALTIME_AUDIO_SANDBOX_ENABLED = 'true'
    process.env.OPENAI_REALTIME_AUDIO_SANDBOX_WORKSPACE_ID = 'w-allowed'
    result = guard.evaluate({ workspaceId: 'w-other', confirmAudioStreaming: true })
    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'audio_sandbox_workspace_not_allowed')

    process.env.OPENAI_REALTIME_AUDIO_REQUIRE_CONFIRMATION = 'true'
    result = guard.evaluate({ workspaceId: 'w-allowed', confirmAudioStreaming: false })
    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'audio_sandbox_confirmation_required')

    result = guard.evaluate({ workspaceId: 'w-allowed', confirmAudioStreaming: true })
    assert.equal(result.allowed, true)
    assert.equal(result.reason, 'audio_sandbox_allowed')
    console.log('realtimeAudioSandboxGuard.test.js passed')
  } finally { process.env = env }
}
run()
