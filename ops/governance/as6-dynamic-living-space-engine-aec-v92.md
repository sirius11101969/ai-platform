# AS6 Dynamic Living Space Engine AEC V92

Failure classes:
- AS6_LIVING_SPACE_ENGINE_DRIFT
- AS6_LIVING_SPACE_MENU_METADATA_GAP
- AS6_ACTIVE_LIVING_SPACE_LOOKUP_GAP
- AS6_CONTEXT_RAIL_ENGINE_POLICY_GAP
- AS6_REGISTRY_PARSING_DUPLICATION_RISK

AEC rules:
- Living Space menu data must come from the engine, not duplicated arrays.
- Active Living Space lookup must use registry engine utilities.
- Context Bar and Intelligence Rail integrations must use registry-backed policy.
- Every active Living Space must expose menu metadata.
