# AS6 Living Product v1

Status: FOUNDATION_IMPLEMENTED / PRODUCT_RUNTIME_VALIDATION_PENDING

## Diagnostics

The repository had a canonical Living Frame, configuration-driven Living Engine, and four approved spaces, but no product-level orchestration layer preserving one shared user context while switching between Focus, CRM, Finance, and Documents.

## Root cause

Framework and engine responsibilities were implemented separately. A product shell owning active-space state, intent continuity, shared context history, and one-route orchestration had not yet been materialized.

## Structure added

- `frontend/src/living/product-v1/productContext.js`
- `frontend/src/living/product-v1/productSpaces.js`
- `frontend/src/living/product-v1/LivingProduct.jsx`
- `frontend/src/living/product-v1/index.js`

## Diagnostics added

- detect unknown Living Product space IDs;
- detect unsupported shared-context events;
- detect product-local page creation instead of one Living Engine route;
- detect context reset during space transition;
- detect direct bypass of Living Engine;
- detect independent AI context per space;
- detect production migration without visual fidelity and rollback evidence.

## Failure classes

- `AS6_LIVING_PRODUCT_MISSING`
- `AS6_LIVING_PRODUCT_SPACE_UNKNOWN`
- `AS6_LIVING_PRODUCT_CONTEXT_EVENT_UNKNOWN`
- `AS6_LIVING_PRODUCT_CONTEXT_LOSS_DRIFT`
- `AS6_LIVING_PRODUCT_ENGINE_BYPASS`
- `AS6_LIVING_PRODUCT_MULTI_PAGE_DRIFT`
- `AS6_LIVING_PRODUCT_AI_CONTEXT_FRAGMENTATION`
- `AS6_LIVING_PRODUCT_VALIDATION_GAP`

## Controls

1. Focus, CRM, Finance, and Documents remain states of one product route.
2. All rendering resolves through `LivingEngine`.
3. Active space, last intent, selected entity, conversation, and context history have one shared owner.
4. Space transitions must preserve context and avoid page reloads.
5. Production adoption is blocked until issues #366 and #367 provide visual, runtime, build, rollback, and health evidence.

## AEC rules

- reject a product space not registered in `livingProductV1Spaces`;
- reject unknown context events;
- reject independent page-local context stores for approved spaces;
- reject direct LivingFrame composition that bypasses LivingEngine at product level;
- reject production route migration without passing visual regression.

## Readiness

- product orchestration foundation: 100%;
- shared context model foundation: 100%;
- preview integration: pending;
- real AI/data adapters: pending;
- production migration: blocked by visual and runtime evidence.
