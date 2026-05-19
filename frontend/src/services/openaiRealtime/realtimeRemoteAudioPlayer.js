export function createRealtimeRemoteAudioPlayer() {
  let active = false
  return {
    prepare() { active = true },
    handleRemoteAudioChunk() { if (!active) return null; return { placeholder: true } },
    stop() { active = false },
  }
}
