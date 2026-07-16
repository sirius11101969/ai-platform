export const livingSpaceRegistry = [
  { id: "home", path: "/app", label: "Дом", short: "Главный фокус", symbol: "⌂", mode: "specialized" },
  { id: "focus", path: "/app/focus", label: "Фокус", short: "Концентрация и приоритет", symbol: "◉", engine: true, center: "Пространство концентрации", subtitle: "Один ясный приоритет", confidence: 92, nodes: ["Главная задача", "Риски", "Контекст", "Решение", "Следующий шаг"], recommendation: "Завершите одно важное действие до перехода к следующему." },
  { id: "conductor", path: "/app/conductor", label: "AI-дирижёр", short: "Намерение и план", symbol: "✦", mode: "specialized" },
  { id: "relations", path: "/app/relations", label: "Клиенты", short: "Отношения и внимание", symbol: "◌", mode: "specialized" },
  { id: "sales", path: "/app/sales", label: "Продажи", short: "Сделки и рост", symbol: "↗", engine: true, center: "Движение продаж", subtitle: "От интереса к результату", confidence: 88, nodes: ["Воронка", "Сделки", "Предложения", "Прогноз", "Повторные продажи"], recommendation: "Сосредоточьтесь на сделках без следующего шага." },
  { id: "finance", path: "/app/finance", label: "Финансы", short: "Устойчивость и решения", symbol: "◈", engine: true, center: "Финансовая устойчивость", subtitle: "Центр принятия решений", confidence: 91, nodes: ["Доход", "Расход", "Прибыль", "Денежный поток", "Резерв", "Прогноз"], recommendation: "Проверьте денежный поток и ближайшие обязательства." },
  { id: "projects", path: "/app/projects", label: "Проекты", short: "Результаты и движение", symbol: "◇", mode: "specialized" },
  { id: "documents", path: "/app/documents", label: "Документы", short: "Контекст и материалы", symbol: "▤", mode: "specialized" },
  { id: "knowledge", path: "/app/knowledge", label: "Знания", short: "Решения и память", symbol: "◎", mode: "specialized" },
  { id: "team", path: "/app/team", label: "Команда", short: "Люди и согласованность", symbol: "◍", engine: true, center: "Работа команды", subtitle: "Согласованность и энергия", confidence: 90, nodes: ["Люди", "Роли", "Загрузка", "Решения", "Развитие"], recommendation: "Уточните владельца главного результата недели." },
  { id: "marketing", path: "/app/marketing", label: "Маркетинг", short: "Спрос и внимание", symbol: "✺", engine: true, center: "Движение спроса", subtitle: "Внимание превращается в интерес", confidence: 86, nodes: ["Аудитория", "Каналы", "Контент", "Кампании", "Результаты"], recommendation: "Сравните каналы по качеству обращений, а не только по объёму." },
  { id: "analytics", path: "/app/analytics", label: "Аналитика", short: "Показатели и выводы", symbol: "⌁", engine: true, center: "Картина бизнеса", subtitle: "Факты становятся решениями", confidence: 89, nodes: ["Метрики", "Тренды", "Отклонения", "Причины", "Сценарии"], recommendation: "Выберите один показатель, который требует объяснения сегодня." },
  { id: "settings", path: "/app/settings", label: "Настройки", short: "Ваше пространство", symbol: "⚙", kind: "utility", mode: "specialized" }
];

export function getLivingSpaceDefinition(id) {
  return livingSpaceRegistry.find((space) => space.id === id) || livingSpaceRegistry[0];
}
