# AS6 Governance — EPIC013 CRM Companies Domain Model

Stage: AS6_EPIC013_SLICE01_CRM_COMPANIES_DOMAIN_MODEL

- Companies / Accounts domain model is declarative only.
- Storage, API calls and business workflows are forbidden in this slice.
- Contact linkage is declarative and not hard-coupled.
- Runtime tracer is required for every domain diagnostic.
- Future Companies slices must reuse this domain contract.
