import React, { useMemo } from 'react'
import { createCrmFiltersWorkspaceRuntime } from './filtersWorkspaceRuntime.js'

export function CRMFiltersWorkspaceSurface({
  children,
  title = 'CRM Filters',
  subtitle = 'Единая фильтрационная поверхность AS6 CRM для сегментов, статусов, владельцев, приоритетов и рабочих состояний.',
}) {
  const runtime = useMemo(() => createCrmFiltersWorkspaceRuntime(), [])
  const integration = runtime.workspaceIntegration
  const panels = integration.panels || []

  return (
    <section className="as6-crm-filters-workspace-surface" data-as6-domain={integration.domain} data-as6-workspace={integration.workspace}>
      <header className="as6-crm-filters-workspace-surface__header">
        <div>
          <p className="as6-crm-filters-workspace-surface__eyebrow">AS6 Workspace · CRM</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <aside className="as6-crm-filters-workspace-surface__status" aria-label="CRM Filters workspace runtime status">
          <span>Runtime</span>
          <strong>{runtime.status}</strong>
        </aside>
      </header>
      <div className="as6-crm-filters-workspace-surface__context" aria-label="CRM Filters workspace context">
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
      <div className="as6-crm-filters-workspace-surface__body">
        <main className="as6-crm-filters-workspace-surface__core">{children}</main>
        <aside className="as6-crm-filters-workspace-surface__rail" aria-label="CRM Filters workspace panels">
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

export default CRMFiltersWorkspaceSurface
