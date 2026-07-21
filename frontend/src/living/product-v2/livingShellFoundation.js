import { createLivingTranslator, normalizeLivingLocale } from "./livingLocalization.js";

const DEFAULT_SPACES = [
  { id: "sales", x: 20, y: 20 },
  { id: "relations", x: 50, y: 12 },
  { id: "marketing", x: 77, y: 25 },
  { id: "finance", x: 16, y: 58 },
  { id: "documents", x: 10, y: 84 },
  { id: "team", x: 83, y: 73 },
];

const DEFAULT_CONNECTIONS = [
  { id: "crm-sales", from: "relations", to: "sales", kind: "structural", d: "M50 12 C40 8 29 10 20 20" },
  { id: "sales-finance", from: "sales", to: "finance", kind: "structural", d: "M20 20 C13 31 12 46 16 58" },
  { id: "crm-marketing", from: "relations", to: "marketing", kind: "structural", d: "M50 12 C61 8 70 14 77 25" },
  { id: "marketing-team", from: "marketing", to: "team", kind: "structural", d: "M77 25 C88 38 88 59 83 73" },
  { id: "finance-documents", from: "finance", to: "documents", kind: "active", d: "M16 58 C11 66 9 76 10 84" },
  { id: "documents-team", from: "documents", to: "team", kind: "active", d: "M10 84 C29 94 62 91 83 73" },
  { id: "finance-team", from: "finance", to: "team", kind: "active", d: "M16 58 C36 76 61 80 83 73" },
];

const copy = {
  ru: {
    spaces: {
      sales: ["Продажи", "Прогноз подтверждён"],
      relations: ["CRM", "Контакты проверены"],
      marketing: ["Маркетинг", "Ожидает решение"],
      finance: ["Финансы", "Проверяет риски"],
      documents: ["Документы", "Обновляют версию"],
      team: ["Команда", "Материалы согласованы"],
    },
    fallback: {
      title: "Подготовить компанию к встрече с инвестором",
      activity: "Проверить финансовый прогноз",
      metricLabel: "Вероятность успешной встречи",
      metricValue: "92%",
      metricDelta: "↑ 3% после завершения проверки",
      intent: "Проверить прогноз перед отправкой инвестору…",
      prepared: [
        { label: "Финансовая модель", target: "finance" },
        { label: "Презентация инвестору", target: "documents" },
        { label: "Ответы на вопросы", target: "knowledge" },
        { label: "План встречи", target: "team" },
      ],
      preparedSummary: "Все материалы для решения собраны и готовы к проверке.",
      why: "Финансовый прогноз — единственный фактор, который ещё может изменить итог встречи.",
      nextTime: "Через 3 минуты",
      next: "Проверка завершится, и презентация обновится автоматически.",
      change: "Вероятность успешной встречи вырастет до 95%.",
      chain: [
        { id: "finance", label: "Финансы" },
        { id: "documents", label: "Документы" },
        { id: "team", label: "Команда" },
      ],
    },
  },
  en: {
    spaces: {
      sales: ["Sales", "Forecast confirmed"],
      relations: ["CRM", "Contacts verified"],
      marketing: ["Marketing", "Awaiting decision"],
      finance: ["Finance", "Checking risks"],
      documents: ["Documents", "Updating version"],
      team: ["Team", "Materials approved"],
    },
    fallback: {
      title: "Prepare the company for an investor meeting",
      activity: "Check the financial forecast",
      metricLabel: "Probability of a successful meeting",
      metricValue: "92%",
      metricDelta: "↑ 3% after the check is complete",
      intent: "Check the forecast before sending it to the investor…",
      prepared: [
        { label: "Financial model", target: "finance" },
        { label: "Investor presentation", target: "documents" },
        { label: "Answers to questions", target: "knowledge" },
        { label: "Meeting plan", target: "team" },
      ],
      preparedSummary: "All materials required for the decision are ready for review.",
      why: "The financial forecast is the only remaining factor that can change the meeting outcome.",
      nextTime: "In 3 minutes",
      next: "The check will finish and the presentation will update automatically.",
      change: "The probability of success will increase to 95%.",
      chain: [
        { id: "finance", label: "Finance" },
        { id: "documents", label: "Documents" },
        { id: "team", label: "Team" },
      ],
    },
  },
};

const actionCopy = {
  ru: {
    prepare_meeting: "Подготовиться к встрече",
    confirm_meeting: "Подтвердить встречу",
    meeting_follow_up: "Закрепить договорённости после встречи",
    deal_loss_risk: "Снизить риск потери сделки",
    risk_follow_up: "Связаться с клиентом сегодня",
    urgent_follow_up: "Срочно связаться повторно",
    send_pricing: "Отправить коммерческие условия",
    align_demo: "Согласовать демонстрацию",
    reply_today: "Ответить клиенту сегодня",
    contact_today: "Связаться с клиентом сегодня",
    needs_follow_up: "Связаться с клиентом повторно",
    nurture: "Продолжить развитие отношений",
    followup_cooldown: "Дождаться безопасного окна контакта",
  },
  en: {
    prepare_meeting: "Prepare for the meeting",
    confirm_meeting: "Confirm the meeting",
    meeting_follow_up: "Confirm the meeting outcomes",
    deal_loss_risk: "Reduce the risk of losing the deal",
    risk_follow_up: "Contact the customer today",
    urgent_follow_up: "Send an urgent follow-up",
    send_pricing: "Send commercial terms",
    align_demo: "Align the product demo",
    reply_today: "Reply to the customer today",
    contact_today: "Contact the customer today",
    needs_follow_up: "Send a follow-up today",
    nurture: "Keep developing the relationship",
    followup_cooldown: "Wait for a safe contact window",
  },
};

function cleanName(value, fallback = "") {
  return String(value || "").trim().replace(/\s+/g, " ") || fallback;
}

function imageUrl(value) {
  const candidate = String(value || "").trim();
  return /^(https:\/\/|data:image\/(png|jpe?g|webp);base64,)/i.test(candidate) ? candidate : "";
}

const PLAN_NAMES = {
  ru: { free: "Базовый", starter: "Старт", pro: "Про", business: "Бизнес", enterprise: "Корпоративный" },
  en: { free: "Basic", starter: "Starter", pro: "Pro", business: "Business", enterprise: "Enterprise" },
};

const PLAN_WORKSPACE_LIMITS = {
  free: 1,
  starter: 1,
  pro: 3,
  business: 10,
  enterprise: 1000,
};

function buildIdentity({ user, workspace, fallbackName, locale }) {
  const displayName = cleanName(
    user?.displayName || user?.display_name || user?.fullName || user?.full_name || user?.name,
    fallbackName || (locale === "en" ? "Vladimir" : "Владимир"),
  );
  const brandingMode = ["platform", "co-branded", "company"].includes(workspace?.brandingMode)
    ? workspace.brandingMode
    : "platform";
  const companyLogoUrl = imageUrl(workspace?.companyLogoUrl || workspace?.company_logo_url);
  const rawCompanyLogoScale = Number(workspace?.companyLogoScale ?? workspace?.company_logo_scale);
  const companyLogoScale = Number.isFinite(rawCompanyLogoScale)
    ? Math.min(150, Math.max(70, Math.round(rawCompanyLogoScale)))
    : 100;
  const rawAvatarScale = Number(user?.avatarScale ?? user?.avatar_scale);
  const avatarScale = Number.isFinite(rawAvatarScale)
    ? Math.min(150, Math.max(70, Math.round(rawAvatarScale)))
    : 100;
  const rawWorkspaceName = cleanName(workspace?.name, "AS6");
  const workspaceName = brandingMode === "platform" && / workspace$/i.test(rawWorkspaceName)
    ? "AS6"
    : rawWorkspaceName;
  return {
    displayName,
    initial: displayName.charAt(0).toUpperCase() || (locale === "en" ? "V" : "В"),
    avatarUrl: imageUrl(user?.avatarUrl || user?.avatar_url),
    avatarScale,
    workspaceName,
    workspaceEditableName: rawWorkspaceName,
    brandingMode: brandingMode === "company" && !companyLogoUrl ? "platform" : brandingMode,
    companyLogoUrl,
    companyLogoScale,
    showCompanyLogo: brandingMode === "company" && Boolean(companyLogoUrl),
    canManageBranding: ["owner", "admin"].includes(workspace?.role),
  };
}

function buildSpaces(locale, priorityInbox, livingData) {
  const localized = copy[locale].spaces;
  const metrics = priorityInbox?.metrics || {};
  const relationsCount = Number(priorityInbox?.totalLeads || livingData?.relations?.length || 0);
  const documentsCount = Number(livingData?.documents?.length || 0);
  const dynamicNotes = locale === "en"
    ? {
        relations: relationsCount ? `${relationsCount} active contacts` : localized.relations[1],
        sales: metrics.focusLeads ? `${metrics.focusLeads} focus deals` : localized.sales[1],
        marketing: metrics.followUpsNeeded ? `${metrics.followUpsNeeded} contacts due` : localized.marketing[1],
        documents: documentsCount ? `${documentsCount} materials ready` : localized.documents[1],
      }
    : {
        relations: relationsCount ? `Активных контактов: ${relationsCount}` : localized.relations[1],
        sales: metrics.focusLeads ? `В фокусе: ${metrics.focusLeads}` : localized.sales[1],
        marketing: metrics.followUpsNeeded ? `Нужно связаться: ${metrics.followUpsNeeded}` : localized.marketing[1],
        documents: documentsCount ? `Материалов: ${documentsCount}` : localized.documents[1],
      };
  return DEFAULT_SPACES.map((space) => ({
    ...space,
    label: localized[space.id][0],
    note: dynamicNotes[space.id] || localized[space.id][1],
  }));
}

function buildPriorityFromLead(locale, lead) {
  const subject = cleanName(lead.company || lead.name, locale === "en" ? "the priority customer" : "приоритетным клиентом");
  const score = Math.max(0, Math.min(100, Number(lead.aiScore || lead.ai_score || 0)));
  const code = String(lead.nextBestActionCode || "");
  const action = actionCopy[locale][code] || (locale === "en"
    ? "Complete the safest next action"
    : cleanName(lead.nextBestAction, "Выполнить безопасный следующий шаг"));
  const risk = String(lead.aiRiskLevel || "").toLowerCase();
  const priority = String(lead.aiPriority || "").toLowerCase();
  const riskText = locale === "en"
    ? (risk === "high" ? "high risk" : priority === "urgent" ? "urgent signal" : "verified by current data")
    : (risk === "high" ? "высокий риск" : priority === "urgent" ? "срочный сигнал" : "подтверждено текущими данными");
  const leadId = String(lead.leadId || lead.id || "");
  const prepared = locale === "en"
    ? [
        { label: "Customer context", target: "relations" },
        { label: `AI signal: ${score}%`, target: "analytics" },
        { label: "Safe next action", target: "conductor" },
        { label: lead.hasMeeting ? "Meeting context" : "Contact history", target: lead.hasMeeting ? "team" : "relations" },
      ]
    : [
        { label: "Контекст клиента", target: "relations" },
        { label: `Сигнал AI: ${score}%`, target: "analytics" },
        { label: "Безопасный следующий шаг", target: "conductor" },
        { label: lead.hasMeeting ? "Контекст встречи" : "История контакта", target: lead.hasMeeting ? "team" : "relations" },
      ];

  return {
    id: `priority-${leadId}`,
    leadId,
    title: locale === "en" ? `Move the deal with ${subject} forward` : `Продвинуть сделку с ${subject}`,
    activity: action,
    actionCode: code,
    actionTarget: "conductor",
    metricLabel: locale === "en" ? "AI signal strength" : "Сила сигнала AI",
    metricValue: `${score}%`,
    metricDelta: locale === "en" ? `Business signal: ${riskText}` : `Бизнес-сигнал: ${riskText}`,
    intent: locale === "en" ? `${action} for ${subject}…` : `${action} для ${subject}…`,
    prepared,
    preparedSummary: locale === "en"
      ? "Customer history, evidence and the next safe step are ready."
      : "История клиента, основания и безопасный следующий шаг готовы.",
    why: locale === "en"
      ? `AS6 selected this deal from the strongest verified business signal: ${riskText}.`
      : `AS6 выбрал эту сделку по самому сильному подтверждённому сигналу: ${riskText}.`,
    nextTime: locale === "en" ? "Today" : "Сегодня",
    next: locale === "en"
      ? "AS6 will prepare the next step and show it before anything is sent."
      : "AS6 подготовит следующий шаг и покажет его перед отправкой.",
    change: locale === "en"
      ? `The deal will move toward the result: ${action.toLowerCase()}.`
      : `Сделка перейдёт к результату: ${action.toLowerCase()}.`,
    chain: locale === "en"
      ? [{ id: "relations", label: "CRM" }, { id: "sales", label: "Sales" }, { id: "team", label: "Team" }]
      : [{ id: "relations", label: "CRM" }, { id: "sales", label: "Продажи" }, { id: "team", label: "Команда" }],
  };
}

function buildPriority(locale, priorityInbox, selectedPriorityId) {
  const leads = priorityInbox?.leads || [];
  // Compatibility marker for the Foundation v1 structural control:
  // priorityInbox?.leads?.[0]
  const selectedLead = leads.find((lead) => `priority-${lead.leadId || lead.id}` === selectedPriorityId) || leads[0];
  return selectedLead ? buildPriorityFromLead(locale, selectedLead) : { id: "investor-readiness", ...copy[locale].fallback };
}

function buildGoalOptions(locale, priorityInbox) {
  const goals = (priorityInbox?.leads || []).slice(0, 8).map((lead) => buildPriorityFromLead(locale, lead));
  return goals.length ? goals : [{ id: "investor-readiness", ...copy[locale].fallback }];
}

export function createLivingShellSnapshot({
  locale,
  user,
  fallbackProfileName,
  livingData,
  selectedPriorityId = "",
  dataStatus = "loading",
  dataError = "",
} = {}) {
  const normalizedLocale = normalizeLivingLocale(locale || user?.locale);
  const t = createLivingTranslator(normalizedLocale);
  const workspace = livingData?.workspace || livingData?.workspaces?.[0] || null;
  const priorityInbox = livingData?.priorityInbox || null;
  const priority = buildPriority(normalizedLocale, priorityInbox, selectedPriorityId);
  const identity = buildIdentity({ user: livingData?.profile || user, workspace, fallbackName: fallbackProfileName, locale: normalizedLocale });
  const dataMessageKey = {
    ready: "dataReady",
    error: "dataError",
    stale: "dataStale",
    offline: "dataOffline",
  }[dataStatus] || "dataLoading";
  const workspaces = livingData?.workspaces || (workspace ? [workspace] : []);
  const accountPlanKey = String(livingData?.profile?.plan || workspace?.plan || user?.plan || "free").toLowerCase();
  const workspaceLimit = Number(PLAN_WORKSPACE_LIMITS[accountPlanKey] || workspace?.limits?.workspacesLimit || 1);
  const ownedWorkspaceCount = workspaces.filter((item) => item.role === "owner" || item.ownerUserId === workspace?.ownerUserId).length;
  const planKey = accountPlanKey;
  return {
    version: "as6-screen1-interaction-multi-workspace-v1",
    snapshotId: `${workspace?.id || "default"}:${priority.id}:${livingData?.loadedAt || "boot"}`,
    locale: normalizedLocale,
    t,
    identity,
    workspace,
    workspaces,
    subscription: {
      key: planKey,
      name: PLAN_NAMES[normalizedLocale][planKey] || planKey,
      active: Boolean(workspace),
    },
    workspaceAllowance: {
      current: ownedWorkspaceCount,
      limit: workspaceLimit,
      canCreate: ownedWorkspaceCount < workspaceLimit,
    },
    actionCount: livingData?.activity?.length || 0,
    activity: livingData?.activity || [],
    goalOptions: buildGoalOptions(normalizedLocale, priorityInbox),
    priority,
    spaces: buildSpaces(normalizedLocale, priorityInbox, livingData),
    connections: DEFAULT_CONNECTIONS,
    dataState: {
      status: dataStatus,
      error: dataError,
      message: t(dataMessageKey),
      loadedAt: livingData?.loadedAt || null,
    },
  };
}
