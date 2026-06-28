# AS6 Context Bar + Intelligence Rail AEC V87

Stage: AS6_CONTEXT_BAR_INTELLIGENCE_RAIL_CONTRACT_V87

Failure classes:
- AS6_CONTEXT_RAIL_ZONE_DRIFT
- AS6_LIVING_SPACE_ADAPTER_ZONE_POLICY
- AS6_CONTEXT_BAR_ADAPTIVITY_GAP
- AS6_INTELLIGENCE_RAIL_ADAPTIVITY_GAP
- AS6_LIVING_SPACE_UI_DUPLICATION_RISK

AEC rules:
- Context Bar is a shell-level adaptive zone, not page business logic.
- Intelligence Rail is a shell-level adaptive zone, not page business logic.
- Living Space adapters must pass contextBarMode="adaptive".
- Living Space adapters must pass intelligenceRailMode="adaptive".
- CRM migration to /as6-sales must use adapter strategy and preserve existing CRM business logic.
