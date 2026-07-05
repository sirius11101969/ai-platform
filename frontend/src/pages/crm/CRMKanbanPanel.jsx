import React from 'react'
import CRMKanbanLegacyPanel from './CRMKanbanLegacyPanel.jsx'
import { CRMKanbanWorkspaceSurface } from '../../crm/kanban/CRMKanbanWorkspaceSurface.jsx'

export default function CRMKanbanPanel(props) {
  return (
    <CRMKanbanWorkspaceSurface>
      <CRMKanbanLegacyPanel {...props} />
    </CRMKanbanWorkspaceSurface>
  )
}
