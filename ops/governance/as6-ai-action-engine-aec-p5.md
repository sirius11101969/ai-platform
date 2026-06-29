# AS6 AI Action Engine AEC P5

Failure classes:
- AS6_AI_ACTION_ENGINE_DRIFT
- AS6_AI_ACTION_VALIDATION_FAILED
- AS6_AI_ACTION_POLICY_DENIED
- AS6_AI_ACTION_CONTEXT_GAP
- AS6_CRM_AI_ACTION_REGISTRATION_GAP

AEC rules:
- AI actions must be registered before execution.
- AI action requests must pass Policy Engine checks.
- AI actions must consume AI Context Engine context.
- CRM AI actions must register through CRM Living Space Runtime.
