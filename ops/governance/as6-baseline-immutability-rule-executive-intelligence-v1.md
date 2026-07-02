# AS6 Baseline Immutability Rule

AS6_BASELINE=EXECUTIVE_INTELLIGENCE_V1
BASELINE_IMMUTABILITY=TRUE

EXECUTIVE_INTELLIGENCE_V1 after VALIDATED must not be modified in place.
Any future correction or extension must create a new baseline version:
- EXECUTIVE_INTELLIGENCE_V1.1 for compatible patch-level changes.
- EXECUTIVE_INTELLIGENCE_V2 for contract, storage, mutation, architecture or behavior changes.
