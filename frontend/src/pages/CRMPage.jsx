import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import {
  addCrmLeadNote,
  analyzeCrmLeadAi,
  analyzeCrmWorkspaceAi,
  createCrmFollowUp,
  createAiAgentAction,
  createCrmLead,
  deleteCrmLead,
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
  sendTelegramLeadMessage,
  queueInactiveAiFollowUps,
  updateCrmStage,
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

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
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
    telegram_ai_reply_sent: "AI ответ отправлен в Telegram",
    meeting_scheduled: "Встреча запланирована",
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
  return String(value || "")
    .replace(/AI follow-up:/gi, "AI‑дожим:")
    .replace(/AI follow‑up/gi, "AI‑дожим")
    .replace(/AI reply sent:/gi, "AI ответ отправлен:")
    .replace(/Telegram message received/gi, "Telegram сообщение получено");
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
  return ({ cold: 'COLD', warm: 'WARM', hot: 'HOT' }[level] || 'AI');
}

function channelLabel(channel) {
  return ({ telegram: 'Telegram', email: 'Email', phone: 'Phone', crm_task: 'CRM task', Telegram: 'Telegram', Email: 'Email', 'Задача менеджеру': 'CRM task' }[channel] || channel || 'CRM task');
}

function forecastLabel(category) {
  return ({ committed: 'Committed', likely: 'Likely', possible: 'Possible', at_risk: 'At risk', lost_risk: 'Lost risk' }[category] || 'Possible');
}

function getLatestForecastEvent(actionCenter = {}) {
  return (actionCenter.timeline || []).find((event) => ['ai_forecast_updated', 'ai_risk_detected', 'ai_score_updated'].includes(event?.type));
}

function getAiBadges(lead) {
  const score = getLeadAiScore(lead);
  if (!score) return [];
  return [
    score.temperature === 'hot' && 'HOT',
    score.temperature === 'warm' && 'WARM',
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
  if (recommendation.nextBestAction) return recommendation.nextBestAction;
  if (Array.isArray(recommendation.recommendations) && recommendation.recommendations[0]) return recommendation.recommendations[0];
  return recommendation.content || recommendation.rawText || 'AI рекомендация готова';
}


function actionStatusLabel(status) {
  return ({ draft: 'черновик', pending_approval: 'ждёт одобрения', approved: 'одобрено', executing: 'выполняется', completed: 'выполнено', executed: 'исполнено', rejected: 'отклонено', sent: 'отправлено', failed: 'ошибка', cancelled: 'отклонено' }[status] || status);
}

function actionTypeLabel(type) {
  return ({ telegram_followup: 'Telegram follow-up', email_followup: 'Email follow-up', telegram_follow_up: 'Telegram follow-up', email_follow_up: 'Email follow-up', telegram_draft: 'Telegram draft', email_draft: 'Email draft', followup_24h: 'Follow-up 24ч', followup_3d: 'Follow-up 3д', demo_offer: 'Demo offer', meeting_request: 'Запрос встречи', follow_up_recommendation: 'Follow-up', crm_next_action: 'CRM действие', lead_prioritization: 'Приоритизация', commercial_offer: 'Коммерческое предложение', send_presentation: 'Отправить презентацию', send_screenshots: 'Отправить скриншоты', send_demo_link: 'Отправить demo link', move_lead_stage: 'Переместить этап', stage_change_recommendation: 'AI рекомендация этапа', create_reminder: 'Создать напоминание' }[type] || type);
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
  return payload.reason || item?.reason || item?.recommendation || 'AI обнаружил сигнал для смены этапа.';
}

function getStageRecommendationConfidence(item) {
  const payload = item?.payload || item || {};
  return Number(payload.confidence ?? item?.confidence ?? 0);
}

function timelineTitle(event) {
  return ({ telegram_inbound: 'Telegram inbound', telegram_outbound_ai: 'Telegram outbound AI', ai_draft_created: 'AI черновик создан', ai_draft_approved: 'AI черновик одобрен', telegram_sent: 'Telegram отправлен', lead_replied: 'Лид ответил', send_failed: 'Отправка не выполнена', ai_stage_suggested: 'AI предложил этап', ai_stage_recommendation: 'AI рекомендовал этап', stage_approved: 'Этап одобрен', stage_changed: 'Этап изменён', opportunity_risk_detected: 'Риск сделки обнаружен', ai_risk_detected: 'AI риск обнаружен', ai_forecast_updated: 'AI прогноз обновлён', ai_next_action_generated: 'AI следующий шаг', email_sent: 'Email отправлен', email_failed: 'Email не отправлен', ai_score_updated: 'AI score обновлён', follow_up_draft: 'Follow-up черновик', sent_follow_up: 'Follow-up отправлен', attachments_sent: 'Материалы отправлены', lead_moved: 'Этап изменён', note_added: 'Заметка', ai_action_sent: 'AI действие отправлено', ai_action_approved: 'AI действие одобрено', ai_action_rejected: 'AI действие отклонено', ai_action_executed: 'AI действие выполнено', ai_action_failed: 'AI действие не выполнено', follow_up_suggested: 'Follow-up suggested', follow_up_approved: 'Follow-up approved', follow_up_rejected: 'Follow-up rejected', follow_up_sent: 'Follow-up sent', follow_up_failed: 'Follow-up failed' }[event?.type] || event?.title || 'Событие');
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
      const [leadsResponse, stagesResponse, statsResponse, activityResponse, templatesResponse, materialsResponse] = await Promise.all([
        fetchCrmLeads(),
        fetchCrmStages(),
        fetchCrmStats(),
        fetchCrmActivity(),
        fetchEmailTemplates(),
        fetchMaterials(),
      ]);
      setLeads(leadsResponse.leads || []);
      setStages((stagesResponse.stages?.length ? stagesResponse.stages : DEFAULT_CRM_STAGES));
      setStats(statsResponse.stats || null);
      setActivity(activityResponse.events || statsResponse.stats?.activity || []);
      setEmailTemplates(templatesResponse.templates || []);
      setMaterials(materialsResponse.materials || []);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить CRM");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCrm(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const leadIdFromUrl = params.get("leadId") || params.get("lead");
    if (!leadIdFromUrl || selectedLeadId || leads.length === 0) return;
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
      refreshMeta().catch((requestError) => setError(requestError.message || "Не удалось обновить ленту активности"));
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

  const leadsByStage = useMemo(() => stages.reduce((acc, stage) => {
    acc[stage.status] = leads.filter((lead) => lead.status === stage.status);
    return acc;
  }, {}), [leads, stages]);

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


  async function handleAnalyzeWorkspaceAi() {
    setError('');
    setAiAnalysisBusy(true);
    try {
      await analyzeCrmWorkspaceAi({ limit: 25 });
      await loadCrm({ silent: true });
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || 'Не удалось обновить AI score');
    } finally {
      setAiAnalysisBusy(false);
    }
  }

  async function handleAnalyzeLeadAi(lead) {
    setError('');
    setAiActionBusy((current) => ({ ...current, [`${lead.id}:lead_ai_score`]: true }));
    try {
      await analyzeCrmLeadAi(lead.id);
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
        <StatCard label="Горячие лиды" value={loading ? "…" : String(stats?.aiMetrics?.hotLeads || 0)} hint={`средний score ${stats?.aiMetrics?.averageLeadScore || 0}/100`} tone="pink" />
        <StatCard label="Forecast Revenue" value={loading ? "…" : formatCurrency(stats?.aiMetrics?.aiForecastedRevenue || stats?.aiMetrics?.predictedRevenue || 0)} hint={`forecast ${stats?.aiMetrics?.conversionForecast || 0}%`} tone="violet" />
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
<div className="ai-action-center-buttons"><button className="ghost-button" type="button" onClick={handleAnalyzeWorkspaceAi} disabled={aiAnalysisBusy}>{aiAnalysisBusy ? "AI пересчитывает…" : "Пересчитать AI score"}</button><button className="btn primary compact" type="button" onClick={handleQueueInactiveFollowUps} disabled={inactiveQueueBusy}>{inactiveQueueBusy ? "AI ставит в очередь…" : "Поставить follow-up для неактивных"}</button></div>
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
                      className={`lead-card premium-lead-card compact-pipeline-card ${getLeadAiScore(lead)?.riskLevel === "high" ? "at-risk-lead" : ""} ${draggedLeadId === lead.id ? "is-dragging" : ""}`}
                      draggable
                      onClick={() => openDetail(lead)}
                      onDragStart={(event) => handleLeadDragStart(event, lead)}
                      onDragEnd={handleLeadDragEnd}
                      key={lead.id}
                    >
                      <div className="lead-topline"><strong>{lead.name}</strong><span>{formatCurrency(lead.value)}</span></div>
                      {getLeadAiScore(lead) ? <>
                        <div className="lead-intelligence-kpis"><b>{getLeadAiScore(lead).probabilityToClose}%</b><span>{riskLabel(getLeadAiScore(lead).riskLevel)}</span><em>{formatCurrency(getLeadAiScore(lead).expectedRevenue || lead.estimatedRevenue)}</em></div>
                        <div className="lead-ai-probability forecast-progress"><span>{forecastLabel(getLeadAiScore(lead).forecastCategory)} · engagement {getLeadAiScore(lead).engagementScore}/100</span><i style={{ width: `${getLeadAiScore(lead).probabilityToClose}%` }} /></div>
                      </> : <div className="ai-forecast-empty-card">AI прогноз появится после квалификации лида.</div>}
                      {getAiBadges(lead).length > 0 && <div className="ai-badge-row">{getAiBadges(lead).map((badge) => <b className="ai-neon-badge" key={badge}>{badge}</b>)}</div>}
                      <p>{lead.company || (isTelegramLead(lead) ? lead.telegram || "Telegram контакт" : "Компания не указана")}</p>{getLeadAiScore(lead)?.aiReasoning && <div className="ai-card-reasoning">{getLeadAiScore(lead).aiReasoning}</div>}
                      <div className="lead-card-meta"><small><i />{stageMap[lead.status] || lead.status}</small><span className={`source-pill ${lead.source === "telegram" ? "telegram-source" : ""}`}>{formatLeadSource(lead.source)}</span></div>{getLeadAiScore(lead)?.recommendedNextStep && <div className="ai-card-recommendation"><span>AI</span>{getLeadAiScore(lead).recommendedNextStep}</div>}{!getLeadAiScore(lead)?.recommendedNextStep && getAiRecommendation(lead) && <div className="ai-card-recommendation"><span>AI</span>{getAiSummaryText(getAiRecommendation(lead))}</div>}{isTelegramLead(lead) && <div className="telegram-card-status"><span className={`telegram-presence-dot ${lead.telegramOnline ? 'online' : 'offline'}`} />{lead.telegramOnline ? 'online' : 'offline'} · {lead.lastMessageAt ? formatDate(lead.lastMessageAt) : 'нет сообщений'}</div>}
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
          closeLeadModal={closeLeadModal}
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

function LeadDetailModal({ lead, stages, stageMap, activity, noteDraft, onNoteDraftChange, onAddNote, onFollowUp, onAiAction, onAnalyzeLeadAi, aiActionBusy = {}, followUpLoading, onDelete, onEdit, onMove, telegramMessages = [], telegramDraft = '', telegramSending = false, onTelegramDraftChange, onSendTelegramReply, emailTemplates = [], leadEmails = [], emailComposer, emailAttachments = [], emailBusy = false, onEmailComposerChange, onGenerateEmail, onUploadEmailAttachment, onSendEmail, actionCenter = { actions: [], timeline: [], attachments: [] }, materials = [], executionBusy = {}, onCreateExecutionAction, onApproveExecutionAction, onSendExecutionAction, onEditExecutionAction, onCancelExecutionAction, onSendMaterials, onApproveApprovalQueueItem, onRejectApprovalQueueItem, onExecuteApprovalQueueItem, onEditApprovalQueueItem, closeLeadModal }) {
  useModalCloseLifecycle(closeLeadModal);
  const telegramOutreachDrafts = getOutreachDrafts(lead, 'telegram');
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

            {getLeadAiScore(lead) ? (
              <div className="detail-section ai-deal-probability-panel">
                <div className="ai-probability-head">
                  <div>
                    <span className="eyebrow">AI Forecast</span>
                    <h4>{getLeadAiScore(lead).probabilityToClose}% вероятность сделки</h4>
                    <p>{getLeadAiScore(lead).aiSummary}</p>
                  </div>
                  <span className={`urgency-badge ${getLeadAiScore(lead).urgencyLevel}`}>{urgencyLabel(getLeadAiScore(lead).urgencyLevel)}</span>
                </div>
                <div className="probability-bar"><i style={{ width: `${getLeadAiScore(lead).probabilityToClose}%` }} /></div>
                <div className="ai-badge-row detail-ai-badges">{getAiBadges(lead).map((badge) => <b className="ai-neon-badge" key={badge}>{badge}</b>)}</div>
                <div className="ai-recommendation-grid">
                  <div><span>probability_to_close</span><strong>{getLeadAiScore(lead).probabilityToClose}%</strong></div>
                  <div><span>engagement_score</span><strong>{getLeadAiScore(lead).engagementScore}/100 · {tempLabel(getLeadAiScore(lead).temperature)}</strong></div>
                  <div><span>expected_revenue</span><strong>{formatCurrency(getLeadAiScore(lead).expectedRevenue || lead.estimatedRevenue)}</strong></div>
                  <div><span>forecast_category</span><strong>{forecastLabel(getLeadAiScore(lead).forecastCategory)}</strong></div>
                  <div><span>risk_level</span><strong>{riskLabel(getLeadAiScore(lead).riskLevel)}</strong></div>
                  <div><span>recommended_channel</span><strong>{channelLabel(getLeadAiScore(lead).recommendedChannel)}</strong></div>
                  <div><span>Прогноз конверсии</span><strong>{getLeadAiScore(lead).dealProbability >= 70 ? 'Высокий шанс оплаты' : getLeadAiScore(lead).dealProbability >= 40 ? 'Нужно усилить доверие' : 'Низкая готовность к покупке'}</strong></div>
                  <div><span>Идеальное время</span><strong>{getLeadAiScore(lead).idealContactTiming || 'сегодня'}</strong></div>
                  <div><span>recommended_next_step</span><strong>{getLeadAiScore(lead).recommendedNextStep || getLeadAiScore(lead).nextBestAction}</strong></div>
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
                  <div><span>Следующее лучшее действие</span><strong>{getAiRecommendation(lead).nextBestAction || 'Клиент готов к следующему касанию'}</strong></div>
                  <div><span>Срочность</span><strong>{getAiRecommendation(lead).urgencyScore ?? '—'}%</strong></div>
                  <div><span>Вероятность сделки</span><strong>{getAiRecommendation(lead).conversionProbability ?? '—'}%</strong></div>
                  <div><span>Follow-up</span><strong>{getAiRecommendation(lead).followUpRecommendation || 'Рекомендуется follow-up через 24 часа'}</strong></div>
                </div>
              ) : <p className="empty-state">Запустите «Анализ лида», чтобы получить AI рекомендации.</p>}
              {Array.isArray(getAiRecommendation(lead)?.recommendations) && <ul className="ai-recommendation-list">{getAiRecommendation(lead).recommendations.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}
              {getLeadAiScore(lead) && <div className="ai-advisor-strip"><p><b>AI рекомендация:</b> {getLeadAiScore(lead).recommendedNextStep || getLeadAiScore(lead).nextBestAction || "Назначить следующий шаг"}</p><p><b>Рекомендуемый CTA:</b> {getLeadAiScore(lead).recommendedCta || "Назначить следующий шаг"}</p><p><b>Возражения:</b> {(getLeadAiScore(lead).objectionsDetected || []).join(", ") || "не обнаружены"}</p><p><b>AI Outreach Engine:</b> {telegramOutreachDrafts.length + emailOutreachDrafts.length} черновиков ждут approval · readiness {getLeadAiScore(lead).temperature === 'hot' ? 'немедленно' : getLeadAiScore(lead).temperature === 'warm' ? 'первый контакт' : 'только рекомендация'}</p></div>}
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
                {(actionCenter.approvalItems || []).length > 0 && <h5 className="approval-mini-title">Очередь AI сотрудников для этого лида</h5>}
                {(actionCenter.approvalItems || []).filter((item) => (item.actionType || item.executionType) !== 'stage_change_recommendation').map((item) => (
                  <article className={`execution-action ${item.status}`} key={item.id}>
                    <div><strong>{actionTypeLabel(item.executionType || item.actionType)}</strong><span>{item.workerName || 'AI сотрудник'} · {actionStatusLabel(item.status)}</span></div>
                    <p>{item.recommendation || item.title}</p>
                    {item.errorMessage && <small className="email-error-text">Ошибка: {item.errorMessage}</small>}
                    <div className="execution-buttons">
                      <button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(item)} disabled={executionBusy[item.id] || !['pending_approval','failed'].includes(item.status)}>{executionBusy[item.id] ? 'Работаем…' : 'Одобрить'}</button>
                      <button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(item)} disabled={executionBusy[item.id] || item.status !== 'approved'}>{executionBusy[item.id] ? 'Отправляем…' : 'Отправить'}</button>
                      <button type="button" className="ghost-button compact" onClick={() => onEditApprovalQueueItem(item)} disabled={executionBusy[item.id] || ['executing','completed','executed'].includes(item.status)}>Изменить</button>
                      <button type="button" className="ghost-button compact danger-action" onClick={() => onRejectApprovalQueueItem(item)} disabled={executionBusy[item.id] || ['executing','completed','executed','rejected'].includes(item.status)}>Отклонить</button>
                    </div>
                  </article>
                ))}
                {(actionCenter.actions || []).length === 0 && (actionCenter.approvalItems || []).length === 0 && <p className="empty-state">Нет AI действий на одобрение. Создайте follow-up или материал.</p>}
                {(actionCenter.actions || []).map((action) => (
                  <article className={`execution-action ${action.status}`} key={action.id}>
                    <div><strong>{actionTypeLabel(action.actionType)}</strong><span>{action.channel} · {actionStatusLabel(action.status)}</span></div>
                    <p>{action.generatedText || action.title}</p>
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
                <div><dt>Следующее AI действие</dt><dd>{getLeadAiScore(lead)?.recommendedNextStep || getLeadAiScore(lead)?.nextBestAction || getAiSummaryText(getAiRecommendation(lead))}</dd></div>
                <div><dt>Email</dt><dd>{lead.email || "—"}</dd></div>
                <div><dt>Этап</dt><dd>{stageMap[lead.status] || lead.status}</dd></div>
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
                {telegramOutreachDrafts.length === 0 && <p className="empty-state">Telegram черновики ещё не созданы.</p>}
                {telegramOutreachDrafts.map((draft) => <p className="ai-sequence-draft" key={draft.id}><b>{outreachTypeLabel(draft.outreachType)}:</b> {draft.text}<small>{actionStatusLabel(draft.status)} · score {draft.score || '—'} · {draft.temperature || 'AI'} · {formatDate(draft.createdAt)}</small><span className="execution-buttons"><button type="button" className="ghost-button compact" onClick={() => onApproveApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || !['pending_approval','failed'].includes(draft.status)}>{executionBusy[draft.id] ? 'Работаем…' : 'Одобрить'}</button><button type="button" className="btn primary compact" onClick={() => onExecuteApprovalQueueItem(draft)} disabled={executionBusy[draft.id] || draft.status !== 'approved'}>{executionBusy[draft.id] ? 'Отправляем…' : 'Отправить'}</button></span></p>)}
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
                <div className="telegram-chat-window" aria-live="polite">
                  {telegramMessages.length === 0 && <p className="empty-state">Сообщений пока нет</p>}
                  {telegramMessages.map((item) => (
                    <article className={`telegram-chat-bubble ${item.role === 'assistant' ? 'assistant' : 'user'}`} key={item.id}>
                      <p>{item.message}</p>
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
                {emailOutreachDrafts.map((draft) => <p className="ai-sequence-draft" key={draft.id}><b>{outreachTypeLabel(draft.outreachType)} · {draft.subject}:</b> {draft.text}<small>{draft.status} · CTA: {draft.cta || '—'} · {formatDate(draft.createdAt)}</small>{draft.demoProposal && <small>{draft.demoProposal}</small>}</p>)}
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
                {(lead.aiOutreachDrafts || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.channel === 'email' ? `Email · ${item.subject}` : 'Telegram'}:</b> {item.text}<small>{actionStatusLabel(item.status)} · {outreachTypeLabel(item.outreachType)} · {formatDate(item.createdAt)}</small></p>)}
                {(lead.aiFollowupJobs || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.suggestedChannel === 'email' ? 'Email' : item.suggestedChannel === 'telegram' ? 'Telegram' : 'CRM reminder'}:</b> {item.generatedMessage}<small>{item.status} · {item.reason || item.ruleType} · срочность {item.urgency} · {formatDate(item.sentAt || item.approvedAt || item.scheduledFor || item.createdAt)}</small>{item.error && <small>Ошибка: {item.error}</small>}</p>)}
                {(lead.aiFollowUpSequences || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.followupType === "email" ? "Email" : item.followupType === "telegram" ? "Telegram" : "Задача"}:</b> {item.generatedMessage}<small>{item.status === "draft" ? "черновик" : item.status} · {formatDate(item.scheduledFor || item.recommendedAt)}</small></p>)}
                {(lead.followUps || []).map((item) => <p key={item.id}><b>AI:</b> {item.message}<small>{formatDate(item.createdAt)}</small></p>)}
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
                {(actionCenter.timeline || []).map((event) => <p className={event.source === 'ai' ? 'ai-timeline-item' : ''} key={event.id}><span />{timelineTitle(event)}<small>{formatCrmText(event.body)}<br />{event.source} · {formatDate(event.createdAt)}</small></p>)}
              </div>
            </div>
          </aside>
        </div>
        <div className="lead-detail-bottom-actions">
          <button className="ghost-button" type="button" onClick={closeLeadModal}>Закрыть</button>
        </div>
      </section>
    </div>
  );
}
