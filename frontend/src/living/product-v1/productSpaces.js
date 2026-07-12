export const livingProductV1Spaces = Object.freeze([
  Object.freeze({ id: "focus", order: 1, role: "overview", status: "approved" }),
  Object.freeze({ id: "crm", order: 2, role: "relationships", status: "approved" }),
  Object.freeze({ id: "finance", order: 3, role: "stability", status: "approved" }),
  Object.freeze({ id: "documents", order: 4, role: "knowledge", status: "approved" }),
]);

export function assertLivingProductSpace(spaceId) {
  const space = livingProductV1Spaces.find((item) => item.id === spaceId);
  if (!space) throw new Error(`AS6_LIVING_PRODUCT_SPACE_UNKNOWN: ${spaceId}`);
  return space;
}
