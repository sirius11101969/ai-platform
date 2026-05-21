import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiCommandCenterOverview, fetchAiCommandCenterTimeline } from '../services/api'

export default function AIEnterpriseCommandCenter() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  const [eventsFilter, setEventsFilter] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchAiCommandCenterOverview(), fetchAiCommandCenterTimeline()])
      .then(([overview, timeline]) => {
        setData(overview)
        setTimelineData(timeline)
      })
      .catch((e) => setError(e.message))
  }, [])

  const drilldownCards = [
    { title: 'System Health', to: '/ai/system-health' },
    { title: 'Revenue', to: '/ai/revenue-engine' },
    { title: 'Workforce', to: '/ai/workforce' },
    { title: 'Strategy', to: '/ai/strategic-planning' },
    { title: 'Coordination', to: '/ai/enterprise-coordination' },
    { title: 'Memory', to: '/ai/organizational-memory' },
    { title: 'Approval Queue', to: '/ai/approval-center' },
  ]

  const recentEvents = timelineData?.recentEvents || []
  const filteredEvents = recentEvents.filter((event) => {
    if (eventsFilter === 'All') return true
    if (eventsFilter === 'Critical') return event.severity === 'critical'
    if (eventsFilter === 'Warnings') return event.severity === 'warning'
    return event.severity === 'info'
  })

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
      <Panel>
        <h3>Live Status Strip</h3>
        <p>READY: {data.health?.READY || 0}</p>
        <p>DEGRADED: {data.health?.DEGRADED || 0}</p>
        <p>MISSING: {data.health?.MISSING || 0}</p>
        <p>GeneratedAt: {new Date(data.generatedAt).toLocaleString()}</p>
      </Panel>
      <Panel>
        <h3>Operational Drilldown Navigation</h3>
        <div className='safety-pills'>
          {drilldownCards.map((card) => <button key={card.title} className='btn compact' type='button' onClick={() => navigate(card.to)}>{card.title}</button>)}
        </div>
      </Panel>
      <Panel>
        <h3>Executive Timeline</h3>
        <p>{JSON.stringify(timelineData?.timeline || [])}</p>
      </Panel>
      <Panel>
        <h3>Recent Events</h3>
        <div className='safety-pills'>
          {['All', 'Critical', 'Warnings', 'Info'].map((filter) => (
            <button key={filter} className='btn compact' type='button' onClick={() => setEventsFilter(filter)}>{filter}</button>
          ))}
        </div>
        <p>{JSON.stringify(filteredEvents)}</p>
      </Panel>
      <Panel><h3>Quick Actions</h3><div className='safety-pills'>{(data.actions || []).map((action) => <button key={action.label} className='btn compact' type='button' disabled>{action.label} — Coming in v1.2</button>)}</div></Panel>
    </> : null}
  </main>
}
