export const AS6_PRODUCT_KNOWLEDGE_LEVELS = Object.freeze({
  OBSERVATION: 'observation',
  HYPOTHESIS: 'hypothesis',
  LOCAL_KNOWLEDGE: 'local_knowledge',
  CONFIRMED_KNOWLEDGE: 'confirmed_knowledge',
  PRODUCT_PRINCIPLE: 'product_principle',
})

export function createProductKnowledgeRecord({ stage, finding, evidence, level }) {
  return {
    stage,
    finding,
    evidence,
    level: level || AS6_PRODUCT_KNOWLEDGE_LEVELS.OBSERVATION,
    createdAt: new Date().toISOString(),
  }
}
