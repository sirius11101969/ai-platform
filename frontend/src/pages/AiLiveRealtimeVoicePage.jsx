import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { createLiveStreamEventSource, startLiveStreamSession, createOpenAiRealtimeEphemeralSession, refreshOpenAiRealtimeSession, createOpenAiRealtimeAudioSandboxSession, stopOpenAiRealtimeAudioSandboxSession, createOpenAiRealtimeAudioPilotSession, stopOpenAiRealtimeAudioPilotSession } from '../services/api'
import { LIVE_STREAM_INITIAL_STATE, reduceLiveStreamState } from '../utils/liveStreamUiState'
import { createMicrophoneManager } from '../services/microphone/microphoneManager'
import { getMicrophoneSupportStatus } from '../services/microphone/microphonePermissionService'
import { createWebrtcNegotiationService } from '../services/webrtc/webrtcNegotiationService'
import { createOpenAiRealtimeAudioBridge } from '../services/openaiRealtime/openaiRealtimeAudioBridge'

export default function AiLiveRealtimeVoicePage() {
  const [stream, setStream] = useState(LIVE_STREAM_INITIAL_STATE)
  const sourceRef = useRef(null)
  const micRef = useRef(null)
  const [micState, setMicState] = useState({ permission: 'unknown', enabled: false, muted: false, speaking: false, level: 0, waveform: Array.from({ length: 32 }, () => 0), status: 'idle', error: null })

  const [ephemeral, setEphemeral] = useState({ status: 'idle', sessionId: null, expiresIn: 0, reconnectState: 'stable', transportState: 'prepared', latencyState: 'simulated', providerMode: 'simulation', providerStatus: 'Simulation', model: null, voice: null, error: null })
  const refreshTimerRef = useRef(null)
  const webrtcRef = useRef(null)
  const [webrtcState, setWebrtcState] = useState({ peerConnectionState: 'idle', iceGatheringState: 'new', signalingState: 'stable', localAudioTrackReady: false, offerCreated: false, simulatedAnswerApplied: false, iceCandidateCount: 0, noAudioSentToOpenAi: true, simulationTransport: true })
  const [sandbox, setSandbox] = useState({ enabled: false, requireConfirmation: true, confirmed: false, allowed: false, reason: 'disabled', active: false })
  const [pilot, setPilot] = useState({ enabled: false, authorizedWorkspace: false, consent: false, state: 'pilot_disconnected', active: false, timer: 0, latency: 0, reason: 'pilot_disabled', maxSessionSeconds: 180 })
  const audioBridgeRef = useRef(null)
  const pilotTimerRef = useRef(null)

  useEffect(() => {
    const manager = createMicrophoneManager({
      onEvent: (event) => {
        setStream((curr) => reduceLiveStreamState(curr, { id: `local-${Date.now()}-${event.eventType}`, ...event }))
      },
    })
    micRef.current = manager
    manager.refreshPermission().then(() => setMicState({ ...manager.state }))
    webrtcRef.current = createWebrtcNegotiationService({
      providerMode: 'simulation',
      onEvent: (event) => setStream((curr) => reduceLiveStreamState(curr, { id: `webrtc-${Date.now()}-${event.eventType}`, ...event })),
    })
    audioBridgeRef.current = createOpenAiRealtimeAudioBridge({ sandboxEnabled: false, confirmationRequired: true, onEvent: (event) => setStream((curr) => reduceLiveStreamState(curr, { id: `sandbox-${Date.now()}-${event.eventType}`, ...event })) })
    const unsubscribe = webrtcRef.current.subscribe(setWebrtcState)
    return () => { unsubscribe(); webrtcRef.current?.close(); manager.stop() }
  }, [])


  async function bootstrapEphemeralSession() {
    const created = await createOpenAiRealtimeEphemeralSession({ transport: 'webrtc' })
    const session = created?.session
    if (!session?.id) return
    const expiresIn = Math.max(1, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000))
    setEphemeral({ status: 'active', sessionId: session.id, expiresIn, reconnectState: 'stable', transportState: 'webrtc', latencyState: session.simulationMode ? 'simulated' : 'live-ready', providerMode: session.providerMode || 'simulation', providerStatus: session.providerMode === 'openai' ? 'Ready' : session.state === 'provider_error_fallback' ? 'Provider Error' : 'Simulation', model: session.model, voice: session.voice, error: null })
  }

  async function startSimulation() {
    setStream({ ...LIVE_STREAM_INITIAL_STATE, status: 'starting' })
    const created = await startLiveStreamSession({})
    await bootstrapEphemeralSession()
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


  useEffect(() => {
    if (ephemeral.status !== 'active' || !ephemeral.sessionId) return
    const timer = setInterval(() => {
      setEphemeral((curr) => ({ ...curr, expiresIn: Math.max(0, curr.expiresIn - 1) }))
    }, 1000)
    return () => clearInterval(timer)
  }, [ephemeral.status, ephemeral.sessionId])

  useEffect(() => {
    if (ephemeral.status !== 'active' || !ephemeral.sessionId || ephemeral.expiresIn > 30) return
    if (refreshTimerRef.current) return
    refreshTimerRef.current = true
    refreshOpenAiRealtimeSession(ephemeral.sessionId, { replayNonce: `browser-${Date.now()}` })
      .then((r) => {
        const sec = Math.max(1, Math.floor((new Date(r.session.expiresAt).getTime() - Date.now()) / 1000))
        setEphemeral((curr) => ({ ...curr, expiresIn: sec, reconnectState: 'refreshed', providerMode: r.session.providerMode || curr.providerMode, providerStatus: r.session.providerMode === 'openai' ? 'Ready' : 'Simulation', model: r.session.model || curr.model, voice: r.session.voice || curr.voice }))
      })
      .catch(() => setEphemeral((curr) => ({ ...curr, reconnectState: 'reconnecting', error: 'Session refresh failed' })))
      .finally(() => { refreshTimerRef.current = null })
  }, [ephemeral])

  const latency = useMemo(() => Math.max(20, stream.events.length * 24), [stream.events.length])
  const support = getMicrophoneSupportStatus()

  const salesBrainSignals = useMemo(() => {
    const byType = (t) => stream.events.filter((e) => e.eventType === t)
    return {
      leadSignals: byType('lead_signal_detected').slice(-1)[0]?.payload || null,
      objections: byType('objection_detected').slice(-1)[0]?.payload || null,
      meeting: byType('meeting_interest_detected').slice(-1)[0]?.payload || null,
      actions: byType('crm_action_suggested').map((e) => e.payload?.action?.type).filter(Boolean),
      sentiment: byType('sentiment_shift_detected').slice(-1)[0]?.payload || null,
    }
  }, [stream.events])

  function syncMic() { if (micRef.current) setMicState({ ...micRef.current.state }) }

  async function enableMicrophone() {
    await micRef.current?.start()
    syncMic()
    const stream = micRef.current?.state?.stream
    if (stream && webrtcRef.current) {
      webrtcRef.current.preparePeerConnection()
      await webrtcRef.current.attachLocalAudioTrack(stream, { enabled: true })
    }
  }

  function disableMicrophone() { micRef.current?.stop(); webrtcRef.current?.close(); syncMic() }
  function toggleMute() { micRef.current?.setMuted(!micState.muted); syncMic() }
  function simulateActivity() {
    if (!micRef.current?.state.enabled) return
    const samples = Array.from({ length: 128 }, (_, idx) => Math.sin((idx / 128) * Math.PI * 8) * (0.12 + Math.random() * 0.8))
    micRef.current.processAudioFrame(samples)
    syncMic()
  }



  async function startSandboxAudioSession() {
    const response = await createOpenAiRealtimeAudioSandboxSession({ confirmAudioStreaming: sandbox.confirmed })
    setSandbox((curr) => ({ ...curr, enabled: response?.safety?.sandboxOnly === true, requireConfirmation: !!response?.safety?.requireConfirmation, allowed: !!response?.allowed, reason: response?.reason || 'unknown', active: !!response?.allowed }))
    if (!response?.allowed) return
    audioBridgeRef.current = createOpenAiRealtimeAudioBridge({ sandboxEnabled: true, confirmationRequired: !!response?.safety?.requireConfirmation, onEvent: (event) => setStream((curr) => reduceLiveStreamState(curr, { id: `sandbox-${Date.now()}-${event.eventType}`, ...event })) })
    audioBridgeRef.current.prepareConnection({ ephemeralSession: { id: ephemeral.sessionId } })
    if (sandbox.confirmed && micRef.current?.state?.stream) audioBridgeRef.current.attachLocalTrack({ stream: micRef.current.state.stream, confirmed: true })
  }

  async function stopSandboxAudioSession() {
    if (ephemeral.sessionId) await stopOpenAiRealtimeAudioSandboxSession(ephemeral.sessionId).catch(() => null)
    audioBridgeRef.current?.stop()
    setSandbox((curr) => ({ ...curr, active: false }))
  }



  useEffect(() => {
    if (!pilot.active) return
    pilotTimerRef.current = setInterval(() => {
      setPilot((curr) => ({ ...curr, timer: curr.timer + 1, latency: Math.max(20, curr.latency + 4) }))
    }, 1000)
    return () => clearInterval(pilotTimerRef.current)
  }, [pilot.active])

  async function startPilotSession() {
    const response = await createOpenAiRealtimeAudioPilotSession({ confirmAudioStreaming: pilot.consent })
    const allowed = !!response?.allowed
    setPilot((curr) => ({ ...curr, enabled: response?.reason !== 'pilot_disabled', authorizedWorkspace: response?.reason !== 'pilot_workspace_not_authorized', state: allowed ? 'pilot_connecting' : 'pilot_failed', active: allowed, reason: response?.reason || 'unknown', maxSessionSeconds: response?.maxSessionSeconds || 180, timer: 0 }))
    if (!allowed) return
    audioBridgeRef.current = createOpenAiRealtimeAudioBridge({ sandboxEnabled: true, confirmationRequired: true, maxSessionSeconds: response?.maxSessionSeconds || 180, onEvent: (event) => {
      const next = event?.payload?.state
      if (next) setPilot((curr) => ({ ...curr, state: next, active: next === 'pilot_connected' || next === 'pilot_connecting' }))
      setStream((curr) => reduceLiveStreamState(curr, { id: `pilot-${Date.now()}-${event.eventType}`, ...event }))
    } })
    audioBridgeRef.current.prepareConnection({ ephemeralSession: { id: ephemeral.sessionId } })
    if (pilot.consent && micRef.current?.state?.stream) audioBridgeRef.current.attachLocalTrack({ stream: micRef.current.state.stream, confirmed: true })
    if (micState.speaking) audioBridgeRef.current.handleInterruption({ userSpeaking: true })
  }

  async function stopPilotSession() {
    if (ephemeral.sessionId) await stopOpenAiRealtimeAudioPilotSession(ephemeral.sessionId).catch(() => null)
    audioBridgeRef.current?.stop()
    setPilot((curr) => ({ ...curr, active: false, state: 'pilot_disconnected' }))
  }

  async function prepareWebrtcTransport() {
    webrtcRef.current?.preparePeerConnection()
    await webrtcRef.current?.createLocalOffer()
  }

  function closeWebrtcConnection() { webrtcRef.current?.close() }

  return <main className='workspace-page ai-realtime-voice-page'>
    <PageHeading eyebrow='Simulation Mode · Live Realtime Streaming Layer' title='AI Live Streaming' copy='Controlled pilot-ready realtime and simulation streaming layer with safety-first browser controls.' />
    <div className='safety-banner realtime-safety-banner'><strong>Local Browser Audio Only</strong><span>OpenAI Realtime: {ephemeral.providerStatus}</span><span>Model: {ephemeral.model || 'n/a'}</span><span>Voice: {ephemeral.voice || 'n/a'}</span><span>Secure Ephemeral Session</span><span>API Key Not Exposed</span></div>
    <section className='dashboard-stats realtime-voice-stats'>
      <Stat label='State' value={stream.status} /><Stat label='Latency meter' value={`${latency}ms`} /><Stat label='Timeline events' value={stream.events.length} /><Stat label='Interruption' value={stream.interruptionDetected ? 'detected' : 'none'} />
      <Stat label='Session active' value={ephemeral.status} /><Stat label='Expires in' value={`${ephemeral.expiresIn}s`} /><Stat label='Reconnect' value={ephemeral.reconnectState} /><Stat label='Transport' value={ephemeral.transportState} /><Stat label='Realtime mode' value={ephemeral.providerMode} /><Stat label='Voice' value={ephemeral.voice || 'n/a'} />
    </section>
    <section className='realtime-detail-grid'>
      <Panel><h3>AI Live Streaming</h3><button className='btn primary' onClick={startSimulation}>Start Live Simulation</button><button className='btn secondary' onClick={prepareWebrtcTransport}>Prepare WebRTC</button><div className='voice-indicator-row'><span className={stream.thinking ? 'active' : ''}>AI Thinking</span><span className={stream.speaking ? 'active' : ''}>AI Speaking</span><span className={stream.interruptionDetected ? 'interrupted' : ''}>Interruption</span><span className={stream.resumed ? 'active' : ''}>Resume</span><span className={stream.completed ? 'active' : ''}>Completed</span></div><p className='eyebrow'>Simulation safety badge active.</p></Panel>
      <Panel>
        <h3>Browser microphone foundation</h3>
        <p>Permission: <b>{micState.permission}</b> · Status: <b>{micState.status}</b> · Browser support: <b>{support.supported ? 'supported' : 'unsupported'}</b></p>
        <div className='mic-controls'><button className='btn compact primary' onClick={enableMicrophone}>Enable Microphone</button><button className='btn compact secondary' onClick={disableMicrophone}>Disable Microphone</button><button className='btn compact secondary' onClick={toggleMute}>{micState.muted ? 'Unmute' : 'Mute'}</button><button className='btn compact secondary' onClick={simulateActivity}>Simulate Audio Activity</button></div>
        <div className='voice-indicator-row'><span className={micState.enabled ? 'active' : ''}>Microphone indicator</span><span className={micState.muted ? 'interrupted' : ''}>{micState.muted ? 'Muted' : 'Unmuted'}</span><span className={micState.speaking ? 'active' : ''}>{micState.speaking ? 'Speaking' : 'Idle'}</span></div>
        <div className='audio-meter'><i style={{ width: `${Math.max(3, micState.level * 100)}%` }} /></div>
        <div className='waveform'>{micState.waveform.map((v, idx) => <span key={idx} style={{ height: `${Math.max(6, v * 100)}%` }} />)}</div>
        {micState.error ? <p className='auth-error'>Microphone error: {micState.error}</p> : null}
      </Panel>

      <Panel>
        <h3>Realtime WebRTC Transport</h3>
        <p><b>WebRTC Prepared</b>: {webrtcState.peerConnectionState !== 'idle' ? 'Yes' : 'No'} · <b>Local Audio Track Ready</b>: {webrtcState.localAudioTrackReady ? 'Yes' : 'No'}</p>
        <p><b>No Audio Sent To OpenAI</b>: {webrtcState.noAudioSentToOpenAi ? 'Yes' : 'No'} · <b>Simulation Transport</b>: {webrtcState.simulationTransport ? 'Yes' : 'No'}</p>
        <div className='voice-indicator-row'><span>Peer: {webrtcState.peerConnectionState}</span><span>ICE: {webrtcState.iceGatheringState}</span><span>Signaling: {webrtcState.signalingState}</span><span>Offer: {webrtcState.offerCreated ? 'Created' : 'Pending'}</span><span>Simulated answer: {webrtcState.simulatedAnswerApplied ? 'Applied' : 'Pending'}</span><span>ICE candidates: {webrtcState.iceCandidateCount}</span></div>
        <button className='btn compact secondary' onClick={closeWebrtcConnection}>Close WebRTC Connection</button>
      </Panel>

      <Panel>
        <h3>OpenAI Realtime Audio Sandbox</h3>
        <p><b>Sandbox Only</b> · Audio may be sent to OpenAI only after confirmation.</p>
        <p><b>Status</b>: {sandbox.active ? 'Enabled' : 'Disabled'} · <b>Reason</b>: {sandbox.reason}</p>
        <p><b>OpenAI API key never exposed</b> · <b>Stop session anytime</b></p>
        <label><input type='checkbox' checked={sandbox.confirmed} onChange={(e) => setSandbox((curr) => ({ ...curr, confirmed: e.target.checked }))} /> I confirm audio streaming for sandbox test.</label>
        <div className='voice-indicator-row'><span className={sandbox.active ? 'active' : ''}>Sandbox Only</span><span className={!sandbox.active ? 'active' : ''}>Real audio disabled by default</span></div>
        <div className='mic-controls'><button className='btn compact primary' onClick={startSandboxAudioSession}>Start Sandbox Audio Session</button><button className='btn compact secondary' onClick={stopSandboxAudioSession}>Stop Session</button></div>
      </Panel>

      <Panel>
        <h3>Realtime AI Conversation</h3>
        <p><b>Pilot Mode</b> · <b>Authorized Workspace Only</b> · <b>Disconnect Anytime</b> · <b>Auto Timeout Enabled</b> · <b>API Key Never Exposed</b></p>
        <p><b>Pilot enabled</b>: {pilot.enabled ? 'Yes' : 'No'} · <b>Workspace authorized</b>: {pilot.authorizedWorkspace ? 'Yes' : 'No'}</p>
        <p><b>Realtime connection state</b>: {pilot.state} · <b>AI speaking</b>: {stream.speaking ? 'Yes' : 'No'} · <b>User speaking</b>: {micState.speaking ? 'Yes' : 'No'} · <b>Interruption</b>: {stream.interruptionDetected ? 'Yes' : 'No'}</p><p><b>Simulation fallback</b>: {ephemeral.providerMode === 'openai' ? 'No' : 'Yes'}</p>
        <p><b>Timer</b>: {pilot.timer}s / {pilot.maxSessionSeconds}s · <b>Latency</b>: {pilot.latency}ms</p>
        <label><input type='checkbox' checked={pilot.consent} onChange={(e) => setPilot((curr) => ({ ...curr, consent: e.target.checked }))} /> I explicitly confirm real audio streaming for this pilot session.</label>
        <div className='mic-controls'><button className='btn compact primary' onClick={startPilotSession}>Connect Pilot</button><button className='btn compact secondary' onClick={stopPilotSession}>Disconnect Pilot</button></div>
      </Panel>


      <Panel><h3>AI Sales Brain</h3><p>Realtime sales cognition layer active. Suggestion-only mode enforced.</p><p><b>No auto-contact</b> · <b>No auto-send</b> · <b>No auto-book</b></p></Panel>
      <Panel><h3>Lead Intelligence</h3><p>{salesBrainSignals.leadSignals ? JSON.stringify(salesBrainSignals.leadSignals.leadContext || {}) : 'Waiting for lead signal...'}</p></Panel>
      <Panel><h3>Conversation Signals</h3><p>Sentiment: {salesBrainSignals.sentiment ? `${salesBrainSignals.sentiment.from} → ${salesBrainSignals.sentiment.to}` : 'n/a'}</p><p>Meeting intents: {salesBrainSignals.meeting?.meetingIntent?.intents?.join(', ') || 'none'}</p></Panel>
      <Panel><h3>Suggested CRM Actions</h3><p>{salesBrainSignals.actions.length ? salesBrainSignals.actions.join(', ') : 'No suggestions yet'}</p><p>Suggestions only. Manual user approval required.</p></Panel>
      <Panel><h3>Objection Analysis</h3><p>{salesBrainSignals.objections?.objection ? `${salesBrainSignals.objections.objection.category} (${Math.round((salesBrainSignals.objections.objection.confidence || 0) * 100)}%)` : 'No objection detected'}</p></Panel>
      <Panel><h3>Meeting Intent Detection</h3><p>{salesBrainSignals.meeting?.meetingIntent?.primaryIntent || 'No meeting intent detected'}</p></Panel>

      <Panel><h3>Live transcript feed & event timeline</h3><p>{stream.transcript || 'Transcript chunks will appear here.'}</p><div className='realtime-event-list'>{stream.events.map((e) => <article key={e.id}><b>{e.eventType}</b><span>{latency}ms</span><p>{e.payload?.text || 'event'}</p></article>)}</div></Panel>
    </section>
  </main>
}

function Stat({ label, value }) { return <article className='stat-card'><span>{label}</span><strong>{value}</strong></article> }
