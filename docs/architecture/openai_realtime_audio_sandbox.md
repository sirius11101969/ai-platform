# OpenAI Realtime Audio Sandbox

## Safety model
- Sandbox is opt-in and disabled by default.
- Explicit workspace allowlist is required.
- Explicit user confirmation is required before local audio may be attached.
- Browser never receives OpenAI API key; backend issues ephemeral session metadata.
- Simulation mode remains active as fallback whenever sandbox is denied or disabled.

## Feature flag rollout
- `OPENAI_REALTIME_AUDIO_SANDBOX_ENABLED=false`
- `OPENAI_REALTIME_AUDIO_SANDBOX_WORKSPACE_ID=`
- `OPENAI_REALTIME_AUDIO_REQUIRE_CONFIRMATION=true`

Recommended rollout:
1. Enable in staging for one workspace only.
2. Validate event logs and stop flow.
3. Expand to internal QA workspaces.
4. Keep default disabled for general users.

## Consent flow
1. User opens AI Live Streaming page.
2. User checks explicit confirmation.
3. User clicks **Start Sandbox Audio Session**.
4. Backend validates feature flags + workspace + confirmation.
5. If allowed, frontend bridge can attach local track; if denied, simulation continues.
6. User can stop session any time.

## Future production rollout checklist
- Add formal policy/consent copy review.
- Add workspace-level admin controls and audit exports.
- Add token/audio usage observability and alerting.
- Add abuse/rate-limit controls.
- Run penetration and privacy review.
