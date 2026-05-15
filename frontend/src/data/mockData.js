export const userProfile = {
  name: "Анна Орлова",
  role: "Head of Growth",
  company: "Northstar AI Lab",
  email: "anna@northstar.ai",
  plan: "Pro Growth",
};

export const creditSummary = {
  balance: 18420,
  used: 71,
  renews: "01 июня 2026",
  forecast: "Хватит на 12 дней активной воронки",
};

export const aiTasks = [
  { title: "Скоринг входящих лидов", status: "В работе", value: "128 лидов", accent: "cyan" },
  { title: "Персональные follow-up", status: "Запланировано", value: "42 письма", accent: "violet" },
  { title: "Резюме созвонов", status: "Готово", value: "16 заметок", accent: "pink" },
];

export const quickActions = ["Создать AI-задачу", "Импортировать лиды", "Открыть CRM", "Пополнить credits"];

export const orders = [
  { title: "Pro Growth", meta: "Подписка активна до 01.06.2026", amount: "9 900 ₽" },
  { title: "Пакет credits x10k", meta: "Заказ #AI-1048 · Оплачен", amount: "4 900 ₽" },
];

export const pipelineStages = [
  {
    title: "Новые лиды",
    total: "1.8M ₽",
    leads: [
      { name: "SberCloud Lab", contact: "Илья · Telegram", value: "720k ₽", score: 94, note: "Нужен пилот AI support на 3 отдела" },
      { name: "FinEdge", contact: "Мария · Website", value: "420k ₽", score: 81, note: "Запросили расчёт credits и SLA" },
    ],
  },
  {
    title: "Квалификация",
    total: "2.4M ₽",
    leads: [
      { name: "Retail Rocket", contact: "Олег · CRM import", value: "1.1M ₽", score: 88, note: "AI SDR собрал pain points" },
      { name: "MedTech Plus", contact: "Елена · Email", value: "650k ₽", score: 76, note: "Ждут security checklist" },
    ],
  },
  {
    title: "Демо",
    total: "3.1M ₽",
    leads: [
      { name: "EduFlow", contact: "Павел · Telegram", value: "980k ₽", score: 91, note: "Демо в пятницу, фокус на CRM" },
      { name: "Logix Pro", contact: "Антон · Referral", value: "1.4M ₽", score: 86, note: "Нужен кастомный pipeline" },
    ],
  },
  {
    title: "Предложение",
    total: "2.0M ₽",
    leads: [
      { name: "AeroDesk", contact: "Ксения · LinkedIn", value: "1.2M ₽", score: 93, note: "Коммерческое отправлено" },
      { name: "MarketPulse", contact: "Никита · Webinar", value: "820k ₽", score: 79, note: "Согласуют бюджет" },
    ],
  },
];

export const followUpSuggestions = [
  "Отправить SberCloud Lab короткое резюме пилота и предложить слот на вторник 11:00.",
  "Для EduFlow подготовить демо-сценарий: импорт лидов → AI scoring → follow-up → заказ.",
  "MarketPulse: напомнить о дедлайне тарифа Pro и приложить прогноз экономии credits.",
];

export const activityFeed = [
  "AI SDR обновил скоринг Retail Rocket до 88",
  "Создана заметка по звонку EduFlow",
  "CRM переместила AeroDesk в этап «Предложение»",
];
