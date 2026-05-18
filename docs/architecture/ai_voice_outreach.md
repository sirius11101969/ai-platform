# AI Voice Outreach Architecture

## Scope

AI Voice Outreach is the mock-mode foundation for autonomous calling agents. The system lets the platform decide that voice is the next best action, enqueue a `voice_outreach_call` execution job, simulate a call internally, persist transcript and analysis, update CRM timeline events, and feed the Revenue Brain without sending real telephony traffic.

## Current safety boundary

- Mock provider only (`mock_provider`).
- No real phone numbers are auto-called.
- No PSTN/SIP/WebRTC telephony traffic is sent.
- Legal compliance is not faked or represented as complete.
- ElevenLabs and OpenAI Realtime provider folders exist as disabled abstractions for future work.

## Data model

### `ai_voice_calls`

Stores one simulated or future real call lifecycle:

- workspace, lead, optional sequence reference
- provider and lifecycle status (`queued`, `dialing`, `active`, `completed`, `failed`, `rejected`)
- phone number, timestamps, duration
- transcript, summary, sentiment, outcome, next action
- recording URL placeholder and metadata

### `ai_voice_call_events`

Append-only call event ledger for lifecycle and observability:

- `queued`
- `dialing`
- `active`
- `transcript_stored`
- `analysis_completed`
- future provider webhooks

## Execution jobs

- `voice_outreach_call`: starts a mock-mode AI voice call and completes the simulated lifecycle.
- `voice_call_analysis`: re-runs deterministic call analysis against a persisted transcript.

Both job types run through the existing autonomous execution runner so Redis orchestration, worker metrics, retries, and execution logs remain compatible.

## Provider abstraction

Providers live under `backend/src/providers/voice/`:

- `mock_provider`: deterministic internal simulator that returns a realistic transcript, duration, metadata, and no recording URL.
- `elevenlabs`: disabled placeholder for future voice/audio capability.
- `openai_realtime`: disabled placeholder for future realtime conversational sessions.

The current provider contract exposes `startCall({ lead, phoneNumber, context })` and must return transcript, duration, provider metadata, and recording information. Future real providers should add explicit compliance gates before any traffic is sent.

## VoiceOutreachService responsibilities

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

## CRM integration

AI voice events are written to `lead_timeline_events`, allowing the CRM activity stream to show call starts, completions, failures, and follow-up recommendations. Timeline metadata always marks mock mode and records the voice call id.

## AI Sequences integration

Sequence templates can use `channel = voice`. When a due active sequence step is evaluated, the orchestrator enqueues `voice_outreach_call` instead of a text draft generation job. The voice call payload carries the lead, sequence id, step, provider `mock_provider`, and mock-mode safety flags.

## AI Revenue Brain integration

Revenue Intelligence reads recent `ai_voice_calls` and treats completed/positive calls as engagement signals. Voice results can raise engagement score, close probability, lead priority, and set `recommended_channel = voice` when the call indicates voice is the best next action.

## API

Protected by the existing JWT/workspace middleware or the internal admin key with an explicit workspace id:

- `POST /api/ai/voice/call`
- `GET /api/ai/voice/calls`
- `GET /api/ai/voice/calls/:id`

All responses include mock-mode safety metadata.

## UI

The AI Voice Outreach dashboard shows:

- queued calls
- active calls
- completed calls
- positive sentiment count
- recent call table with status, sentiment, outcomes, next actions, durations, and timestamps

## Future telephony roadmap

1. Add an explicit workspace-level telephony enablement flag with admin-only controls.
2. Add compliance configuration: caller identity, business purpose, consent/opt-out records, jurisdictional policy checks, call windows, and DNC suppression.
3. Add provider webhook ingestion for ringing, answered, transcript deltas, recording completion, and call failures.
4. Add human approval gates before first live calling.
5. Add realtime monitoring and emergency stop controls.
6. Add analytics for connect rate, qualification rate, opt-outs, and booked meetings.

## Realtime voice architecture roadmap

A future live implementation should separate:

- decisioning: Revenue Brain / next-best-action selects voice
- scheduling: execution job and call-window policy
- realtime session: OpenAI Realtime or equivalent agent session
- telephony bridge: SIP/WebRTC/PSTN provider
- transcript stream: partial and final transcript events
- safety monitor: policy and escalation checks
- CRM writer: summaries, next actions, timeline, revenue score updates

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
