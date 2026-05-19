export function createAudioLevelMonitor({ onLevel, onActivity, onSpeakingStart, onSpeakingStop, activityThreshold = 0.08, silenceMs = 900 } = {}) {
  let speaking = false
  let silenceTimer = null

  function emitStop() {
    speaking = false
    onSpeakingStop?.()
  }

  function process(samples = []) {
    if (!samples.length) {
      onLevel?.(0)
      return 0
    }
    const energy = Math.sqrt(samples.reduce((sum, value) => sum + (value * value), 0) / samples.length)
    onLevel?.(energy)
    if (energy >= activityThreshold) {
      onActivity?.(energy)
      if (!speaking) {
        speaking = true
        onSpeakingStart?.()
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        silenceTimer = null
      }
    } else if (speaking && !silenceTimer) {
      silenceTimer = setTimeout(emitStop, silenceMs)
    }
    return energy
  }

  function stop() {
    if (silenceTimer) clearTimeout(silenceTimer)
    silenceTimer = null
    speaking = false
  }

  return { process, stop, isSpeaking: () => speaking }
}

