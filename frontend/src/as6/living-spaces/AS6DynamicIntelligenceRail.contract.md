# AS6 Dynamic Intelligence Rail Contract V95

Stage: AS6_DYNAMIC_INTELLIGENCE_RAIL_V95

Purpose:
- Render shell-level Intelligence Rail from Dynamic Living Space Engine.
- Keep intelligence context adaptive per Living Space.
- Prevent page-level duplication of assistant/intelligence UI.

Required:
- AS6DynamicIntelligenceRail uses useLocation().
- AS6DynamicIntelligenceRail uses getAS6ActiveLivingSpace(pathname).
- AS6Shell imports and renders AS6DynamicIntelligenceRail.
- Intelligence metadata comes from Living Space Registry.

Validation:
- AS6_DYNAMIC_INTELLIGENCE_RAIL_V95=PASS
