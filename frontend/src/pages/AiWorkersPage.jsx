import React, { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { approveAiApprovalQueueItem, downloadCrmMeetingIcs, executeAiApprovalQueueItem, fetchAiApprovalQueue, fetchAiCommandCenter, rejectAiApprovalQueueItem, runAiWorker, seedDemoSalesPipeline, updateAiApprovalQueueItem, updateAiWorker } from "../services/api";

const typeLabels = {
  ai_sdr_agent: "AI SDR Agent",
  ai_followup_worker: "AI Follow-up Worker",
  ai_revenue_analyst: "AI Revenue Analyst",
  ai_crm_assistant: "AI CRM Assistant",
  ai_email_assistant: "AI Email Assistant",
  ai_telegram_assistant: "AI Telegram Assistant",
  ai_meeting_scheduler: "AI Meeting Scheduler",
};

const statusLabels = {
  active: "Активен",
  paused: "Пауза",
  error: "Ошибка",
};

const modeLabels = {
  suggestion_only: "Только предложения",
  approval_required: "Нужно одобрение",
  autonomous_ready: "Готов к автономности",
};

const runStatusLabels = {
  queued: "В очереди",
  running: "В работе",
  completed: "Готово",
  failed: "Ошибка выполнения",
};

const approvalStatusLabels = {
  pending_approval: "Ждёт одобрения",
  approved: "Одобрено",
  rejected: "Отклонено",
  executing: "Выполняется",
  completed: "Выполнено",
  executed: "Исполнено",
  failed: "Ошибка выполнения",
  cancelled: "Отменено",
};

const actionTypeLabels = {
  telegram_followup: "Сообщение в Telegram",
  email_followup: "Письмо",
  send_demo_link: "Демо-ссылка",
  send_presentation: "Презентация",
  create_reminder: "Напоминание",
  move_lead_stage: "Смена этапа",
  telegram_draft: "Черновик Telegram",
  telegram_reply_draft: "Ответ Telegram",
  telegram_meeting_confirmation_draft: "Подтверждение встречи Telegram",
  telegram_reply_analysis: "Анализ ответа Telegram",
  email_draft: "Черновик письма",
  follow_up_recommendation: "Следующий контакт",
  crm_next_action: "CRM действие",
  lead_prioritization: "Приоритизация",
  stage_change_recommendation: "AI рекомендация этапа",
  meeting_schedule_proposal: "Встреча / demo-созвон",
};

function formatDate(value) {
  if (!value) return "ещё не запускался";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}


function stageLabel(stage) {
  return ({ new: "New", qualified: "Qualified", proposal: "Proposal", booked: "Booked", won: "Won", lost: "Lost" }[stage] || stage || "—");
}

function isStageRecommendation(item) {
  return (item.executionType || item.actionType) === "stage_change_recommendation" || item.actionType === "move_lead_stage";
}

function renderStageDetails(item) {
  if (!isStageRecommendation(item)) return null;
  const payload = item.payload || {};
  const fromStage = payload.fromStage || payload.currentStatus || item.lead?.status || "new";
  const toStage = payload.toStage || payload.nextStatus || payload.status || "qualified";
  return (
    <div className="approval-stage-details">
      <span>From stage <b>{stageLabel(fromStage)}</b></span>
      <span>To stage <b>{stageLabel(toStage)}</b></span>
      <span>Confidence <b>{payload.confidence || "—"}%</b></span>
      <span>Reason <b>{payload.reason || item.recommendation || "AI обнаружил сигнал для смены этапа."}</b></span>
    </div>
  );
}

function getDraftText(item) {
  return item?.payload?.editedText || item?.payload?.edited_text || item?.payload?.draftText || item?.payload?.text || item?.payload?.message || item?.recommendation || "";
}

function getInboundText(item) {
  return item?.payload?.inboundText || item?.payload?.inboundMessage || item?.payload?.customerMessage || "";
}

function riskLabel(level) {
  return ({ low: "Низкий риск", medium: "Средний риск", high: "Высокий риск" }[level] || level || "");
}

function forecastLabel(category) {
  return ({ committed: "Committed", likely: "Likely", possible: "Possible", at_risk: "At risk", lost_risk: "Lost risk" }[category] || category || "");
}

function getForecastRiskBadge(item) {
  const payload = item?.payload || {};
  const score = payload.lastAiScore || {};
  const risk = payload.riskLevel || score.riskLevel;
  const forecast = payload.forecastCategory || score.forecastCategory;
  if (risk) return `Риск: ${riskLabel(risk)}`;
  if (forecast) return `Forecast: ${forecastLabel(forecast)}`;
  if (score.probabilityToClose || score.dealProbability) return `Вероятность: ${score.probabilityToClose || score.dealProbability}%`;
  return "";
}


function isMeetingScheduleProposal(item) {
  return item?.actionType === "meeting_schedule_proposal" || item?.executionType === "meeting_schedule_proposal";
}

function formatMeetingStart(value) {
  if (!value) return "нужно уточнить у клиента";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function renderMeetingScheduleDetails(item, { onDownloadIcs } = {}) {
  if (!isMeetingScheduleProposal(item)) return null;
  const payload = item.payload || {};
  const meeting = item.meeting || null;
  return (
    <div className="approval-stage-details meeting-schedule-details">
      <span>Лид <b>{item.lead?.name || payload.leadName || "—"}</b></span>
      <span>Входящее <b>{payload.inboundMessage || payload.customerMessage || "—"}</b></span>
      <span>Дата/время <b>{payload.detectedDateText || "—"} {payload.detectedTimeText || "—"}</b></span>
      <span>Старт <b>{formatMeetingStart(meeting?.startsAt || payload.proposedStartTime)}</b></span>
      <span>Название <b>{meeting?.title || payload.proposedTitle || "Demo-созвон"}</b></span>
      <span>Длительность <b>{meeting?.durationMinutes || payload.durationMinutes || 30} мин</b></span>
      <span>Confidence <b>{payload.confidence || "—"}%</b></span>
      <span>Канал <b>{payload.channel || "—"}</b></span>
      {meeting && <span>CRM meeting <b>created</b></span>}
      {meeting?.calendarStatus === "synced" && <span className="google-synced-badge">Google synced</span>}
      {meeting?.calendarStatus === "ics_ready" && <span className="ics-ready-badge">ICS ready</span>}
      {meeting?.googleMeetUrl && <a className="ghost-button compact" href={meeting.googleMeetUrl} target="_blank" rel="noreferrer">Google Meet</a>}
      {meeting?.hasIcs && <button type="button" className="ghost-button compact" onClick={() => onDownloadIcs?.(meeting)}>Скачать .ics</button>}
    </div>
  );
}

function isTelegramMeetingConfirmationDraft(item) {
  return item?.actionType === "telegram_meeting_confirmation_draft" || item?.executionType === "telegram_meeting_confirmation_draft";
}

function isTelegramReplyDraft(item) {
  return item?.actionType === "telegram_reply_draft" || item?.executionType === "telegram_reply_draft" || isTelegramMeetingConfirmationDraft(item);
}

function renderTelegramReplyDraft(item, { isEditing = false, editText = "", onEditTextChange, onSaveEdit, onCancelEdit, editBusy = false } = {}) {
  if (!isTelegramReplyDraft(item)) return null;
  const inbound = getInboundText(item) || "—";
  const draft = getDraftText(item) || "—";
  const wasEdited = Boolean(item.payload?.editedByManager || item.payload?.editedText || item.payload?.edited_text);
  const forecastRiskBadge = getForecastRiskBadge(item);
  return (
    <div className="telegram-reply-draft-card">
      <div className="telegram-reply-card-head">
        <span className="telegram-badge">Telegram</span>
        <span className="telegram-meta-pill">Этап: {stageLabel(item.payload?.leadStage || item.payload?.currentStage || item.lead?.status)}</span>
        {forecastRiskBadge && <span className="telegram-meta-pill risk">{forecastRiskBadge}</span>}
        {wasEdited && <span className="telegram-meta-pill edited">Изменено менеджером</span>}
      </div>
      <div>
        <span>{isTelegramMeetingConfirmationDraft(item) ? "Лид" : "Последнее входящее сообщение"}</span>
        <p>{isTelegramMeetingConfirmationDraft(item) ? (item.lead?.name || item.payload?.leadName || "—") : inbound}</p>
      </div>
      {isTelegramMeetingConfirmationDraft(item) && (
        <div>
          <span>Запланированное время</span>
          <p>{formatMeetingStart(item.payload?.scheduledTime || item.payload?.proposedStartTime)}</p>
        </div>
      )}
      <div className="telegram-draft-body">
        <span>{isTelegramMeetingConfirmationDraft(item) ? "Текст подтверждения" : "AI drafted reply text"}</span>
        {!isEditing ? (
          <p>{draft}</p>
        ) : (
          <div className="telegram-draft-editor">
            <textarea value={editText} onChange={(event) => onEditTextChange(event.target.value)} autoFocus />
            <div className="telegram-draft-editor-actions">
              <button type="button" className="btn primary compact" onClick={onSaveEdit} disabled={editBusy || !editText.trim()}>{editBusy ? "Сохраняем…" : "Сохранить черновик"}</button>
              <button type="button" className="ghost-button compact" onClick={onCancelEdit} disabled={editBusy}>Отмена</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shortRecommendation(item) {
  const text = item.recommendation || item.title || "AI рекомендация ожидает решения";
  return text.length > 130 ? `${text.slice(0, 130)}…` : text;
}

const approvalActionMessages = {
  approve: "Действие одобрено",
  reject: "Действие отклонено",
  execute: "Действие выполнено",
  send: "Сообщение отправлено",
  edit: "Черновик сохранён",
};

const approvalActionLoadingLabels = {
  approve: "Одобряем…",
  reject: "Отклоняем…",
  execute: "Выполняем…",
  send: "Отправляем…",
  edit: "Сохраняем…",
};

const APPROVAL_ACTION_TIMEOUT_MS = 15000;
const executableApprovalTypes = new Set(["telegram_reply_draft", "telegram_meeting_confirmation_draft", "telegram_followup", "email_followup", "send_demo_link", "send_presentation", "create_reminder", "move_lead_stage", "stage_change_recommendation", "meeting_schedule_proposal"]);

function isApprovalItemExecutable(item) {
  return executableApprovalTypes.has(item.executionType || item.actionType);
}

function formatApprovalErrorMessage(message) {
  const text = String(message || "").trim();
  if (text === "Lead has no Telegram chat id" || text === "У лида нет Telegram chat id" || text === "Telegram не подключён для этого лида.") {
    return "Telegram не подключён для этого лида.";
  }
  return text || "Не удалось выполнить AI действие";
}

function withApprovalActionTimeout(promise) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error("Запрос выполняется дольше 15 секунд. Спиннер остановлен — попробуйте ещё раз или обновите очередь."));
    }, APPROVAL_ACTION_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

function mergeQueueItem(items, nextItem) {
  if (!nextItem?.id) return items;
  return items.map((item) => (item.id === nextItem.id ? { ...item, ...nextItem } : item));
}

function getOptimisticApprovalItem(item, action, response) {
  if (response?.item?.id) return response.item;

  const statusByAction = {
    approve: "approved",
    reject: "rejected",
    execute: "completed",
    send: "completed",
  };
  const nextStatus = statusByAction[action];
  if (!nextStatus) return null;

  return {
    ...item,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}

function getApprovalActionErrorMessage(error) {
  if (error?.code === "REQUEST_TIMEOUT") {
    return "Запрос выполняется дольше 15 секунд. Спиннер остановлен — попробуйте ещё раз или обновите очередь.";
  }
  return formatApprovalErrorMessage(error?.message || "Не удалось обновить AI действие. Попробуйте ещё раз.");
}

function logApprovalAction(event, details) {
  console.log(`[ai-workers-ui] action ${event}`, details);
}

export default function AiWorkersPage() {
  const [commandCenter, setCommandCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyWorker, setBusyWorker] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [approvalQueue, setApprovalQueue] = useState({ items: [], metrics: {} });
  const [busyAction, setBusyAction] = useState(null);
  const actionInFlightRef = useRef(false);
  const [editingDraft, setEditingDraft] = useState({ itemId: "", text: "" });

  async function loadCommandCenter({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const [response, approvalResponse] = await Promise.all([fetchAiCommandCenter(), fetchAiApprovalQueue()]);
      setCommandCenter(response.commandCenter || null);
      setApprovalQueue({ items: approvalResponse.items || [], metrics: approvalResponse.metrics || {} });
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Command Center");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadCommandCenter();
  }, []);


  async function handleSeedDemoPipeline() {
    setDemoBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await seedDemoSalesPipeline();
      setMessage(response.alreadyExists ? "Демо-воронка уже создана." : `Демо-воронка создана: добавлено ${response.created || 0} лидов с историей и AI scoring.`);
      await loadCommandCenter({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать демо-воронку");
    } finally {
      setDemoBusy(false);
    }
  }

  async function handleRun(worker) {
    setBusyWorker(worker.id);
    setError("");
    setMessage("");
    try {
      const response = await runAiWorker(worker.id);
      setMessage(`${worker.name}: создано ${response.queueItems?.length || 0} рекомендаций на одобрение.`);
      await loadCommandCenter({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось запустить AI сотрудника");
    } finally {
      setBusyWorker("");
    }
  }


  async function handleDownloadIcs(meeting) {
    setError("");
    setMessage("");
    try {
      await downloadCrmMeetingIcs(meeting.id);
      setMessage("ICS файл встречи скачан.");
    } catch (requestError) {
      setError(requestError.message || "Не удалось скачать ICS");
    }
  }

  function updateApprovalItemLocally(updatedItem) {
    if (!updatedItem?.id) return;
    setApprovalQueue((current) => ({
      ...current,
      items: mergeQueueItem(current.items || [], updatedItem),
    }));
    setCommandCenter((current) => current ? {
      ...current,
      queue: mergeQueueItem(current.queue || [], updatedItem),
    } : current);
  }

  async function refreshApprovalStateAfterAction() {
    try {
      await loadCommandCenter({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось обновить очередь AI действий");
    }
  }

  async function runApprovalAction(item, action, requestFactory, onSuccess) {
    if (actionInFlightRef.current) {
      logApprovalAction("failed", { itemId: item.id, action, reason: "action already in progress" });
      return;
    }

    actionInFlightRef.current = true;
    setBusyAction({ itemId: item.id, action });
    setError("");
    setMessage("");
    logApprovalAction("start", { itemId: item.id, action, status: item.status });

    try {
      const response = await withApprovalActionTimeout(requestFactory());
      const updatedItem = getOptimisticApprovalItem(item, action, response);
      updateApprovalItemLocally(updatedItem);

      if (updatedItem?.status === "failed" || response?.error) {
        const errorMessage = formatApprovalErrorMessage(updatedItem?.errorMessage || response?.error);
        setError(errorMessage);
        logApprovalAction("failed", { itemId: item.id, action, error: errorMessage, status: updatedItem?.status });
        return;
      }

      onSuccess?.(response, updatedItem);
      logApprovalAction("success", { itemId: item.id, action, status: updatedItem?.status });
    } catch (requestError) {
      const errorMessage = getApprovalActionErrorMessage(requestError);
      setError(errorMessage);
      logApprovalAction("failed", { itemId: item.id, action, error: errorMessage });
    } finally {
      actionInFlightRef.current = false;
      setBusyAction(null);
      await refreshApprovalStateAfterAction();
    }
  }

  async function handleApprovalAction(item, action) {
    const requestOptions = { timeoutMs: APPROVAL_ACTION_TIMEOUT_MS };

    const actionRequests = {
      approve: () => approveAiApprovalQueueItem(item.id, requestOptions),
      reject: () => rejectAiApprovalQueueItem(item.id, requestOptions),
      execute: () => executeAiApprovalQueueItem(item.id, requestOptions),
      send: () => executeAiApprovalQueueItem(item.id, requestOptions),
    };

    const requestFactory = actionRequests[action];
    if (!requestFactory) return;

    await runApprovalAction(item, action, requestFactory, (_response, updatedItem) => {
      if (updatedItem?.status === "approved") {
        setMessage("Одобрено");
        return;
      }
      if (updatedItem?.status === "rejected") {
        setMessage("Отклонено");
        return;
      }
      if (["completed", "executed"].includes(updatedItem?.status)) {
        setMessage(action === "send" ? "Отправлено" : "Выполнено");
        return;
      }
      setMessage(approvalActionMessages[action] || "Статус AI действия обновлён");
    });
  }

  function handleEditApprovalItem(item) {
    if (actionInFlightRef.current) {
      logApprovalAction("failed", { itemId: item.id, action: "edit", reason: "action already in progress" });
      return;
    }

    const isTelegramReplyDraftItem = isTelegramReplyDraft(item);
    if (isTelegramReplyDraftItem) {
      setEditingDraft({ itemId: item.id, text: getDraftText(item) });
      return;
    }
    if (isMeetingScheduleProposal(item)) {
      const currentTime = item.payload?.proposedStartTime || "";
      const nextTime = window.prompt("Изменить время встречи (ISO или YYYY-MM-DDTHH:mm)", currentTime);
      if (nextTime === null) return;
      saveApprovalItemEdit(item, nextTime);
      return;
    }
    const currentText = item.recommendation || item.title || "";
    const nextText = window.prompt("Изменить рекомендацию AI", currentText);
    if (nextText === null) return;
    saveApprovalItemEdit(item, nextText);
  }

  async function saveApprovalItemEdit(item, nextText) {
    let payload;
    let successMessage = "AI рекомендация изменена.";
    let localPatch = { ...item, updatedAt: new Date().toISOString() };

    if (isTelegramReplyDraft(item)) {
      const normalizedText = String(nextText || "").trim();
      payload = { payload: { ...(item.payload || {}), draftText: item.payload?.draftText || item.payload?.text || item.payload?.message || item.recommendation || "", editedText: normalizedText, edited_text: normalizedText, text: normalizedText, message: normalizedText, editedByManager: true } };
      localPatch = { ...localPatch, payload: payload.payload, recommendation: normalizedText };
      successMessage = "AI draft response изменён.";
    } else if (isMeetingScheduleProposal(item)) {
      const normalizedTime = String(nextText || "").trim();
      payload = { payload: { ...(item.payload || {}), proposedStartTime: normalizedTime || null, managerEditedTime: true } };
      localPatch = { ...localPatch, payload: payload.payload };
      successMessage = "Время встречи изменено.";
    } else {
      payload = { recommendation: nextText };
      localPatch = { ...localPatch, recommendation: nextText };
    }

    await runApprovalAction(
      item,
      "edit",
      () => updateAiApprovalQueueItem(item.id, payload, { timeoutMs: APPROVAL_ACTION_TIMEOUT_MS }),
      (response) => {
        setEditingDraft({ itemId: "", text: "" });
        updateApprovalItemLocally(response?.item?.id ? response.item : localPatch);
        setMessage(successMessage);
      },
    );
  }

  async function handlePause(worker) {
    setBusyWorker(worker.id);
    setError("");
    setMessage("");
    try {
      const nextStatus = worker.status === "paused" ? "active" : "paused";
      await updateAiWorker(worker.id, { status: nextStatus });
      setMessage(nextStatus === "paused" ? `${worker.name} поставлен на паузу.` : `${worker.name} снова активен.`);
      await loadCommandCenter({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось изменить статус AI сотрудника");
    } finally {
      setBusyWorker("");
    }
  }

  const workers = commandCenter?.workers || [];
  const queue = commandCenter?.queue || [];
  const recentRuns = commandCenter?.recentRuns || [];
  const metrics = commandCenter?.metrics || {};
  const approvalItems = approvalQueue.items || [];
  const activeApprovalItems = useMemo(() => approvalItems.filter((item) => !["rejected", "completed", "executed", "cancelled"].includes(item.status)), [approvalItems]);
  const approvalHistoryItems = useMemo(() => approvalItems.filter((item) => ["rejected", "completed", "executed", "cancelled"].includes(item.status)), [approvalItems]);
  const approvalMetrics = approvalQueue.metrics || {};
  const pendingActions = useMemo(() => queue.filter((item) => item.status === "pending_approval"), [queue]);
  const failedActions = useMemo(() => queue.filter((item) => item.status === "failed"), [queue]);

  return (
    <main className="workspace-page ai-workers-page">
      <PageHeading
        eyebrow="AI Command Center"
        title="AI сотрудники и очередь выполнения"
        copy="Контролируйте видимую AI sales workforce: роли, режимы, запуски, очередь рекомендаций и влияние на выручку. Автоотправка сообщений в v1 отключена."
        action={<button className="btn primary compact pulse-action" type="button" onClick={() => loadCommandCenter()} disabled={loading}>Обновить центр</button>}
      />

      {error && <p className="auth-error dashboard-alert">{error}</p>}
      {message && <p className="success-alert dashboard-alert">{message}</p>}


      <Panel className="demo-pipeline-panel">
        <div className="demo-pipeline-copy">
          <span className="eyebrow">Безопасный демо-режим</span>
          <h3>Создать демо-воронку для AI анализа</h3>
          <p>Демо-данные будут добавлены только в текущий workspace.</p>
          <small>Будут созданы 5 реалистичных CRM лидов с заметками, timeline, Telegram, email-событиями и AI scoring. Повторный запуск не дублирует данные.</small>
        </div>
        <button className="btn primary compact demo-pipeline-button" type="button" onClick={handleSeedDemoPipeline} disabled={demoBusy}>
          {demoBusy ? "Создаём демо-воронку…" : "Создать демо-воронку"}
        </button>
      </Panel>

      <section className="dashboard-stats ai-workers-stats">
        <StatCard label="Активные AI сотрудники" value={loading ? "…" : `${metrics.activeWorkers || 0}/${metrics.totalWorkers || 0}`} hint="Видимые роли AI workforce" />
        <StatCard label="Очередь AI задач" value={loading ? "…" : String(metrics.queueActive || 0)} hint="Рекомендации в работе и ожидании" tone="violet" />
        <StatCard label="Действия на одобрение" value={loading ? "…" : String(metrics.pendingActions || 0)} hint="Ничего не отправляется без человека" tone="pink" />
        <StatCard label="AI эффективность" value={loading ? "…" : `${metrics.efficiency || 0}%`} hint="Доля успешных запусков AI работников" />
        <StatCard label="Meetings scheduled by AI" value={loading ? "…" : String(approvalMetrics.meetingsScheduledByAi || 0)} hint="После approval менеджера" tone="violet" />
        <StatCard label="Pending meeting proposals" value={loading ? "…" : String(approvalMetrics.pendingMeetingProposals || 0)} hint="AI предложения demo-созвона ждут решения" tone="pink" />
        <StatCard label="Выручка под контролем AI" value={loading ? "…" : formatMoney(metrics.revenueUnderAi)} hint="Плейсхолдер revenue impact по открытой воронке" tone="violet" />
      </section>

      <Panel className="ai-approval-center-panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Контроль человеком</span>
            <h3>Центр одобрения AI</h3>
            <p>AI только рекомендует. Отправка и выполнение доступны после ручного одобрения менеджером.</p>
          </div>
          <span className="live-pill"><i />{approvalMetrics.waitingApproval || 0} ждут</span>
        </div>
        <div className="approval-metric-strip">
          <span>Одобрено сегодня <b>{approvalMetrics.approvedToday || 0}</b></span>
          <span>Выполнено сегодня <b>{approvalMetrics.executedToday || 0}</b></span>
          <span>Ошибок сегодня <b>{approvalMetrics.failedToday || 0}</b></span>
          <span>Успешность <b>{approvalMetrics.successRate || 0}%</b></span>
          <span>Meeting proposals <b>{approvalMetrics.pendingMeetingProposals || 0}</b></span>
        </div>
        <div className="approval-table">
          {activeApprovalItems.length === 0 && <p className="empty-state">Нет AI действий на одобрение.</p>}
          {activeApprovalItems.slice(0, 12).map((item) => {
            const isItemBusy = busyAction?.itemId === item.id;
            const busyLabel = isItemBusy ? approvalActionLoadingLabels[busyAction.action] : "";
            const isEditingThisDraft = editingDraft.itemId === item.id;
            const isApproveBusy = isItemBusy && busyAction.action === "approve";
            const isEditBusy = isItemBusy && busyAction.action === "edit";
            const isRejectBusy = isItemBusy && busyAction.action === "reject";
            const isExecuteBusy = isItemBusy && ["execute", "send"].includes(busyAction.action);
            const isMeetingProposal = isMeetingScheduleProposal(item);
            const canEditItem = !isMeetingProposal || item.status === "pending_approval" || item.status === "failed";
            const canRejectItem = !isMeetingProposal || item.status === "pending_approval" || item.status === "failed";
            return (
            <article className={`approval-row approval-${item.status}`} key={item.id}>
              <div className="approval-main">
                <strong>{item.title}</strong>
                <p>{shortRecommendation(item)}</p>
                {renderStageDetails(item)}
                {renderMeetingScheduleDetails(item, { onDownloadIcs: handleDownloadIcs })}
                {renderTelegramReplyDraft(item, {
                  isEditing: isEditingThisDraft,
                  editText: isEditingThisDraft ? editingDraft.text : getDraftText(item),
                  onEditTextChange: (text) => setEditingDraft({ itemId: item.id, text }),
                  onSaveEdit: () => saveApprovalItemEdit(item, editingDraft.text),
                  onCancelEdit: () => setEditingDraft({ itemId: "", text: "" }),
                  editBusy: isItemBusy,
                })}
                {item.errorMessage && <small className="email-error-text">Ошибка выполнения: {formatApprovalErrorMessage(item.errorMessage)}</small>}
              </div>
              <div><span>Лид</span><b>{item.lead?.name || "—"}</b></div>
              <div><span>AI сотрудник</span><b>{item.workerName || "AI"}</b></div>
              <div><span>Канал</span><b>{item.payload?.channel || item.payload?.suggestedChannel || (item.lead?.telegram ? "telegram" : item.lead?.email ? "email" : "crm")}</b></div>
              <div><span>Тип</span><b>{actionTypeLabels[item.executionType] || actionTypeLabels[item.actionType] || item.actionType}</b></div>
              <div><span>Статус</span><b className={`glow-status ${item.status}`}>{approvalStatusLabels[item.status] || item.status}</b><small>{formatDate(item.createdAt)}</small></div>
              <div className="approval-actions">
                {["pending_approval", "failed"].includes(item.status) && (
                  <button type="button" className="ghost-button compact" onClick={() => handleApprovalAction(item, "approve")} disabled={isItemBusy}>{isApproveBusy ? busyLabel : "Одобрить"}</button>
                )}
                {canEditItem && (
                  <button type="button" className="ghost-button compact" onClick={() => handleEditApprovalItem(item)} disabled={isItemBusy || ["executing","completed"].includes(item.status)}>{isEditBusy ? "Сохраняем…" : "Изменить"}</button>
                )}
                {canRejectItem && !["executing", "completed", "rejected"].includes(item.status) && (
                  <button type="button" className="ghost-button compact danger-action" onClick={() => handleApprovalAction(item, "reject")} disabled={isItemBusy}>{isRejectBusy ? busyLabel : "Отклонить"}</button>
                )}
                {(isTelegramReplyDraft(item) || (item.status === "approved" && isApprovalItemExecutable(item))) && (
                  <button type="button" className="btn primary compact" onClick={() => handleApprovalAction(item, isTelegramReplyDraft(item) ? "send" : "execute")} disabled={isItemBusy || item.status !== "approved"}>{isExecuteBusy ? busyLabel : isTelegramReplyDraft(item) ? "Отправить" : "Выполнить"}</button>
                )}
              </div>
            </article>
          )})}
        </div>
        {approvalHistoryItems.length > 0 && (
          <div className="approval-history-section">
            <div className="approval-history-head">
              <h4>История</h4>
              <span>{approvalHistoryItems.length} в истории</span>
            </div>
            <div className="approval-table approval-history-table">
              {approvalHistoryItems.slice(0, 8).map((item) => (
                <article className={`approval-row approval-history-row approval-${item.status}`} key={item.id}>
                  <div className="approval-main">
                    <strong>{item.title}</strong>
                    <p>{shortRecommendation(item)}</p>
                    {renderStageDetails(item)}
                    {renderMeetingScheduleDetails(item, { onDownloadIcs: handleDownloadIcs })}
                    {renderTelegramReplyDraft(item)}
                    {item.errorMessage && <small className="email-error-text">Ошибка выполнения: {formatApprovalErrorMessage(item.errorMessage)}</small>}
                  </div>
                  <div><span>Лид</span><b>{item.lead?.name || "—"}</b></div>
                  <div><span>AI сотрудник</span><b>{item.workerName || "AI"}</b></div>
                  <div><span>Канал</span><b>{item.payload?.channel || item.payload?.suggestedChannel || (item.lead?.telegram ? "telegram" : item.lead?.email ? "email" : "crm")}</b></div>
                  <div><span>Тип</span><b>{actionTypeLabels[item.executionType] || actionTypeLabels[item.actionType] || item.actionType}</b></div>
                  <div><span>Статус</span><b className={`glow-status ${item.status}`}>{approvalStatusLabels[item.status] || item.status}</b><small>{formatDate(item.updatedAt || item.createdAt)}</small></div>
                  <div className="approval-actions"><span className="approval-history-note">{item.status === "failed" ? "Требуется внимание" : "Действие завершено"}</span></div>
                </article>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <section className="worker-card-grid">
        {loading && <Panel className="ai-worker-card"><p className="empty-state">Загружаем AI сотрудников…</p></Panel>}
        {!loading && workers.map((worker) => (
          <Panel className={`ai-worker-card worker-status-${worker.status}`} key={worker.id}>
            <div className="worker-card-top">
              <div className="worker-orb" />
              <span className={`worker-status ${worker.status}`}>{statusLabels[worker.status] || worker.status}</span>
            </div>
            <h3>{worker.name}</h3>
            <p>{worker.description}</p>
            <div className="worker-meta-grid">
              <span>Тип <b>{typeLabels[worker.type] || worker.type}</b></span>
              <span>Режим <b>{modeLabels[worker.mode] || worker.mode}</b></span>
              <span>Последний запуск <b>{formatDate(worker.last_run_at)}</b></span>
            </div>
            <div className="worker-actions">
              <button className="btn primary compact" type="button" onClick={() => handleRun(worker)} disabled={busyWorker === worker.id || worker.status === "paused"}>
                {busyWorker === worker.id ? "Выполняется…" : "Запустить"}
              </button>
              <button className="ghost-button" type="button" onClick={() => handlePause(worker)} disabled={busyWorker === worker.id}>
                {worker.status === "paused" ? "Возобновить" : "Пауза"}
              </button>
              <button className="ghost-button" type="button" onClick={() => setMessage(`${worker.name}: настройки режимов будут расширены в следующем релизе.`)}>Настройки</button>
            </div>
          </Panel>
        ))}
      </section>

      <section className="app-grid two-columns ai-command-panels">
        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Очередь</span>
              <h3>Статус AI задач</h3>
            </div>
            <span className="live-pill"><i />{metrics.queueActive || 0} активных</span>
          </div>
          <div className="ai-queue-list">
            {queue.length === 0 && <p className="empty-state">Очередь пуста. Запустите AI сотрудника, чтобы создать рекомендации.</p>}
            {queue.slice(0, 8).map((item) => (
              <article className="ai-queue-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{shortRecommendation(item)}</p>
                  <small>{formatDate(item.created_at)} · {item.action_type}</small>
                </div>
                <b>{item.status === "pending_approval" ? "Ждёт одобрения" : item.status}</b>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Контроль качества</span>
              <h3>Ожидают и требуют внимания</h3>
            </div>
          </div>
          <div className="approval-lanes">
            <div>
              <span>Pending actions</span>
              <strong>{pendingActions.length}</strong>
              <p>Черновики, follow-up и next best actions ждут решения менеджера.</p>
            </div>
            <div>
              <span>Failed actions</span>
              <strong>{failedActions.length}</strong>
              <p>Ошибки исполнения остаются видимыми для безопасного ручного восстановления.</p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="app-grid two-columns ai-command-panels">
        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Execution monitoring</span>
              <h3>Последние AI запуски</h3>
            </div>
          </div>
          <div className="recent-run-list">
            {recentRuns.length === 0 && <p className="empty-state">Запусков пока нет.</p>}
            {recentRuns.map((run) => (
              <article className={`recent-run ${run.status}`} key={run.id}>
                <div>
                  <strong>{run.output_summary?.summary || "AI запуск"}</strong>
                  <span>{runStatusLabels[run.status] || run.status} · {run.credits_spent} AI‑кредитов · {formatDate(run.created_at)}</span>
                </div>
                <b>{runStatusLabels[run.status] || run.status}</b>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="revenue-impact-panel">
          <span className="eyebrow">Revenue impact</span>
          <h3>Потенциальная выручка под контролем AI</h3>
          <strong>{formatMoney(metrics.revenueUnderAi)}</strong>
          <p>В v1 это безопасный индикатор открытой выручки, по которой AI сотрудники могут создавать рекомендации. После включения autonomous mode здесь появятся атрибуция, SLA и прогноз влияния на win rate.</p>
        </Panel>
      </section>
    </main>
  );
}
