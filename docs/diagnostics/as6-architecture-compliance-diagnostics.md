# AS6 Architecture Compliance Diagnostics

Controller:
- ops/bin/as6-autonomous-architecture-compliance-controller

Version: v2

New checks:
- service alias normalization
- compose service identity mapping
- runtime to compose mapping
- postgres/db alias support
- topology identity completeness

New error classes:
- ARCHITECTURE_COMPLIANCE_SERVICE_ALIAS_MISMATCH
- ARCHITECTURE_LAYER_VIOLATION
- FORBIDDEN_DEPENDENCY
- TOPOLOGY_DRIFT
- SECURITY_BOUNDARY_VIOLATION

New AEC rules:
- AEC_RUNTIME_SERVICE_ALIAS_MUST_MATCH_COMPOSE_IDENTITY
- AEC_ARCHITECTURE_COMPLIANCE_REQUIRED_BEFORE_DEPLOYMENT
