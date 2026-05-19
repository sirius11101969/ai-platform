function isEnabled() {
  return String(process.env.OPENAI_REALTIME_AUDIO_SANDBOX_ENABLED || 'false').toLowerCase() === 'true'
}

function allowedWorkspaceId() {
  return String(process.env.OPENAI_REALTIME_AUDIO_SANDBOX_WORKSPACE_ID || '').trim()
}

function requiresConfirmation() {
  return String(process.env.OPENAI_REALTIME_AUDIO_REQUIRE_CONFIRMATION || 'true').toLowerCase() !== 'false'
}

function evaluate({ workspaceId, confirmAudioStreaming } = {}) {
  if (!isEnabled()) return { allowed: false, reason: 'audio_sandbox_disabled', safety: { sandboxOnly: true, requireConfirmation: requiresConfirmation() } }
  const configuredWorkspace = allowedWorkspaceId()
  if (!configuredWorkspace) return { allowed: false, reason: 'audio_sandbox_workspace_not_configured', safety: { sandboxOnly: true, requireConfirmation: requiresConfirmation() } }
  if (String(workspaceId || '') !== configuredWorkspace) {
    return { allowed: false, reason: 'audio_sandbox_workspace_not_allowed', safety: { sandboxOnly: true, requireConfirmation: requiresConfirmation() } }
  }
  if (requiresConfirmation() && confirmAudioStreaming !== true) {
    return { allowed: false, reason: 'audio_sandbox_confirmation_required', safety: { sandboxOnly: true, requireConfirmation: true } }
  }
  return { allowed: true, reason: 'audio_sandbox_allowed', safety: { sandboxOnly: true, requireConfirmation: requiresConfirmation() } }
}

module.exports = { evaluate, isEnabled, requiresConfirmation }
