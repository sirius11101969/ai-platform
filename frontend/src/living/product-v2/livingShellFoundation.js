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
  { id: "finance-team", from: "finance", to: "team", kind: "active", d: "M16 58 C35 48 58 82 83 73" },
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
      activity: "Проверяет финансовый прогноз",
      metricLabel: "Вероятность успешной встречи",
      metricValue: "92%",
      metricDelta: "↑ 3% после завершения проверки",
      intent: "Проверить прогноз перед отправкой инвестору…",
      prepared: ["Финансовую модель", "Презентацию инвестору", "Ответы на вопросы", "План встречи"],
      preparedSummary: "Все ключевые материалы собраны и согласованы.",
      why: "Финансовый прогноз — единственный фактор, который ещё может изменить итог встречи.",
      nextTime: "Через 3 минуты",
      next: "Проверка завершится, и презентация обновится автоматически.",
      change: "Вероятность успешной встречи вырастет до 95%.",
      chain: "Финансы → Документы → Команда",
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
      activity: "Checking the financial forecast",
      metricLabel: "Probability of a successful meeting",
      metricValue: "92%",
      metricDelta: "↑ 3% after the check is complete",
      intent: "Check the forecast before sending it to the investor…",
      prepared: ["Financial model", "Investor presentation", "Answers to questions", "Meeting plan"],
      preparedSummary: "All key materials have been collected and approved.",
      why: "The financial forecast is the only remaining factor that can change the meeting outcome.",
      nextTime: "In 3 minutes",
      next: "The check will finish and the presentation will update automatically.",
      change: "The probability of success will increase to 95%.",
      chain: "Finance → Documents → Team",
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
    urgent_follow_up: "Сделать срочный follow-up",
    send_pricing: "Отправить коммерческие условия",
    align_demo: "Согласовать демонстрацию",
    reply_today: "Ответить клиенту сегодня",
    contact_today: "Связаться с клиентом сегодня",
    needs_follow_up: "Сделать follow-up сегодня",
    nurture: "Сохранить контакт в развитии",
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

function buildIdentity({ user, workspace, fallbackName, locale }) {
  const displayName = cleanName(
    user?.displayName || user?.display_name || user?.fullName || user?.full_name || user?.name,
    fallbackName || (locale === "en" ? "Vladimir" : "Владимир"),
  );
  const brandingMode = ["platform", "co-branded", "company"].includes(workspace?.brandingMode)
    ? workspace.brandingMode
    : "platform";
  const companyLogoUrl = imageUrl(workspace?.companyLogoUrl || workspace?.company_logo_url);
  const rawWorkspaceName = cleanName(workspace?.name, "AS6");
  const workspaceName = brandingMode === "platform" && / workspace$/i.test(rawWorkspaceName)
    ? "AS6"
    : rawWorkspaceName;
  return {
    displayName,
    initial: displayName.charAt(0).toUpperCase() || (locale === "en" ? "V" : "В"),
    avatarUrl: imageUrl(user?.avatarUrl || user?.avatar_url),
    workspaceName,
    workspaceEditableName: rawWorkspaceName,
    brandingMode: brandingMode === "company" && !companyLogoUrl ? "platform" : brandingMode,
    companyLogoUrl,
    showCompanyLogo: brandingMode === "company" && Boolean(companyLogoUrl),
    canManageBranding: ["owner", "admin"].includes(workspace?.role),
  };
}

function countActions(priorityInbox) {
  const metrics = priorityInbox?.metrics || {};
  const sum = ["urgentLeads", "focusLeads", "atRiskDeals", "meetingsToday", "followUpsNeeded"]
    .reduce((total, key) => total + Number(metrics[key] || 0), 0);
  return sum > 0 ? sum : 17;
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
        marketing: metrics.followUpsNeeded ? `${metrics.followUpsNeeded} follow-ups` : localized.marketing[1],
        documents: documentsCount ? `${documentsCount} materials ready` : localized.documents[1],
      }
    : {
        relations: relationsCount ? `Активных контактов: ${relationsCount}` : localized.relations[1],
        sales: metrics.focusLeads ? `В фокусе: ${metrics.focusLeads}` : localized.sales[1],
        marketing: metrics.followUpsNeeded ? `Нужно касаний: ${metrics.followUpsNeeded}` : localized.marketing[1],
        documents: documentsCount ? `Материалов: ${documentsCount}` : localized.documents[1],
      };
  return DEFAULT_SPACES.map((space) => ({
    ...space,
    label: localized[space.id][0],
    note: dynamicNotes[space.id] || localized[space.id][1],
  }));
}

function buildPriority(locale, priorityInbox) {
  const fallback = copy[locale].fallback;
  const lead = priorityInbox?.leads?.[0];
  if (!lead) return { id: "investor-readiness", ...fallback };

  const subject = cleanName(lead.company || lead.name, locale === "en" ? "the priority customer" : "приоритетного клиента");
  const score = Math.max(0, Math.min(100, Number(lead.aiScore || lead.ai_score || 0)));
  const code = String(lead.nextBestActionCode || "");
  const action = actionCopy[locale][code] || (locale === "en" ? "Complete the safest next action" : cleanName(lead.nextBestAction, "Выполнить безопасный следующий шаг"));
  const risk = String(lead.aiRiskLevel || "").toLowerCase();
  const priority = String(lead.aiPriority || "").toLowerCase();
  const riskText = locale === "en"
    ? (risk === "high" ? "high risk" : priority === "urgent" ? "urgent priority" : "current priority")
    : (risk === "high" ? "высокий риск" : priority === "urgent" ? "срочный приоритет" : "текущий приоритет");
  const reason = locale === "en"
    ? `AS6 selected this because it has the strongest verified business signal: ${riskText}.`
    : cleanName(lead.nextBestActionReason, `AS6 выбрал эту задачу как самый сильный подтверждённый бизнес-сигнал: ${riskText}.`);
  const prepared = locale === "en"
    ? ["Customer context", `AI score: ${score}%`, "Safe next action", lead.hasMeeting ? "Meeting context" : "Contact history"]
    : ["Контекст клиента", `AI-оценку: ${score}%`, "Безопасный следующий шаг", lead.hasMeeting ? "Контекст встречи" : "Историю контакта"];

  return {
    id: `priority-${lead.leadId || lead.id}`,
    title: locale === "en" ? `Move the priority with ${subject} forward` : `Продвинуть приоритет по ${subject}`,
    activity: action,
    metricLabel: locale === "en" ? "AI readiness score" : "AI-оценка готовности",
    metricValue: `${score}%`,
    metricDelta: locale === "en" ? `Priority signal: ${riskText}` : `Сигнал приоритета: ${riskText}`,
    intent: locale === "en" ? `${action} for ${subject}…` : `${action} для ${subject}…`,
    prepared,
    preparedSummary: locale === "en" ? "The central goal and both context rails use the same verified snapshot." : "Центр и обе колонки используют один подтверждённый снимок данных.",
    why: reason,
    nextTime: locale === "en" ? "Today" : "Сегодня",
    next: locale === "en" ? "AS6 will prepare an approval-safe action and preserve the full customer context." : "AS6 подготовит действие, требующее подтверждения, и сохранит полный контекст клиента.",
    change: locale === "en" ? `The workspace will move to: ${action.toLowerCase()}.` : `Рабочее пространство перейдёт к результату: ${action.toLowerCase()}.`,
    chain: locale === "en" ? "CRM → Sales → Team" : "CRM → Продажи → Команда",
  };
}

export function createLivingShellSnapshot({
  locale,
  user,
  fallbackProfileName,
  livingData,
  dataStatus = "loading",
  dataError = "",
} = {}) {
  const normalizedLocale = normalizeLivingLocale(locale || user?.locale);
  const t = createLivingTranslator(normalizedLocale);
  const workspace = livingData?.workspace || livingData?.workspaces?.[0] || null;
  const priorityInbox = livingData?.priorityInbox || null;
  const priority = buildPriority(normalizedLocale, priorityInbox);
  const identity = buildIdentity({ user: livingData?.profile || user, workspace, fallbackName: fallbackProfileName, locale: normalizedLocale });
  const dataMessageKey = {
    ready: "dataReady",
    error: "dataError",
    stale: "dataStale",
    offline: "dataOffline",
  }[dataStatus] || "dataLoading";
  return {
    version: "as6-living-shell-foundation-v1",
    snapshotId: `${workspace?.id || "default"}:${priority.id}:${livingData?.loadedAt || "boot"}`,
    locale: normalizedLocale,
    t,
    identity,
    workspace,
    workspaces: livingData?.workspaces || (workspace ? [workspace] : []),
    actionCount: countActions(priorityInbox),
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
