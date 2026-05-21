import { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiCommandCenterBrief, fetchAiCommandCenterFocus, fetchAiCommandCenterOperations } from '../services/api'

export default function AIEnterpriseCommandCenter() {
  const [hub, setHub] = useState(null)
  const [error, setError] = useState('')
  const [checklist, setChecklist] = useState({})

  useEffect(() => {
    Promise.all([fetchAiCommandCenterBrief(), fetchAiCommandCenterOperations(), fetchAiCommandCenterFocus()])
      .then(([brief, operations, focus]) => {
        const merged = {
          generatedAt: brief.generatedAt || operations.generatedAt || focus.generatedAt,
          executiveBrief: brief.executiveBrief || {},
          operations: operations.operations || {},
          focusQueue: focus.focusQueue || [],
          checklist: brief.checklist || [],
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
        <h3>Daily Executive Brief</h3>
        <p>health summary: READY {hub.executiveBrief?.healthSummary?.ready || 0} · DEGRADED {hub.executiveBrief?.healthSummary?.degraded || 0} · MISSING {hub.executiveBrief?.healthSummary?.missing || 0}</p>
        <p>pending approvals: {hub.executiveBrief?.pendingApprovals || 0}</p>
        <p>top bottleneck: {hub.executiveBrief?.topBottleneck || 'None'}</p>
        <p>top recommendation: {hub.executiveBrief?.topRecommendation || 'Maintain governance mode.'}</p>
        <p>generatedAt: {new Date(hub.generatedAt).toLocaleString()}</p>
      </Panel>

      <section className='stats-grid'>
        <Panel><h3>Operations Board</h3><p>Healthy: {hub.operations?.healthy || 0}</p></Panel>
        <Panel><h3>Operations Board</h3><p>Needs Attention: {hub.operations?.needsAttention || 0}</p></Panel>
        <Panel><h3>Operations Board</h3><p>Blocked: {hub.operations?.blocked || 0}</p></Panel>
        <Panel><h3>Operations Board</h3><p>Completed Today: {hub.operations?.completedToday || 0}</p></Panel>
      </section>

      <Panel>
        <h3>Executive Focus Queue</h3>
        <p>Prioritized: critical → high → medium</p>
        {(hub.focusQueue || []).map((item) => <p key={item.id}>{item.priority} | {item.title} | {item.state}</p>)}
      </Panel>

      <Panel>
        <h3>Decision Tracker</h3>
        <p>States: requested · approved · rejected · closed</p>
        {decisionRows.map((item, idx) => <p key={`${item.title}-${idx}`}>{item.state} | {item.title} | {item.source}</p>)}
      </Panel>

      <Panel>
        <h3>Morning Checklist</h3>
        {(hub.checklist || []).map((item) => <label key={item.id} style={{ display: 'block', marginBottom: 8 }}><input type='checkbox' checked={Boolean(checklist[item.id])} onChange={(e) => setChecklist((prev) => ({ ...prev, [item.id]: e.target.checked }))} /> {item.label}</label>)}
      </Panel>
    </> : null}
  </main>
}
