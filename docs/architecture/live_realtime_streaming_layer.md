# Live Realtime Streaming Layer

## Purpose
Adds a safe browser-first realtime streaming foundation for AI conversations using SSE (with future WebSocket readiness).

## Safety
- Simulation Mode
- No real microphone capture
- No real OpenAI audio streaming
- No real telephony

## Backend
- Service modules in `backend/src/services/liveRealtime/`:
  - `liveRealtimeGateway.js`
  - `liveRealtimeSessionService.js`
  - `liveRealtimeStreamBus.js`
  - `liveRealtimeTranscriptService.js`
- API endpoints:
  - `POST /api/ai/live-stream/session`
  - `GET /api/ai/live-stream/sessions`
  - `GET /api/ai/live-stream/sessions/:id`
  - `GET /api/ai/live-stream/sessions/:id/events`
  - `POST /api/ai/live-stream/sessions/:id/stream-token` (short-lived browser stream token)
  - `GET /api/ai/live-stream/sessions/:id/stream` (SSE)
    - emits unified `event: live_stream_event`
    - replays existing events first
    - streams incremental events from in-memory bus
    - sends heartbeat every 10s
    - auto-closes when `completed` event is emitted

## Simulation flow
`session_started -> user_audio_chunk_simulated -> partial_transcript -> ai_thinking -> ai_response_chunk -> interruption_detected -> resume_listening -> final_transcript -> completed`

## Persistence
Migration: `db/migrations/029_live_realtime_streaming.sql`
- `ai_live_stream_sessions`
- `ai_live_stream_events`

## Integrations
- AI Revenue Brain signal refresh after simulated completion.
- CRM timeline entry on session start.
- Optional linkage to Realtime Voice Core session via `realtime_voice_session_id`.

## SSE UI flow
1. Frontend calls `startLiveStreamSession()`.
2. Frontend requests a short-lived stream token (`/stream-token`).
3. Browser opens `EventSource` against signed stream URL query.
4. UI reducer ingests each `live_stream_event` and updates:
   - timeline
   - transcript
   - AI thinking / speaking indicators
   - interruption and resume badges
   - completed state and stream closure

## Browser auth model
- Standard API calls use JWT header auth.
- SSE browser calls use short-lived signed stream token in query because native `EventSource` does not support custom auth headers.
- `AI_EXECUTION_ADMIN_KEY` remains server-only and is never exposed to browser clients.

## Future WebSocket migration
- Keep event contract stable (`eventType`, payload, sessionId, createdAt) so SSE and WebSocket transports are swappable.
- Planned path: `/stream` SSE remains for compatibility while `/ws` channel is introduced for lower-latency bidirectional media transport.
