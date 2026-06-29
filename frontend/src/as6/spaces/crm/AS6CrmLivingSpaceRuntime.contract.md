# AS6 CRM Living Space Runtime Contract P2

Stage: AS6_PLATFORM_V2_CRM_LIVING_SPACE_RUNTIME_P2

Purpose:
- Turn CRM from a page-only implementation into the first Platform V2 Living Space runtime module.
- Use CRM manifest as the source of truth.
- Register CRM through AS6 Space Registry.
- Activate/deactivate CRM through AS6 Space Runtime.
- Publish CRM context through AS6 Space Context.

Required:
- registerAS6CrmLivingSpace
- activateAS6CrmLivingSpace
- deactivateAS6CrmLivingSpace
- updateAS6CrmLivingSpaceContext
- getAS6CrmLivingSpaceState
- validateAS6CrmLivingSpaceRuntimePolicy
