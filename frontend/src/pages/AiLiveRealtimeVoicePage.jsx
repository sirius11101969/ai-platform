import React, { useMemo, useRef, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { createLiveStreamEventSource, startLiveStreamSession } from '../services/api'
import { LIVE_STREAM_INITIAL_STATE, reduceLiveStreamState } from '../utils/liveStreamUiState'

export default function AiLiveRealtimeVoicePage() {
  const [stream, setStream] = useState(LIVE_STREAM_INITIAL_STATE)
  const sourceRef = useRef(null)

  async function startSimulation() {
    setStream({ ...LIVE_STREAM_INITIAL_STATE, status: 'starting' })
    const created = await startLiveStreamSession({})
    const id = created?.session?.id
    if (!id) return
    if (sourceRef.current) sourceRef.current.close()
    const source = await createLiveStreamEventSource(id)
    sourceRef.current = source
    source.addEventListener('live_stream_event', (e) => {
      const payload = JSON.parse(e.data)
      setStream((curr) => reduceLiveStreamState(curr, payload))
      if (payload.eventType === 'completed') source.close()
    })
  } 

  const latency = useMemo(() => Math.max(20, stream.events.length * 24), [stream.events.length])

  return <main className='workspace-page ai-realtime-voice-page'>
    <PageHeading eyebrow='Simulation Mode · Live Realtime Streaming Layer' title='AI Live Streaming' copy='Browser-safe SSE simulation foundation for future live AI conversations. WebSocket-ready architecture, no real media traffic.' />
    <div className='safety-banner realtime-safety-banner'><strong>Simulation Mode</strong><span>No real microphone</span><span>No real OpenAI audio streaming</span><span>No real telephony</span></div>
    <section className='dashboard-stats realtime-voice-stats'>
      <Stat label='State' value={stream.status} /><Stat label='Latency meter' value={`${latency}ms`} /><Stat label='Timeline events' value={stream.events.length} /><Stat label='Interruption' value={stream.interruptionDetected ? 'detected' : 'none'} />
    </section>
    <section className='realtime-detail-grid'>
      <Panel><h3>AI Live Streaming</h3><button className='btn primary' onClick={startSimulation}>Start Live Simulation</button><div className='voice-indicator-row'><span className={stream.thinking ? 'active' : ''}>AI Thinking</span><span className={stream.speaking ? 'active' : ''}>AI Speaking</span><span className={stream.interruptionDetected ? 'interrupted' : ''}>Interruption</span><span className={stream.resumed ? 'active' : ''}>Resume</span><span className={stream.completed ? 'active' : ''}>Completed</span></div><p className='eyebrow'>Simulation safety badge active.</p></Panel>
      <Panel><h3>Live transcript feed & event timeline</h3><p>{stream.transcript || 'Transcript chunks will appear here.'}</p><div className='realtime-event-list'>{stream.events.map((e) => <article key={e.id}><b>{e.eventType}</b><span>{latency}ms</span><p>{e.payload?.text || 'event'}</p></article>)}</div></Panel>
    </section>
  </main>
}

function Stat({ label, value }) { return <article className='stat-card'><span>{label}</span><strong>{value}</strong></article> }
