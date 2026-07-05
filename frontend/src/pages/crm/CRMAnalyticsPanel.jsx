import React from 'react'
import CRMAnalyticsLegacyPanel from './CRMAnalyticsLegacyPanel.jsx'
import { CRMAnalyticsWorkspaceSurface } from '../../crm/analytics/CRMAnalyticsWorkspaceSurface.jsx'
import { AS6Badge, AS6Button, AS6Card, AS6KPI, AS6Panel, AS6Toolbar } from '../../design-system/index.js'

export default function CRMAnalyticsPanel(props) {
  return (
    <CRMAnalyticsWorkspaceSurface>
      <CRMAnalyticsLegacyPanel {...props} />
    </CRMAnalyticsWorkspaceSurface>
  )
}

const AS6_DESIGN_SYSTEM_ANALYTICS_ADOPTION_MARKER = {
  stage: 'AS6_EPIC021_DESIGN_SYSTEM_ANALYTICS_ADOPTION',
  components: ['AS6Card', 'AS6Panel', 'AS6Toolbar', 'AS6Button', 'AS6KPI', 'AS6Badge'],
  policy: 'visual-adoption-only-no-business-logic-change',
}

const AS6_ANALYTICS_DESIGN_SYSTEM_COMPONENTS = {
  AS6Badge,
  AS6Button,
  AS6Card,
  AS6KPI,
  AS6Panel,
  AS6Toolbar,
}
