# OpenAI Realtime + WebRTC Foundation (Simulation Mode)

## Scope
This foundation introduces production-ready transport architecture for future live AI conversations while explicitly staying in simulation mode.

## Safety guardrails
- Simulation Mode only.
- No real microphone capture.
- No real telephony or SIP call placement.
- No OpenAI realtime audio streaming yet.

## Backend architecture
- `webRtcSessionManager.js`: internal event streaming abstraction (`publish`, `subscribe`) with session channels.
- `realtimeSessionRegistry.js`: in-memory lifecycle registry and state synchronization.
- `openaiRealtimeAdapter.js`: provider abstraction with simulation methods (`createSession`, `updateSession`, `closeSession`, `mockAudioChunk`, `mockTranscriptEvent`).
- `realtimeAudioRouter.js`: SDP/ICE negotiation placeholders and peer connection abstraction.
- `realtimeTransportGateway.js`: orchestration layer, persistence, state transitions, event publishing, and Revenue Brain trigger.

## Realtime pipeline
Browser simulation -> negotiation simulation -> mock transcript/audio chunk events -> interruption event -> response chunks -> complete.

## Metrics tracked
- Avg latency
- Interruption recovery count
- Transcript lag (simulated)
- Response chunk timing (simulated)
- Session duration

## Integration roadmap
1. **OpenAI Realtime API**: replace adapter simulation internals with authenticated session creation and realtime transport streaming.
2. **WebRTC roadmap**: wire browser `RTCPeerConnection`, ICE trickle exchange, and secure SDP exchange APIs.
3. **Twilio SIP roadmap**: add SIP bridge service with policy-based routing between browser-native and telephony transports.
4. **WebSocket/SSE strategy**: keep event interface stable (`publish/subscribe`) and add channel fanout adapters for ws/SSE.
5. **Low-latency strategy**: regional media relays, adaptive chunking, and QoS-aware session routing.
