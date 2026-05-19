# WebRTC Negotiation Flow Foundation

## Purpose
This document defines the browser-safe WebRTC negotiation foundation for AI Live Streaming. It prepares peer connection setup without enabling real OpenAI audio streaming.

## Browser WebRTC Flow
1. User starts Live Simulation and obtains ephemeral session metadata from `/api/ai/openai-realtime/ephemeral-session`.
2. User explicitly enables microphone.
3. Frontend creates `RTCPeerConnection` through `webrtcPeerConnectionManager`.
4. Local microphone audio track is attached only after explicit user enablement.
5. Frontend creates local SDP offer.
6. When `providerMode=simulation`, frontend applies a simulated SDP answer.
7. ICE candidates are observed and counted locally.
8. Connection lifecycle states are exposed in UI.
9. User can close WebRTC connection to cleanup tracks/senders/state.

## Safety Model
- Default behavior keeps `noAudioSentToOpenAi=true`.
- No real remote media path is enabled.
- No real provider negotiation is attempted in default simulation mode.
- Microphone capture remains local and user-initiated.

## Simulation vs Real Transport
- **Simulation** (current): local offer + simulated answer, UI observability, no OpenAI media streaming.
- **Real transport** (future): gated feature flag, explicit opt-in, remote answer from provider, secure TURN/STUN strategy.

## OpenAI Realtime Future Integration
Future iteration can reuse this negotiation foundation by replacing simulated answer path with provider answer exchange after ephemeral session creation. This keeps API key server-side and uses ephemeral credentials only.

## Next-step roadmap
1. Add explicit `realtimeAudioEnabled` feature flag.
2. Implement provider answer exchange route (server mediated).
3. Add secure ICE server policy and telemetry.
4. Add end-to-end browser integration tests.
5. Add production-safe mute and stream pause controls for live sessions.
