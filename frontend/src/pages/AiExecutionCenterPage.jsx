/* AS6_REAL_PAGE_CONVERSION_ENGINE_V108: governed by Mission Control Layout 2.0 */
import React, { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiExecutionQueue, fetchAiExecutionRuns } from '../services/api'

export default function AiExecutionCenterPage() {
  const [queue, setQueue] = useState([])
  const [runs, setRuns] = useState([])
  useEffect(() => { (async () => { setQueue((await fetchAiExecutionQueue()).items || []); setRuns((await fetchAiExecutionRuns()).runs || []) })() }, [])
  const by = (s) => queue.filter((i) => i.status === s)
  return <main className='workspace-main'>
    <PageHeading eyebrow='Execution Governance' title='AI Execution Center' copy='Human Approved Execution Only · No Autonomous Outreach · Policy Validation Enabled · Audit Logging Enabled' />
    <Panel><h3>Approved Actions Ready</h3><p>{by('approved').length}</p></Panel>
    <Panel><h3>Execution Queue</h3><p>{by('queued').length}</p></Panel>
    <Panel><h3>Running Executions</h3><p>{runs.filter((r) => r.status === 'executing').length}</p></Panel>
    <Panel><h3>Completed Executions</h3><p>{runs.filter((r) => r.status === 'completed').length}</p></Panel>
    <Panel><h3>Failed Executions</h3><p>{runs.filter((r) => r.status === 'failed').length}</p></Panel>
    <Panel><h3>Execution Audit</h3><p>Audit logging enabled for all execution events.</p></Panel>
  </main>
}
