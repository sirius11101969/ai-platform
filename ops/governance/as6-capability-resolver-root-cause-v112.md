# AS6 Capability Resolver Root Cause V112

Root cause:
Plugins can be loaded, but there is no abstraction layer for resolving requested capabilities.

Repair:
Introduce Capability Resolver above Plugin Loader.
