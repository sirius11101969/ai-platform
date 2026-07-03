# AS6 EPIC014 CRM Next Module Selection

Stage: AS6_EPIC014_CRM_NEXT_MODULE_SELECTION

## Decision

Selected module:

CRM_DEALS_OPPORTUNITIES

## Confirmed previous foundation

- EPIC012 CRM Contacts is production validated.
- EPIC013 CRM Companies / Accounts is production validated.
- EPIC Completion Marker Guard is available for future epic closing.

## Why Deals / Opportunities next

Deals / Opportunities is the next natural CRM layer after Contacts and Companies.

Canonical relationship:

Company
  ├── Contacts
  └── Deals
        ├── Pipeline
        ├── Stage
        ├── Activities
        ├── Tasks
        ├── Documents
        └── Analytics

## EPIC014 proposed slice chain

1. AS6_EPIC014_SLICE01_CRM_DEALS_DOMAIN_MODEL
2. AS6_EPIC014_SLICE02_CRM_DEALS_FOUNDATION
3. AS6_EPIC014_SLICE03_CRM_DEALS_UI_FOUNDATION
4. AS6_EPIC014_SLICE04_CRM_DEALS_WORKSPACE_INTEGRATION
5. AS6_EPIC014_SLICE05_CRM_DEALS_CRM_LAYOUT_BRIDGE
6. AS6_EPIC014_SLICE06_CRM_DEALS_LIVE_LAYOUT_MOUNT
7. AS6_EPIC014_SLICE07_CRM_DEALS_PRODUCTION_POLISH
8. AS6_EPIC014_SLICE08_CRM_DEALS_FINAL_VALIDATION

## Invariants

- REUSE_CONTACTS_FOUNDATION=TRUE
- REUSE_COMPANIES_FOUNDATION=TRUE
- USE_EXISTING_CRM_WORKSPACE=TRUE
- USE_EXISTING_CRM_LAYOUT=TRUE
- USE_AS6_GREP_SAFE=TRUE
- USE_EPIC_COMPLETION_MARKER_GUARD=TRUE
- NO_PARALLEL_SHELL=TRUE
- NO_OWN_ROUTER=TRUE
- NO_OWN_STORE=TRUE
- NO_STORAGE=TRUE for initial foundation slices
- NO_API_CALLS=TRUE for initial foundation slices
- NO_BUSINESS_WORKFLOW=TRUE for initial foundation slices
- PLATFORM_MUTATION=FALSE
