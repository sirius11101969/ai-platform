export const AS6_EXECUTIVE_INSIGHTS_VERSION = "EPIC003_PR1";

export function createAS6ExecutiveFallbackInsights(profileName = "Administrator") {
  return [{
    id: "executive-fallback-insight",
    title: "Executive Insights работают в fallback-режиме",
    reason: "AS6 не получил полный executive context, но сохраняет рекомендации для профиля " + profileName + ".",
    action: "Проверить Live Data и Executive Widgets",
  }];
}

export function createAS6ExecutiveProfileInsights(state, profileName = "Administrator") {
  const insights = [];
  if (profileName === "Sales") insights.push({ id: "sales-revenue-focus", title: "Фокус на Revenue CRM Fusion", reason: "Sales-профилю важнее сделки, CRM и revenue-сигналы.", action: "Проверить Revenue CRM Fusion" });
  if (profileName === "Finance") insights.push({ id: "finance-kpi-focus", title: "Фокус на Executive KPI", reason: "Finance-профилю важнее KPI, прогноз и риски.", action: "Проверить Executive KPI" });
  if (profileName === "Operations") insights.push({ id: "operations-health-focus", title: "Фокус на Operational Health", reason: "Operations-профилю важнее health, connector и operational signals.", action: "Проверить Global Health" });
  if (profileName === "Administrator") insights.push({ id: "admin-command-focus", title: "Фокус на Executive Command Dashboard", reason: "Administrator-профилю нужен общий контроль сигналов платформы.", action: "Открыть Executive Command Dashboard" });
  if (state.platformStatus?.dashboard !== "LIVE") insights.push({ id: "dashboard-fallback-risk", title: "Dashboard Live Data требует внимания", reason: "Текущий Dashboard status: " + (state.platformStatus?.dashboard || "UNKNOWN"), action: "Проверить Dashboard Live Data" });
  if (state.marketplace?.failures?.length) insights.push({ id: "marketplace-risk", title: "Marketplace сообщает о рисках", reason: "Обнаружены Marketplace failures.", action: "Проверить Marketplace GA" });
  return insights;
}

export function createAS6ExecutiveRecommendations(state, profileName = "Administrator", adaptiveSuggestions = []) {
  const profileInsights = createAS6ExecutiveProfileInsights(state, profileName);
  const adaptiveInsights = adaptiveSuggestions.map((suggestion) => ({
    id: "adaptive-" + suggestion.id,
    title: suggestion.title,
    reason: suggestion.reason,
    action: "Применить через AI Adaptive Home",
  }));
  return [...profileInsights, ...adaptiveInsights].slice(0, 5);
}

export function createAS6ExecutiveInsights(state, profileName = "Administrator", adaptiveSuggestions = []) {
  const recommendations = createAS6ExecutiveRecommendations(state, profileName, adaptiveSuggestions);
  return {
    version: AS6_EXECUTIVE_INSIGHTS_VERSION,
    profileName,
    recommendations: recommendations.length ? recommendations : createAS6ExecutiveFallbackInsights(profileName),
    storagePolicy: "NO_STORAGE_SCHEMA_CHANGE",
    source: "AS6BusinessHomeLiveData + AI Adaptive Home + Executive Profiles",
  };
}
