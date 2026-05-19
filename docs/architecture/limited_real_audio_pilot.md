# Limited Real Audio Pilot for OpenAI Realtime

## Rollout strategy
- Feature-flagged pilot via `OPENAI_REALTIME_AUDIO_PILOT_ENABLED=false` by default.
- Single-workspace authorization via `OPENAI_REALTIME_AUDIO_PILOT_WORKSPACE_ID`.
- Pilot can be activated only with explicit user consent (`confirmAudioStreaming=true`).
- Non-eligible sessions always fall back to simulation mode.

## Safety model
- Guard denies by default if pilot flag is off.
- Guard denies if authorized workspace is not configured.
- Guard denies for any workspace mismatch.
- Guard denies when explicit consent is absent.
- API key remains server-only; browser receives ephemeral session artifacts only.

## Timeout model
- Max duration is controlled by `OPENAI_REALTIME_AUDIO_MAX_SESSION_SECONDS` (default 180s).
- Frontend bridge starts a per-session timeout timer and moves state to `pilot_timeout`.
- Timeout always triggers cleanup: stop playback/tracks, close transport, update UI state.

## Consent architecture
- UI exposes explicit consent checkbox before connect.
- Backend re-validates consent regardless of UI state.
- Consent and pilot lifecycle events are persisted to `ai_openai_realtime_session_events`.

## Disconnect guarantees
- UI has explicit disconnect button at all times.
- Backend stop endpoint records disconnect events.
- Frontend cleanup path closes active media/transport and transitions to `pilot_disconnected`.

## Observability
- Structured log event name: `openai_realtime_audio_pilot_event`.
- Persisted events include: `pilot_requested`, `pilot_allowed`, `pilot_denied`, `pilot_connected`, `pilot_disconnected`, `pilot_timeout`, `pilot_failed`.
- Never log API keys, raw tokens, or raw audio payloads.

## Future production roadmap
1. Add server-enforced transport TTL and revocation checks.
2. Add workspace-level rate limits and concurrency caps.
3. Add richer realtime QoS/latency metrics and alerting.
4. Add staged rollout controls (allowlist cohorts, percentage rollout).
5. Add policy automation for enterprise approval workflows.
