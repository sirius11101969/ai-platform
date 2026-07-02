export const AS6_EXECUTIVE_WORKSPACE_PROFILE_VERSION = "EPIC002_PR4";

export const AS6_EXECUTIVE_WIDGET_IDS = [
  "executive-command-dashboard",
  "executive-kpi",
  "executive-platform-health",
  "executive-risk-brief",
  "backend-connector-status",
  "global-health-bar",
  "live-operational-data-status",
  "dashboard-live-data-status",
  "revenue-crm-fusion-status",
];

export const AS6_EXECUTIVE_WORKSPACE_PROFILES = {
  Administrator: [
    "executive-command-dashboard",
    "global-health-bar",
    "backend-connector-status",
    "live-operational-data-status",
    "dashboard-live-data-status",
    "executive-risk-brief",
  ],
  Sales: [
    "executive-kpi",
    "revenue-crm-fusion-status",
    "executive-command-dashboard",
    "executive-risk-brief",
    "dashboard-live-data-status",
  ],
  Finance: [
    "revenue-crm-fusion-status",
    "executive-kpi",
    "executive-command-dashboard",
    "dashboard-live-data-status",
    "executive-risk-brief",
  ],
  Operations: [
    "global-health-bar",
    "live-operational-data-status",
    "backend-connector-status",
    "executive-platform-health",
    "executive-command-dashboard",
  ],
};

export function getAS6ExecutiveWorkspaceProfiles() {
  return Object.keys(AS6_EXECUTIVE_WORKSPACE_PROFILES);
}

export function getAS6ExecutiveWorkspaceProfile(profileName = "Administrator") {
  return AS6_EXECUTIVE_WORKSPACE_PROFILES[profileName] || AS6_EXECUTIVE_WORKSPACE_PROFILES.Administrator;
}

export function applyAS6ExecutiveWorkspaceProfile(layout, profileName = "Administrator") {
  const profileWidgets = getAS6ExecutiveWorkspaceProfile(profileName);
  const profileOrder = new Map(profileWidgets.map((widgetId, index) => [widgetId, index]));
  const existingWidgets = Array.isArray(layout?.widgets) ? layout.widgets : [];
  const nextWidgets = existingWidgets.map((widget) => {
    if (!AS6_EXECUTIVE_WIDGET_IDS.includes(widget.id)) return widget;
    const profileIndex = profileOrder.has(widget.id) ? profileOrder.get(widget.id) : profileWidgets.length + AS6_EXECUTIVE_WIDGET_IDS.indexOf(widget.id);
    return {
      ...widget,
      visible: profileOrder.has(widget.id),
      pinned: profileIndex < 3,
      order: profileIndex,
    };
  });
  return {
    ...layout,
    widgets: nextWidgets.map((widget, index) => ({ ...widget, order: Number.isFinite(widget.order) ? widget.order : index })),
  };
}

export function createAS6ExecutiveProfileRecommendation(profileName = "Administrator") {
  return {
    id: "apply-executive-profile-" + profileName.toLowerCase(),
    title: "Применить профиль " + profileName,
    reason: "AS6 рекомендует порядок Executive-виджетов для роли " + profileName + ". Пользовательская схема хранения не меняется.",
    profileName,
  };
}
