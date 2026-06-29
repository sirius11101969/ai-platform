# AS6 Service Dependency Graph AEC V110

Failure classes:
- AS6_SERVICE_DEPENDENCY_GRAPH_DRIFT
- AS6_HIDDEN_SERVICE_COUPLING_RISK
- AS6_SERVICE_IMPACT_ANALYSIS_GAP
- AS6_PLUGIN_DEPENDENCY_REFERENCE_DRIFT
- AS6_UNREGISTERED_SERVICE_DEPENDENCY

AEC rules:
- Service dependencies must reference registered AS6 services.
- Plugin dependencies must reference registered plugins.
- Impact analysis must use AS6 Dependency Engine.
- New cross-service coupling must be registered in the dependency graph.
