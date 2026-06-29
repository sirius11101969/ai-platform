# AS6 Policy Engine Root Cause V115

Root cause: V114 added Permission Engine, but access logic is still simple role-to-capability mapping.

Risk: enterprise access rules will need service, living space, context and deny-by-default policy enforcement.

Repair: add AS6 Policy Engine with declarative policies over Permission Engine and Capability Registry.
