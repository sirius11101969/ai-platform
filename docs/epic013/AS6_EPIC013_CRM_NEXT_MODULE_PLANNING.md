# AS6 EPIC013 CRM Next Module Planning

Stage: AS6_EPIC013_CRM_NEXT_MODULE_PLANNING

Base: 9b78f56ae3b3f755131b0c8bc8c205dfafaa2acf

## Confirmed Previous Foundation

- EPIC012 CRM Contacts is production validated.
- Contacts Foundation, UI Foundation, Workspace Integration, CRM Layout Bridge, Live Layout Mount, Production Polish and Final Validation are complete.

## Planning Decision

Recommended next module: CRM Companies / Accounts Foundation.

## Why Companies / Accounts next

- Contacts need an account/company parent to become useful in real CRM workflows.
- Deals, tasks and automation become cleaner when Contacts are linked to Companies.
- Companies can reuse the Contacts foundation pattern without introducing storage/API/workflow in the first slice.

## EPIC013 Proposed Slice Chain

1. AS6_EPIC013_SLICE01_CRM_COMPANIES_DOMAIN_MODEL
2. AS6_EPIC013_SLICE02_CRM_COMPANIES_FOUNDATION
3. AS6_EPIC013_SLICE03_CRM_COMPANIES_UI_FOUNDATION
4. AS6_EPIC013_SLICE04_CRM_COMPANIES_WORKSPACE_INTEGRATION
5. AS6_EPIC013_SLICE05_CRM_COMPANIES_CRM_LAYOUT_BRIDGE
6. AS6_EPIC013_SLICE06_CRM_COMPANIES_LIVE_LAYOUT_MOUNT
7. AS6_EPIC013_SLICE07_CRM_COMPANIES_PRODUCTION_POLISH
8. AS6_EPIC013_SLICE08_CRM_COMPANIES_FINAL_VALIDATION

## Invariants

- NO_STORAGE=TRUE for initial foundation slices.
- NO_API_CALLS=TRUE for initial foundation slices.
- NO_BUSINESS_WORKFLOW=TRUE for initial foundation slices.
- REUSE_CONTACTS_FOUNDATION_PATTERN=TRUE.
- USE_EXISTING_CRM_LAYOUT=TRUE.
- USE_EXISTING_WORKSPACE=TRUE.
- PLATFORM_MUTATION=FALSE.
