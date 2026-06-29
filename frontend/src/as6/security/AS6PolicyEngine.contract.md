# AS6 Policy Engine Contract V115

Stage: AS6_POLICY_ENGINE_V115

Purpose:
- Add declarative access policies above Permission Engine.
- Support RBAC/ABAC-ready inputs: role, capability, service, livingSpace and context.
- Deny by default when no policy matches.

Required:
- as6PolicyEngine.js exports as6PolicyRegistry.
- as6PolicyEngine.js exports evaluateAS6Policy.
- as6PolicyEngine.js exports canAccessAS6Capability.
- as6PolicyEngine.js validates policies.

Validation:
- AS6_POLICY_ENGINE_V115=PASS
