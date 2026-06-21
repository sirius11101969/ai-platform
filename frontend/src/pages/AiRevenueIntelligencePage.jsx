/* AS6_REAL_PAGE_CONVERSION_ENGINE_V108: governed by Mission Control Layout 2.0 */
/* AS6_DIRECT_PAGE_REWRITE_V100: governed by AS6UnifiedPageShell / AS6DirectPageRewriteFramework */
import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { getLeadScores, getRevenueIntelligence, triggerRevenueAnalysis } from "../services/api";
import { buildRecommendationQueue, getForecastWidget, getLatestRevenueLeadScores, getRevenueCards, hasRevenueIntelligenceData } from "../utils/revenueIntelligence";

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCardValue(card) {
  if (card.kind === "money") return formatCurrency(card.value);
  if (card.kind === "score") return `${card.value}/100`;
  return String(card.value);
}

function LeadScoreList({ title, eyebrow, leads = [], emptyText, scoreKey = "priorityScore" }) {
  return (
    <Panel className="revenue-list-card ai-revenue-list-panel">
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      {leads.length === 0 && <p className="empty-state">{emptyText}</p>}
      {leads.map((lead) => (
        <article key={lead.id || lead.leadId}>
          <div className="revenue-lead-row-head">
            <b>{lead.leadName || "Lead"}</b>
            <strong>{Number(lead[scoreKey] || 0)}/100</strong>
          </div>
          <small>{lead.company || "—"} · {lead.status || "—"} · {formatCurrency(lead.value)}</small>
          <div className="lead-revenue-kpis">
            <span>Priority {Number(lead.priorityScore || 0)}</span>
            <span>Close {Number(lead.closeProbability || 0)}%</span>
            <span>Health {Number(lead.pipelineHealth || 0)}</span>
          </div>
        </article>
      ))}
    </Panel>
  );
}

export default function AiRevenueIntelligencePage() {
  const [revenueIntelligence, setRevenueIntelligence] = useState(null);
  const [leadScores, setLeadScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueBusy, setRevenueBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadRevenueIntelligence({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [revenueResponse, scoresResponse] = await Promise.all([
        getRevenueIntelligence(),
        getLeadScores({ sortBy: "updatedAt", sortDirection: "desc" }),
      ]);
      setRevenueIntelligence(revenueResponse.intelligence || null);
      setLeadScores(scoresResponse.scores || []);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Revenue Intelligence");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenueIntelligence();
  }, []);

  const intelligence = revenueIntelligence || {};
  const revenueCards = getRevenueCards(intelligence);
  const forecastWidget = getForecastWidget(intelligence);
  const revenueActions = buildRecommendationQueue(intelligence);
  const latestScores = useMemo(() => getLatestRevenueLeadScores(leadScores, 12), [leadScores]);
  const hasData = hasRevenueIntelligenceData(intelligence, latestScores);
  const health = Number(intelligence?.widgets?.aiPipelineHealth || 0);
  const engagement = Number(intelligence?.widgets?.engagementTrend || 0);

  async function handleRunRevenueAnalysis() {
    setRevenueBusy(true);
    setError("");
    setMessage("");
    try {
      await triggerRevenueAnalysis({ limit: 100 });
      await loadRevenueIntelligence({ silent: true });
      setMessage("Revenue analysis jobs queued and forecast generated.");
    } catch (requestError) {
      setError(requestError.message || "Не удалось запустить Revenue Analysis");
    } finally {
      setRevenueBusy(false);
    }
  }

  return (
    <main className="workspace-page ai-revenue-intelligence-page">
      <PageHeading
        eyebrow="Revenue Brain"
        title="AI Revenue Intelligence"
        copy="Revenue Brain, forecast, pipeline health, and next best actions."
        action={<button className="btn primary compact pulse-action" type="button" onClick={handleRunRevenueAnalysis} disabled={revenueBusy}>{revenueBusy ? "Running analysis…" : "Run Revenue Analysis Now"}</button>}
      />

      {error && <p className="auth-error dashboard-alert">{error}</p>}
      {message && <p className="success-alert dashboard-alert">{message}</p>}
      {!loading && !hasData && <p className="empty-state revenue-toast">No AI Revenue Intelligence data yet. Run Revenue Analysis Now to populate forecast, lead scores, and next best actions.</p>}

      <section className="dashboard-stats revenue-widget-row">
        {revenueCards.map((card) => <StatCard key={card.key} label={card.label} value={loading ? "…" : formatCardValue(card)} hint={card.hint} tone={card.key === "stalledLeads" || card.key === "highChurnRisk" ? "pink" : "violet"} />)}
      </section>

      <section className="app-grid two-columns align-start">
        <Panel className="revenue-forecast-panel">
          <div className="revenue-forecast-widget ai-revenue-forecast-widget">
            <div>
              <span className="eyebrow">Revenue Forecast Widget</span>
              <strong>{loading ? "…" : formatCurrency(forecastWidget.projectedRevenue)}</strong>
              <p>Active pipeline {formatCurrency(forecastWidget.activePipelineValue)} · hot {forecastWidget.hotLeadsCount} · stalled {forecastWidget.stalledLeadsCount}</p>
            </div>
            <div className="forecast-mini-trend" aria-label="Forecast confidence trend">
              <span style={{ height: `${Math.max(10, forecastWidget.confidenceScore)}%` }} />
              <span style={{ height: `${Math.max(10, forecastWidget.hotLeadsCount * 12)}%` }} />
              <span style={{ height: `${Math.max(10, forecastWidget.stalledLeadsCount * 12)}%` }} />
            </div>
            <b>{forecastWidget.confidenceScore}% confidence</b>
          </div>
          <div className="ai-revenue-health-grid">
            <div className="lead-revenue-meter">
              <div><span>Pipeline Health</span><b>{health}/100</b></div>
              <i><em style={{ width: `${Math.max(3, health)}%` }} /></i>
            </div>
            <div className="lead-revenue-meter">
              <div><span>Engagement Trend</span><b>{engagement}/100</b></div>
              <i><em style={{ width: `${Math.max(3, engagement)}%` }} /></i>
            </div>
          </div>
        </Panel>

        <Panel className="revenue-action-queue ai-revenue-action-panel">
          <strong>AI Next Best Actions</strong>
          {revenueActions.length === 0 && <p className="empty-state">No AI Revenue recommendations yet. Run analysis to populate the queue.</p>}
          {revenueActions.map((item) => <span key={item.id || item.leadId}>{item.leadName || "Lead"} · {item.recommendedAction} · {item.recommendedChannel || "crm"}</span>)}
        </Panel>
      </section>

      <section className="revenue-intelligence-grid ai-revenue-segment-grid">
        <LeadScoreList title="Hot Leads" eyebrow="Priority" leads={intelligence.hotLeads || []} emptyText="No hot leads in the current Revenue Brain snapshot." />
        <LeadScoreList title="Stalled Leads" eyebrow="Pipeline risk" leads={intelligence.stalledLeads || []} emptyText="No stalled leads detected." scoreKey="churnRisk" />
        <LeadScoreList title="High Churn Risk" eyebrow="Retention" leads={intelligence.churnRisks || []} emptyText="No high churn risk leads detected." scoreKey="churnRisk" />
        <LeadScoreList title="AI Recommendations" eyebrow="Queue" leads={revenueActions} emptyText="No recommendations queued." />
      </section>

      <Panel className="ai-voice-table-panel ai-revenue-table-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Latest lead scores table</span>
            <h3>Latest lead scores</h3>
            <p className="modal-copy">Safe manager summaries only; internal prompts, model reasoning, and raw OpenAI responses are not displayed.</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => loadRevenueIntelligence()} disabled={loading}>Refresh</button>
        </div>
        <div className="ai-voice-table ai-revenue-table">
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Priority</th>
                <th>Close</th>
                <th>Engagement</th>
                <th>Churn</th>
                <th>Health</th>
                <th>Next action</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {latestScores.map((score) => (
                <tr key={score.id || score.leadId}>
                  <td><strong>{score.leadName}</strong><br /><small>{score.company} · {score.status}</small></td>
                  <td>{score.priorityScore}/100</td>
                  <td>{score.closeProbability}%</td>
                  <td>{score.engagementScore}/100</td>
                  <td>{score.churnRisk}/100</td>
                  <td>{score.pipelineHealth}/100</td>
                  <td>{score.recommendedAction || "—"}<br /><small>{score.recommendedChannel || "crm"}</small></td>
                  <td>{formatDate(score.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && latestScores.length === 0 && <p className="empty-state">No lead scores yet. Run Revenue Analysis Now to create the first Revenue Brain scores.</p>}
        </div>
      </Panel>
    </main>
  );
}
