# AI Workforce Command Graph

## Full AI Revenue Workflow Graph
Lead → AI Sales Brain → SDR Loop → Approval Center → Execution Layer → AI Workforce → Realtime Operations.

## Node/Edge Model
Node types:
- lead
- sales_brain
- sdr_loop
- approval
- execution
- workforce_task
- workforce_agent
- execution_plan
- realtime_event
- bottleneck
- metric

Each node includes id, type, label, status, priority, timestamp, payload summary, and source table.

Edge types:
- lead_to_sales_brain
- sales_brain_to_sdr
- sdr_to_approval
- approval_to_execution
- execution_to_workforce
- task_to_agent
- task_to_plan
- plan_to_event
- metric_to_bottleneck

## Governance Gates
- Human Governed Flow
- Approval Gates Active
- Execution Policy Enabled
- No Autonomous Outreach

Unified AI Control Gateway authentication is required for `GET /api/ai/workforce/command-graph`.

## Future Realtime Graph Roadmap
- Live streaming edge updates over SSE.
- Time-window diff view for bottlenecks.
- Role-level workload heatmaps.
- Predictive bottleneck alerts from trend metrics.
