# Browser Microphone Capture Foundation (Local-Only)

## Objective
This phase introduces a browser microphone capture foundation for AI Live Streaming while enforcing strict local-only safety controls.

## Local-Only Security Guarantees
- Audio is captured in-browser via `navigator.mediaDevices.getUserMedia({ audio: true })`.
- No microphone PCM frames are posted to backend APIs.
- No server-side microphone persistence is added.
- No OpenAI Realtime audio ingress is active in this phase.
- Safety badges in the UI explicitly state:
  - Local Browser Audio Only
  - Simulation Mode
  - Audio Not Sent To AI

## Browser Security Model
- Capture requires explicit user permission from the browser permission prompt.
- Denied permission is surfaced in UI status and handled gracefully.
- Unsupported browsers and missing device capability are surfaced as non-fatal states.
- Mute/unmute manipulates local track state only (`MediaStreamTrack.enabled`).

## Event Architecture
Local microphone events are emitted into the same live timeline reducer used by SSE events:
- `microphone_enabled`
- `audio_activity_detected`
- `user_speaking_started`
- `user_speaking_stopped`
- `microphone_muted`
- `microphone_unmuted`

This preserves compatibility with existing realtime transport and UI event patterns.

## Current Scope
Implemented in `frontend/src/services/microphone`:
- permission service
- microphone manager lifecycle
- audio level monitor for speaking/activity detection
- waveform bin renderer for animated local visualization

## Future OpenAI Realtime Integration
Planned next phase:
1. Pipe browser audio frames into a dedicated realtime transport abstraction.
2. Add explicit consent and additional safety controls for external streaming.
3. Integrate with OpenAI Realtime input APIs only behind feature flags.
4. Preserve timeline events while adding true remote audio acknowledgements.

## Future WebRTC Audio Pipeline
Planned WebRTC phase:
- Replace simulated frame generation with real `AudioContext` + `AnalyserNode` loop.
- Add optional peer connection uplink path for approved scenarios.
- Keep local metering/waveform and interruption hooks unchanged.
