import React, { useEffect, useMemo, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiWorkforceAgents, fetchAiWorkforceAssignments, fetchAiWorkforceExecutionPlans, fetchAiWorkforceMetrics, fetchAiWorkforceTasks } from '../services/api'

const safetyLabels = ['Human Governed Workforce', 'Approval Required For Execution', 'Audit Logging Enabled', 'No Autonomous Outreach']
const eventTypes = ['worker_assigned', 'execution_plan_generated', 'workforce_task_completed', 'workforce_escalation_detected', 'collaboration_started']

export default function AiWorkforceCenterPage() {
  const [state, setState] = useState({ agents: [], tasks: [], assignments: [], plans: [], metrics: {} })

  useEffect(() => {
    Promise.all([fetchAiWorkforceAgents(), fetchAiWorkforceTasks(), fetchAiWorkforceAssignments(), fetchAiWorkforceExecutionPlans(), fetchAiWorkforceMetrics()])
      .then(([agents, tasks, assignments, plans, metrics]) => setState({ agents: agents.items || [], tasks: tasks.items || [], assignments: assignments.items || [], plans: plans.items || [], metrics: metrics.metrics || {} }))
      .catch(() => setState((prev) => ({ ...prev })))
  }, [])

  const dependencyNodes = useMemo(() => state.tasks.slice(0, 5).map((task) => ({ id: task.id, label: task.task_type, deps: task.execution_dependencies || [] })), [state.tasks])

  return <div className="workforce-center">
    <PageHeading eyebrow="AI Workforce" title="AI Workforce Control Center" copy="Live orchestration of AI workers, tasks, collaboration, and approval-gated execution." />
    <Panel className="workforce-safety-banner"><strong>Safety Banners</strong><div className="safety-pills">{safetyLabels.map((label) => <span key={label}>{label}</span>)}</div></Panel>
    <section className="workforce-grid">
      <Panel><h3>Live Workforce Overview</h3><div className="stat-grid"><article className="kpi-card"><b>Utilization</b><p>{state.metrics.workforceUtilizationPercent || 0}%</p></article><article className="kpi-card"><b>Active / Idle</b><p>{state.metrics.activeWorkers || 0} / {state.metrics.idleWorkers || 0}</p></article><article className="kpi-card"><b>Approvals</b><p>{state.metrics.pendingApprovals || 0} pending</p></article></div></Panel>
      <Panel><h3>Workforce Metrics</h3><p>Approval bottlenecks: {state.metrics.approvalBottlenecks || 0}</p><p>Overloaded workers: {state.metrics.overloadedWorkers || 0}</p><p>Idle capacity: {state.metrics.idleCapacity || 0}</p><p>Execution queue pressure: {state.metrics.executionQueuePressure || 0}</p><p>Collaboration efficiency: {state.metrics.collaborationEfficiency || 0}%</p></Panel>
      <Panel><h3>Active AI Workers</h3><div className="workforce-cards">{state.agents.map((w) => <article key={w.id} className="workforce-card"><h4>{w.role}</h4><p>Status: <span className={`status-dot ${w.status}`}>{w.status}</span></p><p>Workload: {w.workload}</p><div className="workload-bar"><span style={{ width: `${Math.min(100, (w.workload || 0) * 20)}%` }} /></div><p>Collaboration: {w.collaboration_state}</p><p>Assigned tasks: {state.assignments.filter((a) => a.agent_id === w.id).length}</p><p>Execution dependencies: {((w.metadata || {}).dependencies || []).join(', ') || 'Policy + approvals'}</p><p>Current recommendations: {((w.metadata || {}).recommendations || []).join(', ') || 'No new recommendations'}</p></article>)}</div></Panel>
      <Panel><h3>Workforce Tasks</h3>{state.tasks.map((t) => <p key={t.id}>{t.task_type} · {t.status}</p>)}</Panel>
      <Panel><h3>Collaboration Sessions</h3><p>Open sessions: {state.metrics.collaborationSessions || 0}</p><p>Coordination status indicators are active across assigned workers.</p></Panel>
      <Panel><h3>Execution Plans</h3>{state.plans.map((p) => <p key={p.id}>{p.task_type} · {p.status}</p>)}<p>Waiting approval: {state.metrics.executionPlansWaitingApproval || 0}</p></Panel>
      <Panel><h3>Worker Load Balancing</h3>{(state.metrics.workloadDistribution || []).map((w, i) => <p key={`${w.status}-${i}`}>{w.status}: {w.workload}</p>)}</Panel>
      <Panel><h3>Execution Dependency Graph</h3>{dependencyNodes.map((node) => <p key={node.id}><b>{node.label}</b> → {(node.deps || []).join(', ') || 'no blockers'}</p>)}</Panel>
      <Panel><h3>Workforce Audit Stream</h3>{eventTypes.map((eventType) => <p key={eventType}>{eventType}</p>)}</Panel>
    </section>
  </div>
}
