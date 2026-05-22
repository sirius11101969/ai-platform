import React, { useEffect, useState } from 'react'
import { PageHeading, Panel, StatCard } from '../components/AppShell'
import { fetchRevenueOverview, fetchRevenueFunnel } from '../services/api'

const SAFETY = ['Human Approval Required', 'No Autonomous Execution', 'No Customer Actions', 'No Pricing Changes']

export default function RevenueDashboardPage() {
  const [overview, setOverview] = useState({}); const [funnel, setFunnel] = useState([])
  useEffect(() => { Promise.all([fetchRevenueOverview(), fetchRevenueFunnel()]).then(([o, f]) => { setOverview(o.overview || {}); setFunnel(f.funnel || []) }).catch(() => {}) }, [])
  return <div className='workforce-center'>
    <PageHeading eyebrow='Revenue Activation v1.4' title='Revenue Dashboard' copy='First production revenue flow with approval-first activation.' />
    <Panel><strong>Safety Controls:</strong> <div className='safety-pills'>{SAFETY.map((x) => <span key={x}>{x}</span>)}</div></Panel>
    <section className='stats-grid'>
      <StatCard label='MRR' value={overview.mrr || 0} hint='payment_completed in current month' />
      <StatCard label='Payments Today' value={overview.paymentsToday || 0} hint='today settled payments' />
      <StatCard label='New Users' value={overview.newUsers || 0} hint='today signups' />
      <StatCard label='Credits Issued' value={overview.creditsIssued || 0} hint='today granted credits' />
      <StatCard label='Activation Rate' value={`${overview.activationRate || 0}%`} hint='activation_completed / payment_completed' />
    </section>
    <Panel>
      <h3>Revenue Funnel</h3>
      {funnel.map((item) => <p key={item.stage}><strong>{item.stage}</strong>: {item.total}</p>)}
    </Panel>
    <Panel>
      <h3>CRM Revenue Feed</h3>
      <p>lead · plan · payment_status · credits · activation_status</p>
      <p>Updated via payment paid → credits grant → activation → CRM update chain.</p>
    </Panel>
  </div>
}
