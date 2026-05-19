# OpenAI Realtime Ephemeral Session Flow (Simulation + Feature-Flagged Provider)

## Summary
The backend issues browser-safe ephemeral session credentials for AI Live Streaming.

- Default behavior remains **simulation**.
- Real OpenAI Realtime Sessions exchange is enabled only when `OPENAI_REALTIME_ENABLED=true`.
- Browser never receives `OPENAI_API_KEY`.

## Session creation flow
1. Browser requests `POST /api/ai/openai-realtime/ephemeral-session`.
2. Backend validates workspace auth + origin.
3. Backend checks feature flag and API key:
   - Disabled or missing key → simulation token path.
   - Enabled + key present → call OpenAI Realtime Sessions API.
4. If provider call fails, backend safely logs error and falls back to simulation.
5. Backend persists session row and bootstrap events.
6. Browser receives safe response with `clientSecret`, `session` metadata, and safety flags.

## Feature flag
- `OPENAI_REALTIME_ENABLED=false` (default): simulation mode.
- `OPENAI_REALTIME_ENABLED=true`: attempt provider session creation.

## Fallback behavior
Fallback to simulation happens when:
- Realtime flag is disabled.
- `OPENAI_API_KEY` is missing.
- OpenAI provider returns an error or malformed payload.

## Persistence safety model
Persisted for each session:
- provider mode (`simulation` / `openai`)
- model, voice
- expires_at, state
- token hash only (never raw token)
- safe metadata/capabilities

Never persisted or returned to browser:
- `OPENAI_API_KEY`
- provider auth secrets
- internal private prompts

## API response shape
```json
{
  "session": {
    "id": "...",
    "providerMode": "simulation|openai",
    "model": "gpt-4o-realtime-preview",
    "voice": "alloy",
    "expiresAt": "ISO-8601",
    "clientSecret": "ephemeral-token",
    "simulationMode": true,
    "capabilities": {}
  },
  "safety": {
    "noApiKeyExposed": true,
    "audioStreamingEnabled": false,
    "browserOnlyAudio": true
  }
}
```

## Future step: real audio streaming
Real browser-to-provider audio streaming remains a future step and must stay behind explicit product and safety approval. Current phase keeps microphone capture browser-local by default.
