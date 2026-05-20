# Realtime AI Workforce Operations

## Event bus architecture
The realtime operations layer uses `workforceEventBus` to validate and publish workforce events (`worker_activity_*`, `worker_collaboration_*`, `execution_plan_updated`, escalation and bottleneck events). Event publication is routed through `workforceRealtimeOperationsService` for persistence and structured logging.

## Activity stream
`ai_workforce_events` is the immutable event log. `ai_workforce_activity_stream` is the UI-facing stream projection for timeline and collaboration views.

## Realtime metrics
`ai_workforce_realtime_metrics` stores computed rolling metrics snapshots: throughput, active assignments, bottlenecks, escalations, and collaboration sessions.

## Swarm coordination roadmap
- Expand execution graph lineage by linking tasks, plans, and dependencies.
- Add per-swarm channel metrics and team-level workload balancing.
- Add proactive policy-safe collaboration nudges.

## Safety governance
The layer is monitoring-first:
- Human Governed Workforce
- Realtime Monitoring Only
- Approval Required For Execution
- No Autonomous Outreach

Simulation endpoint `/api/ai/workforce/simulate-activity` creates safe demo events only, with no external outreach and no real customer actions.
