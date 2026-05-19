export const WEBRTC_INITIAL_STATE = {
  peerConnectionState: 'idle',
  iceGatheringState: 'new',
  signalingState: 'stable',
  localAudioTrackReady: false,
  localAudioTrackId: null,
  offerCreated: false,
  simulatedAnswerApplied: false,
  iceCandidateCount: 0,
  noAudioSentToOpenAi: true,
  simulationTransport: true,
  error: null,
}

export function createRealtimeConnectionStateService(initialState = {}) {
  let state = { ...WEBRTC_INITIAL_STATE, ...initialState }
  const listeners = new Set()

  function notify() { listeners.forEach((listener) => listener({ ...state })) }

  return {
    getState() { return { ...state } },
    subscribe(listener) {
      listeners.add(listener)
      listener({ ...state })
      return () => listeners.delete(listener)
    },
    update(patch) {
      state = { ...state, ...patch }
      notify()
      return { ...state }
    },
    reset() {
      state = { ...WEBRTC_INITIAL_STATE }
      notify()
      return { ...state }
    },
  }
}
