# AI Execution Layer

## Execution governance
The AI Execution Layer enforces **Human Approved Execution Only** and blocks autonomous outbound outreach. Every execution request passes policy validation and approval checks before any run starts.

## Approval-to-execution lifecycle
1. Action is queued in `ai_execution_queue` with status `queued`.
2. Engine validates approval state (`approval_status = approved`) and workspace isolation.
3. Policy engine enforces expiration/revocation checks.
4. Execution run is created in `ai_execution_runs` and routed via orchestrator.
5. Structured audit events are persisted in `ai_execution_audit_log`.

## AI workforce orchestration
Foundation routing supports:
- AI worker assignment
- execution routing abstraction
- future async execution support

## Policy engine
Mandatory rules:
- requires approval
- requires workspace match
- requires valid approval status
- deny expired approvals
- deny revoked approvals

## Audit model
Stored fields include executor, originating approval, policy result, payload, timestamps, and failure reasons.
Structured logs:
- `ai_execution_validated`
- `ai_execution_denied`
- `ai_execution_started`
- `ai_execution_completed`
- `ai_execution_failed`

## Future autonomous execution roadmap
Autonomous execution remains disabled for outreach. Future phases may add async workers and constrained autonomous tasks with explicit policy guardrails and simulation-first rollout.
