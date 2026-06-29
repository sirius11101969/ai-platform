# AS6 Policy Engine AEC V115

Failure classes:
- AS6_POLICY_ENGINE_DRIFT
- AS6_POLICY_INPUT_INCOMPLETE
- AS6_POLICY_NO_MATCH
- AS6_POLICY_CAPABILITY_UNKNOWN
- AS6_POLICY_SERVICE_UNKNOWN
- AS6_PERMISSION_ENGINE_DENIED

AEC rules:
- Access decisions must use AS6 Policy Engine for enterprise flows.
- Policy Engine must deny by default.
- Policies must reference registered capabilities and services.
- Policy evaluation must integrate Permission Engine.
