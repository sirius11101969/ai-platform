# OpenAI Realtime Ephemeral Session Flow (Simulation-first)

This architecture adds secure, short-lived browser session orchestration for future OpenAI Realtime audio, without sending microphone audio to OpenAI yet.

## Security architecture
- Backend-only token minting (OpenAI key never reaches browser).
- Signed session IDs + short-lived browser token.
- Origin validation and replay-nonce protection.
- No raw microphone audio persistence.

## Ephemeral auth flow
1. Browser requests `/api/ai/openai-realtime/ephemeral-session`.
2. Backend issues signed session ID + TTL metadata + capability manifest.
3. Browser tracks expiration and refreshes via `/refresh` before expiry.
4. Refresh transitions session lifecycle and updates metrics.

## Session lifecycle states
`session_created -> negotiation_prepared -> browser_ready -> session_refresh -> reconnecting -> expired -> closed`

## Future integration path
Browser mic -> WebRTC transport -> OpenAI Realtime API -> bidirectional audio stream.

Current phase intentionally keeps transport simulation-only; no external raw audio delivery.

## WebRTC roadmap
- Add negotiated SDP exchange endpoint.
- Bind ephemeral sessions to transport peers.
- Attach codec/capability filters and media policy checks.

## Realtime audio roadmap
- Add secure server relay for realtime control channel.
- Add opt-in audio egress gates and policy checks.
- Add redaction-aware observability (no raw audio logs).
