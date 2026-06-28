# AS6 Dynamic Living Space Engine Contract V92

Stage: AS6_DYNAMIC_LIVING_SPACE_ENGINE_V92

Purpose:
- Expose Living Space Registry through reusable engine utilities.
- Prepare automatic Living Space menu rendering.
- Prepare active Living Space lookup for Context Bar and Intelligence Rail.
- Prevent duplicated registry parsing logic.

Engine exports:
- getAS6LivingSpaceEngineState()
- getAS6LivingSpaceMenuItems()
- getAS6ActiveLivingSpace(pathname)
- validateAS6LivingSpaceEnginePolicy()

Required registry fields:
- id
- route
- name
- menuLabel
- menuGroup
- menuOrder
- adapter
- shell
- contextBarMode
- intelligenceRailMode
- businessLogicPolicy
- authRequired
- engineEnabled

Validation:
- AS6_DYNAMIC_LIVING_SPACE_ENGINE_V92=PASS
