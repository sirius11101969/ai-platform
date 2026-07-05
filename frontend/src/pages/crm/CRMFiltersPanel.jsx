import React from 'react'
import CRMFiltersLegacyPanel from './CRMFiltersLegacyPanel.jsx'
import { CRMFiltersWorkspaceSurface } from '../../crm/filters/CRMFiltersWorkspaceSurface.jsx'

export default function CRMFiltersPanel(props) {
  return (
    <CRMFiltersWorkspaceSurface>
      <CRMFiltersLegacyPanel {...props} />
    </CRMFiltersWorkspaceSurface>
  )
}
