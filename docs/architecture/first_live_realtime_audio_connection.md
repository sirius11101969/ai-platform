# First Live Realtime OpenAI Audio Connection

## Realtime audio architecture

The pilot path uses a browser `RTCPeerConnection` and ephemeral OpenAI client secret obtained from backend-only exchange. The browser never receives `OPENAI_API_KEY`; it receives scoped, short-lived credentials only.

## Browser WebRTC flow

1. User enables microphone.
2. User gives explicit pilot consent.
3. Frontend requests pilot session authorization.
4. Backend creates ephemeral OpenAI session only when pilot flag is enabled.
5. Frontend prepares peer connection, publishes local audio track, and attaches remote AI audio playback.
6. If unavailable, simulation fallback remains active.

## Interruption handling

When user speech is detected during AI playback, remote audio playback is stopped immediately, interruption event is emitted, and state transitions to `pilot_interrupted`.

## Timeout model

A hard timer based on `OPENAI_REALTIME_AUDIO_MAX_SESSION_SECONDS` forces disconnect and cleanup:
- close peer connection
- stop microphone tracks
- stop remote playback
- clear timers
- persist timeout event

## Pilot rollout strategy

- Default disabled.
- Allowlisted authorized workspace only.
- Explicit user consent required.
- One-click disconnect always visible.
- Structured audit events logged without secrets.

## Production readiness roadmap

- Add server-side RTC SDP mediation metrics.
- Add richer jitter/packet loss transport telemetry.
- Add automatic reconnect backoff with pilot safety gate.
- Expand test matrix in CI for browser media APIs.
