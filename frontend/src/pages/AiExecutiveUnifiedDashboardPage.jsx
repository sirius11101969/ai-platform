/* AS6_DIRECT_PAGE_REWRITE_V100: governed by AS6UnifiedPageShell / AS6DirectPageRewriteFramework */
import { useEffect, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiExecutiveUnifiedOverview } from '../services/api'

const governanceLabels = ['Human Approval Required','No Autonomous Customer Actions','No Autonomous Pricing Changes','Recommendation / Planning / Memory Only']

export default function AiExecutiveUnifiedDashboardPage(){
  const [data,setData]=useState(null)
  useEffect(()=>{fetchAiExecutiveUnifiedOverview().then(setData).catch(()=>{})},[])
  const cards=data?.cards||{}
  const sections=data?.sections||{}
  return <div className='workforce-center'>
    <PageHeading eyebrow='Executive Unified Dashboard' title='AI Enterprise OS Executive Unified Dashboard' copy='Unified executive overview across Revenue Engine, Executive Brain, Company Simulation, Strategic Planning, Enterprise Coordination, Organizational Memory, Workforce, Approval Center, and Realtime Metrics.' />
    <Panel><strong>Governance labels:</strong><div className='safety-pills'>{(data?.governanceLabels||governanceLabels).map((l)=><span key={l}>{l}</span>)}</div></Panel>
    <section className='workforce-grid'>
      <Panel><h3>Executive Summary</h3><p>organizational health score: {cards.organizationalHealthScore||0}</p><p>governance mode: {cards.governanceMode||'recommendation_only'}</p></Panel>
      <Panel><h3>Revenue Intelligence</h3><p>revenue opportunity: {cards.revenueOpportunity||0}</p></Panel>
      <Panel><h3>Strategic Planning</h3><p>active strategic initiatives: {cards.activeStrategicInitiatives||0}</p></Panel>
      <Panel><h3>Enterprise Coordination</h3><p>open executive escalations: {cards.openExecutiveEscalations||0}</p></Panel>
      <Panel><h3>Organizational Memory</h3><p>strategic drift level: {cards.strategicDriftLevel||'low'}</p></Panel>
      <Panel><h3>Workforce Health</h3><p>workforce utilization: {cards.workforceUtilization||0}</p></Panel>
      <Panel><h3>Approval Bottlenecks</h3><p>approval bottlenecks: {cards.approvalBottlenecks||0}</p></Panel>
      <Panel><h3>Simulation Scenarios</h3><p>simulation risk level: {cards.simulationRiskLevel||'low'}</p></Panel>
      <Panel><h3>Strategic Risks</h3><p>{(sections.strategicRisks||[]).slice(0,3).map((r)=>`${r.risk_type}:${r.severity}`).join(', ')||'none'}</p></Panel>
      <Panel><h3>Governance Status</h3><p>{JSON.stringify(sections.governanceStatus||{})}</p></Panel>
    </section>
  </div>
}
