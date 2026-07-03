# AS6 Platform / Application EPIC Governance

STATUS=ACTIVE
PROJECT_READINESS=99%

## Stable Platform

Executive Intelligence V1=BASELINED
Engineering Meta-Architecture=CANONICAL
Reference Meta-Model=CANONICAL
Operating System V1=BASELINED
Workspace Experience V1=BASELINED
Application Foundation V1=BASELINED

STATUS=STABLE_PLATFORM

## EPIC Type Rule

Every new EPIC must declare:

EPIC_TYPE=PLATFORM
or
EPIC_TYPE=APPLICATION

## PLATFORM EPIC

Allowed:
- platform baseline mutation
- public platform contract changes
- runtime changes
- new platform baseline release

Required:
- NEW_PLATFORM_BASELINE=YES
- COMPATIBILITY_MATRIX_UPDATE=REQUIRED
- PUBLIC_API_REVIEW=REQUIRED

## APPLICATION EPIC

Required:
- PLATFORM_MUTATION=FALSE
- PUBLIC_API_CHANGE=FALSE
- BASELINE_IMPACT=NONE

Allowed:
- use published platform APIs
- register application capabilities
- register application diagnostics
- register application navigation, panels and commands

Not in scope:
- Operating System baseline mutation
- Workspace Experience baseline mutation
- Application Foundation baseline mutation
- public platform contract mutation
