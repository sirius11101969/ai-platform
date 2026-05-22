import { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiCommandCenterBrief, fetchAiCommandCenterDailyReport, fetchAiCommandCenterFocus, fetchAiCommandCenterKpi, fetchAiCommandCenterOperations, fetchAiCommandCenterWeeklyReport } from '../services/api'

export default function AIEnterpriseCommandCenter() {
  const [hub, setHub] = useState(null)
  const [error, setError] = useState('')
  const [checklist, setChecklist] = useState({})

  useEffect(() => {
    Promise.all([fetchAiCommandCenterBrief(), fetchAiCommandCenterOperations(), fetchAiCommandCenterFocus(), fetchAiCommandCenterDailyReport(), fetchAiCommandCenterWeeklyReport(), fetchAiCommandCenterKpi()])
      .then(([brief, operations, focus, dailyReport, weeklyReport, kpi]) => {
        const merged = {
          generatedAt: brief.generatedAt || operations.generatedAt || focus.generatedAt,
          executiveBrief: brief.executiveBrief || {},
          operations: operations.operations || {},
          focusQueue: focus.focusQueue || [],
          checklist: brief.checklist || [],
          dailyReport,
          weeklyReport,
          kpi,
        }
        setHub(merged)
        const initialChecklist = {}
        ;(merged.checklist || []).forEach((item) => { initialChecklist[item.id] = Boolean(item.completed) })
        setChecklist(initialChecklist)
      })
      .catch((e) => setError(e.message || 'Failed to load command center'))
  }, [])

  const decisionRows = (hub?.focusQueue || []).map((item) => ({ title: item.title, state: item.state || 'requested', source: item.source || 'coordination', priority: item.priority || 'medium' }))

  return <main className='workspace-content'>
    <PageHeading eyebrow='AI Enterprise OS v1.2' title='AI Enterprise Command Center' copy='Executive Operations Hub for governance-only recommendations. Human Approval Required · No Autonomous Execution · No Customer Actions · No Pricing Changes.' />
    {error ? <Panel><p>{error}</p></Panel> : null}
    {hub ? <>
      <Panel>
        <h3>Executive Daily Report</h3>
        <p>{hub.dailyReport?.summary || 'No daily summary available.'}</p>
        <p>health summary: READY {hub.executiveBrief?.healthSummary?.ready || 0} · DEGRADED {hub.executiveBrief?.healthSummary?.degraded || 0} · MISSING {hub.executiveBrief?.healthSummary?.missing || 0}</p>
        <p>generatedAt: {new Date(hub.generatedAt).toLocaleString()}</p>
      </Panel>

      <Panel>
        <h3>Weekly Review</h3>
        <p>{hub.weeklyReport?.summary || 'No weekly summary available.'}</p>
      </Panel>

      <Panel>
        <h3>KPI Snapshot</h3>
        <p>Org Health Score: {hub.kpi?.kpis?.organizationalHealthScore || 0}</p>
        <p>Workforce Utilization: {hub.kpi?.kpis?.workforceUtilization || 0}</p>
        <p>Approval Queue Open: {hub.kpi?.kpis?.approvalQueueOpen || 0}</p>
      </Panel>

      <Panel>
        <h3>Decision Summary</h3>
        {decisionRows.map((item, idx) => <p key={`${item.title}-${idx}`}>{item.state} | {item.title} | {item.source}</p>)}
      </Panel>

      <Panel>
        <h3>Risks & Bottlenecks</h3>
        {(hub.dailyReport?.risks || []).map((risk) => <p key={risk.id}>{risk.severity} | {risk.title}</p>)}
        {(hub.dailyReport?.bottlenecks || []).map((item) => <p key={item.area}>{item.area} | {item.value}</p>)}
      </Panel>

      <Panel>
        <h3>Recommended Next Actions</h3>
        {(hub.dailyReport?.recommendedNextActions || []).map((line, idx) => <p key={`next-${idx}`}>{line}</p>)}
      </Panel>

      <section className='stats-grid'>
        <Panel><h3>Operations Board</h3><p>Healthy: {hub.operations?.healthy || 0}</p></Panel>
        <Panel><h3>Operations Board</h3><p>Needs Attention: {hub.operations?.needsAttention || 0}</p></Panel>
        <Panel><h3>Operations Board</h3><p>Blocked: {hub.operations?.blocked || 0}</p></Panel>
        <Panel><h3>Operations Board</h3><p>Completed Today: {hub.operations?.completedToday || 0}</p></Panel>
      </section>

      <Panel>
        <h3>Morning Checklist</h3>
        {(hub.checklist || []).map((item) => <label key={item.id} style={{ display: 'block', marginBottom: 8 }}><input type='checkbox' checked={Boolean(checklist[item.id])} onChange={(e) => setChecklist((prev) => ({ ...prev, [item.id]: e.target.checked }))} /> {item.label}</label>)}
      </Panel>
    </> : null}
  </main>
}
