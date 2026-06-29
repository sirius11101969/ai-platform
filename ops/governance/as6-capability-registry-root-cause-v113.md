# AS6 Capability Registry Root Cause V113

Root cause: V112 added Capability Resolver, but capabilities are still discovered only from plugin metadata.

Risk: capabilities can be duplicated, disabled inconsistently or routed without central priority/status governance.

Repair: add AS6 Capability Registry and Capability Engine as the central source of truth for capability metadata.
