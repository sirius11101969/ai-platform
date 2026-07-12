export const initialLivingProductContext = Object.freeze({
  organizationId: null,
  activeSpaceId: "focus",
  selectedEntity: null,
  conversationId: null,
  lastIntent: null,
  history: [],
});

export function reduceLivingProductContext(state, event) {
  switch (event?.type) {
    case "SPACE_CHANGED":
      return Object.freeze({
        ...state,
        activeSpaceId: event.spaceId,
        history: [...state.history, { type: event.type, spaceId: event.spaceId }],
      });
    case "ENTITY_SELECTED":
      return Object.freeze({ ...state, selectedEntity: event.entity ?? null });
    case "INTENT_SUBMITTED":
      return Object.freeze({
        ...state,
        lastIntent: event.intent ?? null,
        history: [...state.history, { type: event.type, intent: event.intent ?? null }],
      });
    case "CONTEXT_RESET":
      return initialLivingProductContext;
    default:
      throw new Error(`AS6_LIVING_PRODUCT_CONTEXT_EVENT_UNKNOWN: ${event?.type ?? "undefined"}`);
  }
}
