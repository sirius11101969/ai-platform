export const LIVING_LOCALES = ["ru", "en"];
export const DEFAULT_LIVING_LOCALE = "ru";

const STORAGE_KEY = "as6-living-locale";

const messages = {
  ru: {
    today: "Сегодня",
    overnight: "AS6 самостоятельно выполнил {count} действий и нашёл способ повысить вероятность успеха встречи.",
    utilities: "Настройки рабочего пространства",
    lightTheme: "Светлая тема",
    calmMode: "Спокойный режим",
    settings: "Настройки",
    weather: "Погода",
    greeting: "Доброе утро, {name}.",
    dayReady: "Рабочий день подготовлен.",
    mainGoal: "Главная цель",
    as6Now: "AS6 сейчас",
    probability: "Вероятность успешной встречи",
    prepared: "AS6 уже подготовил",
    whyNow: "Почему именно сейчас",
    whatNext: "Что будет дальше",
    whatChanges: "Что изменится",
    intent: "Намерение",
    voiceStart: "Голосовой ввод",
    voiceStop: "Остановить голосовой ввод",
    sendIntent: "Передать намерение",
    switchWorkspace: "Переключить рабочее пространство",
    platformBrand: "AS6 AI PLATFORM",
    signOut: "Выйти из AS6 →",
    dataLoading: "AS6 обновляет рабочий контекст",
    dataReady: "Рабочий контекст актуален",
    dataError: "Часть рабочего контекста временно недоступна",
    dataStale: "Показан последний подтверждённый рабочий контекст",
    dataOffline: "Нет сети — показан последний доступный рабочий контекст",
    settingsTitle: "Профиль и фирменный стиль",
    settingsSubtitle: "Настройки применяются ко всем экранам живого пространства.",
    displayName: "Отображаемое имя",
    avatar: "Фотография профиля",
    workspaceName: "Название компании",
    companyLogo: "Логотип компании",
    brandMode: "Режим бренда",
    brandPlatform: "AS6",
    brandCoBranded: "AS6 + компания",
    brandCompany: "Только компания",
    language: "Основной язык",
    imageHint: "PNG, JPG или WebP, до 1 МБ",
    chooseImage: "Выбрать файл",
    save: "Сохранить",
    saving: "Сохраняем…",
    saved: "Настройки сохранены",
    saveError: "Не удалось сохранить настройки",
    ownerOnly: "Изменять фирменный стиль могут владелец и администратор.",
    backHome: "Вернуться на главный экран",
  },
  en: {
    today: "Today",
    overnight: "AS6 completed {count} actions autonomously and found a way to improve the meeting outcome.",
    utilities: "Workspace controls",
    lightTheme: "Light theme",
    calmMode: "Calm mode",
    settings: "Settings",
    weather: "Weather",
    greeting: "Good morning, {name}.",
    dayReady: "Your working day is ready.",
    mainGoal: "Main goal",
    as6Now: "AS6 now",
    probability: "Probability of a successful meeting",
    prepared: "AS6 has prepared",
    whyNow: "Why now",
    whatNext: "What happens next",
    whatChanges: "What will change",
    intent: "Intent",
    voiceStart: "Voice input",
    voiceStop: "Stop voice input",
    sendIntent: "Send intent",
    switchWorkspace: "Switch workspace",
    platformBrand: "AS6 AI PLATFORM",
    signOut: "Sign out of AS6 →",
    dataLoading: "AS6 is refreshing business context",
    dataReady: "Business context is current",
    dataError: "Some business context is temporarily unavailable",
    dataStale: "Showing the last verified business context",
    dataOffline: "Offline — showing the last available business context",
    settingsTitle: "Profile and company branding",
    settingsSubtitle: "These settings apply to every Living Space screen.",
    displayName: "Display name",
    avatar: "Profile photo",
    workspaceName: "Company name",
    companyLogo: "Company logo",
    brandMode: "Brand mode",
    brandPlatform: "AS6",
    brandCoBranded: "AS6 + company",
    brandCompany: "Company only",
    language: "Primary language",
    imageHint: "PNG, JPG or WebP, up to 1 MB",
    chooseImage: "Choose file",
    save: "Save",
    saving: "Saving…",
    saved: "Settings saved",
    saveError: "Could not save settings",
    ownerOnly: "Only workspace owners and administrators can change branding.",
    backHome: "Return to home screen",
  },
};

export function normalizeLivingLocale(value) {
  const normalized = String(value || "").trim().toLowerCase().slice(0, 2);
  return LIVING_LOCALES.includes(normalized) ? normalized : DEFAULT_LIVING_LOCALE;
}

export function getStoredLivingLocale(fallback = DEFAULT_LIVING_LOCALE) {
  if (typeof window === "undefined") return normalizeLivingLocale(fallback);
  try {
    return normalizeLivingLocale(window.localStorage.getItem(STORAGE_KEY) || fallback);
  } catch (_error) {
    return normalizeLivingLocale(fallback);
  }
}

export function persistLivingLocale(locale) {
  const normalized = normalizeLivingLocale(locale);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (_error) {
      // The active locale still changes in memory when storage is unavailable.
    }
    document.documentElement.lang = normalized;
  }
  return normalized;
}

export function createLivingTranslator(locale) {
  const normalized = normalizeLivingLocale(locale);
  return function translate(key, values = {}) {
    const template = messages[normalized]?.[key] || messages.ru[key] || key;
    return Object.entries(values).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      template,
    );
  };
}

export function livingIntlLocale(locale) {
  return normalizeLivingLocale(locale) === "en" ? "en-GB" : "ru-RU";
}
