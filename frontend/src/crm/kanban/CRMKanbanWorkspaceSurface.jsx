import React, { useMemo } from 'react'
import { createCrmKanbanWorkspaceRuntime } from './kanbanWorkspaceRuntime.js'
import {
  AS6Badge,
  AS6Button,
  AS6Card,
  AS6EmptyState,
  AS6Panel,
  AS6Toolbar,
} from '../../design-system/index.js'

export const AS6_DESIGN_SYSTEM_KANBAN_ADOPTION_MARKER = {
  stage: 'AS6_EPIC021_DESIGN_SYSTEM_KANBAN_ADOPTION',
  mode: 'real-visual-wrapper',
  components: ['AS6Panel', 'AS6Toolbar', 'AS6Card', 'AS6Badge', 'AS6Button', 'AS6EmptyState'],
  policy: 'visual-adoption-only-no-business-logic-change',
  legacyPanelPreserved: true,
}

export function CRMKanbanWorkspaceSurface({
  children,
  title = 'CRM Kanban',
  subtitle = 'Единая Kanban-поверхность AS6 CRM для визуального движения сделок, задач, follow-ups и заблокированных элементов.',
}) {
  const runtime = useMemo(() => createCrmKanbanWorkspaceRuntime(), [])
  const integration = runtime.workspaceIntegration
  const panels = integration.panels || []

  return (
    <AS6Panel
      title={title}
      subtitle={subtitle}
      className="as6-crm-kanban-workspace-surface"
      data-as6-domain={integration.domain}
      data-as6-workspace={integration.workspace}
    >
      <AS6Toolbar
        title="Kanban Workspace"
        description="Отслеживайте движение клиентской работы, заблокированные элементы и следующий приоритет."
        actions={<AS6Badge tone="success">Runtime: {runtime.status}</AS6Badge>}
      />

      <div className="as6-crm-kanban-workspace-surface__context" aria-label="CRM Kanban workspace context">
        <AS6Card
          title="Navigation"
          subtitle={integration.navigation.route}
          actions={<AS6Badge tone="neutral">{integration.navigation.label}</AS6Badge>}
        />
        <AS6Card
          title={integration.assistantContext.title}
          subtitle={integration.assistantContext.nextBestAction}
          actions={<AS6Badge tone="success">Assistant</AS6Badge>}
        />
        <AS6Card
          title={integration.focusContext.title}
          subtitle={integration.focusContext.primaryMetric}
          actions={<AS6Badge tone="warning">Focus</AS6Badge>}
        />
      </div>

      <div className="as6-crm-kanban-workspace-surface__body">
        <main className="as6-crm-kanban-workspace-surface__core">
          <AS6Card
            title="Kanban board"
            subtitle="Карточки и колонки будут отображаться в рабочей области Kanban."
            actions={<AS6Button variant="secondary">Review board</AS6Button>}
          >
            {children}
            <AS6EmptyState
              title="No Kanban cards yet"
              description="When CRM work enters the board, cards will appear here by priority and stage."
            />
          </AS6Card>
        </main>
        <aside className="as6-crm-kanban-workspace-surface__rail" aria-label="CRM Kanban workspace panels">
          {panels.map((panel) => (
            <AS6Card
              key={panel.id}
              title={panel.title}
              subtitle={panel.zone}
              actions={<AS6Badge tone="neutral">Panel</AS6Badge>}
            />
          ))}
        </aside>
      </div>
    </AS6Panel>
  )
}

export default CRMKanbanWorkspaceSurface
