# AS6 Active Context Bar Control Alias AEC V94B

Failure classes:
- AS6_CONTROL_DEPENDENCY_NAME_DRIFT
- AS6_LEGACY_CONTROL_ALIAS_MISSING
- AS6_CONTEXT_BAR_CONTROL_CHAIN_DRIFT

AEC rules:
- Controls must reference existing executable control names.
- When a legacy control name was referenced, add a compatibility alias or patch the caller.
- Context Bar controls must preserve V93 Navigation UI dependency.
