# AS6 Registry-driven Navigation UI AEC V93

Failure classes:
- AS6_REGISTRY_NAVIGATION_UI_DRIFT
- AS6_HARDCODED_LIVING_SPACE_MENU_DRIFT
- AS6_SHELL_NAVIGATION_ENGINE_BYPASS
- AS6_LIVING_SPACE_NAV_ACCESSIBILITY_GAP

AEC rules:
- Living Space navigation must use getAS6LivingSpaceMenuItems().
- Shell must not use duplicated hardcoded Living Space menu arrays.
- AS6LivingSpaceNav must remain independent from page business logic.
- Navigation UI must expose a semantic nav label.
