export const userProfile = {
  name: "Анна Орлова",
  role: "Руководитель роста",
  company: "Northstar AI Lab",
  email: "anna@northstar.ai",
  plan: "Профи Рост",
};

export const creditSummary = {
  balance: 18420,
  used: 71,
  renews: "01 июня 2026",
  forecast: "Хватит на 12 дней активной воронки",
};

export const aiTasks = [
  { title: "Скоринг входящих лидов", status: "В работе", value: "128 лидов", accent: "cyan" },
  { title: "Персональный дожим", status: "Запланировано", value: "42 письма", accent: "violet" },
  { title: "Резюме созвонов", status: "Готово", value: "16 заметок", accent: "pink" },
];

export const quickActions = ["Создать AI‑задачу", "Импортировать лиды", "Открыть CRM", "Пополнить AI‑кредиты"];

export const orders = [
  { title: "Профи Рост", meta: "Подписка активна до 01.06.2026", amount: "9 900 ₽" },
  { title: "Пакет 10k AI‑кредитов", meta: "Заказ #AI‑1048 · Оплачен", amount: "4 900 ₽" },
];

export const pipelineStages = [
  {
    title: "Новые лиды",
    total: "1,8 млн ₽",
    leads: [
      { name: "SberCloud Lab", contact: "Илья · Telegram", value: "720 тыс. ₽", score: 94, note: "Нужен пилот AI‑поддержки на 3 отдела" },
      { name: "FinEdge", contact: "Мария · сайт", value: "420 тыс. ₽", score: 81, note: "Запросили расчёт AI‑кредитов и SLA" },
    ],
  },
  {
    title: "Квалификация",
    total: "2,4 млн ₽",
    leads: [
      { name: "Retail Rocket", contact: "Олег · импорт CRM", value: "1,1 млн ₽", score: 88, note: "AI SDR собрал болевые точки" },
      { name: "MedTech Plus", contact: "Елена · email", value: "650 тыс. ₽", score: 76, note: "Ждут чек-лист безопасности" },
    ],
  },
  {
    title: "Демо",
    total: "3,1 млн ₽",
    leads: [
      { name: "EduFlow", contact: "Павел · Telegram", value: "980 тыс. ₽", score: 91, note: "Демо в пятницу, фокус на CRM" },
      { name: "Logix Pro", contact: "Антон · рекомендация", value: "1,4 млн ₽", score: 86, note: "Нужна кастомная воронка" },
    ],
  },
  {
    title: "Предложение",
    total: "2,0 млн ₽",
    leads: [
      { name: "AeroDesk", contact: "Ксения · LinkedIn", value: "1,2 млн ₽", score: 93, note: "Коммерческое отправлено" },
      { name: "MarketPulse", contact: "Никита · вебинар", value: "820 тыс. ₽", score: 79, note: "Согласуют бюджет" },
    ],
  },
];

export const followUpSuggestions = [
  "Отправить SberCloud Lab короткое резюме пилота и предложить слот на вторник 11:00.",
  "Для EduFlow подготовить демо-сценарий: импорт лидов → AI‑скоринг → дожим → заказ.",
  "MarketPulse: напомнить о дедлайне тарифа «Профи» и приложить прогноз экономии AI‑кредитов.",
];

export const activityFeed = [
  "AI SDR обновил скоринг Retail Rocket до 88",
  "Создана заметка по звонку EduFlow",
  "CRM переместила AeroDesk в этап «Предложение»",
];
