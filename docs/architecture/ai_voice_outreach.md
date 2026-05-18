# AI Voice Outreach Architecture

## Scope

AI Voice Outreach is the mock-mode foundation for autonomous calling agents. The system lets the platform decide that voice is the next best action, enqueue a `voice_outreach_call` execution job, simulate a call internally, persist transcript and analysis, update CRM timeline events, and feed the Revenue Brain without sending real telephony traffic.

## Current safety boundary

- Mock provider only (`mock_provider`).
- No real phone numbers are auto-called.
- No PSTN/SIP/WebRTC telephony traffic is sent.
- Legal compliance is not faked or represented as complete.
- The frontend must always show both safety labels: **Mock Mode** and **No real telephony traffic**.
- ElevenLabs and OpenAI Realtime provider folders exist as disabled abstractions for future work.

## Data model

### `ai_voice_calls`

Stores one simulated or future real call lifecycle:

- workspace, lead, optional sequence reference
- provider and lifecycle status (`queued`, `dialing`, `active`, `completed`, `failed`, `rejected`)
- phone number, timestamps, duration
- transcript, summary, sentiment, outcome, next action
- recording URL placeholder and metadata, including `qualificationLevel`

### `ai_voice_call_events`

Append-only call event ledger for lifecycle and observability:

- `queued`
- `dialing`
- `active`
- `transcript_stored`
- `analysis_completed`
- future provider webhooks

## Backend architecture

### Execution jobs

- `voice_outreach_call`: starts a mock-mode AI voice call and completes the simulated lifecycle.
- `voice_call_analysis`: re-runs deterministic call analysis against a persisted transcript.

Both job types run through the existing autonomous execution runner so Redis orchestration, worker metrics, retries, and execution logs remain compatible.

### Provider abstraction

Providers live under `backend/src/providers/voice/`:

- `mock_provider`: deterministic internal simulator that returns a realistic transcript, duration, metadata, and no recording URL.
- `elevenlabs`: disabled placeholder for future voice/audio capability.
- `openai_realtime`: disabled placeholder for future realtime conversational sessions.

The current provider contract exposes `startCall({ lead, phoneNumber, context })` and must return transcript, duration, provider metadata, and recording information. Future real providers should add explicit compliance gates before any traffic is sent.

### VoiceOutreachService responsibilities

`VoiceOutreachService` owns the orchestration boundary:

1. Validate workspace, lead, and phone availability.
2. Create `ai_voice_calls` records in queued status.
3. Record lifecycle events.
4. Start mock provider simulation.
5. Persist transcript and deterministic analysis.
6. Create CRM timeline events:
   - `ai_voice_call_started`
   - `ai_voice_call_completed`
   - `ai_voice_call_failed`
   - `ai_voice_followup_recommended`
7. Trigger Revenue Brain re-scoring so engagement, priority, and close probability can react to voice outcomes.

## UI architecture

### Navigation

The protected sidebar exposes **AI Voice Outreach** near AI Workers, Revenue Intelligence, and AI Sequences surfaces. The route is `/ai-voice-outreach` and uses the existing protected app shell and workspace headers.

### Voice dashboard page

`frontend/src/pages/AiVoiceOutreachPage.jsx` composes three UI zones:

1. **Executive metrics** — queued calls, active calls, completed calls, positive sentiment, and failed calls.
2. **Mock trigger and recommendations** — a lead selector plus **Start Mock Voice Call** button using `POST /api/ai/voice/call`, alongside recommended next actions extracted from completed call outcomes.
3. **Call ledger and detail modal** — a compact responsive table with Lead, Phone, Provider, Status, Sentiment, Outcome, Duration, and Created At. Selecting a row opens the detail modal.

The page uses `frontend/src/utils/aiVoiceOutreach.js` to normalize backend snake_case/camelCase responses into stable view models. This keeps dashboard rendering, detail rendering, mock-call payload creation, and empty-state behavior testable without requiring a browser runtime.

### Call detail modal

The detail modal shows:

- transcript
- AI summary
- qualification level
- sentiment, outcome, and next action
- metadata key/value pairs
- call timeline events from `ai_voice_call_events`

The modal repeats **Mock Mode** and **No real telephony traffic** so the safety boundary remains visible even after drilling into a single call.

### CRM integration

CRM lead payloads include `latestAiVoiceCall`, sourced from the latest `ai_voice_calls` record for that lead. Lead cards show the latest AI voice call sentiment, outcome/status, and next recommendation. The lead detail view includes an AI Voice Outreach panel with summary, qualification, sentiment, outcome, and next recommendation.

### Revenue Brain integration

Voice outcomes already flow into `aiRevenueIntelligenceService` during call completion. The UI now makes that signal visible in Revenue Brain/lead intelligence areas:

- `recommended_channel = voice` is rendered as **AI Voice**.
- The Revenue Intelligence lead card can show the latest voice sentiment/outcome as a Revenue Brain input.
- The AI recommendations panel includes the latest voice outcome and next recommendation when available.
- Engagement scoring remains backend-owned; completed positive calls continue to lift engagement and close probability through the existing Revenue Brain scoring path.

## API

Protected by the existing JWT/workspace middleware or the internal admin key with an explicit workspace id:

- `POST /api/ai/voice/call`
- `GET /api/ai/voice/calls`
- `GET /api/ai/voice/calls/:id`

All responses include mock-mode safety metadata.

## Testing strategy

Frontend unit coverage focuses on the stable view-model layer:

- dashboard rendering counts for queued, active, completed, positive, and failed calls
- call detail rendering for transcript, summary, qualification, metadata, and timeline
- mock call creation payload for `POST /api/ai/voice/call`
- explicit empty states

Backend compatibility is preserved by not changing the call execution contract, Redis job types, autonomous execution loop, sequence orchestration, or Revenue Brain public APIs.

## Future realtime roadmap

1. Add a workspace-level realtime voice feature flag and admin-only controls.
2. Add event streaming from the backend to the browser using SSE or WebSocket channels scoped by workspace and call id.
3. Stream call lifecycle events into the dashboard: queued, ringing, answered, transcript delta, analysis delta, completed, failed.
4. Add optimistic UI updates for queued mock calls while preserving server-of-record status from `ai_voice_call_events`.
5. Add supervisor controls: pause, abort, handoff, and mark compliance concern.
6. Add analytics: connect rate, average duration, positive sentiment rate, qualification rate, opt-out rate, booked-demo conversion, and revenue influence.

## Twilio/OpenAI Realtime integration roadmap

A future live implementation should remain behind explicit compliance and human-approval gates:

1. **Compliance foundation** — consent records, DNC suppression, call windows, caller identity, audit logging, opt-out handling, and jurisdiction policy checks.
2. **Twilio bridge** — provision numbers, validate webhooks, receive call status callbacks, and bridge media streams only for approved workspaces.
3. **OpenAI Realtime session** — create ephemeral realtime sessions per approved call, provide business-safe instructions, stream transcript deltas, and enforce escalation/stop rules.
4. **Telephony media path** — connect Twilio Media Streams or SIP/WebRTC bridge to the realtime model with interruption handling and timeout controls.
5. **Safety monitor** — real-time policy guard that can terminate calls, suppress unsafe content, and route to a human.
6. **Persistence** — write partial/final transcripts, summaries, sentiment, qualification, outcome, next action, and provider metadata to `ai_voice_calls` and `ai_voice_call_events`.
7. **CRM/Revenue updates** — update lead timeline, engagement scoring, recommendations, sequence progression, and follow-up tasks after final analysis.

## SDR orchestration roadmap

The autonomous SDR loop should become:

1. Lead score changes or sequence step becomes due.
2. AI selects `recommended_channel = voice` only when safe and valuable.
3. Manager approval or policy gate authorizes live call.
4. AI Voice Worker initiates call.
5. AI qualifies need, timeline, authority, and next step.
6. CRM timeline receives transcript, summary, outcome, and follow-up task.
7. Revenue Brain updates priority and forecast.
8. Sequences pause, advance, or switch channel based on call outcome.
