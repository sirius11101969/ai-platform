# AS6 Plugin Loader Root Cause V111

Root cause: V109 added Plugin SDK and V110 added Service Dependency Graph, but plugin lifecycle execution is not yet centralized.

Risk: plugins can be activated directly without dependency validation, Service Registry checks or Event Bus lifecycle events.

Repair: add AS6 Plugin Loader with validate, resolve, activate, unload, reload and status tracking.
