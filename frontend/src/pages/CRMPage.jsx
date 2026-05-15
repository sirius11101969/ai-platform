import React, { useEffect, useMemo, useState } from "react";
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
  generateLeadEmail,
  sendLeadEmail,
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
  return lead?.source === "telegram" || Boolean(lead?.telegram);
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

function getAiBadges(lead) {
  const score = getLeadAiScore(lead);
  if (!score) return [];
  return [
    score.temperature === 'hot' && 'HOT',
    score.score >= 80 && 'AI PRIORITY',
    score.dealProbability >= 70 && 'HIGH PROBABILITY',
    score.urgencyLevel === 'high' && 'FOLLOW-UP REQUIRED',
    score.riskLevel === 'high' && 'AT RISK',
  ].filter(Boolean);
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
  const [aiActionBusy, setAiActionBusy] = useState({});
  const [inactiveQueueBusy, setInactiveQueueBusy] = useState(false);
  const [aiAnalysisBusy, setAiAnalysisBusy] = useState(false);

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedLeadId) || null, [leads, selectedLeadId]);
  const stageMap = useMemo(() => stages.reduce((acc, stage) => ({ ...acc, [stage.status]: stage.title }), {}), [stages]);

  async function loadCrm({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [leadsResponse, stagesResponse, statsResponse, activityResponse, templatesResponse] = await Promise.all([
        fetchCrmLeads(),
        fetchCrmStages(),
        fetchCrmStats(),
        fetchCrmActivity(),
        fetchEmailTemplates(),
      ]);
      setLeads(leadsResponse.leads || []);
      setStages((stagesResponse.stages?.length ? stagesResponse.stages : DEFAULT_CRM_STAGES));
      setStats(statsResponse.stats || null);
      setActivity(activityResponse.events || statsResponse.stats?.activity || []);
      setEmailTemplates(templatesResponse.templates || []);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить CRM");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCrm(); }, []);

  useEffect(() => {
    const leadIdFromUrl = new URLSearchParams(window.location.search).get("lead");
    if (!leadIdFromUrl || selectedLeadId || leads.length === 0) return;
    if (leads.some((lead) => lead.id === leadIdFromUrl)) setSelectedLeadId(leadIdFromUrl);
  }, [leads, selectedLeadId]);

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
      return;
    }
    const response = await fetchLeadEmails(lead.id);
    setLeadEmails(response.emails || []);
  }

  useEffect(() => {
    if (!selectedLead) {
      setLeadEmails([]);
      return;
    }
    setEmailAttachments([]);
    setEmailComposer((current) => ({ ...current, to: selectedLead.email || '', subject: '', text: '', html: '', attachmentIds: [] }));
    refreshLeadEmails(selectedLead).catch((requestError) => setError(requestError.message || 'Не удалось загрузить историю email'));
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
        <StatCard label="AI прогноз выручки" value={loading ? "…" : formatCurrency(stats?.aiMetrics?.predictedRevenue || 0)} hint={`forecast ${stats?.aiMetrics?.conversionForecast || 0}%`} tone="violet" />
        <StatCard label="At-risk сделки" value={loading ? "…" : String(stats?.aiMetrics?.atRiskDeals || 0)} hint={`${stats?.aiMetrics?.followUpsPending || 0} follow-up ждут`} />
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
                      <div className="lead-topline"><strong>{lead.name}</strong><span>{formatCurrency(lead.value)}</span></div>{getLeadAiScore(lead) && <div className="lead-ai-probability"><span>{getLeadAiScore(lead).dealProbability}% вероятность сделки</span><i style={{ width: `${getLeadAiScore(lead).dealProbability}%` }} /></div>}{getAiBadges(lead).length > 0 && <div className="ai-badge-row">{getAiBadges(lead).map((badge) => <b className="ai-neon-badge" key={badge}>{badge}</b>)}</div>}
                      <p>{lead.company || (isTelegramLead(lead) ? lead.telegram || "Telegram контакт" : "Компания не указана")}</p>
                      <div className="lead-card-meta"><small><i />{stageMap[lead.status] || lead.status}</small><span className={`source-pill ${lead.source === "telegram" ? "telegram-source" : ""}`}>{formatLeadSource(lead.source)}</span></div>{getAiRecommendation(lead) && <div className="ai-card-recommendation"><span>AI</span>{getAiSummaryText(getAiRecommendation(lead))}</div>}{isTelegramLead(lead) && <div className="telegram-card-status"><span className={`telegram-presence-dot ${lead.telegramOnline ? 'online' : 'offline'}`} />{lead.telegramOnline ? 'online' : 'offline'} · {lead.lastMessageAt ? formatDate(lead.lastMessageAt) : 'нет сообщений'}</div>}
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
          onEmailComposerChange={setEmailComposer}
          onGenerateEmail={handleGenerateEmail}
          onUploadEmailAttachment={handleUploadEmailAttachment}
          onSendEmail={handleSendEmail}
          onClose={() => { setSelectedLeadId(null); setIsEditingDetail(false); }}
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
  return (
    <div className="modal-backdrop crm-modal-backdrop activity-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ai-task-modal crm-activity-drawer" role="dialog" aria-modal="true" aria-labelledby="crm-activity-title">
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
  return (
    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="ai-task-modal crm-lead-modal" role="dialog" aria-modal="true" aria-labelledby="crm-lead-modal-title">
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

function LeadDetailModal({ lead, stages, stageMap, activity, noteDraft, onNoteDraftChange, onAddNote, onFollowUp, onAiAction, onAnalyzeLeadAi, aiActionBusy = {}, followUpLoading, onDelete, onEdit, onMove, telegramMessages = [], telegramDraft = '', telegramSending = false, onTelegramDraftChange, onSendTelegramReply, emailTemplates = [], leadEmails = [], emailComposer, emailAttachments = [], emailBusy = false, onEmailComposerChange, onGenerateEmail, onUploadEmailAttachment, onSendEmail, onClose }) {
  return (
    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ai-task-modal lead-detail-modal" role="dialog" aria-modal="true" aria-labelledby="lead-detail-title">
        <div className="modal-glow" />
        <div className="panel-head lead-detail-head">
          <div>
            <span className="eyebrow">Карточка лида</span>
            <h3 id="lead-detail-title">{lead.name}</h3>
            <p className="modal-copy">{lead.company || "Компания не указана"} · {formatCurrency(lead.value)}</p>
            <span className={`source-pill detail-source-pill ${lead.source === "telegram" ? "telegram-source" : ""}`}>{formatLeadSource(lead.source)}</span>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="lead-detail-grid">
          <section className="lead-detail-main">
            <div className="detail-kpi-row">
              <div><span>Сумма сделки</span><strong>{formatCurrency(lead.value)}</strong></div>
              <label className="crm-field"><span>Текущий этап</span><select value={lead.status} onChange={(event) => onMove(event.target.value)}>{stages.map((stage) => <option key={stage.status} value={stage.status}>{stage.title}</option>)}</select></label>
            </div>

            {getLeadAiScore(lead) ? (
              <div className="detail-section ai-deal-probability-panel">
                <div className="ai-probability-head">
                  <div>
                    <span className="eyebrow">AI Deal Probability</span>
                    <h4>{getLeadAiScore(lead).dealProbability}% вероятность сделки</h4>
                    <p>{getLeadAiScore(lead).aiSummary}</p>
                  </div>
                  <span className={`urgency-badge ${getLeadAiScore(lead).urgencyLevel}`}>{urgencyLabel(getLeadAiScore(lead).urgencyLevel)}</span>
                </div>
                <div className="probability-bar"><i style={{ width: `${getLeadAiScore(lead).dealProbability}%` }} /></div>
                <div className="ai-badge-row detail-ai-badges">{getAiBadges(lead).map((badge) => <b className="ai-neon-badge" key={badge}>{badge}</b>)}</div>
                <div className="ai-recommendation-grid">
                  <div><span>AI score</span><strong>{getLeadAiScore(lead).score}/100 · {tempLabel(getLeadAiScore(lead).temperature)}</strong></div>
                  <div><span>Риск</span><strong>{riskLabel(getLeadAiScore(lead).riskLevel)}</strong></div>
                  <div><span>Прогноз конверсии</span><strong>{getLeadAiScore(lead).dealProbability >= 70 ? 'Высокий шанс оплаты' : getLeadAiScore(lead).dealProbability >= 40 ? 'Нужно усилить доверие' : 'Низкая готовность к покупке'}</strong></div>
                  <div><span>Идеальное время</span><strong>{getLeadAiScore(lead).idealContactTiming || 'сегодня'}</strong></div>
                </div>
              </div>
            ) : (
              <div className="detail-section ai-deal-probability-panel empty-ai-score">
                <h4>AI Deal Probability</h4>
                <p>Score ещё не рассчитан. Запустите анализ, чтобы увидеть вероятность сделки, риск и срочность.</p>
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
              {getLeadAiScore(lead) && <div className="ai-advisor-strip"><p><b>Рекомендуемый CTA:</b> {getLeadAiScore(lead).recommendedCta || "Назначить следующий шаг"}</p><p><b>Возражения:</b> {(getLeadAiScore(lead).objectionsDetected || []).join(", ") || "не обнаружены"}</p></div>}
            </div>

            <div className="detail-section ai-action-center-card">
              <h4>AI центр действий</h4>
              <div className="ai-action-buttons">
                <button className="ghost-button" type="button" onClick={onAnalyzeLeadAi} disabled={aiActionBusy[`${lead.id}:lead_ai_score`]}>{aiActionBusy[`${lead.id}:lead_ai_score`] ? "AI считает…" : "AI score + прогноз"}</button>
                {[
                  ['analyze_lead', 'Анализ лида'],
                  ['generate_follow_up', 'Сгенерировать follow-up'],
                  ['generate_commercial_offer', 'Сгенерировать КП'],
                  ['generate_telegram_response', 'Ответ в Telegram'],
                  ['generate_email_response', 'Ответ на email'],
                ].map(([taskType, title]) => (
                  <button className="ghost-button" type="button" key={taskType} onClick={() => onAiAction(taskType)} disabled={aiActionBusy[`${lead.id}:${taskType}`]}>
                    {aiActionBusy[`${lead.id}:${taskType}`] ? 'AI работает…' : title}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>Контактные данные</h4>
              <dl className="lead-data-list">
                <div><dt>Контакт</dt><dd>{lead.name}</dd></div>
                <div><dt>Компания</dt><dd>{lead.company || "—"}</dd></div>
                <div><dt>Источник</dt><dd>{formatLeadSource(lead.source)}</dd></div>
                <div><dt>Telegram</dt><dd>{lead.telegram || "—"} {isTelegramLead(lead) && <span className={`telegram-presence ${lead.telegramOnline ? 'online' : 'offline'}`}>{lead.telegramOnline ? 'online' : 'offline'}</span>}</dd></div>
                <div><dt>Email</dt><dd>{lead.email || "—"}</dd></div>
                <div><dt>Этап</dt><dd>{stageMap[lead.status] || lead.status}</dd></div>
                <div><dt>Создано</dt><dd>{formatDate(lead.createdAt)}</dd></div>
                <div><dt>Обновлено</dt><dd>{formatDate(lead.updatedAt)}</dd></div>
              </dl>
            </div>

            {isTelegramLead(lead) && (
              <div className="detail-section telegram-chat-section">
                <div className="telegram-chat-head">
                  <div>
                    <h4>Telegram переписка</h4>
                    <p>Последние сообщения обновляются автоматически каждые 7 секунд.</p>
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
                  <button className="btn primary compact" disabled={telegramSending || !telegramDraft.trim()} type="submit">{telegramSending ? 'Отправляем…' : 'Ответить в Telegram'}</button>
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
                {(lead.followUps || []).length === 0 && (lead.aiFollowUpSequences || []).length === 0 && <p>AI‑дожим ещё не генерировался.</p>}
                {(lead.aiFollowUpSequences || []).map((item) => <p className="ai-sequence-draft" key={item.id}><b>{item.followupType === "email" ? "Email" : item.followupType === "telegram" ? "Telegram" : "Задача"}:</b> {item.generatedMessage}<small>{item.status === "draft" ? "черновик" : item.status} · {formatDate(item.scheduledFor || item.recommendedAt)}</small></p>)}
                {(lead.followUps || []).map((item) => <p key={item.id}><b>AI:</b> {item.message}<small>{formatDate(item.createdAt)}</small></p>)}
              </div>
            </div>

            <div className="detail-section">
              <h4>История активности</h4>
              <div className="activity-preview crm-activity-feed detail-activity-feed">
                {activity.length === 0 && (lead.aiActions || []).length === 0 && <p><span />Событий для лида пока нет</p>}
                {getLeadAiScore(lead) && <p className="ai-timeline-item"><span />AI score обновлён<small>{getLeadAiScore(lead).score}/100 · вероятность {getLeadAiScore(lead).dealProbability}%<br />{formatDate(getLeadAiScore(lead).generatedAt)}</small></p>}
                {(lead.aiFollowUpSequences || []).map((item) => <p className="ai-timeline-item" key={`seq-${item.id}`}><span />AI follow-up предложен<small>{item.generatedMessage}<br />{formatDate(item.recommendedAt)}</small></p>)}
                {(lead.aiActions || []).map((action) => <p className="ai-timeline-item" key={action.id}><span />AI: {action.task_type}<small>{action.status === "queued" ? "в очереди" : action.status === "running" ? "в работе" : action.status === "completed" ? "готово" : "ошибка"}<br />{formatDate(action.created_at)}</small></p>)}
                {activity.map((event) => <p key={event.id}><span />{getActivityTitle(event)}<small>{formatCrmText(event.body)}<br />{formatDate(event.createdAt)}</small></p>)}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
