# AS6 Project State

## Project

AI Platform / AS6

Production repository:

- github.com/sirius11101969/ai-platform
- /var/www/ai-platform

Production stack:

- Ubuntu 24.04 LTS
- VPS Beget / Beget Cloud
- Docker Compose
- nginx
- backend
- postgres
- redis

Production domain:

- https://www.as6.ru

## Current Production Status

AS6_DIAGNOSE_ALL_RESULT=OK

PROJECT_HEALTH_SCORE=100

GIT_MAIN_SYNC=OK

PRODUCTION_READINESS=OK

SECURITY_READINESS=OK

MONITORING_READINESS=OK

DEPLOYMENT_READINESS=OK

ROOT_CAUSE=none

SAFE_TO_CHANGE=YES

## Implemented Governance / Automation Contours

- Root Cause Governance
- Coverage Registry
- Diagnostic Registry
- Secret Scan Gate
- Git Main Sync Gate
- Deployment Safety Gate
- VPS Baseline Diagnostics
- Provider Control Plane Diagnostics
- Autonomous Coverage Gate
- Change Pipeline Controller
- Autonomous Repair Controller
- Autonomous Validation Controller

## Confirmed Incident History

### PROVIDER_HYPERVISOR_REBOOT

Confirmed incident:

- PROVIDER_HYPERVISOR_REBOOT

Evidence:

- System is rebooting (hypervisor initiated shutdown)

Provider:

- Beget Cloud

Additional checks confirmed:

- reboots were visible in the Beget control panel
- API was not used
- login was performed from IP 117.2.165.24
- 2FA is enabled
- panel password was changed
- IP whitelist is configured

## Mandatory Work Methodology

Always follow this sequence:

1. Diagnostics First
2. Root Cause
3. Structure
4. Change
5. Post-Change Diagnostics
6. Governance Registration
7. Coverage Registration
8. Root Cause Registration
9. AEC Registration
10. Git Sync Validation
11. Production Validation

## Mandatory Automation Policy

Always automatically:

- add new diagnostics
- add new checks
- add new controls
- add new root cause classes
- add new AEC rules
- register diagnostics in registry
- register coverage
- register governance
- add prevention mapping
- add rollback mapping
- run repeated diagnostics after changes
- keep this file updated as the project grows

## Command Generation Rules

Use this style for operational server commands:

- one big command
- one external quoted heredoc
- no nested heredoc
- no base64
- no long Python
- do not display secrets
- always diagnostics first
- then change
- then repeated diagnostics

## Secret Handling Rules

Never print secret values:

- API keys
- tokens
- passwords
- private keys
- webhook secrets

Always explicitly show the secret insertion placeholder:

<INSERT_SECRET_HERE>

## Current Autonomy Level

L6

## Next Autonomy Goal

L7

Target chain:

Root Cause
→ Repair Plan
→ Change Pipeline
→ Validation
→ Evidence
→ Production Confirmation
→ Autonomous Deployment
→ Autonomous Incident Control

## Start New Chat Instruction

Read:

- docs/AS6_PROJECT_STATE.md
- docs/AS6_START_CONTEXT.md

Then continue work using diagnostics-first methodology from the last confirmed green production state.

This document is the primary source of truth for AS6 project state and must be updated after every meaningful project growth, operational change, diagnostic expansion, governance addition, root-cause class addition, security exception, backup/restore/DR rule, automation controller change, or production validation milestone.

## L7 Phase 1: Autonomous Production Drift Controller

Status:

- AS6_PRODUCTION_DRIFT_CONTROLLER=IMPLEMENTED
- AS6_PRODUCTION_DRIFT_COVERAGE=REGISTERED
- AEC_PRODUCTION_DRIFT_MUST_BE_NONE_BEFORE_L7_DEPLOYMENT=REGISTERED

Added to diagnostics:

- production drift controller
- canonical file checks
- Docker Compose topology checks
- runtime container checks
- listener checks
- local/public health checks
- Git drift warning
- .env Git tracking protection

Added error classes:

- PRODUCTION_DRIFT_CANONICAL_FILE_MISSING
- PRODUCTION_DRIFT_COMPOSE_SERVICE_MISSING
- PRODUCTION_DRIFT_CONTAINER_NOT_RUNNING
- PRODUCTION_DRIFT_PORT_LISTENER_MISSING
- PRODUCTION_DRIFT_HEALTHCHECK_FAILED
- PRODUCTION_DRIFT_GIT_STATE_DIRTY
- PRODUCTION_DRIFT_SECRET_FILE_TRACKED

## L7 Phase 1 Update: Production Drift Controller V2

Status:

- AS6_PRODUCTION_DRIFT_CONTROLLER_V2=IMPLEMENTED
- AS6_PRODUCTION_DRIFT_V2_COVERAGE=REGISTERED
- AEC_PRODUCTION_DRIFT_CONTAINER_NAMES_MUST_BE_NORMALIZED=REGISTERED
- AEC_LOCAL_HEALTH_MUST_USE_SAFE_FALLBACKS=REGISTERED

Added to diagnostics:

- Docker Compose v2 container name normalization
- legacy container name compatibility
- canonical service identity normalization
- local health fallback matrix
- public health confirmation retained

Added error classes:

- PRODUCTION_DRIFT_CANONICAL_CONTAINER_NAME_MISMATCH
- PRODUCTION_DRIFT_LOCAL_HEALTH_ENDPOINT_VARIANCE
- PRODUCTION_DRIFT_FALSE_POSITIVE_CONTAINER_NAMING

## L7 Corrective Update: Architecture Compliance V2 and Production Drift V3

Status:

- AS6_ARCHITECTURE_COMPLIANCE_V2=IMPLEMENTED
- AS6_PRODUCTION_DRIFT_V3=IMPLEMENTED
- AS6_ARCHITECTURE_COMPLIANCE_V2_COVERAGE=REGISTERED
- AS6_PRODUCTION_DRIFT_V3_COVERAGE=REGISTERED

Added to diagnostics:

- service_alias_normalization
- compose_service_identity_mapping
- runtime_to_compose_mapping
- postgres_db_alias_support
- local_health_contract_detection
- local_health_variant_classification
- public_health_precedence_for_production_status

Added root cause classes:

- ARCHITECTURE_COMPLIANCE_SERVICE_ALIAS_MISMATCH
- PRODUCTION_DRIFT_LOCAL_HEALTH_CONTRACT_MISMATCH

Added AEC rules:

- AEC_RUNTIME_SERVICE_ALIAS_MUST_MATCH_COMPOSE_IDENTITY
- AEC_LOCAL_HEALTH_CONTRACT_MUST_BE_DISCOVERED_BEFORE_VALIDATION
- AEC_PUBLIC_HEALTH_OK_CAN_SUPPRESS_LOCAL_HEALTH_FALSE_POSITIVE
