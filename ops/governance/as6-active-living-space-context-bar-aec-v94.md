# AS6 Active Living Space Context Bar AEC V94

Failure classes:
- AS6_ACTIVE_CONTEXT_BAR_DRIFT
- AS6_CONTEXT_BAR_ENGINE_BYPASS
- AS6_ACTIVE_SPACE_LOOKUP_UI_GAP
- AS6_PAGE_LEVEL_CONTEXT_DUPLICATION_RISK

AEC rules:
- Active Context Bar must use getAS6ActiveLivingSpace(pathname).
- Context Bar must remain shell-level.
- Context metadata must come from Living Space Registry.
- Page components must not duplicate shell context logic.
