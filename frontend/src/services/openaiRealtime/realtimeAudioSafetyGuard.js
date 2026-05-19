export function createRealtimeAudioSafetyGuard({ sandboxEnabled = false, confirmationRequired = true } = {}) {
  return {
    canPrepare() { return sandboxEnabled },
    canAttachLocalTrack({ confirmed } = {}) { return sandboxEnabled && (!confirmationRequired || confirmed === true) },
  }
}
