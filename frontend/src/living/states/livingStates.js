export const AS6_LIVING_STATE_VERSION = "SPRINT_4_GOLDEN_MASTER_STATES";

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
    primaryNodeId: "financial-model",
    message: {
      title: "Подготовил финансовую модель",
      detail: "3 сценария готовы.",
      action: "Жду вашего решения",
    },
  },
  thinking: {
    id: "thinking",
    title: "Мышление",
    subtitle: "Живое пространство",
    emotion: "Любопытство",
    coreMode: "thinking",
    activeNodeIds: ["market", "strategy"],
    primaryNodeId: "strategy",
    message: {
      title: "Нашёл три сценария развития",
      detail: "Сравниваю последствия каждого варианта.",
      action: "Показать варианты",
    },
  },
  analytics: {
    id: "analytics",
    title: "Анализ",
    subtitle: "Живое пространство",
    emotion: "Ясность",
    coreMode: "analytics",
    activeNodeIds: ["financial-model", "risks"],
    primaryNodeId: "financial-model",
    message: {
      title: "Проверил финансовый прогноз",
      detail: "Один сценарий устойчивее остальных.",
      action: "Показать вывод",
    },
  },
  strategy: {
    id: "strategy",
    title: "Стратегия",
    subtitle: "Живое пространство",
    emotion: "Уверенность",
    coreMode: "strategy",
    activeNodeIds: ["strategy", "market"],
    primaryNodeId: "strategy",
    message: {
      title: "Подготовил стратегию развития",
      detail: "Лучшее направление уже выделено.",
      action: "Открыть план",
    },
  },
  decision: {
    id: "decision",
    title: "Решение",
    subtitle: "Живое пространство",
    emotion: "Ответственность",
    coreMode: "decision",
    activeNodeIds: ["strategy", "risks"],
    primaryNodeId: "strategy",
    message: {
      title: "Рекомендую второй сценарий",
      detail: "Он даёт лучший баланс риска и роста.",
      action: "Подтвердить",
    },
  },
  automation: {
    id: "automation",
    title: "Автоматизация",
    subtitle: "Живое пространство",
    emotion: "Спокойствие",
    coreMode: "automation",
    activeNodeIds: ["team", "strategy"],
    primaryNodeId: "team",
    message: {
      title: "Запустил выполнение задачи",
      detail: "Контроль продолжается автоматически.",
      action: "Следить за ходом",
    },
  },
  knowledge: {
    id: "knowledge",
    title: "Знания",
    subtitle: "Живое пространство",
    emotion: "Мудрость",
    coreMode: "knowledge",
    activeNodeIds: ["team", "market"],
    primaryNodeId: "market",
    message: {
      title: "Обновил карту знаний",
      detail: "Новый опыт уже связан с текущими задачами.",
      action: "Показать связи",
    },
  },
  growth: {
    id: "growth",
    title: "Рост",
    subtitle: "Живое пространство",
    emotion: "Воодушевление",
    coreMode: "growth",
    activeNodeIds: ["market", "investors"],
    primaryNodeId: "market",
    message: {
      title: "Нашёл возможность роста",
      detail: "Потенциал выше текущего плана.",
      action: "Оценить эффект",
    },
  },
  harmony: {
    id: "harmony",
    title: "Гармония",
    subtitle: "Живое пространство",
    emotion: "Баланс",
    coreMode: "harmony",
    activeNodeIds: ["team"],
    primaryNodeId: "team",
    message: {
      title: "Система в балансе",
      detail: "Критичных отклонений сейчас нет.",
      action: "Продолжить наблюдение",
    },
  },
};

export const as6LivingStateOrder = [
  "living",
  "focus",
  "thinking",
  "analytics",
  "strategy",
  "decision",
  "automation",
  "knowledge",
  "growth",
  "harmony",
];

export function getAS6LivingState(id = "living") {
  return as6LivingStates[id] || as6LivingStates.living;
}

export function getAS6LivingStateList() {
  return as6LivingStateOrder.map((id) => as6LivingStates[id]);
}
