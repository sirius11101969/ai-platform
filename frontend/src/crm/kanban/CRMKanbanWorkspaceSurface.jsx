import React, { useMemo } from 'react'
import { createCrmKanbanWorkspaceRuntime } from './kanbanWorkspaceRuntime.js'

export function CRMKanbanWorkspaceSurface({
  children,
  title = 'CRM Kanban',
  subtitle = 'Единая Kanban-поверхность AS6 CRM для визуального движения сделок, задач, follow-ups и заблокированных элементов.',
}) {
  const runtime = useMemo(() => createCrmKanbanWorkspaceRuntime(), [])
  const integration = runtime.workspaceIntegration
  const panels = integration.panels || []

  return (
    <section className="as6-crm-kanban-workspace-surface" data-as6-domain={integration.domain} data-as6-workspace={integration.workspace}>
      <header className="as6-crm-kanban-workspace-surface__header">
        <div>
          <p className="as6-crm-kanban-workspace-surface__eyebrow">AS6 Workspace · CRM</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <aside className="as6-crm-kanban-workspace-surface__status" aria-label="CRM Kanban workspace runtime status">
          <span>Runtime</span>
          <strong>{runtime.status}</strong>
        </aside>
      </header>
      <div className="as6-crm-kanban-workspace-surface__context" aria-label="CRM Kanban workspace context">
        <article>
          <span>Navigation</span>
          <strong>{integration.navigation.label}</strong>
          <p>{integration.navigation.route}</p>
        </article>
        <article>
          <span>Assistant</span>
          <strong>{integration.assistantContext.title}</strong>
          <p>{integration.assistantContext.nextBestAction}</p>
        </article>
        <article>
          <span>Focus</span>
          <strong>{integration.focusContext.title}</strong>
          <p>{integration.focusContext.primaryMetric}</p>
        </article>
      </div>
      <div className="as6-crm-kanban-workspace-surface__body">
        <main className="as6-crm-kanban-workspace-surface__core">{children}</main>
        <aside className="as6-crm-kanban-workspace-surface__rail" aria-label="CRM Kanban workspace panels">
          {panels.map((panel) => (
            <article key={panel.id}>
              <span>{panel.zone}</span>
              <strong>{panel.title}</strong>
            </article>
          ))}
        </aside>
      </div>
    </section>
  )
}

export default CRMKanbanWorkspaceSurface
