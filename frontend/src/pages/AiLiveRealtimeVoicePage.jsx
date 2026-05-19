import React, { useMemo, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'

const steps = ['negotiation', 'mock_stream', 'transcript', 'interruption', 'response_chunks', 'completed']

export default function AiLiveRealtimeVoicePage() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('idle')
  const [startedAt, setStartedAt] = useState(null)

  const metrics = useMemo(() => {
    const latency = events.filter((e) => e.latencyMs).map((e) => e.latencyMs)
    const avgLatency = latency.length ? Math.round(latency.reduce((a, b) => a + b, 0) / latency.length) : 0
    return { avgLatency, interruptions: events.filter((e) => e.type === 'interruption').length, transcriptLag: 120, responseChunkTiming: 180, duration: startedAt ? Math.max(1, Date.now() - startedAt) : 0 }
  }, [events, startedAt])

  async function startSimulation() {
    setStatus('running')
    setEvents([])
    setStartedAt(Date.now())
    for (const [i, step] of steps.entries()) {
      await new Promise((resolve) => setTimeout(resolve, 220))
      setEvents((curr) => [...curr, { type: step, latencyMs: 45 + i * 15, text: step === 'transcript' ? 'Prospect: we need revenue visibility in real-time.' : step }])
    }
    setStatus('completed')
  }

  return <main className='workspace-page ai-realtime-voice-page'>
    <PageHeading eyebrow='Simulation Mode · OpenAI Realtime + WebRTC Foundation' title='AI Live Realtime Voice' copy='Production-grade browser realtime transport foundation. No real microphone, no telephony, no OpenAI audio streaming yet.' />
    <div className='safety-banner realtime-safety-banner'><strong>Simulation Mode</strong><span>No real microphone</span><span>No real telephony</span><span>No OpenAI audio streaming yet</span></div>
    <section className='dashboard-stats realtime-voice-stats'>
      <Stat label='Active sessions' value={status === 'running' ? 1 : 0} />
      <Stat label='Transport state' value={status} />
      <Stat label='Avg latency' value={`${metrics.avgLatency}ms`} />
      <Stat label='Session duration' value={`${Math.round(metrics.duration / 1000)}s`} />
    </section>
    <section className='realtime-detail-grid'>
      <Panel><h3>Realtime Simulation</h3><button className='btn primary' onClick={startSimulation} disabled={status === 'running'}>Start Realtime Simulation</button><p>Waveform: ▂▅▃▆▂▇▃▅ (simulated)</p><p>Interruption recovery: {metrics.interruptions}</p><p>Transcript lag: {metrics.transcriptLag}ms · Response chunk timing: {metrics.responseChunkTiming}ms</p></Panel>
      <Panel><h3>Transcript & transport events</h3><div className='realtime-event-list'>{events.map((e, idx) => <article key={idx}><b>{e.type}</b><span>{e.latencyMs}ms</span><p>{e.text}</p></article>)}</div></Panel>
    </section>
  </main>
}

function Stat({ label, value }) { return <article className='stat-card'><span>{label}</span><strong>{value}</strong></article> }
