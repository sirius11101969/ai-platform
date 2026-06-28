# AS6 Global Command Palette Contract V97

Stage: AS6_GLOBAL_COMMAND_PALETTE_V97

Purpose:
- Provide shell-level command access through Ctrl+K.
- Search Living Spaces from Dynamic Living Space Engine.
- Search key product pages and AI tools.
- Keep command UX independent from page business logic.

Required:
- AS6GlobalCommandPalette uses getAS6LivingSpaceMenuItems().
- AS6GlobalCommandPalette uses keyboard shortcut Ctrl+K.
- AS6GlobalCommandPalette uses useNavigate().
- AS6Shell imports and renders AS6GlobalCommandPalette.

Validation:
- AS6_GLOBAL_COMMAND_PALETTE_V97=PASS
