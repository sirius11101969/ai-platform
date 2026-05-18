import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { fetchAiVoiceCalls } from "../services/api";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status) {
  return ({ queued: "Queued", dialing: "Dialing", active: "Active", completed: "Completed", failed: "Failed", rejected: "Rejected" })[status] || status || "—";
}

function countBy(calls, predicate) {
  return calls.filter(predicate).length;
}

export default function AiVoiceOutreachPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchAiVoiceCalls()
      .then((response) => {
        if (active) setCalls(response.calls || []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || "Не удалось загрузить AI Voice Outreach");
        setCalls([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => ({
    queued: countBy(calls, (call) => call.status === "queued"),
    active: countBy(calls, (call) => ["dialing", "active"].includes(call.status)),
    completed: countBy(calls, (call) => call.status === "completed"),
    positive: countBy(calls, (call) => call.sentiment === "positive"),
  }), [calls]);

  return (
    <main className="workspace-page ai-workers-page ai-voice-page">
      <PageHeading
        eyebrow="Mock-mode autonomous calling"
        title="AI Voice Outreach"
        copy="Foundation for autonomous calling agents: lifecycle, transcripts, sentiment, outcomes, and next actions. Real telephony is intentionally disabled."
      />

      <div className="safety-banner">
        <strong>Mock mode only.</strong>
        <span>No real numbers are auto-called, no telephony traffic is sent, and compliance is not simulated.</span>
      </div>

      <section className="dashboard-stats">
        <StatCard label="Queued calls" value={stats.queued} hint="Waiting in mock lifecycle" />
        <StatCard label="Active calls" value={stats.active} hint="Dialing or active simulations" tone="purple" />
        <StatCard label="Completed calls" value={stats.completed} hint="Transcript and analysis saved" tone="green" />
        <StatCard label="Positive sentiment" value={stats.positive} hint="Qualified voice conversations" tone="orange" />
      </section>

      <Panel className="ai-voice-table-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Voice call ledger</span>
            <h3>Recent AI voice calls</h3>
          </div>
        </div>
        {loading && <p className="empty-state">Загружаем voice calls…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && calls.length === 0 && <p className="empty-state">Пока нет AI voice calls. Создайте вызов через API или sequence с channel=voice.</p>}
        {!loading && !error && calls.length > 0 && (
          <div className="responsive-table ai-voice-table">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Sentiment</th>
                  <th>Outcome</th>
                  <th>Next action</th>
                  <th>Duration</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id}>
                    <td>{call.leadName || call.leadId}</td>
                    <td><span className={`status-pill ${call.status}`}>{statusLabel(call.status)}</span></td>
                    <td>{call.sentiment || "—"}</td>
                    <td>{call.outcome || "—"}</td>
                    <td>{call.nextAction || "—"}</td>
                    <td>{call.durationSeconds ? `${call.durationSeconds}s` : "—"}</td>
                    <td>{formatDate(call.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </main>
  );
}
