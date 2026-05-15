import React from "react";
import { Panel, PageHeading } from "../components/AppShell";
import { activityFeed, followUpSuggestions, pipelineStages } from "../data/mockData";

export default function CRMPage() {
  return (
    <main className="workspace-page">
      <PageHeading
        eyebrow="CRM pipeline"
        title="Лиды, этапы и AI follow-up"
        copy="Визуальная CRM страница показывает стадии, карточки лидов, активность и подсказки AI для следующего касания."
        action={<button className="btn primary compact" type="button">Добавить лид</button>}
      />

      <section className="crm-layout">
        <div className="pipeline-board">
          {pipelineStages.map((stage) => (
            <Panel className="stage-column" key={stage.title}>
              <div className="stage-head">
                <div>
                  <h3>{stage.title}</h3>
                  <span>{stage.leads.length} лида · {stage.total}</span>
                </div>
                <b>{stage.leads.length}</b>
              </div>
              <div className="lead-list">
                {stage.leads.map((lead) => (
                  <article className="lead-card" key={lead.name}>
                    <div className="lead-topline">
                      <strong>{lead.name}</strong>
                      <span>{lead.value}</span>
                    </div>
                    <p>{lead.contact}</p>
                    <div className="score-row"><i style={{ width: `${lead.score}%` }} /><b>{lead.score}</b></div>
                    <small>{lead.note}</small>
                  </article>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <aside className="crm-insights">
          <Panel>
            <span className="eyebrow">AI follow-up suggestions</span>
            <h3>Рекомендации AI</h3>
            <div className="suggestion-list">
              {followUpSuggestions.map((suggestion, index) => (
                <article key={suggestion}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <p>{suggestion}</p>
                </article>
              ))}
            </div>
          </Panel>
          <Panel>
            <span className="eyebrow">Notes & activity</span>
            <h3>Последняя активность</h3>
            <div className="activity-preview">
              {activityFeed.map((item) => <p key={item}><span />{item}</p>)}
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}
