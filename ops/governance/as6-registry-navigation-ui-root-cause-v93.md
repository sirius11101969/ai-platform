# AS6 Registry-driven Navigation UI Root Cause V93

Root cause: V92 introduced Dynamic Living Space Engine, but users do not yet have a registry-driven UI surface for switching Living Spaces.

Risk: navigation can remain hardcoded or duplicated outside the Living Space Engine.

Repair: add AS6LivingSpaceNav component powered by getAS6LivingSpaceMenuItems and wire it into AS6Shell as a shell-level navigation surface.
