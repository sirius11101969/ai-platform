# AS6 Production Drift Diagnostics

Controller:
- ops/bin/as6-autonomous-production-drift-controller

Version: v3

New checks:
- local health contract detection
- local health variant classification
- public health precedence for production status
- postgres/db compose alias support

New error classes:
- PRODUCTION_DRIFT_LOCAL_HEALTH_CONTRACT_MISMATCH
- PRODUCTION_DRIFT_CANONICAL_CONTAINER_NAME_MISMATCH
- PRODUCTION_DRIFT_FALSE_POSITIVE_CONTAINER_NAMING

New AEC rules:
- AEC_LOCAL_HEALTH_CONTRACT_MUST_BE_DISCOVERED_BEFORE_VALIDATION
- AEC_PUBLIC_HEALTH_OK_CAN_SUPPRESS_LOCAL_HEALTH_FALSE_POSITIVE
