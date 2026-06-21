/* AS6_REAL_PAGE_CONVERSION_ENGINE_V108: governed by Mission Control Layout 2.0 */
/* AS6_DIRECT_PAGE_REWRITE_V100: governed by AS6UnifiedPageShell / AS6DirectPageRewriteFramework */
import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { fetchAiManagerDashboard } from "../services/api";
import { groupSafetyEvents } from "../utils/aiManagerDashboardSafety";

const rangeOptions = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const EMPTY_COPY = "AI ещё не накопил достаточно действий для KPI.";

function safeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return safeNumber(value).toLocaleString("ru-RU");
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(safeNumber(value));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function hasAnyData(sections) {
  return sections.some((section) => Object.values(section || {}).some((value) => typeof value === "number" ? value > 0 : Number(value || 0) > 0));
}

function KpiGrid({ children }) {
  return <section className="dashboard-stats ai-manager-kpi-grid">{children}</section>;
}

function MetricPanel({ title, eyebrow, children }) {
  return (
    <Panel className="ai-manager-section">
      <div className="panel-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="ai-manager-metric-grid">{children}</div>
    </Panel>
  );
}

function MiniMetric({ label, value, hint, danger = false }) {
  return (
    <article className={`ai-manager-mini-metric ${danger ? "danger" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <p>{hint}</p>}
    </article>
  );
}

function TimelineList({ items, empty, safety = false }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  if (!items?.length) return <p className="empty-state">{empty}</p>;

  const toggleGroup = (key) => {
    setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="ai-manager-event-list">
      {items.map((item, index) => {
        const itemKey = item.key || item.id || `${item.type || "event"}-${item.createdAt || index}-${index}`;
        const isGroupedCooldown = item.grouped && item.groupKind === "cooldown";
        const isExpanded = Boolean(expandedGroups[itemKey]);
        const visibleLeadNames = isExpanded ? item.leadNames : item.leadNames?.slice(0, 3);

        return (
          <article className={`ai-manager-event ${safety ? "safety" : ""} ${isGroupedCooldown ? "grouped-cooldown" : ""}`} key={itemKey}>
            <div className="ai-manager-event-content">
              <div className="ai-manager-event-title-row">
                <strong>{item.title || "AI event"}</strong>
                {item.badge && <span className="ai-manager-event-badge">{item.badge}</span>}
              </div>
              {item.detail && <p>{item.detail}</p>}
              {isGroupedCooldown && visibleLeadNames?.length > 0 && (
                <>
                  <ul className="ai-manager-event-leads">
                    {visibleLeadNames.map((leadName, leadIndex) => (
                      <li key={`${itemKey}-lead-${leadName}-${leadIndex}`}>{leadName}</li>
                    ))}
                  </ul>
                  {item.leadNames.length > 3 && (
                    <button className="ai-manager-event-toggle" type="button" onClick={() => toggleGroup(itemKey)}>
                      {isExpanded ? "Свернуть" : `Показать ещё ${item.leadNames.length - 3}`}
                    </button>
                  )}
                </>
              )}
            </div>
            <time>{formatDate(item.createdAt)}</time>
          </article>
        );
      })}
    </div>
  );
}

export default function AiManagerDashboardPage() {
  const [range, setRange] = useState("7d");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchAiManagerDashboard({ range })
      .then((response) => {
        if (!active) return;
        setDashboard(response || {});
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || "Не удалось загрузить KPI dashboard");
        setDashboard(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [range]);

  const actionFunnel = dashboard?.actionFunnel || {};
  const communicationOutcomes = dashboard?.communicationOutcomes || {};
  const workloadReduction = dashboard?.workloadReduction || {};
  const pipelineHealth = dashboard?.pipelineHealth || {};
  const revenueAttribution = dashboard?.revenueAttribution || {};
  const safetyEvents = dashboard?.safetyEvents || {};
  const recentWins = Array.isArray(dashboard?.recentWins) ? dashboard.recentWins : [];
  const safetyItems = Array.isArray(safetyEvents?.items) ? safetyEvents.items : [];
  const groupedSafetyItems = useMemo(() => groupSafetyEvents(safetyItems), [safetyItems]);

  const hasData = useMemo(() => hasAnyData([actionFunnel, communicationOutcomes, workloadReduction, pipelineHealth, revenueAttribution, safetyEvents]) || recentWins.length > 0 || safetyItems.length > 0, [actionFunnel, communicationOutcomes, workloadReduction, pipelineHealth, revenueAttribution, safetyEvents, recentWins.length, safetyItems.length]);

  return (
    <main className="workspace-page ai-workers-page ai-manager-dashboard-page">
      <PageHeading
        eyebrow="AI Sales Operating System"
        title="AI Manager Dashboard"
        copy="KPI слой для руководителя: ценность AI действий, нагрузка менеджера, безопасность коммуникаций и атрибуция выручки в текущем workspace."
        action={(
          <div className="ai-manager-range-filter" aria-label="Date range filter">
            {rangeOptions.map((option) => (
              <button key={option.value} className={range === option.value ? "active" : ""} type="button" onClick={() => setRange(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        )}
      />

      {loading && <Panel><p className="empty-state">Загружаем KPI AI Sales OS…</p></Panel>}
      {!loading && error && <Panel className="ai-manager-error"><p className="empty-state">{error}</p></Panel>}
      {!loading && !error && !hasData && <Panel><p className="empty-state">{EMPTY_COPY}</p></Panel>}

      {!loading && !error && (
        <>
          <KpiGrid>
            <StatCard label="AI actions generated" value={formatNumber(actionFunnel.actions_generated)} hint="Все AI действия за выбранный период" tone="cyan" />
            <StatCard label="Completed after approval" value={formatNumber(workloadReduction.completed_after_approval)} hint="Завершены после решения менеджера" tone="violet" />
            <StatCard label="Estimated minutes saved" value={formatNumber(workloadReduction.estimated_minutes_saved)} hint="completed customer-facing actions × 7 минут" tone="pink" />
          </KpiGrid>

          <section className="app-grid two-columns align-start ai-manager-grid">
            <MetricPanel eyebrow="A. AI Action Funnel" title="Воронка AI действий">
              <MiniMetric label="Generated" value={formatNumber(actionFunnel.actions_generated)} />
              <MiniMetric label="Pending approval" value={formatNumber(actionFunnel.pending_approval)} />
              <MiniMetric label="Approved" value={formatNumber(actionFunnel.approved)} />
              <MiniMetric label="Sent / completed" value={formatNumber(actionFunnel.sent_completed)} />
              <MiniMetric label="Rejected" value={formatNumber(actionFunnel.rejected)} />
              <MiniMetric label="Failed unresolved" value={formatNumber(actionFunnel.failed_unresolved)} danger />
              <MiniMetric label="Blocked by safety / copy guard" value={formatNumber(actionFunnel.blocked_by_safety_copy_guard)} danger />
            </MetricPanel>

            <MetricPanel eyebrow="B. Communication Outcomes" title="Коммуникации и guardrails">
              <MiniMetric label="Emails sent" value={formatNumber(communicationOutcomes.emails_sent)} />
              <MiniMetric label="Telegram messages sent" value={formatNumber(communicationOutcomes.telegram_messages_sent)} />
              <MiniMetric label="Followups sent" value={formatNumber(communicationOutcomes.followups_sent)} />
              <MiniMetric label="Cooldown skips" value={formatNumber(communicationOutcomes.cooldown_skips)} />
              <MiniMetric label="Duplicate followups prevented" value={formatNumber(communicationOutcomes.duplicate_followups_prevented)} />
              <MiniMetric label="Unsafe copy blocked" value={formatNumber(communicationOutcomes.unsafe_copy_blocked)} danger />
            </MetricPanel>
          </section>

          <section className="app-grid two-columns align-start ai-manager-grid">
            <MetricPanel eyebrow="C. Manager Workload Reduction" title="Снижение ручной нагрузки">
              <MiniMetric label="Actions prepared by AI" value={formatNumber(workloadReduction.actions_prepared_by_ai)} />
              <MiniMetric label="Actions requiring manager decision" value={formatNumber(workloadReduction.actions_requiring_manager_decision)} />
              <MiniMetric label="Completed after approval" value={formatNumber(workloadReduction.completed_after_approval)} />
              <MiniMetric label="Estimated minutes saved" value={formatNumber(workloadReduction.estimated_minutes_saved)} hint="Формула v1: customer-facing completed × 7" />
            </MetricPanel>

            <MetricPanel eyebrow="D. Pipeline Health" title="Здоровье pipeline">
              <MiniMetric label="Urgent leads" value={formatNumber(pipelineHealth.urgent_leads)} />
              <MiniMetric label="Priority leads" value={formatNumber(pipelineHealth.priority_leads)} />
              <MiniMetric label="High risk" value={formatNumber(pipelineHealth.high_risk)} danger />
              <MiniMetric label="Medium risk" value={formatNumber(pipelineHealth.medium_risk)} />
              <MiniMetric label="Low risk" value={formatNumber(pipelineHealth.low_risk)} />
              <MiniMetric label="Committed forecast amount" value={formatMoney(pipelineHealth.committed_forecast_amount)} />
              <MiniMetric label="AI forecast updates today" value={formatNumber(pipelineHealth.ai_generated_forecast_updates_today)} />
            </MetricPanel>
          </section>

          <section className="app-grid two-columns align-start ai-manager-grid">
            <MetricPanel eyebrow="E. Revenue Attribution" title="AI влияние на выручку">
              <MiniMetric label="Pipeline under AI monitoring" value={formatMoney(revenueAttribution.total_pipeline_value_under_ai_monitoring)} />
              <MiniMetric label="Expected revenue from committed leads" value={formatMoney(revenueAttribution.expected_revenue_from_committed_leads)} />
              <MiniMetric label="Actions linked to opportunities" value={formatNumber(revenueAttribution.actions_linked_to_revenue_opportunities)} />
              <MiniMetric label="Meetings scheduled by AI" value={formatNumber(revenueAttribution.meetings_scheduled_by_ai)} />
            </MetricPanel>

            <Panel className="ai-manager-section ai-manager-safety-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Safety</span>
                  <h3>Операционная безопасность</h3>
                </div>
              </div>
              <div className="ai-manager-safety-summary">
                <MiniMetric label="Copy guard blocks" value={formatNumber(safetyEvents.copy_guard_blocks)} danger />
                <MiniMetric label="Cooldown skips" value={formatNumber(safetyEvents.cooldown_skips)} />
                <MiniMetric label="Failed unresolved" value={formatNumber(safetyEvents.failed_unresolved)} danger />
                <MiniMetric label="Fallback-to-email events" value={formatNumber(safetyEvents.fallback_to_email_events)} />
                <MiniMetric label="Route-highlight recoveries" value={formatNumber(safetyEvents.route_highlight_recoveries)} />
              </div>
              <TimelineList items={groupedSafetyItems} empty="Safety events пока нет." safety />
            </Panel>
          </section>

          <Panel className="ai-manager-section">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Recent wins</span>
                <h3>Последние доказательства пользы AI</h3>
              </div>
            </div>
            <TimelineList items={recentWins} empty="Recent wins пока нет." />
          </Panel>
        </>
      )}
    </main>
  );
}
