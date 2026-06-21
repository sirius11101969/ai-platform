/* AS6_REAL_PAGE_CONVERSION_ENGINE_V108: governed by Mission Control Layout 2.0 */
import React, { useEffect, useMemo, useState } from 'react'
import { PageHeading, Panel, StatCard } from '../components/AppShell'
import { approveAiApprovalCenterItem, escalateAiApprovalCenterItem, fetchAiApprovalCenterQueue, rejectAiApprovalCenterItem, snoozeAiApprovalCenterItem } from '../services/api'

export default function AiApprovalCenterPage() {
  const [data, setData] = useState({ items: [], metrics: {} })
  const load = async () => setData(await fetchAiApprovalCenterQueue())
  useEffect(() => { load() }, [])
  const today = new Date().toISOString().slice(0,10)
  const items = data.items || []
  const sections = useMemo(() => ({
    pending: items.filter(i => i.status === 'pending_approval'),
    high: items.filter(i => (i.urgency || '').toLowerCase() === 'high'),
    escalations: items.filter(i => i.status === 'escalated'),
    approvedToday: items.filter(i => i.status === 'approved' && String(i.updatedAt || '').startsWith(today)),
    rejectedToday: items.filter(i => i.status === 'rejected' && String(i.updatedAt || '').startsWith(today)),
    snoozed: items.filter(i => i.status === 'snoozed'),
  }), [items, today])
  const act = async (fn, id, payload={}) => { await fn(id, payload); await load() }
  return <main><PageHeading eyebrow='AI SDR governance' title='AI SDR Approval Center' copy='Human Approval Required · Suggestion Only · No Automatic Outreach · Audit Logging Enabled' />
    <div className='stats-grid'>
      <StatCard label='Approval rate' value={`${data.metrics?.approvalRate || 0}%`} hint='decision quality'/><StatCard label='Rejection rate' value={`${data.metrics?.rejectionRate || 0}%`} hint='risk control'/><StatCard label='Escalation rate' value={`${data.metrics?.escalationRate || 0}%`} hint='manager involvement'/><StatCard label='Avg approval time' value={`${data.metrics?.averageApprovalTimeSeconds || 0}s`} hint='decision latency'/><StatCard label='Pending queue size' value={String(data.metrics?.pendingQueueSize || 0)} hint='actionable now'/>
    </div>
    {Object.entries({ 'Pending Approvals': sections.pending, 'High Urgency': sections.high, Escalations: sections.escalations, 'Approved Today': sections.approvedToday, 'Rejected Today': sections.rejectedToday, 'Snoozed Items': sections.snoozed }).map(([title, list]) => <Panel key={title}><h3>{title}</h3>{list.map(item => <article key={item.id}><p><b>{item.leadName || item.leadId}</b> · {item.recommendationType} · confidence {item.confidenceScore} · urgency {item.urgency}</p><p>AI Recommendation Details: {(item.recommendationPayload?.suggestedAction || item.recommendationPayload?.reasoning || item.recommendationPayload?.reason || 'n/a')}</p><p>lead state: {item.recommendationPayload?.leadState || '—'} · source: {item.recommendationPayload?.source || '—'} · objection summary: {item.recommendationPayload?.objectionSummary || '—'} · meeting intent: {item.recommendationPayload?.meetingIntent || '—'} · AI memory summary: {item.recommendationPayload?.aiMemorySummary || '—'}</p><div><button onClick={()=>act(approveAiApprovalCenterItem,item.id)}>Approve</button><button onClick={()=>act(rejectAiApprovalCenterItem,item.id)}>Reject</button><button onClick={()=>act(snoozeAiApprovalCenterItem,item.id,{snoozeUntil:new Date(Date.now()+86400000).toISOString()})}>Snooze</button><button onClick={()=>act(escalateAiApprovalCenterItem,item.id)}>Escalate</button></div></article>)}</Panel>)}
  </main>
}
