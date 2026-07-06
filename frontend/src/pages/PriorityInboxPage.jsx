import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeading, Panel } from "../components/AppShell";
import { sanitizeVisibleAiText } from "../utils/uiSanitizer";
import { createPriorityInboxAction, fetchAiPriorityInbox } from "../services/api";

const TABS = [
  { key: "focus", label: "Focus" },
  { key: "urgent", label: "Urgent" },
  { key: "risk", label: "At Risk" },
  { key: "meetings", label: "Meetings" },
  { key: "followups", label: "Follow-ups" },
  { key: "all", label: "All Leads" },
];

function formatDate(value) {
  if (!value) return "нет активности";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function metricLabel(key) {
  return ({ urgentLeads: "Urgent Leads", focusLeads: "Focus Leads", atRiskDeals: "At-Risk Deals", meetingsToday: "Meetings Today", followUpsNeeded: "Follow-ups Needed" }[key] || key);
}

function badgeLabel(value) {
  return String(value || "medium").replace("priority", "priority").toUpperCase();
}

function cardClassName(lead) {
  return [
    "priority-lead-card",
    lead.isUrgent ? "urgent" : "",
    lead.isAtRisk ? "risk" : "",
    lead.pendingMeeting || lead.meetingToday || lead.hasMeeting ? "meeting" : "",
  ].filter(Boolean).join(" ");
}

export default function PriorityInboxPage() {
  const [inbox, setInbox] = useState({ leads: [], metrics: {}, totalLeads: 0, mode: "focus" });
  const [mode, setMode] = useState("focus");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyActions, setBusyActions] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const highlightRef = useRef(null);
  const targetLeadId = new URLSearchParams(location.search).get("leadId") || "";

  async function loadInbox(nextMode = mode) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetchAiPriorityInbox({ mode: nextMode });
      setInbox({
        leads: response.leads || [],
        metrics: response.metrics || {},
        totalLeads: response.totalLeads || response.leads?.length || 0,
        generatedAt: response.generatedAt,
        mode: response.mode || nextMode,
      });
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Priority Inbox");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialMode = targetLeadId ? "all" : "focus";
    setMode(initialMode);
    loadInbox(initialMode);
  }, [location.search]);

  useEffect(() => {
    if (!loading && highlightRef.current) highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [loading, targetLeadId, inbox.leads]);

  function selectMode(nextMode) {
    setMode(nextMode);
    loadInbox(nextMode);
  }

  function openLead(lead, focus) {
    const url = lead.actionUrls?.[focus] || lead.crmUrl || `/as6-crm?leadId=${lead.leadId}`;
    navigate(url);
  }

  function actionBusyKey(lead, actionType) {
    return `${lead.leadId}:${actionType}`;
  }

  function isActionBusy(lead, actionType) {
    return Boolean(busyActions[actionBusyKey(lead, actionType)]);
  }

  async function handlePriorityAction(lead, actionType) {
    const busyKey = actionBusyKey(lead, actionType);
    console.log("[priority-inbox] action button clicked", { leadId: lead.leadId, actionType });
    setBusyActions((current) => ({ ...current, [busyKey]: true }));
    setError("");
    setMessage("");
    try {
      const result = await createPriorityInboxAction({ leadId: lead.leadId, actionType });
      if (result.skipped) {
        setMessage(result.message || "Follow-up cooldown: клиенту уже отправлено сообщение недавно.");
        return;
      }
      setMessage(result.duplicate ? "Действие уже ждёт approval — открываем AI Workers" : "AI действие создано — открываем approval center");
      navigate(result.redirectTo || "/ai-workers");
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать AI действие");
    } finally {
      setBusyActions((current) => ({ ...current, [busyKey]: false }));
    }
  }

  return (
    <main className="workspace-page priority-inbox-page">
      <PageHeading
        eyebrow="AI Priority Inbox · Focus Mode v2"
        title="Focus Mode"
        copy="Executive sales cockpit: только urgent, priority, сделки с AI risk и встречи/предложения с высоким action potential. Generic high 51–59 скрыты по умолчанию."
        action={<button className="ghost-button" type="button" onClick={() => loadInbox(mode)} disabled={loading}>{loading ? "Обновляем…" : "Обновить"}</button>}
      />

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="success-alert">{message}</p>}

      <section className="priority-metrics" aria-label="Метрики AI Priority Inbox">
        {["urgentLeads", "focusLeads", "atRiskDeals", "meetingsToday", "followUpsNeeded"].map((key) => (
          <Panel className={`priority-metric priority-metric-${key}`} key={key}>
            <span>{metricLabel(key)}</span>
            <strong>{loading ? "…" : Number(inbox.metrics?.[key] || 0)}</strong>
          </Panel>
        ))}
      </section>

      <Panel className="priority-control-panel">
        <div className="priority-controls-head">
          <div>
            <h3>Focused action queue</h3>
            <p>{loading ? "AI применяет Focus Mode…" : `${inbox.leads.length} из ${inbox.totalLeads || inbox.leads.length} активных лидов показаны в ${TABS.find((tab) => tab.key === mode)?.label || "Focus"}`}</p>
          </div>
          <span className="priority-sorting-hint">Сортировка Focus: urgent → at-risk proposal/booked → meetings → priority</span>
        </div>
        <div className="priority-filter-bar" role="tablist" aria-label="Режимы Priority Inbox">
          {TABS.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={mode === item.key} className={mode === item.key ? "active" : ""} onClick={() => selectMode(item.key)}>{item.label}</button>
          ))}
        </div>
      </Panel>

      <section className="priority-card-grid" aria-live="polite">
        {loading && Array.from({ length: 4 }).map((_, index) => <Panel className="priority-lead-card priority-card-skeleton" key={index}>AI анализирует Focus Mode…</Panel>)}
        {!loading && inbox.leads.length === 0 && <Panel className="empty-priority-inbox">Нет лидов в этом режиме. Generic high лиды доступны во вкладке All Leads.</Panel>}
        {!loading && inbox.leads.map((lead) => (
          <Panel ref={lead.leadId === targetLeadId ? highlightRef : null} className={`${cardClassName(lead)} ${lead.leadId === targetLeadId ? "route-highlight" : ""}`} key={lead.leadId}>
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
              {(lead.pendingMeeting || lead.meetingToday || lead.hasMeeting) && <span className="priority-badge meeting-badge">MEETING</span>}
            </div>

            <div className="priority-action-callout">
              <span>Next suggested action</span>
              <strong>{sanitizeVisibleAiText(lead.nextBestAction)}</strong>
              <p>{sanitizeVisibleAiText(lead.nextBestActionReason)}</p>
            </div>

            <div className="priority-reason-grid">
              <div>
                <span>Почему важно</span>
                <p>{sanitizeVisibleAiText(lead.aiScoringReason)}</p>
              </div>
              <div>
                <span>Last activity</span>
                <p>{formatDate(lead.lastActivityAt)} · {sanitizeVisibleAiText(lead.lastActivitySummary)}{Number(lead.noResponseDays || 0) >= 3 ? ` · no response ${lead.noResponseDays}d` : ""}</p>
              </div>
            </div>

            <div className="priority-card-actions">
              <button type="button" onClick={() => handlePriorityAction(lead, "telegram")} title={lead.actionDisabledReasons?.telegram || ""} disabled={Boolean(lead.actionDisabledReasons?.telegram) || isActionBusy(lead, "telegram")}>{isActionBusy(lead, "telegram") ? "Создаём…" : "Telegram"}</button>
              <button type="button" onClick={() => handlePriorityAction(lead, "email")} title={lead.actionDisabledReasons?.email || ""} disabled={Boolean(lead.actionDisabledReasons?.email) || isActionBusy(lead, "email")}>{isActionBusy(lead, "email") ? "Создаём…" : "Email"}</button>
              <button type="button" onClick={() => handlePriorityAction(lead, "followup")} title={lead.actionDisabledReasons?.followup || ""} disabled={Boolean(lead.actionDisabledReasons?.followup) || isActionBusy(lead, "followup")}>{isActionBusy(lead, "followup") ? "Создаём…" : "Create Follow-up"}</button>
              <button type="button" onClick={() => handlePriorityAction(lead, "meeting")} disabled={isActionBusy(lead, "meeting")}>{isActionBusy(lead, "meeting") ? "Создаём…" : "Meeting"}</button>
              <button type="button" className="primary-card-action" onClick={() => openLead(lead, "lead")}>Open CRM Lead</button>
            </div>
          </Panel>
        ))}
      </section>
    </main>
  );
}
