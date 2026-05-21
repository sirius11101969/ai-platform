import React, { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiSystemHealth } from '../services/api'

export default function AiSystemHealthCenterPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    fetchAiSystemHealth().then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <main className="workspace-content">
      <PageHeading eyebrow="AI Enterprise OS" title="AI System Health Center" copy="Global AI layer readiness, governance, and platform health." />
      {error ? <Panel><p>{error}</p></Panel> : null}
      {data ? (
        <>
          <div className="stats-grid">
            <Panel><strong>Global Status: {data.status}</strong></Panel>
            <Panel><strong>Ready: {data.summary.readyCount}</strong></Panel>
            <Panel><strong>Degraded: {data.summary.degradedCount}</strong></Panel>
            <Panel><strong>Missing: {data.summary.missingCount}</strong></Panel>
          </div>
          <Panel>
            <p>Governance: Human approval required · No autonomous customer actions · No autonomous pricing changes</p>
            <p>Last Checked: {new Date(data.generatedAt).toLocaleString()}</p>
          </Panel>
          <div className="stats-grid">
            {data.layers.map((layer) => (
              <Panel key={layer.name}>
                <h3>{layer.name}</h3>
                <p>Status: {layer.status}</p>
                <p>Endpoint: {layer.endpoint}</p>
                <p>Notes: {layer.notes}</p>
              </Panel>
            ))}
          </div>
        </>
      ) : null}
    </main>
  )
}
