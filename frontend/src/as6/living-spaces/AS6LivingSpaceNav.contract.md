# AS6 Living Space Navigation Contract V93

Stage: AS6_REGISTRY_DRIVEN_NAVIGATION_UI_V93

Purpose:
- Render Living Space navigation from Dynamic Living Space Engine.
- Prevent hardcoded Living Space menu arrays.
- Keep navigation shell-level and registry-backed.

Required:
- AS6LivingSpaceNav uses getAS6LivingSpaceMenuItems().
- AS6LivingSpaceNav renders NavLink route targets from registry data.
- AS6Shell imports and renders AS6LivingSpaceNav.
- Navigation remains independent from Living Space business logic.

Validation:
- AS6_REGISTRY_DRIVEN_NAVIGATION_UI_V93=PASS
