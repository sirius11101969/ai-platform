# Realtime AI Voice Core Foundation

## Current scope

The Realtime AI Voice Core is a simulation-only foundation for future live AI conversations. It intentionally does **not** connect telephony, place outbound calls, or open microphone streams.

Safety guarantees in this release:

- Simulation Mode only.
- No real telephony traffic.
- No real microphone streaming.
- Mock transport: `mock_stream`.
- Mock provider: `mock_realtime_provider`.

## Architecture overview

```text
Frontend AI Realtime Voice page
        |
        v
/api/ai/realtime-voice/session
        |
        v
RealtimeVoiceSessionManager
        |
        +--> ai_realtime_voice_sessions
        +--> RealtimeVoiceStateMachine
        +--> RealtimeVoiceStreamingService
        +--> RealtimeVoiceEventBus
        +--> ai_realtime_voice_events
        +--> CRM lead timeline
        +--> Revenue Brain scoring refresh
```

Core backend modules:

- `realtimeVoiceSessionManager.js` owns session creation, persistence, CRM timeline events, and Revenue Brain refreshes.
- `realtimeVoiceStreamingService.js` simulates streaming lifecycle events, partial transcripts, finalized transcripts, AI response chunks, interruptions, resumes, and latency metrics.
- `realtimeVoiceEventBus.js` provides internal `publish`, `subscribe`, and per-session subscription support.
- `realtimeVoiceStateMachine.js` validates realtime conversation states and transitions.

## Mock streaming lifecycle

The simulation persists every event in `ai_realtime_voice_events` and follows this flow:

1. `session_start`
2. `listening`
3. partial transcript events
4. `ai_processing`
5. finalized transcript
6. `speaking`
7. AI response chunk
8. `interruption`
9. `resume`
10. `ai_processing`
11. `speaking`
12. more AI response chunks
13. latency metric
14. `completed`

## State machine

Supported in-memory states:

- `idle`
- `listening`
- `processing`
- `speaking`
- `interrupted`
- `reconnecting`
- `completed`
- `failed`

Database statuses are intentionally compact for dashboards:

- `initializing`
- `listening`
- `speaking`
- `interrupted`
- `completed`
- `failed`

## Data model

### `ai_realtime_voice_sessions`

Stores workspace, lead, optional legacy voice call linkage, status, provider/transport, metadata, latency, and lifecycle timestamps.

### `ai_realtime_voice_events`

Stores the ordered per-session event stream. Payloads are JSONB so future providers can add audio, token, trace, WebRTC, or SIP metadata without a schema rewrite.

## CRM integration

The session manager writes three lead timeline events:

- `realtime_voice_started`
- `realtime_voice_interrupted`
- `realtime_voice_completed`

These events are designed to appear alongside CRM, Telegram, email, sequences, and existing AI Voice Outreach events.

## Revenue Brain integration

Completed realtime simulations influence Revenue Brain through persisted realtime session signals:

- Engagement score lift from completed realtime sessions.
- Additional lift when interruption handling is observed, indicating live conversational engagement.
- Close probability and churn risk adjustments from completed realtime voice sessions.
- Qualification confidence proxy through higher engagement, priority score, and hot lead scoring.

The Revenue Brain service queries `ai_realtime_voice_sessions` alongside existing `ai_voice_calls` and timeline signals.

## Latency strategy

This release records mock end-to-end latency in milliseconds for every major lifecycle event. Future production latency tracking should split metrics into:

- Client capture latency.
- Network jitter and packet loss.
- Speech-to-text partial latency.
- Model response first-token latency.
- Text-to-speech first-audio latency.
- Barge-in detection latency.
- Provider round-trip latency.
- CRM persistence latency.

Operational targets for the future live stack:

- First partial transcript under 300 ms after speech segment boundaries.
- First AI response token under 800 ms after finalized user intent.
- First synthesized audio under 1200 ms for normal turns.
- Interruption detection under 250 ms.

## Interruption handling

The mock state machine validates a barge-in flow from `speaking` to `interrupted`, then back to `listening`, `processing`, and `speaking`. In future live mode, interruption handling should:

1. Stop outbound audio playback immediately.
2. Preserve the interrupted AI utterance in the event stream.
3. Mark the user interruption transcript span.
4. Re-plan the AI response from the new user intent.
5. Resume speaking only after the new response is ready.

## OpenAI Realtime roadmap

Future OpenAI Realtime work should add a provider adapter behind the session manager while keeping the current state machine and event bus stable.

Planned phases:

1. Add provider interface for session creation, event normalization, and shutdown.
2. Map provider events into internal event types (`transcript_partial`, `transcript_final`, `ai_response_chunk`, `interruption`, `latency_metric`).
3. Add model and voice configuration in `session_metadata`.
4. Add safety controls for consent, recording policy, and human takeover.
5. Add production observability: trace IDs, provider request IDs, token/audio usage, and failure taxonomy.

## WebRTC roadmap

WebRTC should become the browser-to-realtime-provider transport after explicit product approval.

Planned phases:

1. Add frontend device-permission UX with clear consent and recording language.
2. Create ephemeral session token endpoint.
3. Establish peer connection from browser to realtime provider.
4. Stream audio tracks and data-channel events.
5. Normalize WebRTC stats into latency metrics.
6. Add reconnecting state support for ICE restarts and dropped connections.

## Twilio SIP roadmap

Telephony must remain disabled until a later release. When approved, Twilio SIP should be isolated as a transport adapter, not embedded in business logic.

Planned phases:

1. Add inbound-only SIP sandbox for QA numbers.
2. Require workspace-level telephony enablement and compliance flags.
3. Add outbound call guardrails, rate limits, consent, and do-not-call checks.
4. Map SIP media events to the internal realtime event bus.
5. Add call recording controls and retention policy.
6. Add human transfer and emergency stop workflows.

## Compatibility

The core is additive. It does not replace or alter existing AI Voice Outreach mock calls, Revenue Intelligence UI, AI Workers, AI Sequences, Redis orchestration, autonomous execution, or OpenAI execution paths.
