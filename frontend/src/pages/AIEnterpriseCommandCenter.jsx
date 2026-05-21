import { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiCommandCenterOverview } from '../services/api'

export default function AIEnterpriseCommandCenter() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAiCommandCenterOverview().then(setData).catch((e) => setError(e.message))
  }, [])

  return <main className='workspace-content'>
    <PageHeading eyebrow='AI Enterprise OS v1.1' title='AI Enterprise Command Center' copy='Unified realtime command center for governance-only recommendations. No autonomous customer actions. No pricing changes.' />
    {error ? <Panel><p>{error}</p></Panel> : null}
    {data ? <>
      <section className='stats-grid'>
        <Panel><h3>Executive Header</h3><p>organizationalHealthScore: {data.overview?.organizationalHealthScore || 0}</p><p>governanceMode: {data.overview?.governanceMode || 'recommendation_only'}</p><p>generatedAt: {new Date(data.generatedAt).toLocaleString()}</p></Panel>
        <Panel><h3>System Health</h3><p>READY: {data.health?.READY || 0}</p><p>DEGRADED: {data.health?.DEGRADED || 0}</p><p>MISSING: {data.health?.MISSING || 0}</p></Panel>
        <Panel><h3>Executive Feed</h3><p>recent decisions: {(data.executiveFeed?.recentDecisions || []).length}</p><p>escalations: {data.executiveFeed?.escalations || 0}</p><p>bottlenecks: {data.executiveFeed?.bottlenecks || 0}</p></Panel>
        <Panel><h3>Live Metrics</h3><p>workforce utilization: {data.liveMetrics?.workforceUtilization || 0}</p><p>throughput: {data.liveMetrics?.throughput || 0}</p><p>approval queue: {data.liveMetrics?.approvalQueue || 0}</p></Panel>
      </section>
      <Panel><h3>Recent Strategic Actions</h3><p>{JSON.stringify(data.overview?.recentStrategicActions || [])}</p></Panel>
      <Panel><h3>Quick Actions</h3><div className='safety-pills'>{(data.actions || []).map((action) => <button key={action.label} className='btn compact' type='button' disabled>{action.label} — Coming in v1.2</button>)}</div></Panel>
    </> : null}
  </main>
}
