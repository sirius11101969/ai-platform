import React, { useMemo, useRef, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { createLiveStreamSession } from '../services/api'

export default function AiLiveRealtimeVoicePage() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('idle')
  const sourceRef = useRef(null)

  async function startSimulation() {
    setEvents([])
    setStatus('starting')
    const created = await createLiveStreamSession({})
    const id = created?.session?.id
    if (!id) return
    if (sourceRef.current) sourceRef.current.close()
    const source = new EventSource(`/api/ai/live-stream/sessions/${id}/stream`)
    sourceRef.current = source
    source.onmessage = () => {}
    ;['session_started','user_audio_chunk_simulated','partial_transcript','ai_thinking','ai_response_chunk','interruption_detected','resume_listening','final_transcript','completed'].forEach((type) => {
      source.addEventListener(type, (e) => {
        const payload = JSON.parse(e.data)
        setEvents((curr) => [...curr, payload])
        setStatus(type === 'completed' ? 'completed' : type.includes('listening') ? 'listening' : type.includes('response') ? 'speaking' : 'running')
      })
    })
  }

  const latency = useMemo(() => Math.max(20, events.length * 24), [events.length])
  const transcript = events.filter((e) => e.eventType?.includes('transcript')).map((e) => e.payload?.text).filter(Boolean).join(' · ')
  const interruption = events.find((e) => e.eventType === 'interruption_detected')

  return <main className='workspace-page ai-realtime-voice-page'>
    <PageHeading eyebrow='Simulation Mode · Live Realtime Streaming Layer' title='AI Live Streaming' copy='Browser-safe SSE simulation foundation for future live AI conversations. WebSocket-ready architecture, no real media traffic.' />
    <div className='safety-banner realtime-safety-banner'><strong>Simulation Mode</strong><span>No real microphone</span><span>No real OpenAI audio streaming</span><span>No real telephony</span></div>
    <section className='dashboard-stats realtime-voice-stats'>
      <Stat label='State' value={status} /><Stat label='Latency meter' value={`${latency}ms`} /><Stat label='Timeline events' value={events.length} /><Stat label='Interruption' value={interruption ? 'detected' : 'none'} />
    </section>
    <section className='realtime-detail-grid'>
      <Panel><h3>AI Live Streaming</h3><button className='btn primary' onClick={startSimulation}>Start Live Simulation</button><p>AI Listening: {status === 'listening' ? 'ON' : 'OFF'} · AI Speaking: {status === 'speaking' ? 'ON' : 'OFF'}</p><p className='eyebrow'>Simulation safety badge active.</p></Panel>
      <Panel><h3>Live transcript feed & event timeline</h3><p>{transcript || 'Transcript chunks will appear here.'}</p><div className='realtime-event-list'>{events.map((e) => <article key={e.id}><b>{e.eventType}</b><span>{latency}ms</span><p>{e.payload?.text || 'event'}</p></article>)}</div></Panel>
    </section>
  </main>
}

function Stat({ label, value }) { return <article className='stat-card'><span>{label}</span><strong>{value}</strong></article> }
