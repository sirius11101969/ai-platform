import React from "react";
import { getForecastWidget, getRevenueCards } from "../../utils/revenueIntelligence";

export const CRM_ANALYTICS_PANEL_CONTRACT_VERSION = "V77_INTERNAL_PANEL_OWNER";

export default function CRMAnalyticsPanel({
  revenueIntelligence = null,
  revenueBrainBusy = false,
  revenueToast = "",
  visibleLeads = [],
  leadScoreSort = "priorityScore",
  leadScoreFilter = "all",
  onRunRevenueBrain = null,
  onAnalyzeWorkspaceAi = null,
  onLeadScoreSortChange = null,
  onLeadScoreFilterChange = null,
  renderRevenuePanel = null,
  children = null,
} = {}) {
  void visibleLeads;
  void leadScoreSort;
  void leadScoreFilter;
  void onAnalyzeWorkspaceAi;
  void onLeadScoreSortChange;
  void onLeadScoreFilterChange;

  if (typeof renderRevenuePanel === "function") {
    return <>{renderRevenuePanel()}</>;
  }

  if (children) {
    return <>{children}</>;
  }

  return (
    <AiRevenueIntelligencePanel
      intelligence={revenueIntelligence}
      busy={revenueBrainBusy}
      toast={revenueToast}
      onRun={onRunRevenueBrain}
    />
  );
}

function LeadRevenueIntelligenceCard({ lead }) {
  const score = lead.aiRevenueScore || null;
  if (!score) {
    return (
      <div className="ai-lead-score-card">
        <div>
          <strong>{lead.name}</strong>
          <span>Score пока не рассчитан</span>
        </div>
        <span className="score-badge">AI</span>
      </div>
    );
  }

  return (
    <div className="ai-lead-score-card">
      <div>
        <strong>{lead.name}</strong>
        <span>{score.reason || "AI оценка готова"}</span>
      </div>
      <span className="score-badge">{score.score || score.priorityScore || "AI"}</span>
    </div>
  );
}

function AiRevenueIntelligencePanel({ intelligence, busy, toast, onRun }) {
  const cards = getRevenueCards(intelligence);
  const forecast = getForecastWidget(intelligence);
  const leads = intelligence?.topLeads || intelligence?.priorityLeads || [];

  return (
    <section className="ai-revenue-intelligence-panel">
      <div className="ai-revenue-intelligence-header">
        <div>
          <span className="eyebrow">AI Revenue Brain</span>
          <h3>Revenue intelligence</h3>
          <p>AI анализирует сделки, прогноз и next best actions.</p>
        </div>
        <button className="btn primary compact" type="button" onClick={onRun} disabled={busy}>
          {busy ? "AI считает…" : "Запустить Revenue Brain"}
        </button>
      </div>
      {toast ? <div className="ai-revenue-toast">{toast}</div> : null}
      <div className="ai-revenue-cards">
        {cards.map((card) => (
          <article className="ai-revenue-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.hint}</small>
          </article>
        ))}
      </div>
      <div className="ai-revenue-forecast">
        <span>{forecast.label}</span>
        <strong>{forecast.value}</strong>
        <small>{forecast.hint}</small>
      </div>
      <div className="ai-revenue-leads">
        {leads.slice(0, 3).map((lead) => (
          <LeadRevenueIntelligenceCard key={lead.id || lead.name} lead={lead} />
        ))}
      </div>
    </section>
  );
}
