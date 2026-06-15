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
