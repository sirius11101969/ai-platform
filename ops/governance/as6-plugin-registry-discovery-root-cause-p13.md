# AS6 Plugin Registry & Discovery Root Cause P13

Root cause: P12 added plugin generation CLI, but the platform still lacked a discovery index and registry state for installed or available plugins.

Risk: generated and marketplace plugins can remain invisible without manual imports or duplicate ID checks.

Repair: add Plugin Discovery Engine, Plugin Registry state and compatibility/duplicate checks.
