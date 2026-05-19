import React, { useEffect, useMemo, useRef, useState } from "react";
import { PageHeading, Panel } from "../components/AppShell";
import { createRealtimeVoiceSession, fetchCrmLeads, fetchRealtimeVoiceSession, fetchRealtimeVoiceSessions } from "../services/api";

const STATE_LABELS = {
  initializing: "Initializing",
  listening: "Listening",
  speaking: "Speaking",
  interrupted: "Interrupted",
  completed: "Completed",
  failed: "Failed",
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function normalizeEvents(session) {
  return Array.isArray(session?.events) ? session.events : [];
}

function getTranscript(events) {
  const finalEvent = events.find((event) => event.eventType === "completed" && event.payload?.transcript);
  if (finalEvent) return finalEvent.payload.transcript;
  const partials = events.filter((event) => event.eventType === "transcript_partial").map((event) => event.payload?.text).filter(Boolean);
  return partials.join(" ");
}

function getChunks(events) {
  return events.filter((event) => event.eventType === "ai_response_chunk").map((event) => event.payload?.text).filter(Boolean);
}

function getLatestInterruption(events) {
  return [...events].reverse().find((event) => event.eventType === "interruption");
}

export default function AiRealtimeVoicePage() {
  const [sessions, setSessions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const activeSessionIdRef = useRef("");

  useEffect(() => {
    activeSessionIdRef.current = activeSession?.id || "";
  }, [activeSession?.id]);

  async function loadWorkspace() {
    setLoading(true);
    setError("");
    try {
      const [sessionResponse, leadsResponse] = await Promise.all([fetchRealtimeVoiceSessions(), fetchCrmLeads()]);
      const nextSessions = sessionResponse.sessions || [];
      const nextLeads = leadsResponse.leads || [];
      setSessions(nextSessions);
      setLeads(nextLeads);
      setSelectedLeadId((current) => current || nextLeads[0]?.id || "");
      const activeId = activeSessionIdRef.current;
      const sessionToHydrate = nextSessions.find((session) => session.id === activeId) || nextSessions[0];
      if (sessionToHydrate?.id) {
        const detail = await fetchRealtimeVoiceSession(sessionToHydrate.id);
        setActiveSession(detail.session || sessionToHydrate);
      }
    } catch (requestError) {
      setError(requestError.message || "Failed to load AI Realtime Voice");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
    const interval = window.setInterval(() => loadWorkspace(), 10000);
    return () => window.clearInterval(interval);
    // loadWorkspace is intentionally polled through the stable initial closure and activeSessionIdRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStartSession() {
    if (!selectedLeadId) return;
    setCreating(true);
    setMessage("");
    setError("");
    try {
      const response = await createRealtimeVoiceSession({ leadId: selectedLeadId, autoRun: true });
      setActiveSession(response.session);
      setMessage("Realtime voice simulation completed. No telephony or microphone stream was started.");
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || "Failed to start realtime voice simulation");
    } finally {
      setCreating(false);
    }
  }

  async function openSession(session) {
    setActiveSession(session);
    try {
      const response = await fetchRealtimeVoiceSession(session.id);
      setActiveSession(response.session || session);
    } catch (requestError) {
      setError(requestError.message || "Failed to load realtime session detail");
    }
  }

  const stats = useMemo(() => {
    const active = sessions.filter((session) => ["initializing", "listening", "speaking", "interrupted"].includes(session.status)).length;
    return {
      active,
      completed: sessions.filter((session) => session.status === "completed").length,
      interrupted: sessions.filter((session) => session.status === "interrupted" || session.sessionMetadata?.stateHistory?.some?.((entry) => entry.state === "interrupted")).length,
      avgLatency: Math.round(sessions.reduce((sum, session) => sum + Number(session.latencyMs || 0), 0) / Math.max(1, sessions.length)),
    };
  }, [sessions]);

  const events = normalizeEvents(activeSession);
  const transcript = getTranscript(events);
  const chunks = getChunks(events);
  const interruption = getLatestInterruption(events);

  return (
    <main className="workspace-page ai-workers-page ai-realtime-voice-page">
      <PageHeading
        eyebrow="Simulation Mode · Realtime AI Voice Core"
        title="AI Realtime Voice"
        copy="Foundation for future live conversations: session state, event bus, transcript streaming, interruptions, latency metrics, and Revenue Brain signals."
      />

      <div className="safety-banner realtime-safety-banner">
        <strong>Simulation Mode</strong>
        <span>No real telephony</span>
        <span>No real microphone streaming</span>
      </div>

      <section className="dashboard-stats realtime-voice-stats">
        <Stat label="Active sessions" value={stats.active} hint="Listening, speaking, or interrupted" />
        <Stat label="Completed" value={stats.completed} hint="Persisted mock streams" />
        <Stat label="Interruptions" value={stats.interrupted} hint="Barge-in foundation" />
        <Stat label="Avg latency" value={`${stats.avgLatency}ms`} hint="Mock end-to-end stream" />
      </section>

      <section className="realtime-voice-grid">
        <Panel className="realtime-launch-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Streaming simulator</span>
              <h3>Start Realtime Session</h3>
              <p className="modal-copy">Runs session_start → listening → ai_processing → speaking → interruption → resume → speaking → completed.</p>
            </div>
          </div>
          <label className="crm-field">
            <span>Lead</span>
            <select value={selectedLeadId} onChange={(event) => setSelectedLeadId(event.target.value)} disabled={creating || leads.length === 0}>
              {leads.length === 0 && <option value="">No CRM leads available</option>}
              {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.phone || lead.contact || "no phone"}</option>)}
            </select>
          </label>
          <button className="btn primary" type="button" onClick={handleStartSession} disabled={creating || !selectedLeadId}>{creating ? "Simulating…" : "Start Simulation"}</button>
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}
        </Panel>

        <Panel className="realtime-session-list-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Session states</span>
              <h3>Realtime sessions</h3>
            </div>
            <button className="ghost-button compact" type="button" onClick={loadWorkspace} disabled={loading}>Refresh</button>
          </div>
          {loading && <p className="empty-state">Loading realtime sessions…</p>}
          {!loading && sessions.length === 0 && <p className="empty-state">No realtime simulations yet.</p>}
          <div className="realtime-session-list">
            {sessions.map((session) => (
              <button key={session.id} type="button" className={`realtime-session-card ${activeSession?.id === session.id ? "active" : ""}`} onClick={() => openSession(session)}>
                <span className={`live-dot ${session.status}`} />
                <b>{session.leadName || "CRM Lead"}</b>
                <small>{STATE_LABELS[session.status] || session.status} · {session.latencyMs || 0}ms</small>
                <em>{formatDate(session.createdAt)}</em>
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <section className="realtime-detail-grid">
        <Panel className="realtime-stream-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Transcript stream</span>
              <h3>{activeSession?.leadName || "Select a session"}</h3>
            </div>
            {activeSession && <span className={`status-pill ${activeSession.status}`}>{STATE_LABELS[activeSession.status] || activeSession.status}</span>}
          </div>
          <div className="voice-indicator-row">
            <span className={activeSession?.status === "listening" ? "active" : ""}>● AI Listening</span>
            <span className={activeSession?.status === "speaking" || chunks.length ? "active" : ""}>● AI Speaking</span>
            <span className={interruption ? "active interrupted" : ""}>● Interruption Ready</span>
          </div>
          <div className="transcript-console">
            {transcript ? <p>{transcript}</p> : <p className="empty-state">Partial and finalized transcripts will stream here.</p>}
          </div>
          <div className="ai-chunk-console">
            {chunks.map((chunk, index) => <span key={`${chunk}-${index}`}>{chunk}</span>)}
          </div>
        </Panel>

        <Panel className="realtime-events-panel">
          <span className="eyebrow">Event bus ledger</span>
          <h3>Session events</h3>
          <div className="realtime-event-list">
            {events.map((event) => (
              <article key={event.id || `${event.eventType}-${event.createdAt}`}>
                <b>{event.eventType}</b>
                <span>{formatDate(event.createdAt)} · {event.payload?.latencyMs || activeSession?.latencyMs || 0}ms</span>
                <p>{event.payload?.text || event.payload?.reason || event.payload?.indicator || event.payload?.metric || "session event"}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Stat({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}
