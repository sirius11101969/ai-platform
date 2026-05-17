import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeading, Panel } from "../components/AppShell";
import { createCrmFollowUp, fetchAiPriorityInbox } from "../services/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "priority", label: "Priority" },
  { key: "risk", label: "At Risk" },
  { key: "followup", label: "Needs Follow-up" },
  { key: "meetings", label: "Meetings" },
  { key: "no_response", label: "No Response >3d" },
];

function formatDate(value) {
  if (!value) return "нет активности";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function metricLabel(key) {
  return ({ urgentLeads: "Urgent Leads", priorityLeads: "Priority Leads", atRiskDeals: "At-Risk Deals", meetingsPending: "Meetings Pending", followUpsNeeded: "Follow-ups Needed" }[key] || key);
}

function badgeLabel(value) {
  return String(value || "medium").replace("priority", "high").toUpperCase();
}

function leadMatchesFilter(lead, filter) {
  if (filter === "all") return true;
  if (filter === "urgent") return lead.isUrgent;
  if (filter === "priority") return ["urgent", "high", "priority"].includes(lead.aiPriority) || Number(lead.aiScore || 0) >= 70;
  if (filter === "risk") return lead.isAtRisk;
  if (filter === "followup") return lead.needsFollowUp;
  if (filter === "meetings") return lead.pendingMeeting || lead.status === "booked";
  if (filter === "no_response") return Number(lead.noResponseDays || 0) >= 3;
  return true;
}

export default function PriorityInboxPage() {
  const [inbox, setInbox] = useState({ leads: [], metrics: {} });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyFollowUp, setBusyFollowUp] = useState({});
  const navigate = useNavigate();

  async function loadInbox() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAiPriorityInbox();
      setInbox({ leads: response.leads || [], metrics: response.metrics || {}, generatedAt: response.generatedAt });
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Priority Inbox");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadInbox(); }, []);

  const filteredLeads = useMemo(() => inbox.leads.filter((lead) => leadMatchesFilter(lead, filter)), [inbox.leads, filter]);

  function openLead(lead, focus) {
    const url = lead.actionUrls?.[focus] || lead.crmUrl || `/crm?leadId=${lead.leadId}`;
    navigate(url);
  }

  async function handleCreateFollowUp(lead) {
    setBusyFollowUp((current) => ({ ...current, [lead.leadId]: true }));
    setError("");
    try {
      await createCrmFollowUp(lead.leadId);
      await loadInbox();
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать follow-up");
    } finally {
      setBusyFollowUp((current) => ({ ...current, [lead.leadId]: false }));
    }
  }

  return (
    <main className="workspace-page priority-inbox-page">
      <PageHeading
        eyebrow="AI Priority Inbox v1"
        title="AI Priority Inbox"
        copy="Сфокусированный sales cockpit: кому писать сейчас, почему лид важен и какой следующий шаг сработает лучше всего."
        action={<button className="ghost-button" type="button" onClick={loadInbox} disabled={loading}>{loading ? "Обновляем…" : "Обновить"}</button>}
      />

      {error && <p className="auth-error">{error}</p>}

      <section className="priority-metrics" aria-label="Метрики AI Priority Inbox">
        {["urgentLeads", "priorityLeads", "atRiskDeals", "meetingsPending", "followUpsNeeded"].map((key) => (
          <Panel className={`priority-metric priority-metric-${key}`} key={key}>
            <span>{metricLabel(key)}</span>
            <strong>{loading ? "…" : Number(inbox.metrics?.[key] || 0)}</strong>
          </Panel>
        ))}
      </section>

      <Panel className="priority-control-panel">
        <div className="priority-controls-head">
          <div>
            <h3>Action queue</h3>
            <p>{loading ? "AI сортирует лиды…" : `${filteredLeads.length} из ${inbox.leads.length} лидов требуют внимания`}</p>
          </div>
          <span className="priority-sorting-hint">Сортировка: urgent → risk → booked/proposal → score → activity</span>
        </div>
        <div className="priority-filter-bar" role="tablist" aria-label="Фильтры Priority Inbox">
          {FILTERS.map((item) => (
            <button key={item.key} type="button" className={filter === item.key ? "active" : ""} onClick={() => setFilter(item.key)}>{item.label}</button>
          ))}
        </div>
      </Panel>

      <section className="priority-card-grid" aria-live="polite">
        {loading && Array.from({ length: 4 }).map((_, index) => <Panel className="priority-lead-card priority-card-skeleton" key={index}>AI анализирует очередь…</Panel>)}
        {!loading && filteredLeads.length === 0 && <Panel className="empty-priority-inbox">Нет лидов в этом фильтре. Выберите All или обновите scoring.</Panel>}
        {!loading && filteredLeads.map((lead) => (
          <Panel className={`priority-lead-card ${lead.isUrgent ? "urgent" : ""} ${lead.isAtRisk ? "risk" : ""}`} key={lead.leadId}>
            <div className="priority-card-topline">
              <div>
                <span className="eyebrow mini">{lead.stage}</span>
                <h3>{lead.name}</h3>
                <p>{lead.company || lead.email || lead.telegram || "контакт не указан"}{lead.company && lead.email ? ` · ${lead.email}` : ""}</p>
              </div>
              <div className="priority-score">
                <span>AI score</span>
                <strong>{lead.aiScore}</strong>
              </div>
            </div>

            <div className="priority-badges">
              <span className={`priority-badge priority-${lead.aiPriority}`}>{badgeLabel(lead.aiPriority)}</span>
              <span className={`priority-badge temp-${lead.aiTemperature}`}>{badgeLabel(lead.aiTemperature)}</span>
              <span className={`priority-badge risk-${lead.aiRiskLevel}`}>{badgeLabel(lead.aiRiskLevel)} RISK</span>
            </div>

            <div className="priority-action-callout">
              <span>Next suggested action</span>
              <strong>{lead.nextBestAction}</strong>
              <p>{lead.nextBestActionReason}</p>
            </div>

            <div className="priority-reason-grid">
              <div>
                <span>Почему важно</span>
                <p>{lead.aiScoringReason}</p>
              </div>
              <div>
                <span>Last activity</span>
                <p>{formatDate(lead.lastActivityAt)} · {lead.lastActivitySummary}{Number(lead.noResponseDays || 0) >= 3 ? ` · no response ${lead.noResponseDays}d` : ""}</p>
              </div>
            </div>

            <div className="priority-card-actions">
              <button type="button" onClick={() => openLead(lead, "telegram")}>Telegram</button>
              <button type="button" onClick={() => openLead(lead, "email")}>Email</button>
              <button type="button" onClick={() => handleCreateFollowUp(lead)} disabled={busyFollowUp[lead.leadId]}>{busyFollowUp[lead.leadId] ? "Создаём…" : "Create Follow-up"}</button>
              <button type="button" onClick={() => openLead(lead, "demo")}>Schedule Demo</button>
              <button type="button" className="primary-card-action" onClick={() => openLead(lead, "lead")}>Open CRM Lead</button>
            </div>
          </Panel>
        ))}
      </section>
    </main>
  );
}
