import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { sanitizeCustomerVisibleText, sanitizeVisibleAiText } from "../utils/uiSanitizer";
import { REVENUE_LEAD_FILTERS, REVENUE_SORT_OPTIONS, buildRecommendationQueue, filterAndSortRevenueLeads, getForecastWidget, getRevenueCards } from "../utils/revenueIntelligence";
import {
  addCrmLeadNote,
  createCrmFollowUp,
  createAiAgentAction,
  createCrmLead,
  deleteCrmLead,
  downloadCrmMeetingIcs,
  fetchCrmActivity,
  fetchCrmLeads,
  fetchCrmStages,
  fetchCrmStats,
  fetchTelegramMessages,
  fetchEmailTemplates,
  fetchLeadEmails,
  fetchLeadActionCenter,
  fetchAiApprovalQueue,
  approveAiApprovalQueueItem,
  rejectAiApprovalQueueItem,
  updateAiApprovalQueueItem,
  executeAiApprovalQueueItem,
  fetchMaterials,
  generateLeadEmail,
  sendLeadEmail,
  sendLeadAiAction,
  approveLeadAiAction,
  cancelLeadAiAction,
  updateLeadAiAction,
  createLeadAiAction,
  sendLeadMaterials,
  uploadEmailAttachment,
  updateCrmLead,
  runCrmLeadScoring,
  runCrmLeadScoringForLead,
  sendTelegramLeadMessage,
  queueInactiveAiFollowUps,
  updateCrmStage,
  getActiveAiSequences,
  startAiSequence,
  pauseAiSequence,
  stopAiSequence,
  getRevenueIntelligence,
  getLeadScores,
  triggerRevenueAnalysis,
  applyAiSecretaryLeadAction,
  markTestPaymentPaid,
} from "../services/api";

const DEFAULT_CRM_STAGES = [
  { status: "new", title: "Новый" },
  { status: "qualified", title: "Квалификация" },
  { status: "proposal", title: "Предложение" },
  { status: "booked", title: "Встреча" },
  { status: "won", title: "Успешно" },
  { status: "lost", title: "Потеряно" },
];

const initialLeadForm = { name: "", email: "", telegram: "", company: "", value: "", notes: "", source: "ручной ввод", status: "new" };


function clampPercent(value) {
  const n = Number(value || 0)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—"

  const raw = String(value)

  // Do not try to parse normal CRM/AI text as a date.
  // This prevents noisy console warnings when timeline body text is passed accidentally.
  const looksLikeDate =
    /^\d{4}-\d{2}-\d{2}/.test(raw) ||
    /^\d{2}\.\d{2}\.\d{4}/.test(raw) ||
    raw.includes('T')

  if (!looksLikeDate) return "—"

  const d = new Date(raw)

  if (Number.isNaN(d.getTime())) return "—"

  try {
    return d.toLocaleString()
  } catch {
    return "—"
  }
}


const DEFAULT_AI_SEQUENCE_TEMPLATE_NAME = "Enterprise Demo Follow-up";

function sequenceStatusLabel(status) {
  return ({ active: "Active", paused: "Paused", completed: "Completed", stopped: "Stopped" }[status] || status || "Not started");
}

function getSequenceTemplates(sequenceDashboard = {}) {
  const templates = new Map();
  [...(sequenceDashboard.activeSequences || []), ...(sequenceDashboard.upcomingSteps || []), ...(sequenceDashboard.stoppedSequences || [])].forEach((sequence) => {
    if (sequence?.templateId && sequence?.templateName) templates.set(sequence.templateId, sequence.templateName);
  });
  return [{ id: "", name: DEFAULT_AI_SEQUENCE_TEMPLATE_NAME }, ...Array.from(templates, ([id, name]) => ({ id, name })).filter((item) => item.name !== DEFAULT_AI_SEQUENCE_TEMPLATE_NAME)];
}

function getLeadActiveSequence(sequenceDashboard = {}, leadId) {
  return (sequenceDashboard.activeSequences || []).find((sequence) => sequence.leadId === leadId) || null;
}

function getSequenceSafeStatus(sequence) {
  if (!sequence) return "AI will generate drafts for manager approval.";
  if (sequence.status === "active" && sequence.currentStep > 0) return "Step generated and waiting for approval";
  if (sequence.status === "active") return "AI will generate drafts for manager approval.";
  return sequenceStatusLabel(sequence.status);
}


function getScheduledMeetings(lead) {
  return Array.isArray(lead?.meetings) ? lead.meetings.filter((meeting) => meeting.status !== 'cancelled') : [];
}

function calendarStatusLabel(status) {
  return ({ pending: 'ожидает', ics_ready: 'ICS готов', synced: 'синхронизировано', failed: 'ошибка' }[status] || status || 'ожидает');
}

function calendarProviderLabel(provider) {
  return provider === 'google' ? 'Google Calendar' : 'ICS';
}

function toForm(lead) {
  return {
    name: lead?.name || "",
    email: lead?.email || "",
    telegram: lead?.telegram || "",
    company: lead?.company || "",
    value: lead?.value || "",
    notes: lead?.notesText || "",
    source: lead?.source || "ручной ввод",
    status: lead?.status || "new",
  };
}

function getLeadActivity(lead, activity) {
  return activity.filter((event) => event.leadId === lead?.id);
}

function getActivityTitle(event) {
  const titles = {
    lead_created: "Лид создан",
    lead_moved: "Лид перемещён",
    ai_followup_generated: "AI‑дожим создан",
    note_added: "Заметка добавлена",
    lead_updated: "Лид обновлён",
    telegram_lead_updated: "Telegram лид обновлён",
    telegram_message_received: "Telegram сообщение получено",
    telegram_reply_received: "Ответ Telegram получен",
    telegram_connected: "Telegram подключён",
    telegram_message_sent: "Telegram сообщение отправлено",
    telegram_ai_reply_sent: "AI ответ отправлен в Telegram",
    ai_telegram_reply_drafted: "AI Telegram черновик создан",
    telegram_reply_analysis_created: "AI анализ Telegram создан",
    meeting_scheduled: "Встреча запланирована",
    calendar_ics_created: "ICS файл встречи создан",
    follow_up_scheduled: "Follow‑up запланирован",
    attachment_delivered: "Вложение доставлено",
    email_opened: "Клиент открыл email",
    email_sent: "Email отправлен",
    email_queued: "Email поставлен в очередь",
    ai_forecast_updated: "AI прогноз обновлён",
    ai_risk_detected: "AI риск обнаружен",
    ai_score_updated: "AI score обновлён",
  };
  return titles[event?.type] || event?.title || "Событие CRM";
}

function formatCrmText(value) {
  const formatted = String(value || "")
    .replace(/AI follow-up:/gi, "AI‑дожим:")
    .replace(/AI follow‑up/gi, "AI‑дожим")
    .replace(/AI reply sent:/gi, "AI ответ отправлен:")
    .replace(/Telegram message received/gi, "Telegram сообщение получено");
  return sanitizeVisibleAiText(formatted);
}

function formatLeadSource(source) {
  if (source === "telegram") return "Telegram";
  return source || "—";
}

function isTelegramLead(lead) {
  return lead?.source === "telegram" || Boolean(lead?.telegram || lead?.telegramId || lead?.telegramChatId);
}

function hasTelegramChatId(lead) {
  return Boolean(lead?.telegramChatId || lead?.hasTelegramChatId || lead?.metadata?.telegramChatId);
}

function getLeadTelegramConnectLink(lead) {
  return lead?.telegramConnectLink || lead?.metadata?.telegramConnectLink || '';
}




function aiSecretaryActionLabel(action) {
  if (action === 'call') return '📞 Позвонить'
  if (action === 'meeting') return '📅 Встреча'
  if (action === 'proposal') return '📨 КП'
  if (action === 'checkout') return '💳 Оплата'
  return '—'
}

function paymentStatusLabel(status) {
  if (status === 'paid') return '🟢 paid'
  if (status === 'pending') return '🟡 pending'
  return '—'
}

function getLeadAiScore(lead) {
  return lead?.aiScore || null;
}

function riskLabel(level) {
  return ({ low: 'Низкий риск', medium: 'Средний риск', high: 'Высокий риск' }[level] || 'Средний риск');
}

function urgencyLabel(level) {
  return ({ low: 'Низкая срочность', medium: 'Средняя срочность', high: 'Высокая срочность' }[level] || 'Срочность не определена');
}

function tempLabel(level) {
  return ({ cold: 'COLD', warm: 'WARM', hot: 'HOT', priority: 'PRIORITY' }[level] || 'AI');
}

function channelLabel(channel) {
  return ({ telegram: 'Telegram', email: 'Email', phone: 'Phone', voice: 'AI Voice', crm_task: 'CRM task', Telegram: 'Telegram', Email: 'Email', Voice: 'AI Voice', 'Задача менеджеру': 'CRM task' }[channel] || channel || 'CRM task');
}

function getLatestAiVoiceCall(lead) {
  return lead?.latestAiVoiceCall || lead?.latest_ai_voice_call || null;
}

function forecastLabel(category) {
  return ({ committed: 'Committed', likely: 'Likely', possible: 'Possible', at_risk: 'At risk', lost_risk: 'Lost risk' }[category] || 'Possible');
}

function getLatestForecastEvent(actionCenter = {}) {
  return (actionCenter.timeline || []).find((event) => ['ai_forecast_updated', 'ai_risk_detected', 'ai_score_updated', 'lead_scored', 'lead_risk_detected'].includes(event?.type));
}

function getAiBadges(lead) {
  const score = getLeadAiScore(lead);
  if (!score) return [];
  return [
    (lead.aiTemperature || score.temperature) === 'priority' && 'PRIORITY',
    (lead.aiTemperature || score.temperature) === 'hot' && 'HOT',
    (lead.aiTemperature || score.temperature) === 'warm' && 'WARM',
    (lead.aiPriority || score.priority) && `PRIORITY: ${(lead.aiPriority || score.priority).toUpperCase()}`,
    score.score >= 80 && 'AI PRIORITY',
    score.dealProbability >= 70 && 'HIGH PROBABILITY',
    score.urgencyLevel === 'high' && 'FOLLOW-UP REQUIRED',
    score.riskLevel === 'high' && 'AT RISK',
  ].filter(Boolean);
}


function getOutreachDrafts(lead, channel) {
  return (lead?.aiOutreachDrafts || []).filter((draft) => draft.channel === channel || draft.actionType === `${channel}_draft`);
}

function outreachTypeLabel(type) {
  return ({ first_contact: 'Первый контакт', followup_24h: 'Follow-up 24ч', followup_3d: 'Follow-up 3д', meeting_request: 'Встреча', demo_offer: 'Demo offer', recommendation_only: 'Рекомендация' }[type] || type || 'Outreach');
}

function getAiRecommendation(lead) {
  return lead?.aiRecommendation || (lead?.aiActions || []).find((action) => action.task_type === 'analyze_lead' && action.status === 'completed')?.output_result || null;
}

function getAiSummaryText(recommendation) {
  if (!recommendation) return 'AI анализ ещё не запускался';
  if (recommendation.nextBestAction) return sanitizeVisibleAiText(recommendation.nextBestAction);
  if (Array.isArray(recommendation.recommendations) && recommendation.recommendations[0]) return sanitizeVisibleAiText(recommendation.recommendations[0]);
  return sanitizeVisibleAiText(recommendation.content || recommendation.rawText || 'AI рекомендация готова');
}


function actionStatusLabel(status) {
  return ({ draft: 'черновик', pending_approval: 'ждёт одобрения', approved: 'одобрено', executing: 'выполняется', completed: 'выполнено', executed: 'исполнено', rejected: 'отклонено', sent: 'отправлено', failed: 'ошибка', cancelled: 'отклонено' }[status] || status);
}

function actionTypeLabel(type) {
  return ({ telegram_followup: 'Telegram follow-up', email_followup: 'Email follow-up', telegram_follow_up: 'Telegram follow-up', email_follow_up: 'Email follow-up', telegram_draft: 'Telegram draft', email_draft: 'Email draft', followup_24h: 'Follow-up 24ч', followup_3d: 'Follow-up 3д', demo_offer: 'Demo offer', meeting_request: 'Запрос встречи', follow_up_recommendation: 'Follow-up', crm_next_action: 'CRM действие', lead_prioritization: 'Приоритизация', commercial_offer: 'Коммерческое предложение', send_presentation: 'Отправить презентацию', send_screenshots: 'Отправить скриншоты', send_demo_link: 'Отправить demo link', move_lead_stage: 'Переместить этап', stage_change_recommendation: 'AI рекомендация этапа', lead_priority_recommendation: 'AI рекомендация приоритета', lead_scoring_update: 'AI Lead Scoring', create_reminder: 'Создать напоминание' }[type] || type);
}


function getStageRecommendation(lead, actionCenter = {}) {
  return lead?.aiStageRecommendation || (actionCenter.approvalItems || []).find((item) => item.leadId === lead?.id && (item.actionType || item.executionType) === 'stage_change_recommendation') || null;
}

function getRecommendedStage(item) {
  const payload = item?.payload || item || {};
  return payload.toStage || payload.nextStatus || payload.recommendedStage || payload.status || item?.recommendedStage || '';
}

function getStageRecommendationReason(item) {
  const payload = item?.payload || item || {};
  return sanitizeVisibleAiText(payload.reason || item?.reason || item?.recommendation || 'AI обнаружил сигнал для смены этапа.');
}

function getStageRecommendationConfidence(item) {
  const payload = item?.payload || item || {};
  return Number(payload.confidence ?? item?.confidence ?? 0);
}

function timelineTitle(event) {
  return ({ telegram_connected: 'Telegram подключён', telegram_reply_received: 'Ответ Telegram получен', telegram_message_sent: 'Telegram сообщение отправлено', telegram_inbound: 'Telegram inbound', telegram_outbound_ai: 'Telegram outbound AI', ai_draft_created: 'AI черновик создан', ai_draft_approved: 'AI черновик одобрен', telegram_sent: 'Telegram отправлен', lead_replied: 'Лид ответил', send_failed: 'Отправка не выполнена', ai_stage_suggested: 'AI предложил этап', ai_stage_recommendation: 'AI рекомендовал этап', stage_approved: 'Этап одобрен', stage_changed: 'Этап изменён', opportunity_risk_detected: 'Риск сделки обнаружен', ai_risk_detected: 'AI риск обнаружен', ai_forecast_updated: 'AI прогноз обновлён', ai_next_action_generated: 'AI следующий шаг', email_sent: 'Email отправлен', email_failed: 'Email не отправлен', ai_score_updated: 'AI score обновлён', follow_up_draft: 'Follow-up черновик', sent_follow_up: 'Follow-up отправлен', attachments_sent: 'Материалы отправлены', lead_moved: 'Этап изменён', note_added: 'Заметка', ai_action_sent: 'AI действие отправлено', ai_action_approved: 'AI действие одобрено', ai_action_rejected: 'AI действие отклонено', ai_action_executed: 'AI действие выполнено', ai_action_failed: 'AI действие не выполнено', ai_telegram_reply_drafted: 'AI Telegram черновик создан', telegram_reply_analysis_created: 'AI анализ Telegram создан', follow_up_suggested: 'Follow-up suggested', follow_up_approved: 'Follow-up approved', follow_up_rejected: 'Follow-up rejected', follow_up_sent: 'Follow-up sent', follow_up_failed: 'Follow-up failed', calendar_ics_created: 'ICS файл встречи создан' }[event?.type] || event?.title || 'Событие');
}

const modalCloseStack = [];

function useModalCloseLifecycle(onClose, { canClose = true } = {}) {
  useEffect(() => {
    const stackToken = Symbol("crm-modal");
    const previousBodyOverflow = document.body.style.overflow;
    modalCloseStack.push(stackToken);
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      const isTopModal = modalCloseStack[modalCloseStack.length - 1] === stackToken;
      if (event.key === "Escape" && isTopModal && canClose) {
        event.stopPropagation();
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      const stackIndex = modalCloseStack.indexOf(stackToken);
      if (stackIndex !== -1) modalCloseStack.splice(stackIndex, 1);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [canClose, onClose]);
}

export default function CRMPage() {
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState(DEFAULT_CRM_STAGES);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stageSaving, setStageSaving] = useState({});
  const [followUpLoading, setFollowUpLoading] = useState({});
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dropTargetStage, setDropTargetStage] = useState(null);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [telegramMessages, setTelegramMessages] = useState([]);
  const [telegramDraft, setTelegramDraft] = useState('');
  const [telegramSending, setTelegramSending] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [leadEmails, setLeadEmails] = useState([]);
  const [emailComposer, setEmailComposer] = useState({ template: 'commercial_proposal', to: '', subject: '', text: '', html: '', attachmentIds: [] });
  const [emailAttachments, setEmailAttachments] = useState([]);
  const [emailBusy, setEmailBusy] = useState(false);
  const [actionCenter, setActionCenter] = useState({ actions: [], approvalItems: [], timeline: [], attachments: [] });
  const [materials, setMaterials] = useState([]);
  const [executionBusy, setExecutionBusy] = useState({});
  const [aiActionBusy, setAiActionBusy] = useState({});
  const [inactiveQueueBusy, setInactiveQueueBusy] = useState(false);
  const [aiAnalysisBusy, setAiAnalysisBusy] = useState(false);
  const [meetingIcsDownloadingId, setMeetingIcsDownloadingId] = useState(null);
  const [aiSequenceDashboard, setAiSequenceDashboard] = useState({ activeSequences: [], upcomingSteps: [], stoppedSequences: [], metrics: {} });
  const [aiSequenceTemplateId, setAiSequenceTemplateId] = useState("");
  const [aiSequenceBusy, setAiSequenceBusy] = useState({});
  const [aiSequenceMessage, setAiSequenceMessage] = useState("");
  const [aiSequenceError, setAiSequenceError] = useState("");
  const [revenueIntelligence, setRevenueIntelligence] = useState(null);
  const [revenueBrainBusy, setRevenueBrainBusy] = useState(false);
  const [revenueToast, setRevenueToast] = useState("");
  const [leadScoreSort, setLeadScoreSort] = useState("priorityScore");
  const [leadScoreFilter, setLeadScoreFilter] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedLeadId) || null, [leads, selectedLeadId]);
  const stageMap = useMemo(() => stages.reduce((acc, stage) => ({ ...acc, [stage.status]: stage.title }), {}), [stages]);
  const closeLeadModal = useCallback(() => {
    setSelectedLeadId(null);
    setIsEditingDetail(false);

    const params = new URLSearchParams(location.search);
    const hadLeadParam = params.has("lead") || params.has("leadId");
    params.delete("lead");
    params.delete("leadId");

    if (hadLeadParam) {
      const search = params.toString();
      navigate(`${location.pathname}${search ? `?${search}` : ""}${location.hash}`, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  async function loadCrm({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const shouldLoadStatic = !silent
      const shouldLoadRevenue = !silent

      const [leadsResponse, stagesResponse, statsResponse, activityResponse, templatesResponse, materialsResponse, sequencesResponse, revenueResponse] = await Promise.all([
        fetchCrmLeads(),
        shouldLoadStatic ? fetchCrmStages() : Promise.resolve(null),
        fetchCrmStats(),
        fetchCrmActivity(),
        shouldLoadStatic ? fetchEmailTemplates().catch(() => ({ templates: [] })) : Promise.resolve(null),
        shouldLoadStatic ? fetchMaterials().catch(() => ({ materials: [] })) : Promise.resolve(null),
        getActiveAiSequences(),
        shouldLoadRevenue ? getRevenueIntelligence() : Promise.resolve(null),
      ]);
      setLeads(leadsResponse.leads || []);
      if (stagesResponse) setStages((stagesResponse.stages?.length ? stagesResponse.stages : DEFAULT_CRM_STAGES));
      setStats(statsResponse.stats || null);
      setActivity(activityResponse.events || statsResponse.stats?.activity || []);
      if (templatesResponse) setEmailTemplates(templatesResponse.templates || []);
      if (materialsResponse) setMaterials(materialsResponse.materials || []);
      setAiSequenceDashboard(sequencesResponse || { activeSequences: [], upcomingSteps: [], stoppedSequences: [], metrics: {} });
      if (revenueResponse) setRevenueIntelligence(revenueResponse?.intelligence || null);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить CRM");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCrm(); }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadCrm({ silent: true }).catch(() => undefined)
      refreshMeta().catch(() => undefined)
    }, 15000)

    return () => window.clearInterval(intervalId)
  }, []);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const leadIdFromUrl = params.get("leadId") || params.get("lead");
    if (!leadIdFromUrl || leads.length === 0) return;
    if (selectedLeadId === leadIdFromUrl) return;
    if (leads.some((lead) => lead.id === leadIdFromUrl)) setSelectedLeadId(leadIdFromUrl);
  }, [leads, location.search, selectedLeadId]);

  useEffect(() => {
    function handleOpenCreate() {
      window.sessionStorage?.removeItem('crm-open-create-lead');
      resetForm();
      setIsCreateOpen(true);
    }

    function handleOpenActivityFeed() {
      window.sessionStorage?.removeItem('crm-open-activity-feed');
      setIsActivityOpen(true);
      refreshMeta().catch(()=>undefined);
    }

    if (window.sessionStorage?.getItem('crm-open-create-lead') === '1') handleOpenCreate();
    if (window.sessionStorage?.getItem('crm-open-activity-feed') === '1') handleOpenActivityFeed();
    window.addEventListener("crm-open-create-lead", handleOpenCreate);
    window.addEventListener("crm-open-activity-feed", handleOpenActivityFeed);
    return () => {
      window.removeEventListener("crm-open-create-lead", handleOpenCreate);
      window.removeEventListener("crm-open-activity-feed", handleOpenActivityFeed);
    };
  }, []);

  async function refreshTelegramMessages(lead = selectedLead) {
    if (!lead || !isTelegramLead(lead)) {
      setTelegramMessages([]);
      return;
    }
    const response = await fetchTelegramMessages(lead.id);
    setTelegramMessages(response.messages || []);
  }


  async function refreshLeadEmails(lead = selectedLead) {
    if (!lead) {
      setLeadEmails([]);
      setActionCenter({ actions: [], approvalItems: [], timeline: [], attachments: [] });
      return;
    }
    const response = await fetchLeadEmails(lead.id);
    setLeadEmails(response.emails || []);
  }

  async function refreshActionCenter(lead = selectedLead) {
    if (!lead) {
      setActionCenter({ actions: [], approvalItems: [], timeline: [], attachments: [] });
      return;
    }
    const [response, approvalResponse] = await Promise.all([fetchLeadActionCenter(lead.id), fetchAiApprovalQueue({ leadId: lead.id })]);
    setActionCenter({ actions: response.actions || [], approvalItems: approvalResponse.items || [], timeline: response.timeline || [], attachments: response.attachments || [] });
  }

  useEffect(() => {
    if (!selectedLead) {
      setLeadEmails([]);
      return;
    }
    setEmailAttachments([]);
    setEmailComposer((current) => ({ ...current, to: selectedLead.email || '', subject: '', text: '', html: '', attachmentIds: [] }));
    refreshLeadEmails(selectedLead).catch((requestError) => setError(requestError.message || 'Не удалось загрузить историю email'));
    refreshActionCenter(selectedLead).catch((requestError) => setError(requestError.message || 'Не удалось загрузить AI Action Center'));
  }, [selectedLeadId]);


  async function handleDownloadMeetingIcs(meeting) {
    if (!meeting?.id) return;
    setMeetingIcsDownloadingId(meeting.id);
    setError('');
    try {
      await downloadCrmMeetingIcs(meeting.id);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось скачать ICS');
    } finally {
      setMeetingIcsDownloadingId(null);
    }
  }

  async function handleGenerateEmail() {
    if (!selectedLead) return;
    setEmailBusy(true);
    setError('');
    try {
      const response = await generateLeadEmail(selectedLead.id, { template: emailComposer.template, lead: selectedLead });
      setEmailComposer((current) => ({ ...current, ...response.email, to: selectedLead.email || current.to }));
    } catch (requestError) {
      setError(requestError.message || 'Не удалось сгенерировать письмо');
    } finally {
      setEmailBusy(false);
    }
  }

  async function handleUploadEmailAttachment(event) {
    const file = event.target.files?.[0];
    if (!file || !selectedLead) return;
    setEmailBusy(true);
    setError('');
    try {
      const contentBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await uploadEmailAttachment({ leadId: selectedLead.id, fileName: file.name, mimeType: file.type || 'application/octet-stream', contentBase64 });
      setEmailAttachments((current) => [response.attachment, ...current]);
      setEmailComposer((current) => ({ ...current, attachmentIds: [...current.attachmentIds, response.attachment.id] }));
    } catch (requestError) {
      setError(requestError.message || 'Не удалось загрузить вложение');
    } finally {
      setEmailBusy(false);
      event.target.value = '';
    }
  }

  async function handleSendEmail(event) {
    event.preventDefault();
    if (!selectedLead) return;
    setEmailBusy(true);
    setError('');
    try {
      await sendLeadEmail(selectedLead.id, emailComposer);
      await Promise.all([refreshLeadEmails(selectedLead), loadCrm({ silent: true }), refreshMeta()]);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось поставить письмо в очередь');
    } finally {
      setEmailBusy(false);
    }
  }

  async function handleCreateExecutionAction(lead, actionType) {
    if (!lead) return;
    const score = getLeadAiScore(lead);
    const isEmail = actionType === 'email_follow_up' || actionType === 'commercial_offer';
    const text = score?.nextBestAction || getAiSummaryText(getAiRecommendation(lead));
    setExecutionBusy((current) => ({ ...current, create: true }));
    setError('');
    try {
      await createLeadAiAction(lead.id, {
        actionType,
        channel: isEmail ? 'email' : actionType.startsWith('send_') ? (isTelegramLead(lead) ? 'telegram' : 'email') : 'crm',
        title: actionType === 'commercial_offer' ? 'Коммерческое предложение' : actionType === 'send_presentation' ? 'Отправить презентацию' : actionType === 'send_screenshots' ? 'Отправить скриншоты' : 'AI follow-up',
        generatedText: actionType === 'send_demo_link' ? 'Демо AS6 AI CRM Platform: https://www.as6.ru' : text,
        payload: { subject: 'AS6 AI CRM Platform', to: lead.email || '' },
      });
      await Promise.all([refreshActionCenter(lead), loadCrm({ silent: true }), refreshMeta()]);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось создать AI действие');
    } finally {
      setExecutionBusy((current) => ({ ...current, create: false }));
    }
  }

  async function handleApproveExecutionAction(action) {
    setExecutionBusy((current) => ({ ...current, [action.id]: true }));
    setError('');
    try { await approveLeadAiAction(action.id); await Promise.all([refreshActionCenter(selectedLead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Не удалось одобрить действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [action.id]: false })); }
  }

  async function handleCancelExecutionAction(action) {
    setExecutionBusy((current) => ({ ...current, [action.id]: true }));
    setError('');
    try { await cancelLeadAiAction(action.id); await Promise.all([refreshActionCenter(selectedLead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Не удалось отклонить действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [action.id]: false })); }
  }

  async function handleSendExecutionAction(action) {
    setExecutionBusy((current) => ({ ...current, [action.id]: true }));
    setError('');
    try { await sendLeadAiAction(action.id); await Promise.all([refreshActionCenter(selectedLead), refreshLeadEmails(selectedLead), refreshTelegramMessages(selectedLead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Не удалось отправить действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [action.id]: false })); }
  }

  async function handleEditExecutionAction(action) {
    const generatedText = window.prompt('Изменить текст AI действия', action.generatedText || '');
    if (generatedText === null) return;
    setExecutionBusy((current) => ({ ...current, [action.id]: true }));
    setError('');
    try { await updateLeadAiAction(action.id, { generatedText }); await refreshActionCenter(selectedLead); }
    catch (requestError) { setError(requestError.message || 'Не удалось изменить действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [action.id]: false })); }
  }

  async function handleApproveApprovalQueueItem(item) {
    setExecutionBusy((current) => ({ ...current, [item.id]: true }));
    setError('');
    try { await approveAiApprovalQueueItem(item.id); await Promise.all([refreshActionCenter(selectedLead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Не удалось одобрить AI действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [item.id]: false })); }
  }

  async function handleRejectApprovalQueueItem(item) {
    setExecutionBusy((current) => ({ ...current, [item.id]: true }));
    setError('');
    try { await rejectAiApprovalQueueItem(item.id); await Promise.all([refreshActionCenter(selectedLead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Не удалось отклонить AI действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [item.id]: false })); }
  }

  async function handleExecuteApprovalQueueItem(item) {
    setExecutionBusy((current) => ({ ...current, [item.id]: true }));
    setError('');
    try { const response = await executeAiApprovalQueueItem(item.id); if (response?.error) setError(response.error); await Promise.all([refreshActionCenter(selectedLead), refreshLeadEmails(selectedLead), refreshTelegramMessages(selectedLead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Не удалось выполнить AI действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [item.id]: false })); }
  }

  async function handleEditApprovalQueueItem(item) {
    const recommendation = window.prompt('Изменить AI рекомендацию', item.recommendation || item.title || '');
    if (recommendation === null) return;
    setExecutionBusy((current) => ({ ...current, [item.id]: true }));
    setError('');
    try { await updateAiApprovalQueueItem(item.id, { recommendation }); await refreshActionCenter(selectedLead); }
    catch (requestError) { setError(requestError.message || 'Не удалось изменить AI действие'); }
    finally { setExecutionBusy((current) => ({ ...current, [item.id]: false })); }
  }

  async function handleSendMaterials(lead, materialKeys, channel) {
    setExecutionBusy((current) => ({ ...current, materials: true }));
    setError('');
    try { await sendLeadMaterials(lead.id, { materialKeys, channel, email: { to: lead.email || '' } }); await Promise.all([refreshActionCenter(lead), refreshLeadEmails(lead), loadCrm({ silent: true }), refreshMeta()]); }
    catch (requestError) { setError(requestError.message || 'Материал пока не загружен на сервер'); }
    finally { setExecutionBusy((current) => ({ ...current, materials: false })); }
  }

  useEffect(() => {
    if (!selectedLead || !isTelegramLead(selectedLead)) {
      setTelegramMessages([]);
      return undefined;
    }
    setTelegramMessages(selectedLead.telegramMessages || []);
    refreshTelegramMessages(selectedLead).catch((requestError) => setError(requestError.message || 'Не удалось загрузить Telegram переписку'));
    const intervalId = window.setInterval(() => {
      refreshTelegramMessages(selectedLead).catch(() => undefined);
      loadCrm({ silent: true }).catch(() => undefined);
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [selectedLeadId]);

  async function handleSendTelegramReply(event) {
    event.preventDefault();
    const message = telegramDraft.trim();
    if (!selectedLead || !message) return;
    setTelegramSending(true);
    setError('');
    try {
      const response = await sendTelegramLeadMessage(selectedLead.id, message);
      setTelegramMessages((current) => [...current, response.telegramMessage].filter(Boolean));
      setTelegramDraft('');
      await Promise.all([refreshTelegramMessages(selectedLead), loadCrm({ silent: true }), refreshMeta()]);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось отправить сообщение в Telegram');
    } finally {
      setTelegramSending(false);
    }
  }

  const visibleLeads = useMemo(() => filterAndSortRevenueLeads(leads, leadScoreFilter, leadScoreSort), [leads, leadScoreFilter, leadScoreSort]);

  const leadsByStage = useMemo(() => stages.reduce((acc, stage) => {
    acc[stage.status] = visibleLeads.filter((lead) => lead.status === stage.status);
    return acc;
  }, {}), [visibleLeads, stages]);

  async function refreshMeta() {
    const [statsResponse, activityResponse] = await Promise.all([fetchCrmStats(), fetchCrmActivity()]);
    setStats(statsResponse.stats || null);
    setActivity(activityResponse.events || []);
  }

  function resetForm() {
    setLeadForm(initialLeadForm);
    setIsEditingDetail(false);
  }

  async function handleSaveLead(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...leadForm, value: Number(leadForm.value || 0) };
    try {
      if (isEditingDetail && selectedLead) {
        const response = await updateCrmLead(selectedLead.id, payload);
        setLeads((current) => current.map((lead) => (lead.id === selectedLead.id ? response.lead : lead)));
        setSelectedLeadId(response.lead.id);
        setIsEditingDetail(false);
      } else {
        const response = await createCrmLead(payload);
        setLeads((current) => [response.lead, ...current]);
        setIsCreateOpen(false);
      }
      resetForm();
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось сохранить лид");
    } finally {
      setSaving(false);
    }
  }

  async function moveLead(lead, status) {
    if (!lead || lead.status === status) return;
    setError("");
    const previousLeads = leads;
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status, statusLabel: stageMap[status] || status } : item)));
    try {
      const response = await updateCrmLead(lead.id, { status });
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...response.lead, notes: item.notes, followUps: item.followUps } : item)));
      await refreshMeta();
    } catch (requestError) {
      setLeads(previousLeads);
      setError(requestError.message || "Не удалось переместить лид");
    }
  }


  async function handleAiSecretaryCrmAction(lead, action) {
    if (!lead?.id) return

    try {
      setError("")

      const response = await applyAiSecretaryLeadAction(
        lead.id,
        action,
        lead.workspaceId ||
        lead.workspace_id ||
        lead.metadata?.workspaceId
      )

      if (response?.lead) {
        setLeads((current) =>
          current.map((item) =>
            item.id === lead.id ? response.lead : item
          )
        )
      }

      await Promise.all([
        loadCrm({ silent: true }),
        refreshMeta()
      ])
    } catch (requestError) {
      setError(
        requestError.message ||
        'Не удалось выполнить AI Secretary действие'
      )
    }
  }

  async function handleTestPaymentPaid(lead) {
    const paymentId = lead?.metadata?.payment_id || lead?.metadata?.sequence_payment_id

    if (!paymentId) {
      setError("У лида нет payment_id или sequence_payment_id. Сначала создай оплату.")
      return
    }

    try {
      setError("")
      await markTestPaymentPaid(paymentId)
      await Promise.all([
        loadCrm({ silent: true }),
        refreshMeta()
      ])
    } catch (requestError) {
      setError(requestError.message || "Не удалось отметить test payment как paid")
    }
  }

  async function handleDeleteLead(lead) {
    if (!window.confirm(`Удалить лид «${lead.company || lead.name}»?`)) return;
    setError("");
    try {
      await deleteCrmLead(lead.id);
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      if (selectedLeadId === lead.id) setSelectedLeadId(null);
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось удалить лид");
    }
  }

  async function handleAddNote(event, lead) {
    event.preventDefault();
    const body = (noteDrafts[lead.id] || "").trim();
    if (!body) return;
    setError("");
    try {
      const response = await addCrmLeadNote(lead.id, body);
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, notes: [response.note, ...(item.notes || [])], notesText: [item.notesText, body].filter(Boolean).join("\n"), updatedAt: new Date().toISOString() } : item));
      setNoteDrafts((current) => ({ ...current, [lead.id]: "" }));
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось добавить заметку");
    }
  }

  async function handleFollowUp(lead) {
    setError("");
    setFollowUpLoading((current) => ({ ...current, [lead.id]: true }));
    try {
      const response = await createCrmFollowUp(lead.id);
      const noteBody = response.note?.body || (response.followUp?.message ? `AI‑дожим: ${response.followUp.message}` : "");
      setLeads((current) => current.map((item) => item.id === lead.id ? {
        ...item,
        followUps: [response.followUp, ...(item.followUps || [])].filter(Boolean),
        notes: [response.note, ...(item.notes || [])].filter(Boolean),
        notesText: [item.notesText, noteBody].filter(Boolean).join("\\n"),
        updatedAt: new Date().toISOString(),
      } : item));
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать AI‑дожим");
    } finally {
      setFollowUpLoading((current) => ({ ...current, [lead.id]: false }));
    }
  }



  async function handleAiAgentAction(lead, taskType) {
    if (!lead) return;
    setError('');
    setAiActionBusy((current) => ({ ...current, [`${lead.id}:${taskType}`]: true }));
    try {
      await createAiAgentAction({ leadId: lead.id, taskType });
      await loadCrm({ silent: true });
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || 'Не удалось запустить AI действие');
    } finally {
      setAiActionBusy((current) => ({ ...current, [`${lead.id}:${taskType}`]: false }));
    }
  }


  async function handleRunRevenueBrain() {
    setError('');
    setRevenueBrainBusy(true);
    try {
      setRevenueToast("");
      await triggerRevenueAnalysis({ limit: 100 });
      const [response, scoresResponse] = await Promise.all([getRevenueIntelligence(), getLeadScores()]);
      setRevenueIntelligence(response.intelligence || null);
      if (scoresResponse?.scores?.length) {
        setRevenueToast(`Revenue analysis queued. ${scoresResponse.scores.length} lead scores available.`);
      } else {
        setRevenueToast("Revenue analysis queued. Scores will appear after AI workers complete.");
      }
      await loadCrm({ silent: true });
      await refreshMeta();
    } catch (requestError) {
      setRevenueToast('');
      setError(requestError.message || 'Не удалось запустить AI Revenue Brain');
    } finally {
      setRevenueBrainBusy(false);
    }
  }

  async function handleAnalyzeWorkspaceAi() {
    setError('');
    setAiAnalysisBusy(true);
    try {
      await runCrmLeadScoring({ limit: 500 });
      await loadCrm({ silent: true });
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || 'Не удалось запустить lead scoring');
    } finally {
      setAiAnalysisBusy(false);
    }
  }

  async function handleAnalyzeLeadAi(lead) {
    setError('');
    setAiActionBusy((current) => ({ ...current, [`${lead.id}:lead_ai_score`]: true }));
    try {
      await runCrmLeadScoringForLead(lead.id);
      await loadCrm({ silent: true });
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || 'Не удалось выполнить AI анализ лида');
    } finally {
      setAiActionBusy((current) => ({ ...current, [`${lead.id}:lead_ai_score`]: false }));
    }
  }

  async function handleQueueInactiveFollowUps() {
    setError('');
    setInactiveQueueBusy(true);
    try {
      await queueInactiveAiFollowUps({ inactiveHours: 24 });
      await loadCrm({ silent: true });
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || 'Не удалось поставить follow-up в очередь');
    } finally {
      setInactiveQueueBusy(false);
    }
  }

  async function handleRenameStage(stage, title) {
    const nextTitle = title.trim();
    if (!nextTitle || nextTitle === stage.title) return;
    setStageSaving((current) => ({ ...current, [stage.status]: true }));
    setError("");
    const previousStages = stages;
    setStages((current) => current.map((item) => item.status === stage.status ? { ...item, title: nextTitle } : item));
    try {
      const response = await updateCrmStage(stage.status, { title: nextTitle });
      setStages((current) => current.map((item) => item.status === stage.status ? response.stage : item));
    } catch (requestError) {
      setStages(previousStages);
      setError(requestError.message || "Не удалось переименовать этап");
    } finally {
      setStageSaving((current) => ({ ...current, [stage.status]: false }));
    }
  }


  async function refreshAiSequences() {
    const response = await getActiveAiSequences();
    setAiSequenceDashboard(response || { activeSequences: [], upcomingSteps: [], stoppedSequences: [], metrics: {} });
    return response;
  }

  async function handleStartAiSequence(lead) {
    if (!lead) return;
    setAiSequenceBusy((current) => ({ ...current, [lead.id]: "start" }));
    setAiSequenceError("");
    setAiSequenceMessage("");
    try {
      await startAiSequence({ leadId: lead.id, templateId: aiSequenceTemplateId || undefined });
      setAiSequenceMessage("AI sequence started. AI will generate drafts for manager approval.");
      await refreshAiSequences();
      await loadCrm({ silent: true });
    } catch (requestError) {
      setAiSequenceError(requestError.message || "Sequence cannot start for this lead.");
    } finally {
      setAiSequenceBusy((current) => ({ ...current, [lead.id]: "" }));
    }
  }

  async function handlePauseAiSequence(sequence) {
    if (!sequence) return;
    setAiSequenceBusy((current) => ({ ...current, [sequence.leadId]: "pause" }));
    setAiSequenceError("");
    setAiSequenceMessage("");
    try {
      await pauseAiSequence(sequence.id);
      setAiSequenceMessage("AI sequence paused. No drafts will be sent automatically.");
      await refreshAiSequences();
    } catch (requestError) {
      setAiSequenceError(requestError.message || "Не удалось поставить AI sequence на паузу");
    } finally {
      setAiSequenceBusy((current) => ({ ...current, [sequence.leadId]: "" }));
    }
  }

  async function handleStopAiSequence(sequence) {
    if (!sequence) return;
    setAiSequenceBusy((current) => ({ ...current, [sequence.leadId]: "stop" }));
    setAiSequenceError("");
    setAiSequenceMessage("");
    try {
      await stopAiSequence(sequence.id);
      setAiSequenceMessage("AI sequence stopped. Existing drafts still require manager approval.");
      await refreshAiSequences();
    } catch (requestError) {
      setAiSequenceError(requestError.message || "Не удалось остановить AI sequence");
    } finally {
      setAiSequenceBusy((current) => ({ ...current, [sequence.leadId]: "" }));
    }
  }

  function handleLeadDragStart(event, lead) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", lead.id);
    event.dataTransfer.setData("text/lead-id", lead.id);
    setDraggedLeadId(lead.id);
  }

  function handleStageDragOver(event, stageStatus) {
    if (!draggedLeadId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetStage(stageStatus);
  }

  function handleStageDrop(event, stageStatus) {
    event.preventDefault();
    const droppedLeadId = event.dataTransfer.getData("text/lead-id") || event.dataTransfer.getData("text/plain") || draggedLeadId;
    const lead = leads.find((item) => item.id === droppedLeadId);
    setDraggedLeadId(null);
    setDropTargetStage(null);
    moveLead(lead, stageStatus);
  }

  function handleLeadDragEnd() {
    setDraggedLeadId(null);
    setDropTargetStage(null);
  }

  function openDetail(lead) {
    if (draggedLeadId) return;
    setSelectedLeadId(lead.id);
    setIsEditingDetail(false);
  }

  function startDetailEdit(lead) {
    setLeadForm(toForm(lead));
    setIsEditingDetail(true);
  }

  return (
    <main className="workspace-page crm-workspace-page">
      <PageHeading
        eyebrow="CRM‑воронка"
        title="AI‑CRM для продаж"
        copy="Компактная production‑воронка: лиды, этапы, история, заметки и AI‑дожим сохраняются в PostgreSQL и доступны только текущему пользователю через JWT."
      />

      {error && <p className="auth-error crm-alert">{error}</p>}

      <section className="dashboard-stats crm-stat-grid">
        <StatCard label="Лидов" value={loading ? "…" : String(stats?.totalLeads || 0)} hint="в вашей базе" />
        <StatCard label="Воронка" value={loading ? "…" : formatCurrency(stats?.pipelineValue)} hint="активная сумма" tone="violet" />
        <StatCard label="Успешно" value={loading ? "…" : String(stats?.wonDeals || 0)} hint={`${formatCurrency(stats?.wonValue)} выиграно`} tone="pink" />
        <StatCard label="Потеряно" value={loading ? "…" : String(stats?.lostDeals || 0)} hint={`${formatCurrency(stats?.lostValue)} потеряно`} />
        <StatCard label="Конверсия" value={loading ? "…" : `${stats?.conversionRate || 0}%`} hint="успешные сделки от всех лидов" tone="violet" />
        <StatCard label="AI сегодня" value={loading ? "…" : String(stats?.aiMetrics?.actionsToday || 0)} hint="AI действий сегодня" tone="pink" />
        <StatCard label="AI follow-up" value={loading ? "…" : String(stats?.aiMetrics?.generatedFollowUps || 0)} hint="сгенерировано AI" tone="violet" />
        <StatCard label="AI эффективность" value={loading ? "…" : `${stats?.aiMetrics?.efficiency || 0}%`} hint={`${stats?.aiMetrics?.assistedDeals || 0} AI‑сделок`} />
        <StatCard label="Priority Leads" value={loading ? "…" : String(stats?.aiMetrics?.priorityLeads || 0)} hint="AI score 76+ или priority badge" tone="pink" />
        <StatCard label="At-risk Deals" value={loading ? "…" : String(stats?.aiMetrics?.atRiskDeals || 0)} hint="ghosting / stalled / inactive risk" tone="violet" />
        <StatCard label="Hot Leads" value={loading ? "…" : String(stats?.aiMetrics?.hotLeads || 0)} hint={`средний score ${stats?.aiMetrics?.averageLeadScore || 0}/100`} tone="pink" />
        <StatCard label="Leads needing follow-up" value={loading ? "…" : String(stats?.aiMetrics?.leadsNeedingFollowUp || stats?.aiMetrics?.followUpsPending || 0)} hint="риск или нет свежего касания" />
        <StatCard label="Weighted Forecast" value={loading ? "…" : formatCurrency(stats?.aiMetrics?.aiForecastedRevenue || stats?.aiMetrics?.predictedRevenue || 0)} hint={`forecast ${stats?.aiMetrics?.conversionForecast || 0}%`} tone="violet" />
        <StatCard label="Revenue At Risk" value={loading ? "…" : formatCurrency(stats?.aiMetrics?.revenueAtRisk || 0)} hint={`${stats?.aiMetrics?.atRiskDeals || 0} at-risk deals`} tone="pink" />
        <StatCard label="High Probability Deals" value={loading ? "…" : String(stats?.aiMetrics?.highProbabilityDeals || 0)} hint="probability ≥ 70%" />
        <StatCard label="Stalled Opportunities" value={loading ? "…" : String(stats?.aiMetrics?.stalledOpportunities || stats?.aiMetrics?.inactiveOpportunities || 0)} hint="нет активности более 7 дней" tone="pink" />
        <StatCard label="Pipeline Health" value={loading ? "…" : `${stats?.aiMetrics?.pipelineHealth || 0}%`} hint="risk + activity forecast index" tone="violet" />
      </section>

      <section className="ai-action-center-panel">
        <div>
          <span className="eyebrow">AI центр действий</span>
          <h3>Автономная очередь follow-up</h3>
          <p>AI анализирует неактивных лидов по реальному CRM контексту и готовит черновики без автоотправки.</p>
        </div>
<div className="ai-action-center-buttons"><button className="ghost-button" type="button" onClick={handleAnalyzeWorkspaceAi} disabled={aiAnalysisBusy}>{aiAnalysisBusy ? "Scoring запущен…" : "Запустить scoring"}</button><button className="btn primary compact" type="button" onClick={handleQueueInactiveFollowUps} disabled={inactiveQueueBusy}>{inactiveQueueBusy ? "AI ставит в очередь…" : "Поставить follow-up для неактивных"}</button></div>
      </section>

      <AiRevenueIntelligencePanel intelligence={revenueIntelligence} busy={revenueBrainBusy} toast={revenueToast} onRun={handleRunRevenueBrain} />

      <section className="lead-list-controls" aria-label="AI Revenue lead filters">
        <div>
          <span className="eyebrow">Lead lists</span>
          <h3>Sortable AI Revenue columns</h3>
        </div>
        <div className="lead-list-control-actions">
          <label>Filter
            <select value={leadScoreFilter} onChange={(event) => setLeadScoreFilter(event.target.value)}>
              {REVENUE_LEAD_FILTERS.map((filter) => <option key={filter.id} value={filter.id}>{filter.label}</option>)}
            </select>
          </label>
          <label>Sort by
            <select value={leadScoreSort} onChange={(event) => setLeadScoreSort(event.target.value)}>
              {REVENUE_SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="crm-layout production-crm-layout">
        <div className="pipeline-board production-pipeline">
          {loading ? DEFAULT_CRM_STAGES.slice(0, 3).map((stage) => <Panel className="stage-column crm-skeleton" key={stage.status}>Загрузка: {stage.title}…</Panel>) : stages.map((stage) => {
            const stageLeads = leadsByStage[stage.status] || [];
            const stageTotal = stageLeads.reduce((total, lead) => total + Number(lead.value || 0), 0);
            return (
              <Panel
                className={`stage-column drop-stage ${draggedLeadId ? "drag-active" : ""} ${dropTargetStage === stage.status ? "drop-hover" : ""}`}
                key={stage.status}
                onDragEnter={() => draggedLeadId && setDropTargetStage(stage.status)}
                onDragOver={(event) => handleStageDragOver(event, stage.status)}
                onDragLeave={() => setDropTargetStage((current) => (current === stage.status ? null : current))}
                onDrop={(event) => handleStageDrop(event, stage.status)}
              >
                <div className="stage-head editable-stage-head">
                  <div>
                    <input
                      aria-label={`Название этапа ${stage.title}`}
                      className="stage-title-input"
                      defaultValue={stage.title}
                      disabled={stageSaving[stage.status]}
                      onBlur={(event) => handleRenameStage(stage, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                        if (event.key === "Escape") { event.currentTarget.value = stage.title; event.currentTarget.blur(); }
                      }}
                    />
                    <span>{stageLeads.length} · {formatCurrency(stageTotal)}</span>
                  </div>
                  <b>{stageLeads.length}</b>
                </div>
                <div className="lead-list compact-lead-list">
                  {stageLeads.length === 0 && <p className="empty-state">Перетащите лид на этот этап</p>}
                  {stageLeads.map((lead) => (
                    <article
                      className={`lead-card premium-lead-card compact-pipeline-card ${getLeadAiScore(lead)?.riskLevel === "high" ? "at-risk-lead" : ""} ${draggedLeadId === lead.id ? "is-dragging" : ""} ${selectedLeadId === lead.id ? "route-highlight" : ""}`}
                      draggable
                      onClick={() => openDetail(lead)}
                      onDragStart={(event) => handleLeadDragStart(event, lead)}
                      onDragEnd={handleLeadDragEnd}
                      key={lead.id}
                    >
                      <div className="lead-topline"><strong>{lead.name}</strong><span>{formatCurrency(lead.value)}</span></div>
                      {getLeadAiScore(lead) ? <>
                        <div className="lead-intelligence-kpis"><b>AI {getLeadAiScore(lead).score}/100</b><span>{lead.aiPriority || getLeadAiScore(lead).priority || 'medium'}</span><em>{tempLabel(lead.aiTemperature || getLeadAiScore(lead).temperature)}</em></div>
                        {lead.aiRevenueScore && <div className="lead-revenue-kpis"><span>AI Priority {lead.aiRevenueScore.priorityScore}/100</span><span>Close {lead.aiRevenueScore.closeProbability}%</span><span>{lead.aiRevenueScore.recommendedAction}</span></div>}
                        {getLatestAiVoiceCall(lead) && <div className="lead-voice-kpis"><span>AI Voice</span><b>{getLatestAiVoiceCall(lead).sentiment || '—'}</b><em>{getLatestAiVoiceCall(lead).outcome || getLatestAiVoiceCall(lead).status}</em><small>{sanitizeVisibleAiText(getLatestAiVoiceCall(lead).nextAction || 'No recommendation yet')}</small></div>}
                        <div className="lead-ai-probability forecast-progress"><span>{forecastLabel(getLeadAiScore(lead).forecastCategory)} · engagement {getLeadAiScore(lead).engagementScore}/100</span><i style={{ width: `${getLeadAiScore(lead).probabilityToClose}%` }} /></div>
                      </> : <div className="ai-forecast-empty-card">AI прогноз появится после квалификации лида.</div>}
                      
                      <p>{lead.company || (isTelegramLead(lead) ? lead.telegram || "Telegram контакт" : "Компания не указана")}</p>
                      <div className="lead-card-meta"><small><i />{stageMap[lead.status] || lead.status}</small><span className={`source-pill ${lead.source === "telegram" ? "telegram-source" : ""}`}>{formatLeadSource(lead.source)}</span></div>{getLeadAiScore(lead)?.recommendedNextStep && <div className="ai-card-recommendation"><span>AI</span>{sanitizeVisibleAiText(getLeadAiScore(lead).recommendedNextStep)}</div>}{!getLeadAiScore(lead)?.recommendedNextStep && getAiRecommendation(lead) && <div className="ai-card-recommendation"><span>AI</span>{getAiSummaryText(getAiRecommendation(lead))}</div>}{isTelegramLead(lead) && <div className="telegram-card-status"><span className={`telegram-presence-dot ${lead.telegramOnline ? 'online' : 'offline'}`} />{lead.telegramOnline ? 'online' : 'offline'} · {lead.lastMessageAt ? formatDate(lead.lastMessageAt) : 'нет сообщений'}</div>}
                    </article>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>
      </section>

      {isCreateOpen && (
        <LeadFormModal
          title="Создать лид"
          subtitle="Новая сделка сразу попадёт в выбранный этап воронки."
          stages={stages}
          leadForm={leadForm}
          setLeadForm={setLeadForm}
          saving={saving}
          submitLabel="Создать лид"
          onSubmit={handleSaveLead}
          onClose={() => { setIsCreateOpen(false); resetForm(); }}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          stages={stages}
          stageMap={stageMap}
          activity={getLeadActivity(selectedLead, activity)}
          noteDraft={noteDrafts[selectedLead.id] || ""}
          onNoteDraftChange={(value) => setNoteDrafts((current) => ({ ...current, [selectedLead.id]: value }))}
          onAddNote={(event) => handleAddNote(event, selectedLead)}
          onFollowUp={() => handleFollowUp(selectedLead)}
          onAiAction={(taskType) => handleAiAgentAction(selectedLead, taskType)}
          onAnalyzeLeadAi={() => handleAnalyzeLeadAi(selectedLead)}
          aiActionBusy={aiActionBusy}
          followUpLoading={followUpLoading[selectedLead.id]}
          onDelete={() => handleDeleteLead(selectedLead)}
          onEdit={() => startDetailEdit(selectedLead)}
          onMove={(status) => moveLead(selectedLead, status)}
          telegramMessages={telegramMessages}
          telegramDraft={telegramDraft}
          telegramSending={telegramSending}
          onTelegramDraftChange={setTelegramDraft}
          onSendTelegramReply={handleSendTelegramReply}
          emailTemplates={emailTemplates}
          leadEmails={leadEmails}
          emailComposer={emailComposer}
          emailAttachments={emailAttachments}
          emailBusy={emailBusy}
          actionCenter={actionCenter}
          materials={materials}
          executionBusy={executionBusy}
          onCreateExecutionAction={(actionType) => handleCreateExecutionAction(selectedLead, actionType)}
          onApproveExecutionAction={handleApproveExecutionAction}
          onSendExecutionAction={handleSendExecutionAction}
          onEditExecutionAction={handleEditExecutionAction}
          onCancelExecutionAction={handleCancelExecutionAction}
          onSendMaterials={(materialKeys, channel) => handleSendMaterials(selectedLead, materialKeys, channel)}
          onApproveApprovalQueueItem={handleApproveApprovalQueueItem}
          onRejectApprovalQueueItem={handleRejectApprovalQueueItem}
          onExecuteApprovalQueueItem={handleExecuteApprovalQueueItem}
          onEditApprovalQueueItem={handleEditApprovalQueueItem}
          onEmailComposerChange={setEmailComposer}
          onGenerateEmail={handleGenerateEmail}
          onUploadEmailAttachment={handleUploadEmailAttachment}
          onSendEmail={handleSendEmail}
          onDownloadMeetingIcs={handleDownloadMeetingIcs}
          meetingIcsDownloadingId={meetingIcsDownloadingId}
          aiSequence={getLeadActiveSequence(aiSequenceDashboard, selectedLead.id)}
          aiSequenceTemplates={getSequenceTemplates(aiSequenceDashboard)}
          aiSequenceTemplateId={aiSequenceTemplateId}
          aiSequenceBusy={aiSequenceBusy[selectedLead.id]}
          aiSequenceMessage={aiSequenceMessage}
          aiSequenceError={aiSequenceError}
          onAiSequenceTemplateChange={setAiSequenceTemplateId}
          onStartAiSequence={() => handleStartAiSequence(selectedLead)}
          onPauseAiSequence={handlePauseAiSequence}
          onStopAiSequence={handleStopAiSequence}
          closeLeadModal={closeLeadModal}
          onAiSecretaryCrmAction={handleAiSecretaryCrmAction}
          onTestPaymentPaid={handleTestPaymentPaid}
        />
      )}

      {isActivityOpen && (
        <ActivityFeedDrawer
          activity={activity}
          onClose={() => setIsActivityOpen(false)}
        />
      )}

      {isEditingDetail && selectedLead && (
        <LeadFormModal
          title="Редактировать лид"
          subtitle="Обновите контактные данные, сумму сделки, этап и заметки."
          stages={stages}
          leadForm={leadForm}
          setLeadForm={setLeadForm}
          saving={saving}
          submitLabel="Сохранить"
          onSubmit={handleSaveLead}
          onClose={() => { setIsEditingDetail(false); resetForm(); }}
        />
      )}
    </main>
  );
}


function LeadRevenueIntelligenceCard({ lead }) {
  const score = lead.aiRevenueScore || null;
  if (!score) {
    return (
      <div className="detail-section lead-revenue-detail-card empty-revenue-detail">
        <div>
          <span className="eyebrow">AI Revenue Intelligence</span>
          <h4>Revenue score pending</h4>
          <p>Run Revenue Analysis Now to populate AI priority, close probability, churn risk, pipeline health, channel, and a safe recommendation.</p>
        </div>
      </div>
    );
  }

  const metrics = [
    ['AI Priority Score', score.priorityScore, '/100', 'priority'],
    ['Close Probability', score.closeProbability, '%', 'close'],
    ['Engagement Score', score.engagementScore, '/100', 'engagement'],
    ['Churn Risk', score.churnRisk, '%', 'risk'],
    ['Pipeline Health', score.pipelineHealth, '/100', 'health'],
  ];

  return (
    <div className="detail-section lead-revenue-detail-card">
      <div className="lead-revenue-detail-head">
        <div>
          <span className="eyebrow">AI Revenue Intelligence</span>
          <h4>{sanitizeVisibleAiText(score.recommendedAction || 'AI recommendation ready')}</h4>
          <p>{sanitizeVisibleAiText(score.reasoningSummary || 'Safe revenue summary from scored CRM signals.')}</p>
        </div>
        <div className="revenue-channel-stack">
          <span className="ai-neon-badge">{channelLabel(score.recommendedChannel)}</span>
          <small>Last AI analysis {formatDate(score.updatedAt || score.createdAt || lead.aiLastScoredAt)}</small>
        </div>
      </div>
      <div className="lead-revenue-meter-grid">
        {metrics.map(([label, value, suffix, tone]) => (
          <div className={`lead-revenue-meter ${tone}`} key={label}>
            <div><span>{label}</span><b>{Number(value || 0)}{suffix}</b></div>
            <i><em style={{ width: `${Math.max(3, Math.min(100, Number(value || 0)))}%` }} /></i>
          </div>
        ))}
      </div>
      <div className="lead-revenue-badges">
        <span>AI Recommendation: <b>{sanitizeVisibleAiText(score.recommendedAction)}</b></span>
        <span>Recommended Channel: <b>{channelLabel(score.recommendedChannel)}</b></span>
      </div>
    </div>
  );
}

function AiRevenueIntelligencePanel({ intelligence, busy, toast, onRun }) {
  const widgets = intelligence?.widgets || {};
  const forecast = getForecastWidget(intelligence);
  const hotLeads = intelligence?.hotLeads || [];
  const stalledLeads = intelligence?.stalledLeads || [];
  const churnRisks = intelligence?.churnRisks || [];
  const nextBestActions = buildRecommendationQueue(intelligence);
  const cards = getRevenueCards(intelligence);
  return (
    <section className="crm-ai-revenue-panel">
      <div className="panel-head revenue-panel-head">
        <div>
          <span className="eyebrow">AI Revenue Intelligence</span>
          <h3>AI Revenue Command Center</h3>
          <p className="modal-copy">Executive view of weighted forecast, hot leads, stalled deals, churn risk, health, and safe AI recommendations.</p>
        </div>
        <button className="btn primary compact" type="button" onClick={onRun} disabled={busy}>{busy ? "Running analysis…" : "Run Revenue Analysis Now"}</button>
      </div>
      {toast && <p className="success-alert revenue-toast">{toast}</p>}
      <div className="dashboard-stats revenue-widget-row">
        {cards.map((card) => <StatCard key={card.key} label={card.label} value={card.kind === 'money' ? formatCurrency(card.value) : card.kind === 'score' ? `${card.value}/100` : String(card.value)} hint={card.hint} tone={card.key === 'highChurnRisk' || card.key === 'stalledLeads' ? 'pink' : 'violet'} />)}
      </div>
      <div className="revenue-forecast-widget">
        <div>
          <span className="eyebrow">Weighted Forecast Widget</span>
          <strong>{formatCurrency(forecast.projectedRevenue)}</strong>
          <p>Active pipeline {formatCurrency(forecast.activePipelineValue)} · generated {formatDate(forecast.generatedAt)}</p>
        </div>
        <div className="forecast-mini-trend" aria-label="Forecast confidence trend">
          <span style={{ height: `${Math.max(0, Math.min(100, Number(Math.max(10, forecast.confidenceScore) || 0)))}%` }} />
          <span style={{ height: `${Math.max(0, Math.min(100, Number(Math.max(10, forecast.hotLeadsCount * 12) || 0)))}%` }} />
          <span style={{ height: `${Math.max(0, Math.min(100, Number(Math.max(10, forecast.stalledLeadsCount * 12) || 0)))}%` }} />
        </div>
        <b>{forecast.confidenceScore}% confidence</b>
      </div>
      <div className="revenue-intelligence-grid">
        <RevenueList title="Hot leads" items={hotLeads} empty="No hot leads scored yet." />
        <RevenueList title="Highest close probability" items={intelligence?.highestCloseProbability || []} empty="No close probability data yet." field="closeProbability" suffix="%" />
        <RevenueList title="Stalled leads" items={stalledLeads} empty="No stalled leads detected." field="churnRisk" suffix=" risk" />
        <RevenueList title="Churn risks" items={churnRisks} empty="No churn risks detected." field="churnRisk" suffix=" risk" />
      </div>
      <div className="revenue-action-queue">
        <strong>AI Next Best Actions</strong>
        {nextBestActions.length === 0 && <p className="empty-state">Run Revenue Brain to populate recommendations.</p>}
        {nextBestActions.slice(0, 6).map((item) => <span key={item.id || item.leadId}>{item.leadName || 'Lead'} · {item.recommendedAction} · {channelLabel(item.recommendedChannel)}</span>)}
      </div>
    </section>
  );
}

function RevenueList({ title, items, empty, field = "priorityScore", suffix = "/100" }) {
  return (
    <div className="revenue-list-card">
      <strong>{title}</strong>
      {items.length === 0 && <p className="empty-state">{empty}</p>}
      {items.slice(0, 4).map((item) => (
        <article key={item.id || item.leadId}>
          <span>{item.leadName || item.company || 'Lead'}</span>
          <b>{item[field] ?? 0}{suffix}</b>
          <small>{sanitizeVisibleAiText(item.recommendedAction || item.reasoningSummary || '')}</small>
        </article>
      ))}
    </div>
  );
}

function ActivityFeedDrawer({ activity, onClose }) {
  useModalCloseLifecycle(onClose);

  return (
    <div className="modal-backdrop crm-modal-backdrop activity-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ai-task-modal crm-activity-drawer" role="dialog" aria-modal="true" aria-labelledby="crm-activity-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-glow" />
        <div className="panel-head activity-drawer-head">
          <div>
            <span className="eyebrow">Лента активности</span>
            <h3 id="crm-activity-title">Полная история CRM</h3>
            <p className="modal-copy">Все ключевые события по лидам: создание, перемещение между этапами, AI‑дожимы и заметки.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="activity-drawer-list crm-activity-feed">
          {activity.length === 0 && <p className="activity-drawer-empty"><span />Событий пока нет<small>Когда лиды появятся в CRM, здесь будет полная хронология.</small></p>}
          {activity.map((event) => (
            <article className="activity-drawer-item" key={event.id}>
              <span className="activity-dot" />
              <div>
                <div className="activity-row-title">
                  <strong>{getActivityTitle(event)}</strong>
                  <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
                </div>
                <p>{formatCrmText(event.body) || "Событие сохранено в CRM."}</p>
                <small>{event.leadName ? `Лид: ${event.leadName}` : "Лид не указан"}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function LeadFormModal({ title, subtitle, stages, leadForm, setLeadForm, saving, submitLabel, onSubmit, onClose }) {
  useModalCloseLifecycle(onClose, { canClose: !saving });

  return (
    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="ai-task-modal crm-lead-modal" role="dialog" aria-modal="true" aria-labelledby="crm-lead-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-glow" />
        <div className="panel-head">
          <div>
            <span className="eyebrow">CRM</span>
            <h3 id="crm-lead-modal-title">{title}</h3>
            <p className="modal-copy">{subtitle}</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} disabled={saving} aria-label="Закрыть">×</button>
        </div>
        <form className="lead-form modal-lead-form" onSubmit={onSubmit}>
          <label className="crm-field"><span>Контактное имя *</span><input autoFocus id="crm-lead-name" value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} required /></label>
          <label className="crm-field"><span>Компания</span><input value={leadForm.company} onChange={(event) => setLeadForm({ ...leadForm, company: event.target.value })} /></label>
          <label className="crm-field"><span>Telegram</span><input value={leadForm.telegram} onChange={(event) => setLeadForm({ ...leadForm, telegram: event.target.value })} placeholder="@username" /></label>
          <label className="crm-field"><span>Email</span><input type="email" value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} /></label>
          <label className="crm-field"><span>Сумма сделки</span><input min="0" type="number" value={leadForm.value} onChange={(event) => setLeadForm({ ...leadForm, value: event.target.value })} /></label>
          <label className="crm-field"><span>Этап</span><select value={leadForm.status} onChange={(event) => setLeadForm({ ...leadForm, status: event.target.value })}>{stages.map((stage) => <option key={stage.status} value={stage.status}>{stage.title}</option>)}</select></label>
          <label className="crm-field modal-notes"><span>Заметки</span><textarea value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} placeholder="Контекст сделки, боль, следующий шаг" /></label>
          <div className="form-actions modal-actions"><span>{saving ? "Сохраняем данные…" : "JWT + PostgreSQL"}</span><button className="btn primary compact" disabled={saving} type="submit">{saving && <i className="button-spinner" />}{saving ? "Сохраняем…" : submitLabel}</button></div>
        </form>
      </section>
    </div>
  );
}

function LeadDetailModal({ lead, stages, stageMap, activity, noteDraft, onNoteDraftChange, onAddNote, onFollowUp, onAiAction, onAnalyzeLeadAi, aiActionBusy = {}, followUpLoading, onDelete, onEdit, onMove, telegramMessages = [], telegramDraft = '', telegramSending = false, onTelegramDraftChange, onSendTelegramReply, emailTemplates = [], leadEmails = [], emailComposer, emailAttachments = [], emailBusy = false, onEmailComposerChange, onGenerateEmail, onUploadEmailAttachment, onSendEmail, actionCenter = { actions: [], timeline: [], attachments: [] }, materials = [], executionBusy = {}, onCreateExecutionAction, onApproveExecutionAction, onSendExecutionAction, onEditExecutionAction, onCancelExecutionAction, onSendMaterials, onApproveApprovalQueueItem, onRejectApprovalQueueItem, onExecuteApprovalQueueItem, onEditApprovalQueueItem, onDownloadMeetingIcs, meetingIcsDownloadingId, aiSequence = null, aiSequenceTemplates = [], aiSequenceTemplateId = "", aiSequenceBusy = "", aiSequenceMessage = "", aiSequenceError = "", onAiSequenceTemplateChange, onStartAiSequence, onPauseAiSequence, onStopAiSequence, closeLeadModal, onAiSecretaryCrmAction, onTestPaymentPaid }) {
  useModalCloseLifecycle(closeLeadModal);
  const telegramOutreachDrafts = getOutreachDrafts(lead, 'telegram');
  const telegramReplyDrafts = (actionCenter.approvalItems || []).filter((item) => item.leadId === lead.id && (item.actionType === 'telegram_reply_draft' || item.executionType === 'telegram_reply_draft'));
  const emailOutreachDrafts = getOutreachDrafts(lead, 'email');

  return (
    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) closeLeadModal(); }}>
      <section className="ai-task-modal lead-detail-modal" role="dialog" aria-modal="true" aria-labelledby="lead-detail-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-glow" />
        <div className="panel-head lead-detail-head">
          <div>
            <span className="eyebrow">Карточка лида</span>
            <h3 id="lead-detail-title">{lead.name}</h3>
            <p className="modal-copy">{lead.company || "Компания не указана"} · {formatCurrency(lead.value)}</p>
            <span className={`source-pill detail-source-pill ${lead.source === "telegram" ? "telegram-source" : ""}`}>{formatLeadSource(lead.source)}</span>
          </div>
          <button className="modal-close lead-modal-close" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeLeadModal(); }} aria-label="Закрыть карточку лида"><span aria-hidden="true">×</span></button>
        </div>

        <div className="lead-detail-grid">
          <section className="lead-detail-main">
            <div className="detail-kpi-row">
              <div><span>Сумма сделки</span><strong>{formatCurrency(lead.value)}</strong></div>
              <label className="crm-field"><span>Текущий этап</span><select value={lead.status} onChange={(event) => onMove(event.target.value)}>{stages.map((stage) => <option key={stage.status} value={stage.status}>{stage.title}</option>)}</select></label>
            </div>

            <LeadRevenueIntelligenceCard lead={lead} />

            <div className="detail-section ai-sequence-card">
              <div className="ai-sequence-head">
                <div>
                  <span className="eyebrow">AI Sequence</span>
                  <h4>Enterprise follow-up orchestrator</h4>
                  <p>Never auto-send. AI will generate drafts for manager approval.</p>
                </div>
                <span className={`sequence-status-badge ${aiSequence?.status || "idle"}`}>{sequenceStatusLabel(aiSequence?.status)}</span>
              </div>
              <div className="ai-sequence-grid">
                <span>Status <b>{getSequenceSafeStatus(aiSequence)}</b></span>
                <span>Current step <b>{aiSequence?.currentStep ?? "—"}</b></span>
                <span>Next run time <b>{formatDate(aiSequence?.nextRunAt)}</b></span>
                <span>Template <b>{aiSequence?.templateName || DEFAULT_AI_SEQUENCE_TEMPLATE_NAME}</b></span>
              </div>
              {!aiSequence && aiSequenceTemplates.length > 1 && (
                <label className="crm-field ai-sequence-template-field"><span>Template</span><select value={aiSequenceTemplateId} onChange={(event) => onAiSequenceTemplateChange(event.target.value)}>{aiSequenceTemplates.map((template) => <option key={template.id || "default"} value={template.id}>{template.name}</option>)}</select></label>
              )}
              {aiSequenceMessage && <p className="form-success ai-sequence-message">{aiSequenceMessage}</p>}
              {aiSequenceError && <p className="form-error ai-sequence-message">{aiSequenceError}</p>}
              <div className="ai-sequence-actions">
                <button className="btn primary compact" type="button" onClick={onStartAiSequence} disabled={Boolean(aiSequence) || aiSequenceBusy === "start"}>{aiSequenceBusy === "start" ? "Starting…" : "Start AI Sequence"}</button>
                <button className="ghost-button compact" type="button" onClick={() => onPauseAiSequence(aiSequence)} disabled={!aiSequence || aiSequenceBusy === "pause"}>{aiSequenceBusy === "pause" ? "Pausing…" : "Pause"}</button>
                <button className="ghost-button compact danger-action" type="button" onClick={() => onStopAiSequence(aiSequence)} disabled={!aiSequence || aiSequenceBusy === "stop"}>{aiSequenceBusy === "stop" ? "Stopping…" : "Stop"}</button>
              </div>
            </div>

            {getStageRecommendation(lead, actionCenter) && (
              <div className="detail-section ai-stage-recommendation-panel">
                <div className="execution-head">
                  <div>
                    <span className="eyebrow">AI Pipeline Automation</span>
                    <h4>{stageMap[lead.status] || lead.status} → {stageMap[getRecommendedStage(getStageRecommendation(lead, actionCenter))] || getRecommendedStage(getStageRecommendation(lead, actionCenter))}</h4>
                    <p>{getStageRecommendationReason(getStageRecommendation(lead, actionCenter))}</p>
                  </div>
                  <span className="ai-glow-badge">confidence {getStageRecommendationConfidence(getStageRecommendation(lead, actionCenter)) || '—'}%</span>
                </div>
                <div className="ai-recommendation-grid">
                  <div><span>Текущий stage</span><strong>{stageMap[lead.status] || lead.status}</strong></div>
                  <div><span>AI recommended stage</span><strong>{stageMap[getRecommendedStage(getStageRecommendation(lead, actionCenter))] || getRecommendedStage(getStageRecommendation(lead, actionCenter))}</strong></div>
                  <div><span>Статус approval</span><strong>{actionStatusLabel(getStageRecommendation(lead, actionCenter).status)}</strong></div>
                  <div><span>Reason</span><strong>{getStageRecommendationReason(getStageRecommendation(lead, actionCenter))}</strong></div>
                </div>
                <div className="execution-buttons">
                  <button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] || !['pending_approval','failed'].includes(getStageRecommendation(lead, actionCenter).status)}>{executionBusy[getStageRecommendation(lead, actionCenter).id] ? 'Обновляем…' : 'Approve stage change'}</button>
                  <button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] || getStageRecommendation(lead, actionCenter).status !== 'approved'}>{executionBusy[getStageRecommendation(lead, actionCenter).id] ? 'Выполняем…' : 'Execute stage change'}</button>
                  <button type="button" className="ghost-button compact danger-action" onClick={() => onRejectApprovalQueueItem(getStageRecommendation(lead, actionCenter))} disabled={executionBusy[getStageRecommendation(lead, actionCenter).id] || ['executing','completed','executed','rejected'].includes(getStageRecommendation(lead, actionCenter).status)}>Reject</button>
                </div>
              </div>
            )}

            {lead.aiRevenueScore && (
              <div className="detail-section ai-revenue-lead-card">
                <div className="ai-probability-head">
                  <div>
                    <span className="eyebrow">AI Revenue Intelligence</span>
                    <h4>AI Priority {lead.aiRevenueScore.priorityScore}/100 · Close {lead.aiRevenueScore.closeProbability}%</h4>
                    <p>{sanitizeVisibleAiText(lead.aiRevenueScore.reasoningSummary)}</p>
                  </div>
                  <span className="ai-glow-badge">{formatDate(lead.aiRevenueScore.updatedAt)}</span>
                </div>
                <div className="ai-recommendation-grid">
                  <div><span>AI Priority</span><strong>{lead.aiRevenueScore.priorityScore}/100</strong></div>
                  <div><span>Close Probability</span><strong>{lead.aiRevenueScore.closeProbability}%</strong></div>
                  <div><span>AI Recommendation</span><strong>{sanitizeVisibleAiText(lead.aiRevenueScore.recommendedAction)}</strong></div>
                  <div><span>Recommended channel</span><strong>{channelLabel(lead.aiRevenueScore.recommendedChannel)}</strong></div>
                  <div><span>Pipeline health</span><strong>{lead.aiRevenueScore.pipelineHealth}/100</strong></div>
                  <div><span>Last AI Analysis</span><strong>{formatDate(lead.aiRevenueScore.updatedAt)}</strong></div>
                  {getLatestAiVoiceCall(lead) && <div><span>Voice outcome in Revenue Brain</span><strong>{getLatestAiVoiceCall(lead).sentiment || '—'} · {getLatestAiVoiceCall(lead).outcome || '—'}</strong></div>}
                </div>
              </div>
            )}

            {getLatestAiVoiceCall(lead) && (
              <div className="detail-section ai-voice-lead-card">
                <div className="ai-probability-head">
                  <div>
                    <span className="eyebrow">AI Voice Outreach</span>
                    <h4>Latest AI voice call · {getLatestAiVoiceCall(lead).status}</h4>
                    <p>{sanitizeVisibleAiText(getLatestAiVoiceCall(lead).summary || getLatestAiVoiceCall(lead).nextAction || 'Mock call result is saved to this CRM lead.')}</p>
                  </div>
                  <span className="ai-glow-badge">Mock Mode · No real telephony traffic</span>
                </div>
                <div className="ai-recommendation-grid">
                  <div><span>Sentiment</span><strong>{getLatestAiVoiceCall(lead).sentiment || '—'}</strong></div>
                  <div><span>Outcome</span><strong>{getLatestAiVoiceCall(lead).outcome || '—'}</strong></div>
                  <div><span>Qualification</span><strong>{getLatestAiVoiceCall(lead).qualificationLevel || '—'}</strong></div>
                  <div><span>Next recommendation</span><strong>{sanitizeVisibleAiText(getLatestAiVoiceCall(lead).nextAction || '—')}</strong></div>
                </div>
              </div>
            )}


            {getLeadAiScore(lead) ? (
              <div className="detail-section ai-deal-probability-panel">
                <div className="ai-probability-head">
                  <div>
                    <span className="eyebrow">AI Forecast</span>
                    <h4>{getLeadAiScore(lead).probabilityToClose}% вероятность сделки</h4>
                    <p>{sanitizeVisibleAiText(getLeadAiScore(lead).aiSummary)}</p>
                  </div>
                  <span className={`urgency-badge ${getLeadAiScore(lead).urgencyLevel}`}>{urgencyLabel(getLeadAiScore(lead).urgencyLevel)}</span>
                </div>
                <div className="probability-bar"><i style={{ width: `${getLeadAiScore(lead).probabilityToClose}%` }} /></div>
                <div className="ai-badge-row detail-ai-badges">{getAiBadges(lead).map((badge) => <b className="ai-neon-badge" key={badge}>{badge}</b>)}</div>
                <div className="ai-recommendation-grid">
                  <div><span>AI score</span><strong>{getLeadAiScore(lead).score}/100</strong></div>
                  <div><span>priority_badge</span><strong>{lead.aiPriority || getLeadAiScore(lead).priority || 'medium'}</strong></div>
                  <div><span>temperature</span><strong>{tempLabel(lead.aiTemperature || getLeadAiScore(lead).temperature)}</strong></div>
                  <div><span>risk_badge</span><strong>{riskLabel(lead.aiRiskLevel || getLeadAiScore(lead).riskLevel)}</strong></div>
                  <div><span>AI reasoning</span><strong>{sanitizeVisibleAiText(lead.aiScoringReason || getLeadAiScore(lead).scoringReason || getLeadAiScore(lead).aiReasoning)}</strong></div>
                  <div><span>probability_to_close</span><strong>{getLeadAiScore(lead).probabilityToClose}%</strong></div>
                  <div><span>engagement_score</span><strong>{getLeadAiScore(lead).engagementScore}/100 · {tempLabel(getLeadAiScore(lead).temperature)}</strong></div>
                  <div><span>expected_revenue</span><strong>{formatCurrency(getLeadAiScore(lead).expectedRevenue || lead.estimatedRevenue)}</strong></div>
                  <div><span>forecast_category</span><strong>{forecastLabel(getLeadAiScore(lead).forecastCategory)}</strong></div>
                  <div><span>risk_level</span><strong>{riskLabel(getLeadAiScore(lead).riskLevel)}</strong></div>
                  <div><span>recommended_channel</span><strong>{channelLabel(getLeadAiScore(lead).recommendedChannel)}</strong></div>
                  <div><span>Прогноз конверсии</span><strong>{getLeadAiScore(lead).dealProbability >= 70 ? 'Высокий шанс оплаты' : getLeadAiScore(lead).dealProbability >= 40 ? 'Нужно усилить доверие' : 'Низкая готовность к покупке'}</strong></div>
                  <div><span>Идеальное время</span><strong>{getLeadAiScore(lead).idealContactTiming || 'сегодня'}</strong></div>
                  <div><span>recommended_next_step</span><strong>{sanitizeVisibleAiText(getLeadAiScore(lead).recommendedNextStep || getLeadAiScore(lead).nextBestAction)}</strong></div>
                  <div><span>latest forecast timeline event</span><strong>{getLatestForecastEvent(actionCenter)?.title || '—'} · {formatDate(getLatestForecastEvent(actionCenter)?.createdAt)}</strong></div>
                </div>
              </div>
            ) : (
              <div className="detail-section ai-deal-probability-panel empty-ai-score">
                <h4>AI Forecast</h4>
                <p>AI прогноз появится после квалификации лида.</p>
                <button className="ghost-button" type="button" onClick={onAnalyzeLeadAi} disabled={aiActionBusy[`${lead.id}:lead_ai_score`]}>{aiActionBusy[`${lead.id}:lead_ai_score`] ? 'AI считает…' : 'Рассчитать AI score'}</button>
              </div>
            )}

            <div className="detail-section ai-recommendation-panel">
              <div className="telegram-chat-head">
                <div>
                  <h4>AI рекомендации</h4>
                  <p>Рекомендации генерируются OpenAI только из CRM, Telegram, заметок и email истории.</p>
                </div>
                <span className="ai-glow-badge">AI мозг</span>
              </div>
              {getAiRecommendation(lead) ? (
                <div className="ai-recommendation-grid">
                  <div><span>Следующее лучшее действие</span><strong>{sanitizeVisibleAiText(getAiRecommendation(lead).nextBestAction || 'Клиент готов к следующему касанию')}</strong></div>
                  <div><span>Срочность</span><strong>{getAiRecommendation(lead).urgencyScore ?? '—'}%</strong></div>
                  <div><span>Вероятность сделки</span><strong>{getAiRecommendation(lead).conversionProbability ?? '—'}%</strong></div>
                  <div><span>Follow-up</span><strong>{sanitizeVisibleAiText(getAiRecommendation(lead).followUpRecommendation || 'Рекомендуется follow-up через 24 часа')}</strong></div>
                </div>
              ) : <p className="empty-state">Запустите «Анализ лида», чтобы получить AI рекомендации.</p>}
              {Array.isArray(getAiRecommendation(lead)?.recommendations) && <ul className="ai-recommendation-list">{getAiRecommendation(lead).recommendations.map((item, index) => <li key={`${item}-${index}`}>{sanitizeVisibleAiText(item)}</li>)}</ul>}
              {getLeadAiScore(lead) && <div className="ai-advisor-strip"><p><b>AI рекомендация:</b> {sanitizeVisibleAiText(getLeadAiScore(lead).recommendedNextStep || getLeadAiScore(lead).nextBestAction || "Назначить следующий шаг")}</p><p><b>Рекомендуемый CTA:</b> {sanitizeVisibleAiText(getLeadAiScore(lead).recommendedCta || "Назначить следующий шаг")}</p><p><b>Возражения:</b> {sanitizeVisibleAiText((getLeadAiScore(lead).objectionsDetected || []).join(", ") || "не обнаружены")}</p><p><b>AI Outreach Engine:</b> {telegramOutreachDrafts.length + emailOutreachDrafts.length} черновиков ждут approval · readiness {getLeadAiScore(lead).temperature === 'hot' ? 'немедленно' : getLeadAiScore(lead).temperature === 'warm' ? 'первый контакт' : 'только рекомендация'}</p>{getLatestAiVoiceCall(lead) && <p><b>AI Voice outcome:</b> {getLatestAiVoiceCall(lead).sentiment || '—'} · {getLatestAiVoiceCall(lead).outcome || '—'} · {sanitizeVisibleAiText(getLatestAiVoiceCall(lead).nextAction || '—')}</p>}</div>}
            </div>


            <div className="detail-section meeting-calendar-panel">
              <div className="telegram-chat-head">
                <div>
                  <h4>Запланированная встреча</h4>
                  <p>Calendar Integration v1 создаёт Google Calendar + Meet при наличии настроек и сохраняет .ics fallback.</p>
                </div>
                <span className="telegram-badge">Calendar</span>
              </div>
              {getScheduledMeetings(lead).length === 0 && <p className="empty-state">Встречи ещё не запланированы.</p>}
              {getScheduledMeetings(lead).map((meeting) => (
                <article className="meeting-calendar-card" key={meeting.id}>
                  <div>
                    <strong>{meeting.title || 'Demo-созвон AS6'}</strong>
                    <small>{formatDate(meeting.startsAt)} · {meeting.durationMinutes || 30} мин · {meeting.timezone || 'Europe/Moscow'}</small>
                  </div>
                  <div className="meeting-calendar-meta">
                    <span>Provider: {calendarProviderLabel(meeting.calendarProvider)}</span>
                    <span className={`calendar-status ${meeting.calendarStatus || 'pending'}`}>{calendarStatusLabel(meeting.calendarStatus)}</span>
                    <span>{meeting.status || 'scheduled'}</span>
                  </div>
                  {meeting.googleMeetUrl && <a className="calendar-meet-url" href={meeting.googleMeetUrl} target="_blank" rel="noreferrer">{meeting.googleMeetUrl}</a>}
                  {meeting.calendarError && <p className="calendar-error">{meeting.calendarError}</p>}
                  <div className="meeting-calendar-actions">
                    {meeting.googleMeetUrl && <a className="btn primary compact" href={meeting.googleMeetUrl} target="_blank" rel="noreferrer">Открыть Google Meet</a>}
                    <button type="button" className="btn primary compact" onClick={() => onDownloadMeetingIcs?.(meeting)} disabled={!meeting.hasIcs || meetingIcsDownloadingId === meeting.id}>{meetingIcsDownloadingId === meeting.id ? 'Скачиваем…' : meeting.hasIcs ? 'Скачать .ics' : '.ics готовится'}</button>
                  </div>
                </article>
              ))}
            </div>

            <div className="detail-section ai-action-center-card execution-center-card">
              <div className="execution-head">
                <div><h4>AI Execution Center</h4><p>AI не отправляет сам: сначала черновик, затем «Одобрить» и только потом «Отправить».</p></div>
                <span className="ai-glow-badge">APPROVE / SEND</span>
              </div>
              <div className="ai-action-buttons">
                <button className="ghost-button" type="button" onClick={onAnalyzeLeadAi} disabled={aiActionBusy[`${lead.id}:lead_ai_score`]}>{aiActionBusy[`${lead.id}:lead_ai_score`] ? "AI считает…" : "AI score + прогноз"}</button>
                {[
                  ['telegram_follow_up', 'Telegram follow-up'],
                  ['email_follow_up', 'Email follow-up'],
                  ['commercial_offer', 'КП'],
                  ['send_presentation', 'Презентация'],
                  ['send_screenshots', 'Скриншоты'],
                  ['send_demo_link', 'Demo link'],
                  ['create_reminder', 'Напоминание'],
                ].map(([actionType, title]) => <button className="ghost-button" type="button" key={actionType} onClick={() => onCreateExecutionAction(actionType)} disabled={executionBusy.create}>{title}</button>)}
              </div>
              <div className="execution-materials">
                <strong>Материалы на сервере</strong>
                <div>{materials.map((item) => <span className={item.exists ? 'material-ready' : 'material-missing'} key={item.key}>{item.exists ? '✓' : '!' } {item.fileName}</span>)}</div>
                <button className="ghost-button compact" type="button" onClick={() => onSendMaterials(['presentation'], isTelegramLead(lead) ? 'telegram' : 'email')} disabled={executionBusy.materials}>Отправить презентацию</button>
                <button className="ghost-button compact" type="button" onClick={() => onSendMaterials(['screenshot_1', 'screenshot_2'], isTelegramLead(lead) ? 'telegram' : 'email')} disabled={executionBusy.materials}>Отправить скриншоты</button>
              </div>
              <div className="execution-action-list">
                {(actionCenter.approvalItems || []).filter((item) => !['rejected','completed','executed','cancelled'].includes(item.status)).length > 0 && <h5 className="approval-mini-title">Очередь AI сотрудников для этого лида</h5>}
                {(actionCenter.approvalItems || []).filter((item) => !['rejected','completed','executed','cancelled'].includes(item.status) && (item.actionType || item.executionType) !== 'stage_change_recommendation').map((item) => (
                  <article className={`execution-action ${item.status}`} key={item.id}>
                    <div><strong>{actionTypeLabel(item.executionType || item.actionType)}</strong><span>{item.workerName || 'AI сотрудник'} · {actionStatusLabel(item.status)}</span></div>
                    <p>{sanitizeVisibleAiText(item.recommendation || item.title)}</p>
                    {item.errorMessage && <small className="email-error-text">Ошибка: {item.errorMessage}</small>}
                    <div className="execution-buttons">
                      <button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(item)} disabled={executionBusy[item.id] || !['pending_approval','failed'].includes(item.status)}>{executionBusy[item.id] ? 'Работаем…' : 'Одобрить'}</button>
                      <button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(item)} disabled={executionBusy[item.id] || item.status !== 'approved'}>{executionBusy[item.id] ? 'Отправляем…' : 'Отправить'}</button>
                      <button type="button" className="ghost-button compact" onClick={() => onEditApprovalQueueItem(item)} disabled={executionBusy[item.id] || ['executing','completed','executed'].includes(item.status)}>Изменить</button>
                      <button type="button" className="ghost-button compact danger-action" onClick={() => onRejectApprovalQueueItem(item)} disabled={executionBusy[item.id] || ['executing','completed','executed','rejected'].includes(item.status)}>Отклонить</button>
                    </div>
                  </article>
                ))}
                {(actionCenter.approvalItems || []).filter((item) => ['rejected','completed','executed','cancelled'].includes(item.status) && (item.actionType || item.executionType) !== 'stage_change_recommendation').length > 0 && (
                  <>
                    <h5 className="approval-mini-title">История AI действий</h5>
                    {(actionCenter.approvalItems || []).filter((item) => ['rejected','completed','executed','cancelled'].includes(item.status) && (item.actionType || item.executionType) !== 'stage_change_recommendation').slice(0, 6).map((item) => (
                      <article className={`execution-action ${item.status}`} key={item.id}>
                        <div><strong>{actionTypeLabel(item.executionType || item.actionType)}</strong><span>{item.workerName || 'AI сотрудник'} · {actionStatusLabel(item.status)} · {formatDate(item.updatedAt || item.executedAt || item.createdAt)}</span></div>
                        <p>{sanitizeVisibleAiText(item.recommendation || item.title)}</p>
                        {item.errorMessage && <small className="email-error-text">Ошибка: {item.errorMessage}</small>}
                      </article>
                    ))}
                  </>
                )}
                {(actionCenter.actions || []).length === 0 && (actionCenter.approvalItems || []).filter((item) => !['rejected','completed','executed','cancelled'].includes(item.status)).length === 0 && <p className="empty-state">Нет AI действий на одобрение. Создайте follow-up или материал.</p>}
                {(actionCenter.actions || []).map((action) => (
                  <article className={`execution-action ${action.status}`} key={action.id}>
                    <div><strong>{actionTypeLabel(action.actionType)}</strong><span>{action.channel} · {actionStatusLabel(action.status)}</span></div>
                    <p>{sanitizeCustomerVisibleText(action.generatedText || action.title)}</p>
                    {action.error && <small className="email-error-text">Ошибка: {action.error}</small>}
                    <div className="execution-buttons">
                      <button type="button" className="ghost-button compact" onClick={() => onApproveExecutionAction(action)} disabled={executionBusy[action.id] || ['approved','sent','cancelled'].includes(action.status)}>Одобрить</button>
                      <button type="button" className="btn primary compact" onClick={() => onSendExecutionAction(action)} disabled={executionBusy[action.id] || ['sent','failed','cancelled'].includes(action.status)}>Отправить</button>
                      <button type="button" className="ghost-button compact" onClick={() => onEditExecutionAction(action)} disabled={executionBusy[action.id] || ['sent','cancelled'].includes(action.status)}>Изменить</button>
                      <button type="button" className="ghost-button compact danger-action" onClick={() => onCancelExecutionAction(action)} disabled={executionBusy[action.id] || ['sent','cancelled'].includes(action.status)}>Отклонить</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>Контактные данные</h4>
              <dl className="lead-data-list">
                <div><dt>Контакт</dt><dd>{lead.name}</dd></div>
                <div><dt>Компания</dt><dd>{lead.company || "—"}</dd></div>
                <div><dt>Источник</dt><dd>{formatLeadSource(lead.source)}</dd></div>
                <div><dt>Telegram</dt><dd>{lead.telegram || lead.telegramUsername || "—"} {isTelegramLead(lead) && <span className="telegram-badge inline">Telegram</span>} {isTelegramLead(lead) && <span className={`telegram-presence ${lead.telegramOnline ? 'online' : 'offline'}`}>{lead.telegramOnline ? 'online' : 'offline'}</span>}</dd></div>
                <div><dt>Telegram username</dt><dd>{lead.telegramUsername || lead.telegram || "—"}</dd></div>
                <div><dt>Chat id</dt><dd>{hasTelegramChatId(lead) ? <span className="telegram-chat-status ok">chat id сохранён</span> : <span className="telegram-chat-status missing">chat id отсутствует</span>}</dd></div>
                <div><dt>Последний контакт</dt><dd>{formatDate(lead.lastMessageAt || lead.updatedAt)}</dd></div>
                <div><dt>Следующее AI действие</dt><dd>{sanitizeVisibleAiText(getLeadAiScore(lead)?.recommendedNextStep || getLeadAiScore(lead)?.nextBestAction || getAiSummaryText(getAiRecommendation(lead)))}</dd></div>
                <div><dt>Email</dt><dd>{lead.email || "—"}</dd></div>
                <div><dt>Этап</dt><dd>{stageMap[lead.status] || lead.status}</dd></div>
                {lead.metadata?.payment_status && <div><dt>Оплата</dt><dd>💰 {String(lead.metadata.payment_status).toUpperCase()} · {String(lead.metadata.plan || '-').toUpperCase()} · {lead.metadata.credits || 0} credits</dd></div>}
                {lead.metadata?.payment_id && <div><dt>Payment ID</dt><dd style={{wordBreak:'break-all'}}>{lead.metadata.payment_id}</dd></div>}

                {(lead.metadata?.sequence_payment_id || lead.metadata?.sequence_checkout_url || lead.metadata?.sequence_payment_status) && (
                  <>
                    <div>
                      <dt>AI Sequence</dt>
                      <dd>🤖 Auto checkout · {String(lead.metadata.sequence_payment_status || 'pending').toUpperCase()}</dd>
                    </div>

                    {lead.metadata?.sequence_payment_id && (
                      <div>
                        <dt>Sequence Payment ID</dt>
                        <dd style={{wordBreak:'break-all'}}>{lead.metadata.sequence_payment_id}</dd>
                      </div>
                    )}

                    {lead.metadata?.sequence_checkout_url && (
                      <div>
                        <dt>Sequence Checkout</dt>
                        <dd>
                          <a href={lead.metadata.sequence_checkout_url} target="_blank" rel="noreferrer">
                            Открыть ссылку оплаты
                          </a>
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {(lead.metadata?.checkout_recovery_status || lead.metadata?.checkout_recovery_payment_id || lead.metadata?.checkout_recovery_last_at) && (
                  <>
                    <div>
                      <dt>Checkout Recovery</dt>
                      <dd>💬 {String(lead.metadata.checkout_recovery_status || 'pending').toUpperCase()} · Step {lead.metadata.checkout_recovery_step || 1}</dd>
                    </div>

                    {lead.metadata?.checkout_recovery_payment_id && (
                      <div>
                        <dt>Recovery Payment ID</dt>
                        <dd style={{wordBreak:'break-all'}}>{lead.metadata.checkout_recovery_payment_id}</dd>
                      </div>
                    )}

                    {lead.metadata?.checkout_recovery_last_at && (
                      <div>
                        <dt>Recovery Last At</dt>
                        <dd>{String(lead.metadata.checkout_recovery_last_at)}</dd>
                      </div>
                    )}
                  </>
                )}

                <div><dt>AI Score</dt><dd>{lead.metadata?.ai_score || lead.ai_score || 0}/100</dd></div>

                <div><dt>Next Action</dt><dd>{aiSecretaryActionLabel(
                  lead.metadata?.next_action ||
                  lead.metadata?.ai_secretary_last_action
                )}</dd></div>

                <div><dt>Payment Status</dt><dd>{paymentStatusLabel(
                  lead.metadata?.payment_status
                )}</dd></div>

                <div><dt>Last AI Action</dt><dd>{lead.metadata?.ai_secretary_last_action || '—'}</dd></div>
                <div><dt>Создано</dt><dd>{formatDate(lead.createdAt)}</dd></div>
                <div><dt>Обновлено</dt><dd>{formatDate(lead.updatedAt)}</dd></div>
              </dl>
            </div>

            <div className="detail-section telegram-chat-section">
              <div className="telegram-chat-head">
                <div>
                  <h4>Telegram tab · AI outreach drafts</h4>
                  <p>Автоматические короткие русские черновики после AI qualification. Отправка только после approval.</p>
                </div>
                <span className="telegram-badge">Telegram drafts</span>
              </div>
              <div className="followup-history detail-followups">
                {telegramOutreachDrafts.length === 0 && telegramReplyDrafts.length === 0 && <p className="empty-state">Telegram черновики ещё не созданы.</p>}
                {telegramReplyDrafts.map((draft) => {
                  const payload = draft.payload || {};
                  const inboundText = payload.inboundText || payload.inboundMessage || payload.customerMessage || '';
                  const draftText = payload.editedText || payload.edited_text || payload.draftText || payload.text || payload.message || draft.recommendation || '';
                  const wasEdited = Boolean(payload.editedByManager || payload.editedText || payload.edited_text);
                  return <article className="telegram-approval-preview" key={draft.id}>
                    <div><span>Входящее</span><p>{sanitizeCustomerVisibleText(inboundText || '—')}</p><small>{formatDate(draft.createdAt)}</small></div>
                    <div><span>AI reply draft</span><p>{sanitizeCustomerVisibleText(draftText || '—')}</p><small>{actionStatusLabel(draft.status)}{wasEdited ? ' · Изменено менеджером' : ''} · {formatDate(draft.updatedAt || draft.createdAt)}</small></div>
                    <div className="execution-buttons"><button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}</button><button type="button" className="ghost-button compact" onClick={() => onEditApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || ['executing','completed'].includes(draft.status)}>Изменить</button><button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'}</button></div>
                  </article>;
                })}
                {telegramOutreachDrafts.map((draft) => <p className="ai-sequence-draft" key={draft.id}><b>{outreachTypeLabel(draft.outreachType)}:</b> {sanitizeCustomerVisibleText(draft.text)}<small>{actionStatusLabel(draft.status)} · score {draft.score || '—'} · {draft.temperature || 'AI'} · {formatDate(draft.createdAt)}</small><span className="execution-buttons"><button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}</button><button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'}</button></span></p>)}
              </div>
            </div>

            {isTelegramLead(lead) && (
              <div className="detail-section telegram-chat-section">
                <div className="telegram-chat-head">
                  <div>
                    <h4>Telegram переписка</h4>
                    <p>{hasTelegramChatId(lead) ? 'Последние сообщения обновляются автоматически каждые 7 секунд.' : 'У лида нет Telegram chat id. Отправка в Telegram недоступна.'}</p>
                  </div>
                  <span className="telegram-badge">Telegram</span>
                </div>
                {!hasTelegramChatId(lead) && (
                  <div className="telegram-connect-card">
                    <div>
                      <strong>Telegram не подключён</strong>
                      <p>Клиент должен открыть ссылку и нажать Start, чтобы CRM могла отправлять сообщения.</p>
                    </div>
                    <label className="crm-field"><span>Ссылка подключения</span><input readOnly value={getLeadTelegramConnectLink(lead) || 'Укажите TELEGRAM_BOT_USERNAME на backend'} /></label>
                    <div className="telegram-connect-actions">
                      <button className="ghost-button compact" type="button" disabled={!getLeadTelegramConnectLink(lead)} onClick={() => navigator.clipboard?.writeText(getLeadTelegramConnectLink(lead))}>Скопировать</button>
                      <a className={`btn primary compact ${!getLeadTelegramConnectLink(lead) ? 'disabled-link' : ''}`} href={getLeadTelegramConnectLink(lead) || undefined} target="_blank" rel="noreferrer" aria-disabled={!getLeadTelegramConnectLink(lead)}>Открыть Telegram</a>
                    </div>
                  </div>
                )}
                <div className="telegram-chat-window" aria-live="polite">
                  {telegramMessages.length === 0 && <p className="empty-state">Сообщений пока нет</p>}
                  {telegramMessages.map((item) => (
                    <article className={`telegram-chat-bubble ${item.role === 'assistant' ? 'assistant' : 'user'}`} key={item.id}>
                      <p>{sanitizeCustomerVisibleText(item.message)}</p>
                      <small>{item.role === 'assistant' ? 'CRM / AI' : lead.telegram || lead.name} · {formatDate(item.createdAt)}</small>
                    </article>
                  ))}
                </div>
                <form className="telegram-reply-form" onSubmit={onSendTelegramReply}>
                  <textarea value={telegramDraft} onChange={(event) => onTelegramDraftChange(event.target.value)} placeholder="Ответить клиенту в Telegram из CRM" />
                  <button className="btn primary compact" disabled={telegramSending || !telegramDraft.trim() || !hasTelegramChatId(lead)} type="submit">{telegramSending ? 'Отправляем…' : 'Ответить в Telegram'}</button>
                </form>
              </div>
            )}

            <div className="detail-section email-composer-section">
              <div className="telegram-chat-head">
                <div>
                  <h4>Email клиенту</h4>
                  <p>AI генерирует письмо, очередь отправляет через SMTP/Gmail API, а CRM сохраняет статусы и открытия.</p>
                </div>
                <span className="telegram-badge">Email</span>
              </div>
              <div className="followup-history detail-followups">
                {emailOutreachDrafts.length === 0 && <p className="empty-state">Email черновики ещё не созданы.</p>}
                {emailOutreachDrafts.map((draft) => <p className="ai-sequence-draft" key={draft.id}><b>{outreachTypeLabel(draft.outreachType)} · {draft.subject}:</b> {sanitizeCustomerVisibleText(draft.text)}<small>{draft.status} · CTA: {draft.cta || '—'} · {formatDate(draft.createdAt)}</small>{draft.demoProposal && <small>{sanitizeVisibleAiText(draft.demoProposal)}</small>}</p>)}
              </div>
              <form className="email-composer" onSubmit={onSendEmail}>
                <div className="email-composer-row">
                  <label className="crm-field"><span>Шаблон</span><select value={emailComposer.template} onChange={(event) => onEmailComposerChange({ ...emailComposer, template: event.target.value })}>{emailTemplates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}</select></label>
                  <label className="crm-field"><span>Кому</span><input type="email" value={emailComposer.to} onChange={(event) => onEmailComposerChange({ ...emailComposer, to: event.target.value })} placeholder="client@company.ru" required /></label>
                </div>
                <label className="crm-field"><span>Тема</span><input value={emailComposer.subject} onChange={(event) => onEmailComposerChange({ ...emailComposer, subject: event.target.value })} placeholder="Тема письма" required /></label>
                <label className="crm-field"><span>Текст письма</span><textarea value={emailComposer.text} onChange={(event) => onEmailComposerChange({ ...emailComposer, text: event.target.value })} placeholder="AI‑черновик появится здесь" required /></label>
                <label className="crm-field"><span>HTML (опционально)</span><textarea value={emailComposer.html} onChange={(event) => onEmailComposerChange({ ...emailComposer, html: event.target.value })} placeholder="HTML версия письма" /></label>
                <div className="email-attachment-row">
                  <label className="ghost-button file-upload-button">Загрузить вложение<input type="file" onChange={onUploadEmailAttachment} /></label>
                  <button className="ghost-button" type="button" onClick={onGenerateEmail} disabled={emailBusy}>{emailBusy ? 'AI готовит…' : 'AI сгенерировать письмо'}</button>
                  <button className="btn primary compact" type="submit" disabled={emailBusy || !emailComposer.to || !emailComposer.subject}>{emailBusy ? 'Отправляем…' : 'Отправить email'}</button>
                </div>
                {emailAttachments.length > 0 && <div className="email-attachments-list">{emailAttachments.map((file) => <span key={file.id}>📎 {file.fileName}</span>)}</div>}
              </form>
              <div className="email-history">
                <h5>История email</h5>
                {leadEmails.length === 0 && <p className="empty-state">Писем пока нет</p>}
                {leadEmails.map((email) => (
                  <article className={`email-history-card ${email.status === 'failed' ? 'failed' : ''}`} key={email.id}>
                    <strong>{email.subject}</strong>
                    <span>{email.status === 'sent' ? 'отправлено' : email.status === 'queued' ? 'в очереди / повторная отправка' : email.status === 'failed' ? 'ошибка отправки' : 'отправляется'} · {formatDate(email.createdAt)}</span>
                    <small>Кому: {email.to}{email.sentAt ? ` · SMTP ${formatDate(email.sentAt)}` : ''}{email.openedAt ? ` · открыто ${formatDate(email.openedAt)}` : ''}</small>
                    {email.attachments?.length > 0 && <small>Вложения: {email.attachments.map((file) => file.fileName).join(', ')}</small>}
                    {email.error && <small className="email-error-text">Ошибка: {email.error}</small>}
                  </article>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>Заметки</h4>
              {lead.notesText ? <p className="detail-notes-text">{formatCrmText(lead.notesText)}</p> : <p className="empty-state">Заметок пока нет</p>}
              <form className="detail-note-form" onSubmit={onAddNote}>
                <textarea value={noteDraft} onChange={(event) => onNoteDraftChange(event.target.value)} placeholder="Добавить новую заметку по сделке" />
                <button className="btn primary compact" type="submit">Добавить заметку</button>
              </form>
            </div>

            <div className="detail-actions">
              <button className="btn primary compact" type="button" onClick={onFollowUp} disabled={followUpLoading}>{followUpLoading ? "AI думает…" : "Сгенерировать AI‑дожим"}</button>
              <button className="ghost-button" type="button" onClick={onEdit}>Редактировать</button>
              <button className="ghost-button danger-action" type="button" onClick={onDelete}>Удалить</button>
            </div>
          </section>

          <aside className="lead-detail-side">
            <div className="detail-section">
              <h4>AI‑дожим</h4>
              <div className="followup-history detail-followups">
                {(lead.followUps || []).length === 0 && (lead.aiFollowUpSequences || []).length === 0 && (lead.aiFollowupJobs || []).length === 0 && (lead.aiOutreachDrafts || []).length === 0 && <p>AI‑дожим ещё не генерировался.</p>}
                {(lead.aiOutreachDrafts || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.channel === 'email' ? `Email · ${item.subject}` : 'Telegram'}:</b> {sanitizeCustomerVisibleText(item.text)}<small>{actionStatusLabel(item.status)} · {outreachTypeLabel(item.outreachType)} · {formatDate(item.createdAt)}</small></p>)}
                {(lead.aiFollowupJobs || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.suggestedChannel === 'email' ? 'Email' : item.suggestedChannel === 'telegram' ? 'Telegram' : 'CRM reminder'}:</b> {sanitizeCustomerVisibleText(item.generatedMessage)}<small>{item.status} · {sanitizeVisibleAiText(item.reason || item.ruleType)} · срочность {item.urgency} · {formatDate(item.sentAt || item.approvedAt || item.scheduledFor || item.createdAt)}</small>{item.error && <small>Ошибка: {item.error}</small>}</p>)}
                {(lead.aiFollowUpSequences || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.followupType === "email" ? "Email" : item.followupType === "telegram" ? "Telegram" : "Задача"}:</b> {sanitizeCustomerVisibleText(item.generatedMessage)}<small>{item.status === "draft" ? "черновик" : item.status} · {formatDate(item.scheduledFor || item.recommendedAt)}</small></p>)}
                {(lead.followUps || []).map((item) => <p key={item.id}><b>AI:</b> {sanitizeCustomerVisibleText(item.message)}<small>{formatDate(item.createdAt)}</small></p>)}
              </div>
            </div>

            <div className="detail-section attachment-history-card">
              <h4>История вложений</h4>
              {(actionCenter.attachments || []).length === 0 && <p className="empty-state">Материалы ещё не отправлялись.</p>}
              {(actionCenter.attachments || []).map((item) => <p className="attachment-history-row" key={item.id}><b>{item.file_name}</b><small>{item.channel || '—'} · {item.status === 'sent' ? 'отправлено' : item.status} · {formatDate(item.sent_at || item.created_at)}</small></p>)}
            </div>

            <div className="detail-section">
              <h4>Timeline memory</h4>
              <div className="activity-preview crm-activity-feed detail-activity-feed timeline-memory-feed">
                {(actionCenter.timeline || []).length === 0 && activity.length === 0 && <p><span />Событий для лида пока нет</p>}
                {(actionCenter.timeline || []).map((event) => <p className={event.source === 'ai' ? 'ai-timeline-item' : ''} key={event.id}><span />{timelineTitle(event)}<small>{formatCrmText(event.body)}<br />{sanitizeVisibleAiText(event.source)} · {formatDate(event.createdAt)}</small></p>)}
              </div>
            </div>
          </aside>
        </div>
        <div className="lead-detail-bottom-actions">
          <button className="ghost-button compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "call")}>📞 Позвонить</button>
          <button className="ghost-button compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "meeting")}>📅 Встреча</button>
          <button className="ghost-button compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "proposal")}>📨 КП</button>
          <button className="btn primary compact" type="button" onClick={() => onAiSecretaryCrmAction?.(lead, "checkout")}>💳 Оплата</button>
          <button className="btn primary compact" type="button" onClick={() => onTestPaymentPaid?.(lead)}>✅ Test Paid</button>
          <button className="ghost-button" type="button" onClick={closeLeadModal}>Закрыть</button>
        </div>
      </section>
    </div>
  );
}
