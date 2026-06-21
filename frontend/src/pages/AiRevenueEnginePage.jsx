/* AS6_REAL_PAGE_CONVERSION_ENGINE_V108: governed by Mission Control Layout 2.0 */
/* AS6_DIRECT_PAGE_REWRITE_V100: governed by AS6UnifiedPageShell / AS6DirectPageRewriteFramework */
import React, { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiRevenueEngineSnapshot, fetchAiRevenueEngineRecommendations, fetchAiRevenueEngineRisks, runAiRevenueEngineAnalysis } from '../services/api'

const safetyLabels = ['Recommendation Only', 'Human Approval Required', 'No Autonomous Outreach', 'No Pricing Changes Without Approval']

export default function AiRevenueEnginePage() {
  const [snapshot, setSnapshot] = useState(null); const [recommendations, setRecommendations] = useState([]); const [risks, setRisks] = useState([])
  const load = async () => { const [s, r, k] = await Promise.all([fetchAiRevenueEngineSnapshot(), fetchAiRevenueEngineRecommendations(), fetchAiRevenueEngineRisks()]); setSnapshot(s.snapshot); setRecommendations(r.recommendations || []); setRisks(k.risks || []) }
  useEffect(() => { load().catch(() => {}) }, [])
  return <div className='workforce-center'>
    <PageHeading eyebrow='AI Revenue Engine' title='Autonomous AI Revenue Engine (Recommendation-Only)' copy='Analyzes revenue workflow performance and suggests optimization strategies with human governance.' action={<button className='btn primary compact' onClick={() => runAiRevenueEngineAnalysis().then(load)}>Run analysis</button>} />
    <Panel><strong>Safety Labels:</strong> <div className='safety-pills'>{safetyLabels.map((l) => <span key={l}>{l}</span>)}</div></Panel>
    <section className='workforce-grid'>
      <Panel><h3>Revenue Engine Snapshot</h3><p>Projected revenue opportunity: {snapshot?.snapshot_payload?.forecast?.projectedRevenueOpportunity || 0}</p><p>Stalled revenue: {snapshot?.snapshot_payload?.forecast?.stalledRevenue || 0}</p><p>Approval bottleneck count: {snapshot?.snapshot_payload?.pendingApprovals || 0}</p><p>Hot lead count: {snapshot?.snapshot_payload?.hotLeadCount || 0}</p><p>Workforce utilization: {snapshot?.snapshot_payload?.workforceUtilization || 0}%</p><p>Execution pressure: {snapshot?.snapshot_payload?.executionPressure || 0}</p><p>Conversion improvement potential: {snapshot?.snapshot_payload?.conversion?.conversionImprovementPotential || 'n/a'}</p></Panel>
      <Panel><h3>Strategy Recommendations</h3>{recommendations.map((r) => <p key={r.id}>{r.recommendation_type} · {r.impact_estimate} · conf {r.confidence_score} · {r.urgency}</p>)}</Panel>
      <Panel><h3>Revenue Risks</h3>{risks.map((r) => <p key={r.id}>{r.risk_type} · {r.severity}</p>)}</Panel>
      <Panel><h3>Conversion Optimization</h3><p>{snapshot?.snapshot_payload?.conversion?.suggestion || 'No recommendations yet.'}</p></Panel>
      <Panel><h3>Pipeline Forecast</h3><p>{JSON.stringify(snapshot?.snapshot_payload?.forecast || {})}</p></Panel>
      <Panel><h3>Workforce Impact</h3><p>{JSON.stringify(snapshot?.snapshot_payload?.workflow || {})}</p></Panel>
      <Panel><h3>Approval Bottlenecks</h3><p>Pending approvals: {snapshot?.snapshot_payload?.pendingApprovals || 0}</p></Panel>
      <Panel><h3>Optimization Memory</h3><p>Stored after each analysis run for future optimization context.</p></Panel>
    </section>
  </div>
}
