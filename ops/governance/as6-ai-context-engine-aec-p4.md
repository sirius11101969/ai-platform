# AS6 AI Context Engine AEC P4

Failure classes:
- AS6_AI_CONTEXT_DRIFT
- AS6_AI_CONTEXT_PROVIDER_GAP
- AS6_AI_CONTEXT_CONSUMER_GAP
- AS6_AI_CONTEXT_ISOLATION_GAP
- AS6_CRM_AI_CONTEXT_PUBLISH_GAP

AEC rules:
- Living Spaces must publish AI-readable context through AI Context Engine.
- AI consumers must read context through AI Context Bridge.
- CRM Runtime must publish current CRM context.
- AI context must provide snapshot and merged context APIs.
