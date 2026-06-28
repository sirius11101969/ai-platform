# AS6 Active Living Space Context Bar Root Cause V94

Root cause: V92 added active Living Space lookup and V93 added navigation, but AS6Shell still lacks a dynamic Context Bar surface driven by the active Living Space.

Risk: Context Bar behavior can become hardcoded or duplicated per page instead of using the Living Space Engine.

Repair: add AS6ActiveLivingSpaceContextBar powered by getAS6ActiveLivingSpace(pathname) and render it in AS6Shell.
