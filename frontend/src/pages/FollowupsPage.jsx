import React from 'react'
import LegacyFollowupsPage from './FollowupsLegacyPage.jsx'
import { FollowupsWorkspaceSurface } from '../crm/followups/FollowupsWorkspaceSurface.jsx'

export default function FollowupsPage() {
  return (
    <FollowupsWorkspaceSurface>
      <LegacyFollowupsPage />
    </FollowupsWorkspaceSurface>
  )
}
