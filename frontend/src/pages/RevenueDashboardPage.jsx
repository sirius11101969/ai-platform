import React, { useEffect, useMemo, useState } from 'react'
import { PageHeading, Panel, StatCard } from '../components/AppShell'
import { fetchRevenueOverview, fetchRevenueFunnel, fetchRevenueOrders, fetchWorkspaces, getActiveWorkspaceId, fetchPaymentDashboard, fetchRevenueCommandCenter } from '../services/api'

export default function RevenueDashboardPage() {
  const [overview, setOverview] = useState({})
  const [funnel, setFunnel] = useState([])
  const [workspaceId, setWorkspaceId] = useState(() => getActiveWorkspaceId())
  const [orders, setOrders] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentDashboard, setPaymentDashboard] = useState({ providers: [], transactions: [], health: [] })
  const [revenueCommand, setRevenueCommand] = useState(null)
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
      fetchPaymentDashboard(workspaceId),
      fetchRevenueCommandCenter(),
    ])
      .then(([o, f, po, w, pd, rc]) => {
        if (!active) return
        setOverview(o?.overview || o?.data?.overview || {})
        setFunnel(f?.funnel || f?.data?.funnel || [])
        setOrders(po?.orders || [])
        setWorkspaces(w.workspaces || [])
        setPaymentDashboard(pd || { providers: [], transactions: [], health: [] })
        setRevenueCommand(rc?.revenue || null)
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

  const normalizePlan = (plan) => {
    const value = String(plan || '').toLowerCase()
    if (['pro', 'профи'].includes(value)) return 'Pro'
    if (['business', 'бизнес'].includes(value)) return 'Business'
    return 'Starter'
  }

  const visibleTransactions = useMemo(
    () => (paymentDashboard.transactions || []).filter((t) => !String(t.external_payment_id || '').startsWith('mock_')),
    [paymentDashboard.transactions]
  )
  const paidTransactions = useMemo(
    () => visibleTransactions.filter((t) => t.status === 'paid'),
    [visibleTransactions]
  )
  const pendingTransactions = useMemo(
    () => visibleTransactions.filter((t) => ['pending', 'created'].includes(t.status)),
    [visibleTransactions]
  )
  const paidRevenue = useMemo(
    () => paidTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [paidTransactions]
  )
  const latestPayment =
paidTransactions
.slice()
.sort(
(a,b)=>
new Date(b.created_at)-new Date(a.created_at)
)[0] || null

  const liveProviders = useMemo(
    () => (paymentDashboard.providers || []).filter((p) => p.enabled && p.mode === 'live'),
    [paymentDashboard.providers]
  )

  const recentVisibleTransactions = useMemo(
    () => visibleTransactions.slice(0, 10),
    [visibleTransactions]
  )

  const workspaceLabel = useMemo(() => {
    const match = workspaces.find((workspace) => workspace.id === workspaceId)
    return match?.name || workspaceId || 'Not selected'
  }, [workspaces, workspaceId])



  return <div className='workforce-center'>
    <PageHeading eyebrow='Revenue Activation v1.5' title='Revenue Dashboard' copy='First production revenue flow with approval-first activation.' />
    <Panel><strong>Current workspace:</strong> {workspaceLabel}</Panel>

    {loading && <Panel><p>Loading revenue dashboard…</p></Panel>}
    {!loading && error && <Panel><p role='alert'>Failed to load dashboard: {error}</p></Panel>}

    {!loading && !error && <>
      <section className='stats-grid'>
        <StatCard label='Revenue This Month' value={overview.mrr || 0} hint='paid YooKassa payments this month' />
        <StatCard label='Revenue Today' value={overview.paymentsToday || 0} hint='paid YooKassa payments today' />
        <StatCard label='New Users' value={overview.newUsers || 0} hint='today signups' />
        <StatCard label='Credits Issued' value={overview.creditsIssued || 0} hint='today granted credits' />
        <StatCard label='Activation Rate' value={`${overview.activationRate || 0}%`} hint='activation_completed / payment_completed' />
        <StatCard label='Paid Revenue' value={`${paidRevenue.toLocaleString('ru-RU')} ₽`} hint='sum of paid transactions' />
        <StatCard label='Paid Payments' value={paidTransactions.length} hint='successful payments' />
        <StatCard label='Pending Payments' value={pendingTransactions.length} hint='waiting for payment' />
        <StatCard label='Latest Payment' value={latestPayment ? `${Number(latestPayment.amount || 0).toLocaleString('ru-RU')} ${latestPayment.currency}` : '—'} hint={latestPayment?.status || 'no payments'} />
      </section>
      <Panel>
        <h3>Revenue Funnel</h3>
        <p><strong>Revenue source:</strong> live API</p>
        {funnel.length === 0 ? <p>No funnel events yet for this workspace.</p> : funnel.map((item) => <p key={item.stage}><strong>{item.stage}</strong>: {item.total ?? 0}</p>)}
      </Panel>
      {revenueCommand && (
        <Panel>
          <h3>Revenue Command Center</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'12px'}}>
            {(revenueCommand.by_provider || []).map((p) => (
              <div key={`${p.provider}-${p.currency}`} style={{padding:'14px',border:'1px solid rgba(255,255,255,.12)',borderRadius:'12px'}}>
                <div><strong>{String(p.provider).toUpperCase()}</strong></div>
                <div>Currency: {p.currency}</div>
                <div>Paid: {p.paid_count}</div>
                <div>Total: {Number(p.paid_total || 0).toLocaleString()}</div>
                <div>Open: {p.open_count}</div>
                <div>Open total: {Number(p.open_total || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <p style={{marginTop:12}}>Credits issued: {revenueCommand.credits_issued}</p>
        </Panel>
      )}

      <Panel><h3>Live Payment Provider</h3>{liveProviders.length===0 ? <p>No live providers enabled.</p> : liveProviders.map((p)=><p key={p.provider}>{p.provider} · {p.currency} · LIVE · enabled</p>)}</Panel>
      <Panel>
<h3>Payments History</h3>

<div style={{display:'grid',gap:'12px'}}>

{recentVisibleTransactions.length===0
? <p>No payments yet.</p>

: recentVisibleTransactions.map((t)=>(

<div
key={t.id}
style={{
padding:'14px',
border:'1px solid rgba(255,255,255,.12)',
borderRadius:'12px'
}}
>

<div><strong>{t.amount} {t.currency}</strong></div>

<div>Provider: {t.provider}</div>

<div>
Status:
<span style={{
marginLeft:8,
color:t.status==='paid'
?'#00d26a'
:'#ffb400'
}}>
{t.status.toUpperCase()}
</span>
</div>

<div>
Plan:
{normalizePlan(t.metadata?.plan)}
</div>

<div>
Date:
{new Date(t.created_at).toLocaleString()}
</div>

<div style={{
opacity:.6,
fontSize:12
}}>
Payment:
{t.external_payment_id}
</div>

</div>

))

}

</div>

</Panel>
      <Panel>
<h3>Provider Health</h3>

{paymentDashboard.health
.filter((h)=>h.mode==='live')
.map((h)=>

<p key={h.provider}>
🟢 {h.provider === 'yookassa' ? 'YooKassa' : h.provider} {h.status}
</p>

)}

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
