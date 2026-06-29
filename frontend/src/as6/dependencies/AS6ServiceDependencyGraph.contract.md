# AS6 Service Dependency Graph Contract V110

Stage: AS6_SERVICE_DEPENDENCY_GRAPH_V110

Purpose:
- Register service-to-service dependencies.
- Prepare impact analysis before plugin loading and permission enforcement.
- Prevent hidden service coupling.

Required:
- as6ServiceDependencyGraph.js exports dependency graph.
- as6DependencyEngine.js exports impact/dependency helpers.
- Dependencies must reference registered AS6 services.
- Plugin dependencies must reference registered plugins when used.

Validation:
- AS6_SERVICE_DEPENDENCY_GRAPH_V110=PASS
