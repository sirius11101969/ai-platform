import React, { useEffect, useMemo, useState } from 'react'
import { PageHeading, Panel } from '../components/AppShell'
import { fetchAiWorkforceActivityStream, fetchAiWorkforceAgents, fetchAiWorkforceAssignments, fetchAiWorkforceEvents, fetchAiWorkforceExecutionPlans, fetchAiWorkforceMetrics, fetchAiWorkforceRealtimeMetrics, fetchAiWorkforceRealtimeMetricsHistory, fetchAiWorkforceTasks } from '../services/api'

const safetyLabels = ['Human Governed Workforce', 'Realtime Monitoring Only', 'Approval Required For Execution', 'No Autonomous Outreach']

export default function AiWorkforceCenterPage() {
  const [state, setState] = useState({ agents: [], tasks: [], assignments: [], plans: [], metrics: {}, events: [], activity: [], realtime: {}, realtimeHistory: [], bottlenecks: [], escalations: [], collaboration: {} })

  useEffect(() => {
    Promise.all([fetchAiWorkforceAgents(), fetchAiWorkforceTasks(), fetchAiWorkforceAssignments(), fetchAiWorkforceExecutionPlans(), fetchAiWorkforceMetrics(), fetchAiWorkforceEvents(), fetchAiWorkforceActivityStream(), fetchAiWorkforceRealtimeMetrics(), fetchAiWorkforceRealtimeMetricsHistory({ limit: 50 })])
      .then(([agents, tasks, assignments, plans, metrics, events, activity, realtime, history]) => setState({ agents: agents.items || [], tasks: tasks.items || [], assignments: assignments.items || [], plans: plans.items || [], metrics: metrics.metrics || {}, events: events.items || [], activity: activity.items || [], realtime: realtime.metrics || {}, realtimeHistory: history.items || [], bottlenecks: realtime.bottlenecks || [], escalations: realtime.escalations || [], collaboration: realtime.collaboration || {} }))
      .catch(() => setState((prev) => ({ ...prev })))
  }, [])

  const dependencyNodes = useMemo(() => state.tasks.slice(0, 5).map((task) => ({ id: task.id, label: task.task_type, deps: task.execution_dependencies || [] })), [state.tasks])

  return <div className="workforce-center">
    <PageHeading eyebrow="AI Workforce" title="AI Workforce Control Center" copy="Live orchestration of AI workers, tasks, collaboration, and approval-gated execution." />
    <Panel className="workforce-safety-banner"><strong>Safety Banners</strong><div className="safety-pills">{safetyLabels.map((label) => <span key={label}>{label}</span>)}</div></Panel>
    <section className="workforce-grid">
      <Panel><h3>Live Workforce Activity Stream</h3>{state.activity.slice(0, 8).map((item) => <p key={item.id}>{item.event_type} · {item.summary}</p>)}</Panel>
      <Panel><h3>Realtime Collaboration</h3><p>Started: {state.collaboration.started || 0}</p><p>Completed: {state.collaboration.completed || 0}</p></Panel>
      <Panel><h3>Execution Graph</h3>{dependencyNodes.map((node) => <p key={node.id}><b>{node.label}</b> → {(node.deps || []).join(', ') || 'no blockers'}</p>)}</Panel>
      <Panel><h3>Bottleneck Detection</h3>{state.bottlenecks.length ? state.bottlenecks.map((b) => <p key={b.id}>Assignment {b.id} · {b.status}</p>) : <p>No bottlenecks detected</p>}</Panel>
      <Panel><h3>Escalation Chains</h3>{state.escalations.length ? state.escalations.map((e) => <p key={e.id}>{e.event_type} · {e.published_at}</p>) : <p>No escalation chains detected</p>}</Panel>
      <Panel><h3>AI Swarm Coordination</h3><p>Active assignments: {state.realtime.activeAssignments || 0}</p><p>Throughput (24h): {state.realtime.throughput24h || 0}</p><p>Collaboration sessions: {state.realtime.collaborationSessions || 0}</p></Panel>
      <Panel><h3>Realtime Metrics Snapshots</h3><p>Latest computed at: {state.realtime.timestamp || 'n/a'}</p><p>History snapshots: {state.realtimeHistory.length}</p><p>Source: {state.realtime.source || 'realtime_workforce_operations'}</p></Panel>
      <Panel><h3>Event Timeline</h3>{state.events.slice(0, 6).map((event) => <p key={event.id}>{event.event_type} · {event.severity}</p>)}</Panel>
      <Panel><h3>Worker Activity Pulses</h3>{state.agents.map((w) => <p key={w.id}>{w.role} · {w.status} · load {w.workload}</p>)}</Panel>
      <Panel><h3>Collaboration Links</h3>{state.activity.filter((i) => String(i.event_type || '').includes('collaboration')).map((i) => <p key={i.id}>{i.event_type} ↔ {i.worker_id || 'swarm'}</p>)}</Panel>
      <Panel><h3>Execution Plan Status Graph</h3>{state.plans.map((p) => <p key={p.id}>{p.task_type} · {p.status}</p>)}</Panel>
      <Panel><h3>Bottleneck Cards</h3><p>Detected: {state.realtime.bottlenecksDetected || 0}</p></Panel>
      <Panel><h3>Escalation Cards</h3><p>Detected: {state.realtime.escalationsDetected || 0}</p></Panel>
    </section>
  </div>
}
