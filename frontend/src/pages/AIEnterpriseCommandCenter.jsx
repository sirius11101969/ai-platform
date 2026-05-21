import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeading, Panel } from '../components/AppShell'
import { approveAiCommandCenterAction, fetchAiCommandCenterActionAudit, fetchAiCommandCenterInbox, fetchAiCommandCenterOverview, fetchAiCommandCenterTimeline, rejectAiCommandCenterAction, requestAiCommandCenterAction } from '../services/api'

export default function AIEnterpriseCommandCenter() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  const [eventsFilter, setEventsFilter] = useState('All')
  const [error, setError] = useState('')
  const [actionRequests, setActionRequests] = useState([])
  const [selectedAudit, setSelectedAudit] = useState([])
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionReason, setActionReason] = useState('')

  useEffect(() => {
    Promise.all([fetchAiCommandCenterOverview(), fetchAiCommandCenterTimeline(), fetchAiCommandCenterInbox()])
      .then(([overview, timeline, actions]) => {
        console.info('command_center_inbox_loaded', { count: (actions.actions || []).length })
        setData(overview)
        setTimelineData(timeline)
        setActionRequests(actions.actions || [])
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



  const executiveActions = [
    { label: 'Request Strategic Planning Review', actionType: 'strategic_planning_review' },
    { label: 'Request Revenue Review', actionType: 'revenue_review' },
    { label: 'Request Workforce Review', actionType: 'workforce_review' },
    { label: 'Request Coordination Review', actionType: 'coordination_review' },
    { label: 'Request Memory Review', actionType: 'memory_review' },
    { label: 'Run Autonomous Customer Outreach (disabled)', actionType: 'disabled_dangerous', dangerous: true },
  ]

  async function submitExecutiveAction() {
    if (!confirmAction || confirmAction.dangerous) return
    try {
      const response = await requestAiCommandCenterAction({
        workspaceId: data?.workspaceId,
        actionType: confirmAction.actionType,
        reason: actionReason,
      })
      setActionRequests((prev) => [response.action, ...prev])
      setConfirmAction(null)
      setActionReason('')
    } catch (e) {
      setError(e.message)
    }
  }

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
      <Panel>
        <h3>Executive Inbox</h3>
        <p>Human Approval Required · No Autonomous Execution · No Customer Actions · No Pricing Changes</p>
        {(actionRequests||[]).map((a)=> <div key={a.id}><p>{a.action_type} | {a.reason} | {a.status} | {new Date(a.created_at).toLocaleString()}</p><p>Governance: Human Approval Required · No Autonomous Execution · No Customer Actions · No Pricing Changes</p><div className='safety-pills'><button className='btn compact' type='button' onClick={async()=>{ if(!window.confirm('Approve action? Status only. No external execution.')) return; const reviewNote=window.prompt('Approval note (optional)','')||''; const r=await approveAiCommandCenterAction(a.id,{reviewNote}); setActionRequests(prev=>prev.map(x=>x.id===a.id?r.action:x)); console.info('command_center_action_approved',{actionId:a.id}); }}>Approve</button><button className='btn compact' type='button' onClick={async()=>{ if(!window.confirm('Reject action? Status only. No external execution.')) return; const reviewNote=window.prompt('Rejection note (optional)','')||''; const r=await rejectAiCommandCenterAction(a.id,{reviewNote}); setActionRequests(prev=>prev.map(x=>x.id===a.id?r.action:x)); console.info('command_center_action_rejected',{actionId:a.id}); }}>Reject</button><button className='btn compact' type='button' onClick={async()=>{ if(!window.confirm('Load audit trail?')) return; const r=await fetchAiCommandCenterActionAudit(a.id); setSelectedAudit(r.audit||[]); console.info('command_center_action_audit_loaded',{actionId:a.id,count:(r.audit||[]).length}); }}>Audit</button></div></div>)}
        <p>{JSON.stringify(selectedAudit)}</p>
      </Panel>
      <Panel>
        <h3>Executive Actions Panel</h3>
        <p>Governance warning: no autonomous execution, no customer outreach, no pricing changes, human approval is mandatory.</p>
        <div className='safety-pills'>{executiveActions.map((action) => <button key={action.label} className='btn compact' type='button' disabled={action.dangerous} onClick={() => setConfirmAction(action)}>{action.label}</button>)}</div>
        <p>Status: requires human approval</p>
        <p>Recent requests: {JSON.stringify(actionRequests)}</p>
      </Panel>
      {confirmAction ? <Panel><h3>Confirm Executive Action</h3><p>Governance warning: This request does not execute autonomously and requires human approval.</p><p>{confirmAction.label}</p><textarea value={actionReason} onChange={(e)=>setActionReason(e.target.value)} placeholder='Reason for review request' /><div className='safety-pills'><button className='btn compact' type='button' onClick={submitExecutiveAction}>Confirm request</button><button className='btn compact' type='button' onClick={()=>setConfirmAction(null)}>Cancel</button></div></Panel> : null}
    </> : null}
  </main>
}
