import React, { useEffect, useMemo, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiWorkforceActivityStream, fetchAiWorkforceAgents, fetchAiWorkforceAssignments, fetchAiWorkforceCommandGraph, fetchAiWorkforceEvents, fetchAiWorkforceExecutionPlans, fetchAiWorkforceMetrics, fetchAiWorkforceRealtimeMetrics, fetchAiWorkforceRealtimeMetricsHistory, fetchAiWorkforceTasks } from '../services/api'

const safetyLabels = ['Human Governed Flow', 'Approval Gates Active', 'Execution Policy Enabled', 'No Autonomous Outreach']
const stageOrder = ['lead', 'sales_brain', 'sdr_loop', 'approval', 'execution', 'workforce_task', 'workforce_agent', 'execution_plan', 'realtime_event', 'bottleneck', 'metric']

export default function AiWorkforceCenterPage() {
  const [state, setState] = useState({ agents: [], tasks: [], assignments: [], plans: [], metrics: {}, events: [], activity: [], realtime: {}, realtimeHistory: [], bottlenecks: [], escalations: [], collaboration: {}, commandGraph: { nodes: [], edges: [] } })

  useEffect(() => {
    Promise.all([fetchAiWorkforceAgents(), fetchAiWorkforceTasks(), fetchAiWorkforceAssignments(), fetchAiWorkforceExecutionPlans(), fetchAiWorkforceMetrics(), fetchAiWorkforceEvents(), fetchAiWorkforceActivityStream(), fetchAiWorkforceRealtimeMetrics(), fetchAiWorkforceRealtimeMetricsHistory({ limit: 50 }), fetchAiWorkforceCommandGraph()])
      .then(([agents, tasks, assignments, plans, metrics, events, activity, realtime, history, commandGraph]) => setState({ agents: agents.items || [], tasks: tasks.items || [], assignments: assignments.items || [], plans: plans.items || [], metrics: metrics.metrics || {}, events: events.items || [], activity: activity.items || [], realtime: realtime.metrics || {}, realtimeHistory: history.items || [], bottlenecks: realtime.bottlenecks || [], escalations: realtime.escalations || [], collaboration: realtime.collaboration || {}, commandGraph: commandGraph.graph || { nodes: [], edges: [] } }))
      .catch(() => setState((prev) => ({ ...prev })))
  }, [])

  const dependencyNodes = useMemo(() => state.tasks.slice(0, 5).map((task) => ({ id: task.id, label: task.task_type, deps: task.execution_dependencies || [] })), [state.tasks])
  const graphGroups = useMemo(() => stageOrder.map((type) => ({ type, items: state.commandGraph.nodes.filter((node) => node.type === type) })), [state.commandGraph])

  return <div className="workforce-center">
    <PageHeading eyebrow="AI Workforce" title="AI Workforce Control Center" copy="Live orchestration of AI workers, tasks, collaboration, and approval-gated execution." />
    <Panel className="workforce-safety-banner"><strong>Safety Banners</strong><div className="safety-pills">{safetyLabels.map((label) => <span key={label}>{label}</span>)}</div></Panel>
    <Panel className="workforce-command-graph">
      <h3>AI Workforce Command Graph</h3>
      <p>Unified revenue flow: Lead → AI Sales Brain → SDR Loop → Approval Center → Execution Layer → AI Workforce → Realtime Operations.</p>
      <div className="command-stage-columns">{graphGroups.map((group) => <div key={group.type} className="command-stage-column"><h4>{group.type}</h4>{group.items.slice(0, 8).map((node) => <div key={node.id} className={`command-node-card ${node.type === 'bottleneck' ? 'warning' : ''} ${node.type === 'realtime_event' ? 'pulse' : ''}`}><strong>{node.label}</strong><small>{node.status} · {node.priority}</small><small>{node.payloadSummary || '—'}</small></div>)}</div>)}</div>
      <div className="command-edge-list">{state.commandGraph.edges.slice(0, 20).map((edge) => <span key={edge.id}>{edge.type}: {edge.from} → {edge.to}</span>)}</div>
    </Panel>
    <section className="workforce-grid">
      <Panel><h3>Current Bottlenecks</h3>{state.bottlenecks.length ? state.bottlenecks.map((b) => <p key={b.id}>Assignment {b.id} · {b.status}</p>) : <p>No bottlenecks detected</p>}</Panel>
      <Panel><h3>Pending Approvals</h3><p>Approval queue pressure: {state.metrics.pendingApprovals || 0}</p></Panel>
      <Panel><h3>Execution Plans</h3>{state.plans.map((p) => <p key={p.id}>{p.task_type} · {p.status}</p>)}</Panel>
      <Panel><h3>Active Workers</h3>{state.agents.map((w) => <p key={w.id}>{w.role} · {w.status} · load {w.workload}</p>)}</Panel>
      <Panel><h3>Realtime Events</h3>{state.events.slice(0, 6).map((event) => <p key={event.id}>{event.event_type} · {event.severity}</p>)}</Panel>
      <Panel><h3>Metrics</h3><p>Throughput (24h): {state.realtime.throughput24h || 0}</p><p>Collaboration sessions: {state.realtime.collaborationSessions || 0}</p></Panel>
      <Panel><h3>Execution Graph</h3>{dependencyNodes.map((node) => <p key={node.id}><b>{node.label}</b> → {(node.deps || []).join(', ') || 'no blockers'}</p>)}</Panel>
    </section>
  </div>
}
