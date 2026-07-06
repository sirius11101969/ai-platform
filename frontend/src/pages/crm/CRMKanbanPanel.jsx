import React from 'react'
import CRMKanbanLegacyPanel from './CRMKanbanLegacyPanel.jsx'
import { CRMKanbanWorkspaceSurface } from '../../crm/kanban/CRMKanbanWorkspaceSurface.jsx'

const AS6_DESIGN_SYSTEM_KANBAN_PANEL_MARKER = {
  stage: 'AS6_EPIC021_DESIGN_SYSTEM_KANBAN_ADOPTION',
  mode: 'workspace-surface-design-system-visual-adoption',
  policy: 'visual-adoption-only-no-business-logic-change',
  legacyPanelPreserved: true,
}

export default function CRMKanbanPanel(props) {
  return (
    <CRMKanbanWorkspaceSurface>
      <CRMKanbanLegacyPanel {...props} />
    </CRMKanbanWorkspaceSurface>
  )
}

export { AS6_DESIGN_SYSTEM_KANBAN_PANEL_MARKER }
