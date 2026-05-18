import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { createAiVoiceCall, fetchAiVoiceCall, fetchAiVoiceCalls, fetchCrmLeads } from "../services/api";
import { buildMockVoiceCallPayload, buildVoiceCallDetail, buildVoiceDashboard } from "../utils/aiVoiceOutreach";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status) {
  return ({ queued: "Queued", dialing: "Dialing", active: "Active", completed: "Completed", failed: "Failed", rejected: "Rejected" })[status] || status || "—";
}

function sentimentLabel(sentiment) {
  return ({ positive: "Positive", neutral: "Neutral", negative: "Negative" })[sentiment] || sentiment || "—";
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === "") return "—";
  const normalized = Number(seconds);
  if (!Number.isFinite(normalized)) return "—";
  if (normalized < 60) return `${normalized}s`;
  return `${Math.floor(normalized / 60)}m ${normalized % 60}s`;
}

function formatJson(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function AiVoiceOutreachPage() {
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [detailCall, setDetailCall] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  async function loadVoiceWorkspace() {
    setLoading(true);
    setError("");
    try {
      const [callsResponse, leadsResponse] = await Promise.all([fetchAiVoiceCalls(), fetchCrmLeads()]);
      setCalls(callsResponse.calls || []);
      const nextLeads = leadsResponse.leads || [];
      setLeads(nextLeads);
      setSelectedLeadId((current) => current || nextLeads.find((lead) => lead.phone)?.id || nextLeads[0]?.id || "");
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Voice Outreach");
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    loadVoiceWorkspace().catch((requestError) => {
      if (!active) return;
      setError(requestError.message || "Не удалось загрузить AI Voice Outreach");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const dashboard = useMemo(() => buildVoiceDashboard(calls), [calls]);
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId);
  const detail = detailCall ? buildVoiceCallDetail(detailCall) : null;

  async function handleCreateMockCall() {
    setCreating(true);
    setError("");
    setCreateMessage("");
    try {
      const response = await createAiVoiceCall(buildMockVoiceCallPayload({ leadId: selectedLeadId, phoneNumber: selectedLead?.phone }));
      const createdCall = response.call;
      setCalls((current) => [createdCall, ...current.filter((call) => call.id !== createdCall.id)]);
      setCreateMessage("Mock voice call completed. No real telephony traffic was sent.");
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать mock voice call");
    } finally {
      setCreating(false);
    }
  }

  async function openCallDetail(call) {
    setDetailCall(call);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await fetchAiVoiceCall(call.id);
      setDetailCall(response.call || call);
    } catch (requestError) {
      setDetailError(requestError.message || "Не удалось загрузить детали звонка");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <main className="workspace-page ai-workers-page ai-voice-page">
      <PageHeading
        eyebrow="Mock-mode autonomous calling"
        title="AI Voice Outreach"
        copy="Executive UI for mock AI calling agents: lifecycle, transcripts, sentiment, outcomes, qualification, and next actions."
      />

      <div className="safety-banner">
        <strong>Mock Mode</strong>
        <span>No real telephony traffic</span>
      </div>

      <section className="dashboard-stats voice-dashboard-stats">
        <StatCard label="Queued calls" value={dashboard.stats.queued} hint="Waiting in mock lifecycle" />
        <StatCard label="Active calls" value={dashboard.stats.active} hint="Dialing or active simulations" tone="purple" />
        <StatCard label="Completed calls" value={dashboard.stats.completed} hint="Transcript and analysis saved" tone="green" />
        <StatCard label="Positive sentiment" value={dashboard.stats.positive} hint="Qualified voice conversations" tone="orange" />
        <StatCard label="Failed calls" value={dashboard.stats.failed} hint="Failed or rejected calls" tone="pink" />
      </section>

      <section className="ai-voice-command-grid">
        <Panel className="ai-voice-trigger-card">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Mock call trigger</span>
              <h3>Start Mock Voice Call</h3>
              <p className="modal-copy">Uses POST /api/ai/voice/call and forces mock_provider safety mode.</p>
            </div>
          </div>
          <div className="voice-trigger-form">
            <label className="crm-field">
              <span>Lead</span>
              <select value={selectedLeadId} onChange={(event) => setSelectedLeadId(event.target.value)} disabled={creating || leads.length === 0}>
                {leads.length === 0 && <option value="">No CRM leads available</option>}
                {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.phone || "no phone"}</option>)}
              </select>
            </label>
            <button className="btn primary" type="button" onClick={handleCreateMockCall} disabled={creating || !selectedLeadId}>{creating ? "Starting…" : "Start Mock Voice Call"}</button>
          </div>
          {createMessage && <p className="form-success">{createMessage}</p>}
          <p className="voice-safety-note">Mock Mode · No real telephony traffic · transcripts are generated by the mock provider.</p>
        </Panel>

        <Panel className="ai-voice-actions-card">
          <span className="eyebrow">Recommended next actions</span>
          <h3>Voice outcomes queue</h3>
          {dashboard.recommended.length === 0 && <p className="empty-state">No voice recommendations yet. Completed mock calls will appear here.</p>}
          <div className="voice-recommendation-list">
            {dashboard.recommended.map((item) => (
              <article key={item.id}>
                <b>{item.leadName}</b>
                <span>{sentimentLabel(item.sentiment)} · {item.outcome}</span>
                <p>{item.nextAction}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel className="ai-voice-table-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Voice call ledger</span>
            <h3>Recent AI voice calls</h3>
          </div>
          <button className="ghost-button compact" type="button" onClick={loadVoiceWorkspace} disabled={loading}>Refresh</button>
        </div>
        {loading && <p className="empty-state">Загружаем voice calls…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && dashboard.isEmpty && <p className="empty-state">Пока нет AI voice calls. Use Start Mock Voice Call to populate transcripts, outcomes, and recommendations.</p>}
        {!loading && !error && !dashboard.isEmpty && (
          <div className="responsive-table ai-voice-table">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Phone</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Sentiment</th>
                  <th>Outcome</th>
                  <th>Duration</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.calls.map((call) => (
                  <tr key={call.id} onClick={() => openCallDetail(call)} className="clickable-row">
                    <td><button type="button" className="link-button" onClick={(event) => { event.stopPropagation(); openCallDetail(call); }}>{call.leadName}</button></td>
                    <td>{call.phoneNumber}</td>
                    <td>{call.provider}</td>
                    <td><span className={`status-pill ${call.status}`}>{statusLabel(call.status)}</span></td>
                    <td><span className={`sentiment-pill ${call.sentiment}`}>{sentimentLabel(call.sentiment)}</span></td>
                    <td>{call.outcome}</td>
                    <td>{formatDuration(call.durationSeconds)}</td>
                    <td>{formatDate(call.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {detail && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailCall(null); }}>
          <div className="ai-task-modal voice-detail-modal" role="dialog" aria-modal="true" aria-label="AI voice call details">
            <div className="modal-glow" />
            <div className="panel-head">
              <div>
                <span className="eyebrow">AI Voice Outreach detail</span>
                <h3>{detail.leadName} · {statusLabel(detail.status)}</h3>
                <p className="modal-copy">Mock Mode · No real telephony traffic</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setDetailCall(null)} aria-label="Close">×</button>
            </div>
            {detailLoading && <p className="empty-state">Loading call detail…</p>}
            {detailError && <p className="form-error">{detailError}</p>}
            <div className="voice-detail-grid">
              <section className="detail-section voice-transcript-card">
                <h4>Transcript</h4>
                <p>{detail.transcript}</p>
              </section>
              <section className="detail-section">
                <h4>AI summary</h4>
                <p>{detail.summary}</p>
              </section>
              <section className="detail-section">
                <h4>Qualification & next action</h4>
                <div className="ai-recommendation-grid compact-grid">
                  <div><span>Qualification level</span><strong>{detail.qualificationLevel}</strong></div>
                  <div><span>Sentiment</span><strong>{sentimentLabel(detail.sentiment)}</strong></div>
                  <div><span>Outcome</span><strong>{detail.outcome}</strong></div>
                  <div><span>Next action</span><strong>{detail.nextAction}</strong></div>
                </div>
              </section>
              <section className="detail-section">
                <h4>Metadata</h4>
                {detail.metadataEntries.length === 0 && <p className="empty-state">No metadata stored.</p>}
                <dl className="voice-metadata-list">
                  {detail.metadataEntries.map((entry) => <React.Fragment key={entry.key}><dt>{entry.key}</dt><dd>{entry.value}</dd></React.Fragment>)}
                </dl>
              </section>
              <section className="detail-section voice-timeline-card">
                <h4>Call timeline events</h4>
                {detail.timeline.length === 0 && <p className="empty-state">No timeline events stored.</p>}
                {detail.timeline.map((event) => (
                  <article key={event.id}>
                    <b>{event.eventType}</b>
                    <span>{formatDate(event.createdAt)}</span>
                    <pre>{formatJson(event.payload)}</pre>
                  </article>
                ))}
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
