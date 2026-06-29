# AS6 AI Context Engine Contract P4

Stage: AS6_PLATFORM_V2_AI_CONTEXT_ENGINE_P4

Purpose:
- Provide a shared AI context layer for Living Spaces.
- Let CRM publish current customer, deal, pipeline and workspace context.
- Let AI consumers read merged context through one API.

Required:
- registerLivingSpaceContext
- getCurrentLivingSpace
- getMergedContext
- getCurrentCustomer
- getCurrentDeal
- getCurrentPipeline
- getContextSnapshot

Rules:
- Living Spaces publish context.
- AI reads context through AI Context Bridge.
- Context must be mergeable and snapshot-ready.
