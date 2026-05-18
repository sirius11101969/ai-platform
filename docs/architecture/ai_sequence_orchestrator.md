# AI Follow-Up Sequence Orchestrator

## Purpose

The AI Follow-Up Sequence Orchestrator turns a single lead follow-up into a governed, multi-step sales sequence. It keeps the existing autonomous execution loop, Redis/Postgres queueing, OpenAI execution, cooldown engine, CRM timeline, and AI Workers approval UI intact while adding sequence-level state.

## Lifecycle

1. **Lead enters a sequence** through `POST /api/ai/sequences/start`.
2. The orchestrator creates an `ai_lead_sequences` row with `status=active`, `current_step=0`, and a first `next_run_at` based on the first template step delay.
3. The autonomous execution loop scans due active sequences.
4. Before queueing work, the orchestrator checks stop conditions and the existing follow-up cooldown engine.
5. A due step becomes an `ai_execution_jobs` row with `job_type=sales_sequence_step_generation` and payload:

   ```json
   {
     "leadSequenceId": "...",
     "step": 2
   }
   ```

6. The AI execution runner generates a safe customer-facing message.
7. The generated message is inserted into `ai_worker_queue` with `status=pending_approval` and is never auto-sent.
8. After a manager sends/executes the AI Worker item, the orchestrator schedules the next step using the next step delay.
9. The sequence completes after the final step is sent or stops immediately when a stop condition appears.

## Database model

- `ai_sequence_templates` stores workspace-owned sequence definitions and channel defaults.
- `ai_sequence_steps` stores ordered step metadata: delay, goal, tone, and generation instructions.
- `ai_lead_sequences` stores per-lead runtime state: status, current step, next run timestamp, last generation timestamp, and stop reason.

The default seeded template is **Enterprise Demo Follow-up** with four steps:

1. Friendly reconnect
2. Demo proposal
3. Business value reminder
4. Gentle final follow-up

## Orchestration behavior

The autonomous execution loop invokes the sequence orchestrator before dispatching queued AI jobs. The orchestrator:

- reconciles sequences waiting on manager approval/sending;
- schedules the next step only after the previous sequence AI Worker item is `completed` or `executed`;
- scans due `active` sequences with `next_run_at <= NOW()`;
- uses idempotency keys per sequence step to prevent duplicate execution jobs;
- reschedules instead of generating when the cooldown engine reports a recent outbound message;
- stops safely when the lead replied, booked a meeting, was won/lost, or unsubscribed.

## AI reasoning flow

The `sales_sequence_step_generation` runner builds a constrained prompt from safe context only:

- lead public fields such as name, company, source, status, and next step;
- recent timeline event summaries;
- prior generated sequence messages;
- sequence template name;
- current step goal, tone, and instructions.

The model is instructed to return message text only. The runner performs a second safety pass before creating an AI Worker queue item.

## Approval flow

Every generated sequence step creates an AI Worker queue item with:

- `status=pending_approval`;
- `action_type=sales_sequence_followup_draft`;
- payload source `sales_sequence_step_generation`;
- `noAutoSend=true`;
- a recommendation explaining why that step was generated.

No sequence message is sent automatically by this orchestrator.

## Safety rules

Sequence generation blocks or strips unsafe output. Messages must be no longer than 700 characters and must not include:

- spammy pressure;
- fake urgency;
- internal CRM data;
- AI terminology;
- hallucinated promises;
- hidden scoring, priority, or risk fields.

## Stop conditions

A running sequence stops when any of these conditions are detected:

- customer reply timeline events;
- meeting booked/scheduled timeline events;
- lead status or stage becomes `booked`, `won`, or `lost`;
- lead metadata indicates an unsubscribe or opt-out.

Stop events are written to the lead timeline with `ai_sequence_stopped` and a machine-readable reason.

## Timeline events

The orchestrator writes these events:

- `ai_sequence_started`
- `ai_sequence_step_generated`
- `ai_sequence_paused`
- `ai_sequence_completed`
- `ai_sequence_stopped`

## Dashboard support

`GET /api/ai/sequences/active` returns:

- active sequences;
- upcoming steps;
- stopped and completed sequences;
- completion rate;
- aggregate counts.

This keeps live dashboard support separate from the AI Workers UI while reusing queue statuses for approval/sending progress.

## Scaling roadmap

Near-term improvements:

- add per-template channel variants and workspace-level quiet hours;
- add sequence analytics by template, step, and manager approval rate;
- add richer reply classification so stop reasons distinguish objections, out-of-office replies, and buying intent;
- add configurable cooldown windows by workspace and channel;
- add UI controls to edit sequence templates and step delays.

Long-term autonomous deal management:

- have the system recommend sequence enrollment based on lead intelligence;
- coordinate follow-up, meeting scheduling, collateral sending, and next-best-action recommendations under a single deal plan;
- pause or adapt sequences when a deal risk forecast changes;
- propose manager-approved deal actions such as stakeholder mapping, pricing follow-up, and procurement nudges;
- preserve the same safety posture: human approval before outbound customer communication.
