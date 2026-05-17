import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeading, Panel } from "../components/AppShell";
import { fetchAiPipelineCopilot } from "../services/api";

const metricLabels = {
  actionsToday: "Actions Today",
  focusLeads: "Focus Leads",
  riskDeals: "Risk Deals",
  meetingsNext24h: "Meetings Next 24h",
  pendingApprovals: "Pending Approvals",
  failedActions: "Failed Actions",
};

const priorityLabels = {
  urgent: "Срочно",
  priority: "В фокусе",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const statusLabels = {
  pending_approval: "Ждёт approval",
  approved: "Одобрено",
  completed: "Выполнено",
  executed: "Исполнено",
  failed: "Failed / needs fix",
  rejected: "Отклонено",
  cancelled: "Отменено",
};

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function leadSubtitle(item) {
  return [item.company || item.leadCompany, item.email, item.telegram].filter(Boolean).join(" · ") || "CRM lead";
}

function badgeClass(value, prefix = "pipeline") {
  return `${prefix}-${String(value || "medium").toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
}

function ActionButtons({ ctas = {}, navigate }) {
  const buttons = [
    ["Open Lead", ctas.openLead || "/crm"],
    ["Open AI Workers", ctas.openAiWorkers || "/ai-workers"],
    ["Open Priority Inbox", ctas.openPriorityInbox || "/priority-inbox"],
    ["Create Follow-up", ctas.createFollowUp || "/crm"],
    ["Schedule Meeting", ctas.scheduleMeeting || "/crm"],
  ];
  return (
    <div className="pipeline-card-actions">
      {buttons.map(([label, route]) => (
        <button key={label} type="button" onClick={() => navigate(route)}>{label}</button>
      ))}
    </div>
  );
}

function SectionHeader({ title, hint, action }) {
  return (
    <div className="pipeline-section-header">
      <div>
        <h3>{title}</h3>
        <p>{hint}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ children = "Нет элементов для этого блока." }) {
  return <Panel className="pipeline-empty-state">{children}</Panel>;
}

export default function PipelineCopilotPage() {
  const [cockpit, setCockpit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  async function loadCockpit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAiPipelineCopilot();
      setCockpit(response);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Pipeline Copilot");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCockpit();
  }, []);

  const summary = cockpit?.summary || {};
  const revenue = cockpit?.revenueSnapshot || {};
  const metrics = useMemo(() => ["actionsToday", "focusLeads", "riskDeals", "meetingsNext24h", "pendingApprovals", "failedActions"], []);

  function visibleItems(sectionKey, items = [], limit) {
    return expandedSections[sectionKey] ? items : items.slice(0, limit);
  }

  function showAllButton(sectionKey, items = [], limit) {
    if (items.length <= limit) return null;
    const expanded = Boolean(expandedSections[sectionKey]);
    return (
      <button className="pipeline-show-all" type="button" onClick={() => setExpandedSections((current) => ({ ...current, [sectionKey]: !expanded }))}>
        {expanded ? "Свернуть" : `Show all ${items.length}`}
      </button>
    );
  }

  return (
    <main className="workspace-page pipeline-copilot-page">
      <PageHeading
        eyebrow="AI Pipeline Copilot · AS6 AI Revenue OS"
        title="AI Pipeline Copilot"
        copy="Daily command center for what to do today: focus leads, at-risk deals, upcoming meetings, pending approvals, and fixes. No customer-facing sends happen here."
        action={<button className="ghost-button" type="button" onClick={loadCockpit} disabled={loading}>{loading ? "Обновляем…" : "Обновить"}</button>}
      />

      {error && <p className="auth-error">{error}</p>}

      <Panel className="pipeline-safety-banner">
        <strong>Safety mode: command center only.</strong>
        <span>No Telegram/email send from this page. Open AI Workers to approve or execute customer-facing actions.</span>
      </Panel>

      <section className="pipeline-summary-grid" aria-label="Top metrics">
        {metrics.map((key) => (
          <Panel className={`pipeline-metric ${badgeClass(key, "metric")}`} key={key}>
            <span>{metricLabels[key]}</span>
            <strong>{loading ? "…" : Number(summary[key] || 0)}</strong>
          </Panel>
        ))}
      </section>

      <Panel className="pipeline-summary-block">
        <div>
          <span className="eyebrow mini">Summary</span>
          <h3>{loading ? "AI формирует cockpit…" : summary.headline || "Сегодня нужно сделать 0 действий"}</h3>
        </div>
        <div className="pipeline-summary-lines">
          <span>{summary.riskText || "0 сделок в риске"}</span>
          <span>{summary.meetingsText || "0 встреч требуют подготовки"}</span>
          <span>{summary.approvalsText || "0 AI задач ждут approval"}</span>
        </div>
      </Panel>

      <section className="pipeline-section">
        <SectionHeader title="Today’s Sales Actions" hint="High-signal sales actions only: unresolved fixes, meetings, risk deals, focus leads, and actionable approvals." action={showAllButton("todayActions", cockpit?.todayActions || [], 10)} />
        <div className="pipeline-action-list">
          {loading && Array.from({ length: 4 }).map((_, index) => <Panel className="pipeline-action-card skeleton" key={index}>AI собирает действия…</Panel>)}
          {!loading && (cockpit?.todayActions || []).length === 0 && <EmptyState>Сегодня нет срочных AI-действий.</EmptyState>}
          {!loading && visibleItems("todayActions", cockpit?.todayActions || [], 10).map((action) => (
            <Panel className={`pipeline-action-card ${badgeClass(action.priority, "priority")} category-${action.category}`} key={action.id}>
              <div className="pipeline-card-topline">
                <div>
                  <span className="eyebrow mini">{action.leadName}</span>
                  <h3>{action.actionTitle}</h3>
                  <p>{action.reason}</p>
                </div>
                <div className="pipeline-urgency-stack">
                  <span className={`pipeline-badge ${badgeClass(action.priority, "priority")}`}>{priorityLabels[action.priority] || action.priority}</span>
                  <span className="pipeline-due-badge">{action.dueLabel}</span>
                </div>
              </div>
              <ActionButtons ctas={action.ctas} navigate={navigate} />
            </Panel>
          ))}
        </div>
      </section>

      <section className="pipeline-two-column">
        <div className="pipeline-section">
          <SectionHeader title="Focus Leads" hint="Only leads that need manager attention now: elevated risk, booked/proposal stage, or clear buying intent." action={showAllButton("focusLeads", cockpit?.focusLeads || [], 6)} />
          <div className="pipeline-compact-list">
            {!loading && (cockpit?.focusLeads || []).length === 0 && <EmptyState />}
            {visibleItems("focusLeads", cockpit?.focusLeads || [], 6).map((lead) => (
              <Panel className="pipeline-mini-card" key={lead.id}>
                <div>
                  <h4>{lead.name}</h4>
                  <p>{leadSubtitle(lead)}</p>
                </div>
                <div className="pipeline-mini-meta">
                  <span className={`pipeline-badge ${badgeClass(lead.aiPriority, "priority")}`}>{priorityLabels[lead.aiPriority] || lead.aiPriority}</span>
                  <strong>{lead.aiRiskLevel === "high" || lead.aiRiskLevel === "medium" ? `${lead.aiRiskLevel} risk` : "focus"}</strong>
                </div>
                <ActionButtons ctas={lead.ctas} navigate={navigate} />
              </Panel>
            ))}
          </div>
        </div>

        <div className="pipeline-section">
          <SectionHeader title="Deals at Risk" hint="High/medium risk deals requiring intervention today." action={showAllButton("riskDeals", cockpit?.riskDeals || [], 6)} />
          <div className="pipeline-compact-list">
            {!loading && (cockpit?.riskDeals || []).length === 0 && <EmptyState />}
            {visibleItems("riskDeals", cockpit?.riskDeals || [], 6).map((lead) => (
              <Panel className={`pipeline-mini-card risk-${lead.aiRiskLevel}`} key={lead.id}>
                <div>
                  <h4>{lead.name}</h4>
                  <p>{lead.managerReason || leadSubtitle(lead)}</p>
                </div>
                <div className="pipeline-mini-meta">
                  <span className={`pipeline-badge risk-${lead.aiRiskLevel}`}>{lead.aiRiskLevel} risk</span>
                  <strong>{formatMoney(lead.value)}</strong>
                </div>
                <ActionButtons ctas={lead.ctas} navigate={navigate} />
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="pipeline-three-column">
        <div className="pipeline-section">
          <SectionHeader title="Upcoming Meetings" hint="Meetings today/tomorrow and next 7 days." action={showAllButton("upcomingMeetings", cockpit?.upcomingMeetings || [], 6)} />
          <div className="pipeline-compact-list">
            {!loading && (cockpit?.upcomingMeetings || []).length === 0 && <EmptyState />}
            {visibleItems("upcomingMeetings", cockpit?.upcomingMeetings || [], 6).map((meeting) => (
              <Panel className="pipeline-mini-card meeting" key={meeting.id}>
                <div>
                  <h4>{meeting.leadName}</h4>
                  <p>{meeting.title} · {formatDateTime(meeting.startsAt)}</p>
                </div>
                <span className={meeting.needsPrep ? "pipeline-badge meeting-hot" : "pipeline-badge"}>{meeting.needsPrep ? "Prep now" : meeting.status}</span>
                <ActionButtons ctas={meeting.ctas} navigate={navigate} />
              </Panel>
            ))}
          </div>
        </div>

        <div className="pipeline-section">
          <SectionHeader title="Waiting for Approval" hint="Actionable sales approvals only: messages, follow-ups, meetings, and next-best-action items." action={showAllButton("pendingApprovals", cockpit?.pendingApprovals || [], 6)} />
          <div className="pipeline-compact-list">
            {!loading && (cockpit?.pendingApprovals || []).length === 0 && <EmptyState />}
            {visibleItems("pendingApprovals", cockpit?.pendingApprovals || [], 6).map((item) => (
              <Panel className="pipeline-mini-card approval" key={item.id}>
                <div>
                  <h4>{item.leadName}</h4>
                  <p>{item.title}</p>
                </div>
                <span className="pipeline-badge approval-waiting">{statusLabels[item.status] || item.status}</span>
                <ActionButtons ctas={item.ctas} navigate={navigate} />
              </Panel>
            ))}
          </div>
        </div>

        <div className="pipeline-section">
          <SectionHeader title="Failed / Needs Fix" hint="Only unresolved failed customer-facing actions. Resolved fallback history stays out of the urgent cockpit." action={showAllButton("failedActions", cockpit?.failedActions || [], 5)} />
          <div className="pipeline-compact-list">
            {!loading && (cockpit?.failedActions || []).length === 0 && <EmptyState />}
            {visibleItems("failedActions", cockpit?.failedActions || [], 5).map((item) => (
              <Panel className="pipeline-mini-card failed" key={item.id}>
                <div>
                  <h4>{item.leadName}</h4>
                  <p>{item.errorMessage || item.title}</p>
                </div>
                <span className="pipeline-badge failed-badge">Needs fix</span>
                <ActionButtons ctas={item.ctas} navigate={navigate} />
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="pipeline-section">
        <SectionHeader title="Revenue Snapshot" hint="Pipeline value, weighted value, and value exposed to risk." />
        <div className="pipeline-revenue-grid">
          <Panel><span>Open Pipeline</span><strong>{formatMoney(revenue.openPipelineValue)}</strong><p>{revenue.activeDeals || 0} active deals</p></Panel>
          <Panel><span>Weighted Pipeline</span><strong>{formatMoney(revenue.weightedPipelineValue)}</strong><p>Probability-weighted view</p></Panel>
          <Panel><span>Risk Pipeline</span><strong>{formatMoney(revenue.riskPipelineValue)}</strong><p>Elevated risk exposure</p></Panel>
          <Panel><span>Focus Pipeline</span><strong>{formatMoney(revenue.focusPipelineValue)}</strong><p>Value in today’s focus set</p></Panel>
        </div>
      </section>
    </main>
  );
}
