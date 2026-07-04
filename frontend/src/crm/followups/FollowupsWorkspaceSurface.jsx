import React, { useMemo } from 'react'
import { createCrmFollowupWorkspaceRuntime } from './followupWorkspaceRuntime.js'

export function FollowupsWorkspaceSurface({
  children,
  title = 'CRM Followups',
  subtitle = 'Единое рабочее пространство для контроля следующих действий по клиентам, сделкам и активностям.',
}) {
  const runtime = useMemo(() => createCrmFollowupWorkspaceRuntime(), [])
  const integration = runtime.workspaceIntegration
  const panels = integration.panels || []

  return (
    <section className="as6-crm-followups-workspace-surface" data-as6-domain={integration.domain} data-as6-workspace={integration.workspace}>
      <header className="as6-crm-followups-workspace-surface__header">
        <div>
          <p className="as6-crm-followups-workspace-surface__eyebrow">AS6 Workspace · CRM</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <aside className="as6-crm-followups-workspace-surface__status" aria-label="Followups workspace runtime status">
          <span>Runtime</span>
          <strong>{runtime.status}</strong>
        </aside>
      </header>
      <div className="as6-crm-followups-workspace-surface__context" aria-label="Followups workspace context">
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
      <div className="as6-crm-followups-workspace-surface__body">
        <main className="as6-crm-followups-workspace-surface__core">{children}</main>
        <aside className="as6-crm-followups-workspace-surface__rail" aria-label="Followups workspace panels">
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

export default FollowupsWorkspaceSurface
