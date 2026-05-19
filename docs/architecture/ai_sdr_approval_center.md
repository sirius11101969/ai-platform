# AI SDR Approval Center

## Human-in-the-loop governance
All outbound or CRM-impacting recommendations remain suggestion-only. Human manager approval is required before any operational execution.

## Approval lifecycle
`pending_approval` → `approved` / `rejected` / `snoozed` / `escalated`.
Additional action: `assign_manager` to reroute ownership while preserving pending state.

## Audit architecture
Three persistence layers:
- `ai_approval_queue`: current recommendation state and payload.
- `ai_approval_decisions`: manager decisions and transition reasons.
- `ai_approval_audit_log`: immutable audit events with previous/new status.

## Enterprise compliance model
- Explicit safety labels: Human Approval Required, Suggestion Only, No Automatic Outreach, Audit Logging Enabled.
- Every decision carries actor, timestamp, reason, and transition context.
- Queue includes workspace and lead provenance for tenant-safe traceability.

## Future autonomous operations roadmap
Phase 1 (current): full manual governance.
Phase 2: policy-assisted approvals with constrained auto-routing.
Phase 3: scoped autonomy for low-risk internal-only recommendations, still audit-first.
