function isPilotEnabled() {
  return String(process.env.OPENAI_REALTIME_AUDIO_PILOT_ENABLED || 'false').toLowerCase() === 'true'
}

function allowedWorkspaceId() {
  return String(process.env.OPENAI_REALTIME_AUDIO_PILOT_WORKSPACE_ID || '').trim()
}

function evaluate({ workspaceId, confirmAudioStreaming } = {}) {
  const safety = {
    pilotMode: true,
    authorizedWorkspaceOnly: true,
    explicitConfirmationRequired: true,
    simulationFallback: true,
  }

  if (!isPilotEnabled()) return { allowed: false, reason: 'pilot_disabled', safety }
  const configuredWorkspace = allowedWorkspaceId()
  if (!configuredWorkspace) return { allowed: false, reason: 'pilot_workspace_not_configured', safety }
  if (String(workspaceId || '') !== configuredWorkspace) return { allowed: false, reason: 'pilot_workspace_not_authorized', safety }
  if (confirmAudioStreaming !== true) return { allowed: false, reason: 'pilot_confirmation_required', safety }
  return { allowed: true, reason: 'pilot_allowed', safety }
}

module.exports = { evaluate, isPilotEnabled, allowedWorkspaceId }
