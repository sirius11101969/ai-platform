export const AS6_LIVING_STATE_VERSION = "SPRINT_1_LIVING_CORE";

export const as6LivingStates = {
  living: {
    id: "living",
    title: "Живое пространство",
    subtitle: "Живое пространство",
    emotion: "Гармония",
    coreMode: "living",
    activeNodeIds: [],
    message: {
      title: "Доброе утро, Владимир",
      detail: "Я проверил ночные события и подготовил главное.",
      action: "Показать рекомендации",
    },
  },
  focus: {
    id: "focus",
    title: "Фокус",
    subtitle: "Живое пространство",
    emotion: "Концентрация",
    coreMode: "focus",
    activeNodeIds: ["financial-model", "investors"],
    message: {
      title: "Подготовил финансовую модель",
      detail: "3 сценария готовы.",
      action: "Жду вашего решения",
    },
  },
  analytics: {
    id: "analytics",
    title: "Анализ",
    subtitle: "Живое пространство",
    emotion: "Ясность",
    coreMode: "analytics",
    activeNodeIds: ["finance", "risks"],
    message: {
      title: "Проверил финансовый прогноз",
      detail: "Один сценарий устойчивее остальных.",
      action: "Показать вывод",
    },
  },
  decision: {
    id: "decision",
    title: "Решение",
    subtitle: "Живое пространство",
    emotion: "Уверенность",
    coreMode: "decision",
    activeNodeIds: ["strategy"],
    message: {
      title: "Рекомендую второй сценарий",
      detail: "Он даёт лучший баланс риска и роста.",
      action: "Подтвердить",
    },
  },
};

export function getAS6LivingState(id = "living") {
  return as6LivingStates[id] || as6LivingStates.living;
}
