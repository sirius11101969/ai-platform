# Unified AI Control Gateway

## Overview

`backend/src/middleware/aiControlGateway.js` provides a single auth/control layer for AI service routes that need either:

- standard JWT user authentication, or
- internal `x-ai-execution-key` automation authentication.

The gateway normalizes auth outputs into:

```js
req.aiControl = {
  authMode,
  workspaceId,
  userId,
  isAdminKey,
  isJwt,
  allowed,
}
```

## Current rollout

The gateway is now the first auth layer for Approval Center routes:

- `GET /api/ai/approval-center/queue`
- `POST /api/ai/approval-center/:id/approve`
- `POST /api/ai/approval-center/:id/reject`
- `POST /api/ai/approval-center/:id/snooze`
- `POST /api/ai/approval-center/:id/escalate`

Approval Center routes are mounted before broader `/api/ai` auth chains to prevent middleware-order collisions.

## Security model

### Admin-key path

- Uses `x-ai-execution-key` (or compatible key query fallback from existing runner auth logic).
- Requires `workspaceId` resolution by default (`x-workspace-id`, query/body `workspaceId` or `workspace_id`, params).
- Validates workspace existence in DB.
- Hydrates `req.user` as workspace owner and `req.workspace` as admin-scoped workspace.
- Denies requests when workspace context is missing or invalid.

### JWT path

- Uses existing `requireAuth` + `requireWorkspace` logic.
- Preserves user-scoped workspace isolation and role behavior.

## Structured logs

Gateway emits these structured events:

- `ai_control_gateway_workspace_resolved`
- `ai_control_gateway_auth_success`
- `ai_control_gateway_auth_denied`

These logs include method/path and, where available, workspaceId/userId/reason.

## Compatibility notes

The gateway intentionally reuses existing auth primitives (`requireAuth`, `requireWorkspace`, and internal admin-key validator) to avoid behavior drift.

Live Stream, OpenAI Realtime, Realtime Voice, Sequences, and Execution routes remain compatible with their current auth paths while Approval Center is migrated first.
