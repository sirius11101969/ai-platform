# AS6 AI Action Engine Root Cause P5

Root cause: P4 added AI Context Engine, but AI could only read context and could not safely execute governed platform actions.

Risk: AI remains passive and cannot drive CRM workflows through a consistent capability/policy-controlled action layer.

Repair: add AI Action Engine with action registry, policy validation, AI context injection and CRM reference actions.
