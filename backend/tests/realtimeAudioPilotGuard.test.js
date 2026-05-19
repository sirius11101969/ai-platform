const assert = require('assert')
const guard = require('../src/services/openaiRealtime/realtimeAudioPilotGuard')

function run() {
  const env = { ...process.env }
  try {
    process.env.OPENAI_REALTIME_AUDIO_PILOT_ENABLED = 'false'
    let result = guard.evaluate({ workspaceId: 'w1', confirmAudioStreaming: true })
    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'pilot_disabled')

    process.env.OPENAI_REALTIME_AUDIO_PILOT_ENABLED = 'true'
    process.env.OPENAI_REALTIME_AUDIO_PILOT_WORKSPACE_ID = 'w-allowed'
    result = guard.evaluate({ workspaceId: 'w-other', confirmAudioStreaming: true })
    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'pilot_workspace_not_authorized')

    result = guard.evaluate({ workspaceId: 'w-allowed', confirmAudioStreaming: false })
    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'pilot_confirmation_required')

    result = guard.evaluate({ workspaceId: 'w-allowed', confirmAudioStreaming: true })
    assert.equal(result.allowed, true)
    assert.equal(result.reason, 'pilot_allowed')
    console.log('realtimeAudioPilotGuard.test.js passed')
  } finally { process.env = env }
}
run()
