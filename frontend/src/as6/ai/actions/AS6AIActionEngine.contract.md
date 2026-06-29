# AS6 AI Action Engine Contract P5

Stage: AS6_PLATFORM_V2_AI_ACTION_ENGINE_P5

Purpose:
- Let AI execute governed platform actions.
- Register actions with capability, service and livingSpace metadata.
- Validate policy before execution.
- Use AI Context Engine during execution.

Required:
- registerAS6AIAction
- getAS6AIActions
- validateAS6AIActionRequest
- executeAS6AIAction
- getAS6AIActionEngineState
- CRM AI actions

Rules:
- AI actions must be registered.
- AI actions must reference a capability.
- AI actions must pass Policy Engine access checks.
- AI actions must receive AI Context.
