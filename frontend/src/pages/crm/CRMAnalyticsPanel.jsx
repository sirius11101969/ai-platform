import React from 'react'
import CRMAnalyticsLegacyPanel from './CRMAnalyticsLegacyPanel.jsx'
import { CRMAnalyticsWorkspaceSurface } from '../../crm/analytics/CRMAnalyticsWorkspaceSurface.jsx'

export default function CRMAnalyticsPanel(props) {
  return (
    <CRMAnalyticsWorkspaceSurface>
      <CRMAnalyticsLegacyPanel {...props} />
    </CRMAnalyticsWorkspaceSurface>
  )
}
