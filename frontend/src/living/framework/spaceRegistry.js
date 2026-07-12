const defineSpace = (space) => Object.freeze(space);

export const livingSpaceRegistry = Object.freeze({
  focus: defineSpace({
    id: "focus",
    number: 1,
    title: "Фокус",
    subtitle: "Пространство концентрации",
    geometry: "sphere",
    placeholder: "Расскажите, что вы хотите получить.",
    status: "master",
  }),
  crm: defineSpace({
    id: "crm",
    number: 2,
    title: "CRM",
    subtitle: "Пространство отношений",
    geometry: "relationship-network",
    placeholder: "Что Вы хотите узнать о клиентах?",
    status: "approved",
  }),
  finance: defineSpace({
    id: "finance",
    number: 3,
    title: "Финансы",
    subtitle: "Пространство устойчивости",
    geometry: "stability-crystal",
    placeholder: "Что Вы хотите узнать о финансах?",
    status: "approved",
  }),
  documents: defineSpace({
    id: "documents",
    number: 4,
    title: "Документы",
    subtitle: "Пространство знаний",
    geometry: "knowledge-sphere",
    placeholder: "Что Вы хотите узнать из документов?",
    status: "approved",
  }),
  projects: defineSpace({
    id: "projects",
    number: 5,
    title: "Проекты",
    subtitle: "Пространство развития",
    geometry: "development-orbits",
    placeholder: "Что Вы хотите узнать о развитии проектов?",
    status: "planned",
  }),
});

export function getLivingSpaceDefinition(spaceId = "focus") {
  const definition = livingSpaceRegistry[spaceId];
  if (!definition) {
    throw new Error(`AS6_LIVING_SPACE_UNKNOWN: ${spaceId}`);
  }
  return definition;
}

export default livingSpaceRegistry;
