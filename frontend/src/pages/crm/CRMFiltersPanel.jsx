import React from 'react'
import CRMFiltersLegacyPanel from './CRMFiltersLegacyPanel.jsx'
import { CRMFiltersWorkspaceSurface } from '../../crm/filters/CRMFiltersWorkspaceSurface.jsx'
import { AS6Badge, AS6Button, AS6Card, AS6EmptyState, AS6Panel, AS6Toolbar } from '../../design-system/index.js'

export default function CRMFiltersPanel(props) {
  return (
    <CRMFiltersWorkspaceSurface>
      <CRMFiltersLegacyPanel {...props} />
    </CRMFiltersWorkspaceSurface>
  )
}

const AS6_DESIGN_SYSTEM_FILTERS_ADOPTION_MARKER = {
  stage: 'AS6_EPIC021_DESIGN_SYSTEM_FILTERS_ADOPTION',
  components: ['AS6Card', 'AS6Panel', 'AS6Toolbar', 'AS6Button', 'AS6Badge', 'AS6EmptyState'],
  policy: 'visual-adoption-only-no-business-logic-change',
}

const AS6_FILTERS_DESIGN_SYSTEM_COMPONENTS = {
  AS6Badge,
  AS6Button,
  AS6Card,
  AS6EmptyState,
  AS6Panel,
  AS6Toolbar,
}
