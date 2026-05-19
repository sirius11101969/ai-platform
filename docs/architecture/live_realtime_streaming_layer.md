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
  - `GET /api/ai/live-stream/sessions/:id/stream` (SSE)

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
