# AS6 Service Dependency Graph Root Cause V110

Root cause: V108 added Service Registry and V109 added Plugin SDK, but service relationships and impact analysis are not yet explicit.

Risk: services and plugins can form hidden coupling, making future changes risky.

Repair: add AS6 Service Dependency Graph and Dependency Engine for declared service dependencies and impact mapping.
