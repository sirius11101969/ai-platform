import { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiCommandCenterBrief, fetchAiCommandCenterDailyReport, fetchAiCommandCenterFocus, fetchAiCommandCenterKpi, fetchAiCommandCenterOperations, fetchAiCommandCenterPlanning, fetchAiCommandCenterPlanningMonthly, fetchAiCommandCenterPlanningWeekly, fetchAiCommandCenterQuality, fetchAiCommandCenterReadiness, fetchAiCommandCenterReview, fetchAiCommandCenterStability, fetchAiCommandCenterWeeklyReport } from '../services/api'

export default function AIEnterpriseCommandCenter() {
  const [hub, setHub] = useState(null)
  const [planning, setPlanning] = useState(null)
  const [review, setReview] = useState(null)
  const [stability, setStability] = useState(null)
  const [readiness, setReadiness] = useState(null)
  const [quality, setQuality] = useState(null)
  const [error, setError] = useState('')
  const [checklist, setChecklist] = useState({})

  useEffect(() => {
    Promise.all([fetchAiCommandCenterBrief(), fetchAiCommandCenterOperations(), fetchAiCommandCenterFocus(), fetchAiCommandCenterDailyReport(), fetchAiCommandCenterWeeklyReport(), fetchAiCommandCenterKpi(), fetchAiCommandCenterPlanning(), fetchAiCommandCenterPlanningWeekly(), fetchAiCommandCenterPlanningMonthly(), fetchAiCommandCenterReview(), fetchAiCommandCenterStability(), fetchAiCommandCenterReadiness(), fetchAiCommandCenterQuality()])
      .then(([brief, operations, focus, dailyReport, weeklyReport, kpi, planningAll, planningWeekly, planningMonthly, reviewPayload, stabilityPayload, readinessPayload, qualityPayload]) => {
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
        setPlanning({ all: planningAll, weekly: planningWeekly, monthly: planningMonthly })
        setReview(reviewPayload)
        setStability(stabilityPayload)
        setReadiness(readinessPayload)
        setQuality(qualityPayload)
      })
      .catch((e) => setError(e.message || 'Failed to load command center'))
  }, [])

  const decisionRows = (hub?.focusQueue || []).map((item) => ({ title: item.title, state: item.state || 'requested', source: item.source || 'coordination', priority: item.priority || 'medium' }))

  return <main className='workspace-content'>
    <PageHeading eyebrow='AI Enterprise OS v1.3' title='AI Enterprise Command Center' copy='Executive Operations Hub for governance-only recommendations. Human Approval Required · No Autonomous Execution · No Customer Actions · No Pricing Changes.' />
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
        <h3>Executive Planning Board</h3>
        <p>Planning Horizon: {planning?.all?.planningHorizon || 'weekly_monthly'}</p>
        <p>Generated: {planning?.all?.generatedAt ? new Date(planning.all.generatedAt).toLocaleString() : 'n/a'}</p>
      </Panel>

      <Panel>
        <h3>Weekly Priorities</h3>
        {(planning?.weekly?.weeklyPriorities || []).map((p) => <p key={p.id}>{p.priority} | {p.title} | {p.source}</p>)}
      </Panel>

      <Panel>
        <h3>Monthly Objectives</h3>
        {(planning?.monthly?.monthlyObjectives || []).map((o, idx) => <p key={`mo-${idx}`}>{o.objective} | current {o.current} | target {o.target}</p>)}
      </Panel>

      <Panel>
        <h3>KPI Review Plan</h3>
        {(planning?.all?.kpiReviewPlan || []).map((k, idx) => <p key={`kpi-plan-${idx}`}>{k.metric} | {k.cadence} | owner {k.owner}</p>)}
      </Panel>

      <Panel>
        <h3>Decision Follow-ups</h3>
        {(planning?.all?.decisionFollowups || []).map((d) => <p key={d.actionId}>{d.status} | {d.actionType} | required: {d.requiredDecision}</p>)}
      </Panel>

      <Panel>
        <h3>Planning Recommendations</h3>
        {(planning?.all?.recommendations || []).map((line, idx) => <p key={`planning-rec-${idx}`}>{line}</p>)}
      </Panel>


      <section className='stats-grid'>
        <Panel><h3>Review Dashboard</h3><p>Total Open Decisions: {review?.review?.totalOpenDecisions || 0}</p></Panel>
        <Panel><h3>Review Dashboard</h3><p>Approved Today: {review?.review?.approvedToday || 0}</p></Panel>
        <Panel><h3>Review Dashboard</h3><p>Rejected Today: {review?.review?.rejectedToday || 0}</p></Panel>
        <Panel><h3>Review Dashboard</h3><p>Unresolved Followups: {review?.review?.unresolvedFollowups || 0}</p></Panel>
      </section>

      <section className='stats-grid'>
        <Panel><h3>Stability Monitor</h3><p>Duplicated Recommendations: {stability?.stability?.duplicatedRecommendations || 0}</p></Panel>
        <Panel><h3>Stability Monitor</h3><p>Empty Reports: {stability?.stability?.emptyReports || 0}</p></Panel>
        <Panel><h3>Stability Monitor</h3><p>Stale Approvals (&gt;24h): {stability?.stability?.staleApprovals || 0}</p></Panel>
        <Panel><h3>Stability Monitor</h3><p>Orphan Planning Entries: {stability?.stability?.orphanPlanningEntries || 0}</p></Panel>
      </section>

      <Panel><h3>Quality Badge</h3><p>Quality: duplicates {quality?.quality?.duplicatedRecommendations || 0} · empty reports {quality?.quality?.emptyReports || 0}</p></Panel>

      <Panel><h3>Governance Badge</h3><p>Governance: {quality?.governance?.governanceScore || readiness?.governance?.governanceScore || 0} ({quality?.governance?.governanceStatus || readiness?.governance?.governanceStatus || 'degraded'})</p></Panel>

      <Panel><h3>Readiness Badge</h3><p>Readiness: {quality?.readiness?.governanceOk ? 'ready' : 'not ready'}</p></Panel>

      <Panel>
        <h3>Governance Health</h3>
        <p>Governance Score: {readiness?.governance?.governanceScore || 0}</p>
        <p>Approval SLA: {readiness?.governance?.approvalSla || '0%'}</p>
        <p>Review Coverage: {readiness?.governance?.reviewCoverage || '0%'}</p>
      </Panel>

      <Panel>
        <h3>Release Readiness</h3>
        <p>{readiness?.readiness?.healthOk ? '☑' : '☐'} Health OK</p>
        <p>{readiness?.readiness?.reportsOk ? '☑' : '☐'} Reports OK</p>
        <p>{readiness?.readiness?.planningOk ? '☑' : '☐'} Planning OK</p>
        <p>{readiness?.readiness?.approvalQueueOk ? '☑' : '☐'} Approval Queue OK</p>
        <p>{readiness?.readiness?.governanceOk ? '☑' : '☐'} Governance OK</p>
      </Panel>

      <Panel>
        <h3>Morning Checklist</h3>
        {(hub.checklist || []).map((item) => <label key={item.id} style={{ display: 'block', marginBottom: 8 }}><input type='checkbox' checked={Boolean(checklist[item.id])} onChange={(e) => setChecklist((prev) => ({ ...prev, [item.id]: e.target.checked }))} /> {item.label}</label>)}
      </Panel>
    </> : null}
  </main>
}
