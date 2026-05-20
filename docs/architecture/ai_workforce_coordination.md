# AI Workforce Coordination Layer

## Workforce orchestration architecture

The AI Workforce Coordination layer adds a policy-governed orchestration slice on top of existing AI Sales Brain, Autonomous SDR Loop, Approval Center, and AI Execution Layer. It introduces specialized worker roles, routing, load balancing, collaboration planning, and execution planning while preserving human approvals and auditability.

Core services:
- `workforceCoordinator.js`: end-to-end assignment + orchestration entrypoint
- `workforceTaskRouter.js`: skill-to-worker routing map
- `workforceAgentRegistry.js`: worker definitions, responsibilities, and statuses
- `workforceExecutionPlanner.js`: sequential, approval-gated plans
- `workforceCollaborationEngine.js`: multi-agent collaboration model
- `workforceAuditLogger.js`: structured governance logging
- `workforceLoadBalancer.js`: lowest-load assignment strategy

## Worker coordination model

Worker types supported:
- SDR Worker
- Closer Worker
- RevOps Worker
- Customer Success Worker
- Technical Consultant Worker
- Executive Assistant Worker

Statuses:
- idle
- assigned
- collaborating
- waiting_approval
- executing
- completed
- blocked

The coordinator routes each task to the best-fit role, chooses the least-loaded worker in that role, and prepares collaboration-aware plans if additional support workers are required.

## Collaboration engine

Collaboration supports:
- multi-worker plans
- sequential execution plans
- collaborative recommendations
- escalation chains

Realtime event contracts:
- `worker_assigned`
- `worker_collaboration_started`
- `execution_plan_generated`
- `workforce_task_completed`
- `workforce_escalation_detected`

## Governance model

Safety controls are explicit and always-on:
- Human Governed Workforce
- Approval Required For Execution
- Audit Logging Enabled
- No Autonomous Outreach

Structured logs:
- `ai_worker_assigned`
- `ai_worker_collaboration_started`
- `ai_execution_plan_created`
- `ai_workforce_task_completed`
- `ai_workforce_escalation_detected`

Persistence tables introduced in migration `035_ai_workforce_coordination.sql`:
- `ai_workforce_agents`
- `ai_workforce_tasks`
- `ai_workforce_assignments`
- `ai_workforce_collaboration_events`
- `ai_workforce_execution_plans`

## Future autonomous workforce roadmap

Current release deliberately blocks autonomous execution chains. Future phases can progressively allow constrained autonomy behind explicit governance milestones:
1. Policy simulation mode for autonomous sequences.
2. Scoped autonomy for non-outreach internal actions.
3. Runtime anomaly guardrails and rollback workflows.
4. Human override checkpoints at every escalation boundary.

## Workforce Control Center architecture

The Workforce Control Center adds a dedicated operations API and UI surface on top of existing orchestration persistence:

- `GET /api/ai/workforce/agents`
- `GET /api/ai/workforce/tasks`
- `GET /api/ai/workforce/assignments`
- `GET /api/ai/workforce/execution-plans`
- `GET /api/ai/workforce/metrics`

All routes are protected by the same authentication/workspace middleware chain used by AI Control Gateway and Approval Center, preserving workspace isolation and compatibility guarantees.

## Realtime workforce monitoring

The control center renders workforce event types as a live audit stream:

- `worker_assigned`
- `execution_plan_generated`
- `workforce_task_completed`
- `workforce_escalation_detected`
- `collaboration_started`

These events are designed to map directly to existing collaboration + audit flows without bypassing approval or execution policy gates.

## Workforce analytics model

The metrics model exposes:

- active workers, idle workers, assigned workers
- collaboration sessions
- pending approvals
- execution plans waiting approval
- workload distribution
- workforce utilization %
- approval bottlenecks, overloaded workers, idle capacity
- execution queue pressure and collaboration efficiency

This keeps manager visibility operational and safety-focused while staying in human-governed execution mode.

## Coordination visualization model

The control center UI visualizes workforce state using:

- workload progress bars per worker
- animated coordination status indicators
- dependency graph entries from `execution_dependencies`
- utilization cards for workforce pressure and capacity

The presentation layer is cosmetic only and does not alter orchestration decisions, routing rules, or approval enforcement.

## Realtime Operations Addendum
See `realtime_ai_workforce_operations.md` for the event bus, stream, metrics, and swarm coordination monitoring architecture.
