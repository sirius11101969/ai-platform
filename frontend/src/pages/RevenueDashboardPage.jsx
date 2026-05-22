import React, { useEffect, useMemo, useState } from 'react'
import { PageHeading, Panel, StatCard } from '../components/AppShell'
import { fetchRevenueOverview, fetchRevenueFunnel, fetchRevenueOrders, completeRevenuePayment, fetchWorkspaces, getActiveWorkspaceId } from '../services/api'

const SAFETY = ['Human Approval Required', 'No Autonomous Execution', 'No Customer Actions', 'No Pricing Changes']

export default function RevenueDashboardPage() {
  const [overview, setOverview] = useState({})
  const [funnel, setFunnel] = useState([])
  const [workspaceId, setWorkspaceId] = useState(() => getActiveWorkspaceId())
  const [orders, setOrders] = useState([])
  const [payingOrderId, setPayingOrderId] = useState('')
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleWorkspaceUpdate = (event) => setWorkspaceId(event?.detail?.workspaceId || getActiveWorkspaceId())
    window.addEventListener('ai-platform-workspace-updated', handleWorkspaceUpdate)
    return () => window.removeEventListener('ai-platform-workspace-updated', handleWorkspaceUpdate)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    Promise.all([
      fetchRevenueOverview(workspaceId),
      fetchRevenueFunnel(workspaceId),
      fetchRevenueOrders(workspaceId),
      fetchWorkspaces(),
    ])
      .then(([o, f, po, w]) => {
        if (!active) return
        setOverview(o?.overview || o?.data?.overview || {})
        setFunnel(f?.funnel || f?.data?.funnel || [])
        setOrders(po?.orders || [])
        setWorkspaces(w.workspaces || [])
      })
      .catch((e) => {
        if (!active) return
        setError(e?.message || 'Failed to load revenue dashboard')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [workspaceId])

  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'payment_pending'), [orders])
  const paidOrders = useMemo(() => orders.filter((order) => order.status === 'paid'), [orders])

  const workspaceLabel = useMemo(() => {
    const match = workspaces.find((workspace) => workspace.id === workspaceId)
    return match?.name || workspaceId || 'Not selected'
  }, [workspaces, workspaceId])


  const markOrderPaid = async (orderId) => {
    setPayingOrderId(orderId)
    try {
      const result = await completeRevenuePayment({ workspaceId, orderId })
      console.info('payment_completed_created', result)
      console.info('credit_granted', { orderId: result.orderId, creditsIssued: result.creditsIssued })
      console.info('activation_completed', { orderId: result.orderId, activationStatus: result.activationStatus })
      const [o, f, all] = await Promise.all([fetchRevenueOverview(workspaceId), fetchRevenueFunnel(workspaceId), fetchRevenueOrders(workspaceId)])
      setOverview(o?.overview || o?.data?.overview || {})
      setFunnel(f?.funnel || f?.data?.funnel || [])
      setOrders(all?.orders || [])
    } catch (e) {
      setError(e?.message || 'Failed to complete payment')
    } finally {
      setPayingOrderId('')
    }
  }

  return <div className='workforce-center'>
    <PageHeading eyebrow='Revenue Activation v1.4' title='Revenue Dashboard' copy='First production revenue flow with approval-first activation.' />
    <Panel><strong>Safety Controls:</strong> <div className='safety-pills'>{SAFETY.map((x) => <span key={x}>{x}</span>)}</div></Panel>
    <Panel><strong>Current workspace:</strong> {workspaceLabel}</Panel>

    {loading && <Panel><p>Loading revenue dashboard…</p></Panel>}
    {!loading && error && <Panel><p role='alert'>Failed to load dashboard: {error}</p></Panel>}

    {!loading && !error && <>
      <section className='stats-grid'>
        <StatCard label='MRR' value={overview.mrr || 0} hint='payment_completed in current month' />
        <StatCard label='Payments Today' value={overview.paymentsToday || 0} hint='today settled payments' />
        <StatCard label='New Users' value={overview.newUsers || 0} hint='today signups' />
        <StatCard label='Credits Issued' value={overview.creditsIssued || 0} hint='today granted credits' />
        <StatCard label='Activation Rate' value={`${overview.activationRate || 0}%`} hint='activation_completed / payment_completed' />
      </section>
      <Panel>
        <h3>Revenue Funnel</h3>
        <p><strong>Revenue source:</strong> live API</p>
        {funnel.length === 0 ? <p>No funnel events yet for this workspace.</p> : funnel.map((item) => <p key={item.stage}><strong>{item.stage}</strong>: {item.total ?? 0}</p>)}
      </Panel>
      <Panel>
        <h3>Pending Orders</h3>
        {pendingOrders.length === 0 ? <p>No pending orders.</p> : pendingOrders.map((order) => <div key={order.id} style={{ marginBottom: 10 }}><p><strong>{order.id}</strong> · {order.plan} · {order.status} · {order.created_at}</p><button className='btn compact' disabled={payingOrderId === order.id} onClick={() => markOrderPaid(order.id)}>Mark test payment as paid</button><p><small>Test only · no real charge</small></p></div>)}
      </Panel>
      <Panel>
        <h3>Paid Orders</h3>
        {paidOrders.length === 0 ? <p>No paid orders.</p> : paidOrders.map((order) => <p key={order.id}><strong>{order.id}</strong> · {order.plan} · {order.status} · credits: {order.credits || 0} · activation_completed</p>)}
      </Panel>
    </>}

    <Panel>
      <h3>CRM Revenue Feed</h3>
      <p>lead · plan · payment_status · credits · activation_status</p>
      <p>Updated via payment paid → credits grant → activation → CRM update chain.</p>
    </Panel>
  </div>
}
