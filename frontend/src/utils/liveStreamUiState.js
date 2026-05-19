export const LIVE_STREAM_INITIAL_STATE = { events: [], status: 'idle', transcript: '', interruptionDetected: false, resumed: false, thinking: false, speaking: false, completed: false }

export function reduceLiveStreamState(current, event) {
  const events = [...current.events, event]
  const type = event?.eventType
  const transcript = events.filter((e) => e.eventType?.includes('transcript')).map((e) => e.payload?.text).filter(Boolean).join(' · ')
  return {
    ...current,
    events,
    transcript,
    interruptionDetected: current.interruptionDetected || type === 'interruption_detected',
    resumed: current.resumed || type === 'resume_listening',
    thinking: type === 'ai_thinking',
    speaking: type === 'ai_response_chunk',
    completed: type === 'completed',
    status: type === 'completed' ? 'completed' : type === 'ai_response_chunk' ? 'speaking' : type === 'resume_listening' ? 'listening' : 'running',
  }
}
