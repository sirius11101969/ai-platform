import { createAS6DashboardLiveSnapshot, getAS6DashboardLiveDataStatus } from "../../data/as6DashboardLiveData";
import { getAS6BusinessWorkspaceState } from "../business-workspace";
import { getAS6BusinessNavigationState } from "../business-navigation";
import { getAS6MarketplaceGAState } from "../plugins/AS6MarketplaceGA";

export const AS6_BUSINESS_HOME_LIVE_DATA_VERSION = "EPIC001_PR3";

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    return { ...fallback, error: error?.message || "AS6_BUSINESS_HOME_LIVE_DATA_ERROR" };
  }
}

function compactNumber(value, fallback = "0") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return String(value);
}

function getMetricSource(snapshot, path, fallback) {
  return path.reduce((acc, key) => acc?.[key], snapshot?.widgets) ?? fallback;
}

export function createAS6BusinessHomeLiveData() {
  const dashboardSnapshot = safeCall(() => createAS6DashboardLiveSnapshot(), { widgets: {}, freshness: "fallback" });
  const dashboardStatus = safeCall(() => getAS6DashboardLiveDataStatus(), { status: "FALLBACK", widgetCount: 0 });
  const workspace = safeCall(() => getAS6BusinessWorkspaceState(), { modules: [], notifications: [], recentItems: [] });
  const navigation = safeCall(() => getAS6BusinessNavigationState(), { items: [], sections: [], tree: [] });
  const marketplace = safeCall(() => getAS6MarketplaceGAState(), { status: "AS6_MARKETPLACE_GA_UNKNOWN", packageCount: 0, failures: [] });

  const revenue = getMetricSource(dashboardSnapshot, ["revenue"], {});
  const crm = getMetricSource(dashboardSnapshot, ["crm"], {});
  const workforce = getMetricSource(dashboardSnapshot, ["workforce"], {});
  const productionHealth = getMetricSource(dashboardSnapshot, ["productionHealth"], {});

  const metrics = [
    {
      label: "Revenue",
      value: compactNumber(revenue.monthlyRecurringRevenue ?? revenue.revenue ?? revenue.total ?? "live"),
      trend: revenue.trend || revenue.status || dashboardSnapshot.freshness,
    },
    {
      label: "CRM",
      value: compactNumber(crm.activeDeals ?? crm.deals ?? crm.totalDeals ?? workspace.modules?.length),
      trend: crm.riskSummary || crm.status || "workspace linked",
    },
    {
      label: "AI Workforce",
      value: compactNumber(workforce.activeAgents ?? workforce.agents ?? workforce.total ?? navigation.items?.length),
      trend: workforce.status || "navigation linked",
    },
    {
      label: "Platform",
      value: productionHealth.status || dashboardStatus.status || "LIVE",
      trend: marketplace.status || "Marketplace GA",
    },
  ];

  const brief = {
    title: dashboardStatus.status === "LIVE" ? "Business Home подключён к живым данным" : "Business Home использует fallback snapshot",
    summary: "Сводка собрана из Dashboard Live Data, Business Workspace, Universal Navigation и Marketplace GA.",
    actions: [
      "Открыть CRM",
      "Проверить Platform Health",
      "Запустить Command Center",
    ],
  };

  const recommendations = [
    marketplace.failures?.length ? "Проверить Marketplace GA failures перед установкой новых расширений." : "Marketplace 1.0 GA активен и готов к расширениям.",
    workspace.notifications?.length ? "Просмотреть новые уведомления рабочего пространства." : "Добавить реальные уведомления рабочего дня в Workspace Runtime.",
    navigation.items?.length ? "Использовать Universal Navigation для быстрого перехода в ключевые модули." : "Зарегистрировать рабочие пространства в Universal Navigation.",
  ];

  const activity = [
    "Dashboard Live Data snapshot: " + (dashboardSnapshot.freshness || "unknown"),
    "Workspace modules: " + (workspace.modules?.length || 0),
    "Navigation items: " + (navigation.items?.length || 0),
    "Marketplace status: " + (marketplace.status || "unknown"),
  ];

  return {
    version: AS6_BUSINESS_HOME_LIVE_DATA_VERSION,
    generatedAt: dashboardSnapshot.generatedAt || new Date().toISOString(),
    dashboardSnapshot,
    dashboardStatus,
    workspace,
    navigation,
    marketplace,
    brief,
    metrics,
    recommendations,
    activity,
    platformStatus: {
      dashboard: dashboardStatus.status,
      widgets: dashboardStatus.widgetCount,
      marketplace: marketplace.status,
      packages: marketplace.packageCount,
      navigationItems: navigation.items?.length || 0,
      workspaceModules: workspace.modules?.length || 0,
    },
  };
}
