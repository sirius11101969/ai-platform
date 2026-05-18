import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { isInternalAiDebugEnabled, sanitizeCustomerVisibleText, sanitizeVisibleAiText } from "../utils/uiSanitizer";
import { approveAiApprovalQueueItem, downloadCrmMeetingIcs, executeAiApprovalQueueItem, fetchAiApprovalQueue, fetchAiCommandCenter, fetchAiWorkersFocusSummary, fetchCrmLeads, getActiveAiSequences, rejectAiApprovalQueueItem, runAiWorker, seedDemoSalesPipeline, startAiSequence, updateAiApprovalQueueItem, updateAiWorker } from "../services/api";

const typeLabels = {
  ai_sdr_agent: "AI SDR Agent",
  ai_followup_worker: "AI Follow-up Engine",
  ai_revenue_analyst: "AI Revenue Analyst",
  ai_crm_assistant: "AI CRM Assistant",
  ai_email_assistant: "AI Email Assistant",
  ai_telegram_assistant: "AI Telegram Assistant",
  ai_meeting_scheduler: "AI Meeting Scheduler",
  ai_lead_scoring_engine: "AI Lead Scoring Engine",
  ai_next_best_action_engine: "AI Next Best Action Engine",
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
  pending_approval: "Ждёт решения менеджера",
  approved: "Готово к выполнению",
  rejected: "Отклонено",
  executing: "Выполняется",
  completed: "Действие завершено",
  executed: "Действие завершено",
  failed: "Требуется внимание",
  cancelled: "Отменено",
};


const approvalFooterStatusLabels = {
  pending_approval: "Ждёт решения менеджера",
  approved: "Готово к выполнению",
  failed: "Требуется внимание",
  rejected: "Отклонено",
  completed: "Действие завершено",
  executed: "Действие завершено",
  executing: "Выполняется",
  cancelled: "Отменено",
};

function getApprovalFooterStatusLabel(status) {
  return approvalFooterStatusLabels[status] || approvalStatusLabels[status] || status || "—";
}

function isAiSendDebugBadgeEnabled() {
  const env = import.meta?.env || {};
  return env.DEV === true || String(env.VITE_SHOW_AI_SEND_DEBUG_BADGE || "").toLowerCase() === "true";
}

const actionTypeLabels = {
  telegram_followup: "Сообщение в Telegram",
  email_followup: "Письмо",
  email_followup_draft: "Черновик email follow-up",
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
  followup_sequence_draft: "Autonomous follow-up",
  lead_scoring_update: "AI Lead Scoring",
  lead_priority_recommendation: "Lead priority recommendation",
  meeting_prep_recommendation: "Подготовка к demo",
  risk_followup_recommendation: "Риск сделки",
  proposal_followup_recommendation: "Follow-up по предложению",
};

function isValidDateValue(value) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time);
}

function formatDate(value) {
  if (!isValidDateValue(value)) return "ещё не запускался";
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


const DEFAULT_AI_SEQUENCE_TEMPLATE_NAME = "Enterprise Demo Follow-up";

function isSequenceDraft(item) {
  const payload = getActionPayload(item);
  return getActionType(item) === "sales_sequence_followup_draft" || payload.source === "sales_sequence_step_generation" || Boolean(payload.leadSequenceId);
}

function getDueSoonCount(sequences = []) {
  const now = Date.now();
  const soon = now + 24 * 60 * 60 * 1000;
  return safeArray(sequences).filter((sequence) => {
    const time = new Date(sequence?.nextRunAt || 0).getTime();
    return Number.isFinite(time) && time >= now && time <= soon;
  }).length;
}

function getSequenceTemplates(sequenceDashboard = {}) {
  const templates = new Map();
  [...safeArray(sequenceDashboard.activeSequences), ...safeArray(sequenceDashboard.stoppedSequences)].forEach((sequence) => {
    if (sequence?.templateId && sequence?.templateName) templates.set(sequence.templateId, sequence.templateName);
  });
  return [{ id: "", name: DEFAULT_AI_SEQUENCE_TEMPLATE_NAME }, ...Array.from(templates, ([id, name]) => ({ id, name })).filter((item) => item.name !== DEFAULT_AI_SEQUENCE_TEMPLATE_NAME)];
}

function getLeadPriorityValue(lead = {}) {
  const score = Number(lead.aiScore?.score || lead.ai_score?.score || lead.aiScore || 0);
  const priority = String(lead.aiPriority || lead.aiScore?.priority || "").toLowerCase();
  const boost = priority === "urgent" ? 40 : priority === "high" ? 25 : priority === "medium" ? 10 : 0;
  return score + boost + Number(lead.value || 0) / 100000;
}


function stageLabel(stage) {
  return ({ new: "New", qualified: "Qualified", proposal: "Proposal", booked: "Booked", won: "Won", lost: "Lost" }[stage] || stage || "—");
}

function isStageRecommendation(item) {
  if (!isObjectAction(item)) return false;
  const type = getActionType(item);
  return type === "stage_change_recommendation" || type === "move_lead_stage";
}

function renderStageDetails(item) {
  if (!isStageRecommendation(item)) return null;
  const payload = getActionPayload(item);
  const fromStage = payload.fromStage || payload.currentStatus || item.lead?.status || "new";
  const toStage = payload.toStage || payload.nextStatus || payload.status || "qualified";
  return (
    <div className="approval-stage-details">
      <span>From stage <b>{stageLabel(fromStage)}</b></span>
      <span>To stage <b>{stageLabel(toStage)}</b></span>
      <span>Confidence <b>{payload.confidence || "—"}%</b></span>
      <span>Reason <b>{sanitizeVisibleAiText(payload.reason || item.recommendation || "AI обнаружил сигнал для смены этапа.")}</b></span>
    </div>
  );
}

function getDraftText(item) {
  const payload = getActionPayload(item);
  return payload.editedText || payload.edited_text || payload.customerText || payload.customer_text || payload.suggestedText || payload.draftText || payload.body || payload.text || payload.message || "";
}

function getInternalAiContext(item) {
  const payload = getActionPayload(item);
  const context = payload.internalContext || {};
  const parts = [];
  if (context.ai_score || payload.aiScore) parts.push(`ai_score: ${context.ai_score || payload.aiScore}`);
  if (context.ai_priority || payload.aiPriority) parts.push(`ai_priority: ${context.ai_priority || payload.aiPriority}`);
  if (context.ai_risk_level || payload.riskLevel) parts.push(`ai_risk_level: ${context.ai_risk_level || payload.riskLevel}`);
  if (context.ai_scoring_reason || payload.aiScoringReason) parts.push(`ai_scoring_reason: ${context.ai_scoring_reason || payload.aiScoringReason}`);
  if (context.nextBestAction || payload.nextBestAction) parts.push(`nextBestAction: ${context.nextBestAction || payload.nextBestAction}`);
  return parts.join(" · ");
}

function renderInternalAiContext(item) {
  const text = getInternalAiContext(item);
  if (!text || !isInternalAiDebugEnabled()) return null;
  return (
    <div className="telegram-draft-body internal-ai-context internal-ai-debug-visible">
      <span>Внутренний AI контекст</span>
      <p>{text}</p>
    </div>
  );
}

function getInboundText(item) {
  const payload = getActionPayload(item);
  return payload.inboundText || payload.inboundMessage || payload.customerMessage || "";
}

function getTelegramChatId(item) {
  const payload = getActionPayload(item);
  return item?.lead?.telegramChatId || payload.telegramChatId || payload.telegram_chat_id || payload.chatId || "";
}

function riskLabel(level) {
  return ({ low: "Низкий риск", medium: "Средний риск", high: "Высокий риск" }[level] || level || "");
}

function forecastLabel(category) {
  return ({ committed: "Committed", likely: "Likely", possible: "Possible", at_risk: "At risk", lost_risk: "Lost risk" }[category] || category || "");
}

function getForecastRiskBadge(item) {
  const payload = getActionPayload(item);
  const score = payload.lastAiScore || {};
  const risk = payload.riskLevel || score.riskLevel;
  const forecast = payload.forecastCategory || score.forecastCategory;
  if (risk) return `Риск: ${riskLabel(risk)}`;
  if (forecast) return `Forecast: ${forecastLabel(forecast)}`;
  if (score.probabilityToClose || score.dealProbability) return `Вероятность: ${score.probabilityToClose || score.dealProbability}%`;
  return "";
}


function isMeetingScheduleProposal(item) {
  return getItemType(item) === "meeting_schedule_proposal";
}

function formatMeetingStart(value) {
  if (!isValidDateValue(value)) return "нужно уточнить у клиента";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function renderMeetingScheduleDetails(item, { onDownloadIcs } = {}) {
  if (!isMeetingScheduleProposal(item)) return null;
  const payload = getActionPayload(item);
  const meeting = item.meeting || null;
  return (
    <div className="approval-stage-details meeting-schedule-details">
      <span>Лид <b>{getActionLeadName(item) || "—"}</b></span>
      <span>Входящее <b>{sanitizeCustomerVisibleText(payload.inboundMessage || payload.customerMessage || "—")}</b></span>
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
  return getItemType(item) === "telegram_meeting_confirmation_draft";
}

function isFollowupSequenceDraft(item) {
  return getItemType(item) === "followup_sequence_draft";
}

function isEmailFollowupDraft(item) {
  return getItemType(item) === "email_followup_draft";
}

function isTelegramReplyDraft(item) {
  return getItemType(item) === "telegram_reply_draft" || isTelegramMeetingConfirmationDraft(item) || isFollowupSequenceDraft(item);
}

function renderFollowupSequenceDetails(item) {
  if (!isFollowupSequenceDraft(item)) return null;
  const payload = getActionPayload(item);
  return (
    <div className="approval-stage-details meeting-schedule-details">
      <span>Sequence step <b>{payload.sequenceStep || "—"}</b></span>
      <span>Last touch <b>{payload.inactiveHours ? `${payload.inactiveHours} ч. назад` : "—"}</b></span>
      <span>Last message <b>{sanitizeCustomerVisibleText(payload.lastMessageText || "—")}</b></span>
      <span>Confidence <b>{payload.confidence || "—"}</b></span>
    </div>
  );
}

function renderTelegramReplyDraft(item, { isEditing = false, editText = "", onEditTextChange, onSaveEdit, onCancelEdit, editBusy = false } = {}) {
  if (!isTelegramReplyDraft(item)) return null;
  const inbound = sanitizeCustomerVisibleText(getInboundText(item) || "—");
  const draft = sanitizeCustomerVisibleText(getDraftText(item) || "—");
  const payload = getActionPayload(item);
  const wasEdited = Boolean(payload.editedByManager || payload.editedText || payload.edited_text);
  const forecastRiskBadge = getForecastRiskBadge(item);
  return (
    <div className="telegram-reply-draft-card">
      <div className="telegram-reply-card-head">
        <span className="telegram-badge">{isFollowupSequenceDraft(item) ? (payload.channel || "follow-up") : "Telegram"}</span>
        <span className="telegram-meta-pill">Этап: {stageLabel(payload.leadStage || payload.currentStage || item?.lead?.status)}</span>
        {forecastRiskBadge && <span className="telegram-meta-pill risk">{forecastRiskBadge}</span>}
        {wasEdited && <span className="telegram-meta-pill edited">Изменено менеджером</span>}
      </div>
      <div>
        <span>{isTelegramMeetingConfirmationDraft(item) ? "Лид" : isFollowupSequenceDraft(item) ? "Последнее касание" : "Последнее входящее сообщение"}</span>
        <p>{isTelegramMeetingConfirmationDraft(item) ? (getActionLeadName(item) || "—") : isFollowupSequenceDraft(item) ? sanitizeCustomerVisibleText(payload.lastMessageText || "—") : inbound}</p>
      </div>
      {isTelegramMeetingConfirmationDraft(item) && (
        <div>
          <span>Запланированное время</span>
          <p>{formatMeetingStart(payload.scheduledTime || payload.proposedStartTime)}</p>
        </div>
      )}
      <div className="telegram-draft-body">
        <span>{isTelegramMeetingConfirmationDraft(item) ? "Текст подтверждения" : isFollowupSequenceDraft(item) ? "Customer-facing follow-up text" : "Customer-facing reply text"}</span>
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
      {renderInternalAiContext(item)}
    </div>
  );
}

function renderEmailFollowupDraft(item, { isEditing = false, editText = "", onEditTextChange, onSaveEdit, onCancelEdit, editBusy = false } = {}) {
  if (!isEmailFollowupDraft(item)) return null;
  const payload = getActionPayload(item);
  const body = sanitizeCustomerVisibleText(getDraftText(item) || "—");
  const wasEdited = Boolean(payload.editedByManager || payload.editedText || payload.edited_text);
  return (
    <div className="telegram-reply-draft-card">
      <div className="telegram-reply-card-head">
        <span className="telegram-badge">Email</span>
        <span className="telegram-meta-pill">Кому: {payload.email || payload.to || item.lead?.email || "—"}</span>
        {wasEdited && <span className="telegram-meta-pill edited">Изменено менеджером</span>}
      </div>
      <div>
        <span>Лид</span>
        <p>{getActionLeadName(item) || "—"}</p>
      </div>
      <div>
        <span>Email</span>
        <p>{payload.email || payload.to || item.lead?.email || "—"}</p>
      </div>
      <div>
        <span>Тема письма</span>
        <p>{sanitizeVisibleAiText(payload.subject || getActionTitle(item) || "—")}</p>
      </div>
      <div className="telegram-draft-body">
        <span>Customer-facing email follow-up text</span>
        {!isEditing ? (
          <p>{body}</p>
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
      {renderInternalAiContext(item)}
    </div>
  );
}

function shortRecommendation(item) {
  if (!isObjectAction(item)) return "AI рекомендация ожидает решения";
  const payload = getActionPayload(item);
  const text = sanitizeVisibleAiText(payload.suggestedText || item?.recommendation || getActionTitle(item) || "AI рекомендация ожидает решения");
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
const executableApprovalTypes = new Set(["followup_sequence_draft", "email_followup_draft", "telegram_reply_draft", "telegram_meeting_confirmation_draft", "telegram_followup", "email_followup", "send_demo_link", "send_presentation", "create_reminder", "move_lead_stage", "stage_change_recommendation", "meeting_schedule_proposal"]);

function isApprovalItemExecutable(item) {
  return executableApprovalTypes.has(getItemType(item));
}

function getSafeTime(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sortApprovalItemsByCreatedDesc(items) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  return safeItems.slice().sort((left, right) => getSafeTime(right?.createdAt || right?.created_at) - getSafeTime(left?.createdAt || left?.created_at));
}

function canAutoApproveAndExecuteDraft(item) {
  return isTelegramReplyDraft(item) || isFollowupSequenceDraft(item) || isEmailFollowupDraft(item);
}

function getExecutableButtonState(item, { isItemBusy = false, currentLoadingKey = "" } = {}) {
  const executeLoadingKey = getApprovalActionKey(getActionId(item), "execute");
  const itemStatus = getActionStatus(item);
  const isExecutable = isApprovalItemExecutable(item);
  const canExecuteApproved = itemStatus === "approved";
  const canExecutePendingDraft = itemStatus === "pending_approval" && canAutoApproveAndExecuteDraft(item);
  const isExecutingThisAction = currentLoadingKey === executeLoadingKey;
  const buttonEnabled = Boolean(isExecutable && (canExecuteApproved || canExecutePendingDraft) && !isItemBusy && !isExecutingThisAction);

  return {
    actionType: getApprovalItemType(item),
    buttonEnabled,
    disabled: !buttonEnabled,
    executeLoadingKey,
    isExecutingThisAction,
    loadingKey: currentLoadingKey || "none",
  };
}

function formatApprovalErrorMessage(message) {
  const text = String(message || "").trim();
  if (text === "Lead has no Telegram chat id" || text === "У лида нет Telegram chat id" || text === "Telegram не подключён для этого лида.") {
    return "Telegram не подключён для этого лида.";
  }
  return text || "Не удалось выполнить AI действие";
}

function withApprovalActionTimeout(promise, action) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      const error = new Error(action === "send" ? "Отправка не завершилась. Попробуйте ещё раз." : "Запрос выполняется дольше 15 секунд. Спиннер остановлен — попробуйте ещё раз или обновите очередь.");
      error.code = "REQUEST_TIMEOUT";
      reject(error);
    }, APPROVAL_ACTION_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

function mergeQueueItem(items, nextItem) {
  if (!isObjectAction(nextItem) || !getActionId(nextItem)) return safeArray(items);
  return safeArray(items).map((item) => (getActionId(item) === getActionId(nextItem) ? { ...item, ...nextItem } : item));
}

function getOptimisticApprovalItem(item, action, response) {
  if (response?.item?.id) return response.item;

  const statusByAction = {
    approve: "approved",
    reject: "rejected",
    execute: "completed",
  };
  const nextStatus = statusByAction[action];
  if (!nextStatus) return null;

  return {
    ...item,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}

function getApprovalActionErrorMessage(error, action) {
  if (action === "execute" && (error?.code === "REQUEST_TIMEOUT" || error?.name === "AbortError")) {
    return "Отправка не завершилась. Попробуйте ещё раз.";
  }
  if (error?.code === "REQUEST_TIMEOUT") {
    return "Запрос выполняется дольше 15 секунд. Спиннер остановлен — попробуйте ещё раз или обновите очередь.";
  }
  if (action === "execute") {
    const message = String(error?.message || "");
    if (!error?.status && (!message || /failed to fetch|networkerror|load failed/i.test(message))) {
      return "Backend endpoint недоступен. Отправка не завершилась. Попробуйте ещё раз.";
    }
    return formatApprovalErrorMessage(message || "Backend endpoint недоступен. Отправка не завершилась. Попробуйте ещё раз.");
  }
  return formatApprovalErrorMessage(error?.message || "Не удалось обновить AI действие. Попробуйте ещё раз.");
}

function getApprovalActionKey(actionId, operation) {
  return `${actionId}:${operation}`;
}

function logApprovalAction(event, details) {
  console.log(`[ai-workers-ui] action ${event}`, details);
}

function logTelegramSendViaExecute(item) {
  console.log("[ai-workers-ui] telegram send via execute", { actionId: getActionId(item), actionType: getItemType(item) });
}

function getApprovalItemType(item) {
  return getItemType(item);
}


const FOCUS_QUEUE_LIMIT = 10;
const FOCUS_RECENT_WINDOW_MS = 72 * 60 * 60 * 1000;
const activeActionStatuses = new Set(["pending_approval", "approved"]);
const finishedActionStatuses = new Set(["completed", "executed", "rejected", "cancelled"]);
const customerFacingActionTypes = new Set(["telegram_followup", "email_followup", "email_followup_draft", "telegram_draft", "telegram_reply_draft", "telegram_meeting_confirmation_draft", "email_draft", "followup_sequence_draft", "meeting_schedule_proposal"]);
const followupActionTypes = new Set(["telegram_followup", "email_followup", "email_followup_draft", "telegram_draft", "telegram_reply_draft", "telegram_meeting_confirmation_draft", "email_draft", "followup_sequence_draft"]);
const meetingActionTypes = new Set(["meeting_schedule_proposal", "telegram_meeting_confirmation_draft"]);
const focusTabs = [
  { id: "focus", label: "Focus" },
  { id: "needsApproval", label: "Needs Approval" },
  { id: "failed", label: "Failed" },
  { id: "meetings", label: "Meetings" },
  { id: "followups", label: "Follow-ups" },
  { id: "all", label: "All" },
];

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function isFinishedActionStatus(status) {
  return finishedActionStatuses.has(status);
}

function isObjectAction(action) {
  return Boolean(action && typeof action === "object" && !Array.isArray(action));
}

function getActionId(action) {
  try {
    if (!isObjectAction(action)) return "";
    return action.id || action.actionId || action.action_id || "";
  } catch (_error) {
    return "";
  }
}

function getActionStatus(action) {
  try {
    if (!isObjectAction(action)) return "";
    return action.status || action.state || "";
  } catch (_error) {
    return "";
  }
}

function getActionTitle(action) {
  try {
    if (!isObjectAction(action)) return "AI действие";
    return action.title || action.name || action.recommendation || getActionPayload(action).title || "AI действие";
  } catch (_error) {
    return "AI действие";
  }
}

function getActionPayload(action) {
  try {
    if (!isObjectAction(action)) return {};
    const payload = action.payload;
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  } catch (_error) {
    return {};
  }
}

function getActionLeadName(action) {
  try {
    if (!isObjectAction(action)) return "";
    const payload = getActionPayload(action);
    return action.lead?.name || action.leadName || action.lead_name || payload.leadName || payload.lead_name || "";
  } catch (_error) {
    return "";
  }
}

function getActionType(item) {
  try {
    if (!isObjectAction(item)) return "";
    return item.type || item.executionType || item.actionType || getActionPayload(item).actionType || getActionPayload(item).type || "";
  } catch (_error) {
    return "";
  }
}

function getLeadId(item) {
  try {
    if (!isObjectAction(item)) return "";
    return item.leadId || item.lead_id || getActionPayload(item).leadId || getActionPayload(item).lead_id || "";
  } catch (_error) {
    return "";
  }
}

function getRouteHighlightSections(focusQueueState) {
  const safeState = isObjectAction(focusQueueState) ? focusQueueState : {};
  return [
    { section: "focus", label: "Focus Queue", items: safeArray(safeState.focusActions), collapsedSection: "" },
    { section: "completed", label: "completed history", items: safeArray(safeState.completedHistoryActions), collapsedSection: "completed" },
    { section: "legacy", label: "legacy pending", items: safeArray(safeState.hiddenLegacyActions), collapsedSection: "legacy" },
    { section: "safety", label: "safety history", items: safeArray(safeState.safetyHistoryActions), collapsedSection: "safety" },
    { section: "all", label: "all actions", items: safeArray(safeState.allActions), collapsedSection: "all" },
    { section: "raw", label: "raw queue history", items: safeArray(safeState.rawQueueActions), collapsedSection: "raw" },
  ];
}

function createEmptyHighlightResolution() {
  return { found: false, section: null, action: null };
}

function resolveHighlightedAction(actionId, sections) {
  try {
    const targetId = String(actionId || "").trim();
    if (!targetId || !Array.isArray(sections)) return createEmptyHighlightResolution();

    for (const sectionInfo of sections) {
      if (!isObjectAction(sectionInfo)) continue;
      const candidates = safeArray(sectionInfo.items);
      const action = candidates.find((candidate) => isObjectAction(candidate) && getActionId(candidate) === targetId) || null;
      if (action) {
        return {
          found: true,
          section: ["focus", "completed", "legacy", "safety", "all", "raw"].includes(sectionInfo.section) ? sectionInfo.section : null,
          action,
        };
      }
    }
  } catch (error) {
    console.warn("[ai-workers-focus] highlight skipped safely", { actionId, error });
  }
  return createEmptyHighlightResolution();
}

function getActionDomId(actionId) {
  return `ai-action-${String(actionId || "").replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function safeOpenDetails(ref) {
  const node = ref?.current;
  if (!node || typeof node !== "object") return false;
  if (!("open" in node)) return false;
  node.open = true;
  return true;
}

class AiWorkersErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, href: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const search = typeof window !== "undefined" ? window.location?.search || "" : "";
    const currentActionId = search ? new URLSearchParams(search).get("actionId") || new URLSearchParams(search).get("approvalId") || "" : "";
    const href = typeof window !== "undefined" ? window.location?.href || "" : "";
    this.setState({ error, errorInfo, href });
    console.error("[ai-workers-ui] render failed", {
      message: error?.message || "",
      stack: error?.stack || "",
      componentStack: errorInfo?.componentStack || "",
      href,
      actionId: currentActionId,
      error,
    });
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error || {};
      const stackLines = String(error.stack || "").split("\n").slice(0, 8).join("\n");
      const componentStack = this.state.errorInfo?.componentStack || "";
      const href = this.state.href || (typeof window !== "undefined" ? window.location?.href || "" : "");
      return (
        <main className="workspace-page ai-workers-page">
          <Panel className="ai-workers-fallback-panel">
            <h2>AI Workers временно не отрисовался.</h2>
            <p>Сработала защита от реального render crash. Попробуйте обновить страницу или перейти на <a href="/ai-workers">/ai-workers</a>.</p>
            <pre className="ai-workers-debug-block">
              {`message: ${error.message || ""}\nstack:\n${stackLines}\ncomponentStack:\n${componentStack}\nhref: ${href}`}
            </pre>
          </Panel>
        </main>
      );
    }

    return this.props.children;
  }
}

function getItemCreatedTime(item) {
  return new Date(item?.createdAt || item?.created_at || 0).getTime() || 0;
}

function getItemUpdatedTime(item) {
  return new Date(item?.updatedAt || item?.updated_at || item?.createdAt || 0).getTime() || 0;
}

function getItemType(item) {
  if (!isObjectAction(item)) return "";
  return item.executionType || item.actionType || getActionType(item);
}

function getItemSearchText(item) {
  if (!isObjectAction(item)) return "";
  const payload = getActionPayload(item);
  const chunks = [getActionTitle(item), item?.recommendation, item?.errorMessage, payload.testName, payload.source, payload.scenario];
  return safeArray(chunks).join(" ").toLowerCase();
}

function isRecentAction(item, now = Date.now()) {
  return now - getItemCreatedTime(item) <= FOCUS_RECENT_WINDOW_MS;
}

function isCustomerFacingAction(item) {
  const payload = getActionPayload(item);
  return customerFacingActionTypes.has(getItemType(item)) || ["email", "telegram"].includes(String(payload.channel || payload.suggestedChannel || "").toLowerCase());
}

function isFollowupAction(item) {
  return followupActionTypes.has(getItemType(item));
}

function isMeetingAction(item) {
  return meetingActionTypes.has(getItemType(item));
}

function isSafetyHistoryAction(item) {
  const text = getItemSearchText(item);
  const payload = getActionPayload(item);
  return /unsafe copy guard test|safety[-_ ]?test|copy guard|ai safety|sanitizer test/.test(text) || payload.source === "copy_guard_test" || payload.safetyTest === true;
}

function isGenericLowValueLeadPriority(item) {
  if (getItemType(item) !== "lead_priority_recommendation") return false;
  const payload = getActionPayload(item);
  const priority = String(payload.priority || payload.aiPriority || payload.value || "").toLowerCase();
  const score = Number(payload.score || payload.aiScore || 0);
  return ["", "low", "medium", "normal"].includes(priority) && score < 70;
}

function hasNewerCompletedFallback(item, items) {
  if (getActionStatus(item) !== "failed" || !getLeadId(item)) return false;
  const itemTime = getItemUpdatedTime(item);
  return safeArray(items).some((candidate) => {
    if (getActionId(candidate) === getActionId(item) || getLeadId(candidate) !== getLeadId(item)) return false;
    if (!["completed", "executed"].includes(getActionStatus(candidate))) return false;
    if (!isCustomerFacingAction(candidate)) return false;
    if (getItemUpdatedTime(candidate) <= itemTime) return false;
    const candidatePayload = getActionPayload(candidate);
    const candidateChannel = String(candidatePayload.channel || candidatePayload.suggestedChannel || "").toLowerCase();
    const itemPayload = getActionPayload(item);
    const itemChannel = String(itemPayload.channel || itemPayload.suggestedChannel || "").toLowerCase();
    return candidateChannel === "email" || candidateChannel !== itemChannel;
  });
}

function getFocusPriority(item, items, now = Date.now()) {
  const type = getItemType(item);
  const payload = getActionPayload(item);
  const source = String(payload.source || item?.workerName || payload.engine || "").toLowerCase();
  const status = getActionStatus(item);
  if (activeActionStatuses.has(status) && isCustomerFacingAction(item) && isRecentAction(item, now)) return 1;
  if (source.includes("next_best_action") || type.includes("next_best_action")) return 2;
  if (source.includes("pipeline_copilot") || type.includes("pipeline_copilot")) return 3;
  if (isFollowupAction(item)) return 4;
  if (isMeetingAction(item)) return 5;
  if (status === "failed" && isCustomerFacingAction(item) && !hasNewerCompletedFallback(item, items)) return 6;
  return 99;
}

function shouldHideFromFocus(item, items, now = Date.now()) {
  const type = getItemType(item);
  const status = getActionStatus(item);
  if (finishedActionStatuses.has(status)) return true;
  if (isSafetyHistoryAction(item)) return true;
  if (status === "failed" && hasNewerCompletedFallback(item, items)) return true;
  if (type === "lead_scoring_update" && ["completed", "executed"].includes(status)) return true;
  if (["telegram_draft", "email_draft"].includes(type) && !isRecentAction(item, now)) return true;
  if (isGenericLowValueLeadPriority(item)) return true;
  return false;
}

function buildFocusQueueState(items, now = Date.now()) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const sorted = sortApprovalItemsByCreatedDesc(safeItems);
  const completedHistoryActions = Array.isArray(sorted) ? sorted.filter((item) => isFinishedActionStatus(getActionStatus(item)) && !isSafetyHistoryAction(item)) : [];
  const safetyHistoryActions = Array.isArray(sorted) ? sorted.filter(isSafetyHistoryAction) : [];
  const focusCandidates = sorted
    .filter((item) => !shouldHideFromFocus(item, sorted, now))
    .filter((item) => activeActionStatuses.has(getActionStatus(item)) || (getActionStatus(item) === "failed" && !hasNewerCompletedFallback(item, sorted)))
    .map((item) => ({ item, priority: getFocusPriority(item, sorted, now) }))
    .filter(({ priority }) => priority < 99)
    .sort((left, right) => left.priority - right.priority || getItemCreatedTime(right.item) - getItemCreatedTime(left.item))
    .map(({ item }) => item);
  const focusActions = safeArray(focusCandidates).slice(0, FOCUS_QUEUE_LIMIT);
  const safeCompletedHistoryForMetrics = Array.isArray(completedHistoryActions) ? completedHistoryActions : [];
  const focusIds = new Set(focusActions.map(getActionId).filter(Boolean));
  const completedHistoryIds = new Set(safeCompletedHistoryForMetrics.map(getActionId).filter(Boolean));
  const safetyHistoryIds = new Set(safetyHistoryActions.map(getActionId).filter(Boolean));
  const hiddenLegacyActions = sorted.filter((item) => !focusIds.has(getActionId(item)) && !completedHistoryIds.has(getActionId(item)) && !safetyHistoryIds.has(getActionId(item)));
  const unresolvedFailedActions = sorted.filter((item) => getActionStatus(item) === "failed" && !hasNewerCompletedFallback(item, sorted) && !isSafetyHistoryAction(item));
  const needsApprovalActions = sorted.filter((item) => activeActionStatuses.has(getActionStatus(item)) && !isSafetyHistoryAction(item));
  const meetingsActions = sorted.filter((item) => isMeetingAction(item) && !isSafetyHistoryAction(item) && !finishedActionStatuses.has(getActionStatus(item)));
  const followupActions = sorted.filter((item) => isFollowupAction(item) && !isSafetyHistoryAction(item) && !finishedActionStatuses.has(getActionStatus(item)));

  return {
    focusActions,
    hiddenLegacyActions,
    completedHistoryActions,
    safetyHistoryActions,
    allActions: sorted,
    tabActions: {
      focus: focusActions,
      needsApproval: needsApprovalActions,
      failed: unresolvedFailedActions,
      meetings: meetingsActions,
      followups: followupActions,
      all: sorted,
    },
    metrics: {
      actionableNow: focusActions.length,
      needsApproval: needsApprovalActions.length,
      failedUnresolved: unresolvedFailedActions.length,
      hiddenLegacy: hiddenLegacyActions.length,
      completedHistory: safeCompletedHistoryForMetrics.length,
      safetyHistory: safetyHistoryActions.length,
    },
  };
}

function isValidCompletedHistoryAction(action) {
  if (!action || typeof action !== "object" || Array.isArray(action)) return false;
  if (!action.id) return false;
  if (!action.status) return false;
  if (!action.title) return false;
  if (!action.created_at && !action.createdAt) return false;
  if (Object.keys(getActionPayload(action)).length === 0) return false;
  return true;
}

function logTelegramSendButtonState(item, buttonState) {
  console.log("[ai-workers-ui] send button state", {
    actionId: getActionId(item),
    actionType: buttonState.actionType,
    status: getActionStatus(item),
    buttonEnabled: buttonState.buttonEnabled,
    disabled: buttonState.disabled,
    loadingKey: buttonState.loadingKey,
  });
}

function AiWorkersPageContent() {
  const [commandCenter, setCommandCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyWorker, setBusyWorker] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [approvalQueue, setApprovalQueue] = useState({ items: [], metrics: {} });
  const [focusSummary, setFocusSummary] = useState(null);
  const [aiSequences, setAiSequences] = useState({ activeSequences: [], upcomingSteps: [], stoppedSequences: [], metrics: {} });
  const [crmLeads, setCrmLeads] = useState([]);
  const [sequenceLeadId, setSequenceLeadId] = useState("");
  const [sequenceTemplateId, setSequenceTemplateId] = useState("");
  const [sequenceBusy, setSequenceBusy] = useState(false);
  const [activeApprovalTab, setActiveApprovalTab] = useState("focus");
  const [expandedSections, setExpandedSections] = useState({ legacy: false, completed: false, safety: false, all: false, raw: false });
  const [busyActions, setBusyActions] = useState({});
  const [loadingKey, setLoadingKey] = useState("");
  const actionInFlightRef = useRef(new Set());
  const [editingDraft, setEditingDraft] = useState({ itemId: "", text: "" });
  const location = useLocation();
  const highlightRef = useRef(null);
  const completedDetailsRef = useRef(null);
  const legacyDetailsRef = useRef(null);
  const safetyDetailsRef = useRef(null);
  const allDetailsRef = useRef(null);
  const rawDetailsRef = useRef(null);
  const detailsRefs = useMemo(() => ({
    completed: completedDetailsRef,
    legacy: legacyDetailsRef,
    safety: safetyDetailsRef,
    all: allDetailsRef,
    raw: rawDetailsRef,
  }), []);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const targetActionId = params.get("actionId") || params.get("approvalId") || "";
  const targetLeadId = params.get("leadId") || "";
  const [highlightResolution, setHighlightResolution] = useState(createEmptyHighlightResolution);
  const [highlightResolutionReady, setHighlightResolutionReady] = useState(false);

  async function loadCommandCenter({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const queueParams = targetActionId ? {} : (targetLeadId ? { leadId: targetLeadId } : {});
      const focusParams = { actionId: targetActionId, leadId: targetLeadId };
      const [response, approvalResponse, focusResponse, sequencesResponse, leadsResponse] = await Promise.all([fetchAiCommandCenter(), fetchAiApprovalQueue(queueParams), fetchAiWorkersFocusSummary(focusParams), getActiveAiSequences(), fetchCrmLeads()]);
      setCommandCenter(response.commandCenter || null);
      setApprovalQueue({ items: approvalResponse.items || [], metrics: approvalResponse.metrics || {} });
      setFocusSummary(focusResponse || null);
      setAiSequences(sequencesResponse || { activeSequences: [], upcomingSteps: [], stoppedSequences: [], metrics: {} });
      const nextLeads = safeArray(leadsResponse.leads);
      setCrmLeads(nextLeads);
      setSequenceLeadId((current) => current || [...nextLeads].sort((a, b) => getLeadPriorityValue(b) - getLeadPriorityValue(a))[0]?.id || "");
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить AI Command Center");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadCommandCenter();
  }, [location.search]);

  useEffect(() => {
    if (location.state?.toast) setMessage(location.state.toast);
  }, [location.state]);


  async function handleStartSelectedSequence() {
    if (!sequenceLeadId) {
      setError("Выберите lead для AI sequence.");
      return;
    }
    setSequenceBusy(true);
    setError("");
    setMessage("");
    try {
      await startAiSequence({ leadId: sequenceLeadId, templateId: sequenceTemplateId || undefined });
      setMessage("AI Sequence started. AI will generate drafts for manager approval — never auto-send.");
      await loadCommandCenter({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Sequence cannot start for selected lead.");
    } finally {
      setSequenceBusy(false);
    }
  }

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
      setMessage(worker.type === "ai_lead_scoring_engine"
        ? `${worker.name}: scoring завершён для ${safeArray(response.scoredLeads).filter((item) => !item.error).length || 0} лидов.`
        : `${worker.name}: создано ${response.queueItems?.length || 0} рекомендаций на одобрение.`);
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
    const itemId = getActionId(item);
    const actionKey = getApprovalActionKey(itemId, action);
    if (!itemId || actionInFlightRef.current.has(actionKey)) {
      logApprovalAction("failed", { itemId, action, reason: itemId ? "action already in progress" : "missing action id" });
      return;
    }

    actionInFlightRef.current.add(actionKey);
    setBusyActions((current) => ({ ...current, [actionKey]: { itemId, action } }));
    if (action === "execute") setLoadingKey(actionKey);
    setError("");
    setMessage("");
    logApprovalAction("start", { itemId, action, status: getActionStatus(item) });

    try {
      const response = await withApprovalActionTimeout(requestFactory(), action);
      const updatedItem = getOptimisticApprovalItem(item, action, response);
      updateApprovalItemLocally(updatedItem);

      if (updatedItem?.status === "failed" || response?.error) {
        const errorMessage = formatApprovalErrorMessage(updatedItem?.errorMessage || response?.error);
        setError(errorMessage);
        logApprovalAction("failed", { itemId, action, error: errorMessage, status: getActionStatus(updatedItem) });
        return;
      }

      onSuccess?.(response, updatedItem);
      logApprovalAction("success", { itemId, action, status: getActionStatus(updatedItem) });
    } catch (requestError) {
      const errorMessage = getApprovalActionErrorMessage(requestError, action);
      setError(errorMessage);
      logApprovalAction("failed", { itemId, action, error: errorMessage });
    } finally {
      actionInFlightRef.current.delete(actionKey);
      setBusyActions((current) => {
        const next = { ...current };
        delete next[actionKey];
        return next;
      });
      if (action === "execute") setLoadingKey((current) => (current === actionKey ? "" : current));
      await refreshApprovalStateAfterAction();
    }
  }

  async function handleApprovalAction(item, action) {
    const requestOptions = { timeoutMs: APPROVAL_ACTION_TIMEOUT_MS };
    const itemId = getActionId(item);

    if (action === "execute" && (isTelegramReplyDraft(item) || isEmailFollowupDraft(item))) {
      console.log("[ai-workers-ui] send clicked", { actionId: itemId, actionType: getApprovalItemType(item), status: getActionStatus(item) });
      logTelegramSendViaExecute(item);
    }

    const executeApprovalItem = async () => {
      if ((isTelegramReplyDraft(item) || isEmailFollowupDraft(item)) && getActionStatus(item) === "pending_approval") {
        await approveAiApprovalQueueItem(itemId, requestOptions);
      }
      return executeAiApprovalQueueItem(itemId, requestOptions);
    };

    const actionRequests = {
      approve: () => approveAiApprovalQueueItem(itemId, requestOptions),
      reject: () => rejectAiApprovalQueueItem(itemId, requestOptions),
      execute: executeApprovalItem,
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
        setMessage((isTelegramReplyDraft(item) || isEmailFollowupDraft(item)) ? "Сообщение отправлено" : "Выполнено");
        if (targetActionId && getActionId(item) === targetActionId) setExpandedSections((current) => ({ ...current, completed: true }));
        return;
      }
      setMessage(approvalActionMessages[action] || "Статус AI действия обновлён");
    });
  }

  function handleEditApprovalItem(item) {
    const itemId = getActionId(item);
    const itemHasBusyAction = safeArray(Object.keys(busyActions)).some((key) => key.startsWith(`${itemId}:`));
    if (itemHasBusyAction) {
      logApprovalAction("failed", { itemId, action: "edit", reason: "action already in progress" });
      return;
    }

    const isTelegramReplyDraftItem = isTelegramReplyDraft(item);
    if (isTelegramReplyDraftItem || isFollowupSequenceDraft(item) || isEmailFollowupDraft(item)) {
      setEditingDraft({ itemId, text: getDraftText(item) });
      return;
    }
    if (isMeetingScheduleProposal(item)) {
      const currentTime = getActionPayload(item).proposedStartTime || "";
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

    if (isTelegramReplyDraft(item) || isFollowupSequenceDraft(item) || isEmailFollowupDraft(item)) {
      const normalizedText = String(nextText || "").trim();
      const currentPayload = getActionPayload(item);
      payload = { payload: { ...currentPayload, customerText: normalizedText, draftText: currentPayload.draftText || currentPayload.body || currentPayload.text || currentPayload.message || item.recommendation || "", editedText: normalizedText, edited_text: normalizedText, body: isEmailFollowupDraft(item) ? normalizedText : currentPayload.body, text: normalizedText, message: normalizedText, editedByManager: true } };
      localPatch = { ...localPatch, payload: payload.payload, recommendation: normalizedText };
      successMessage = "AI draft response изменён.";
    } else if (isMeetingScheduleProposal(item)) {
      const normalizedTime = String(nextText || "").trim();
      payload = { payload: { ...getActionPayload(item), proposedStartTime: normalizedTime || null, managerEditedTime: true } };
      localPatch = { ...localPatch, payload: payload.payload };
      successMessage = "Время встречи изменено.";
    } else {
      payload = { recommendation: nextText };
      localPatch = { ...localPatch, recommendation: nextText };
    }

    await runApprovalAction(
      item,
      "edit",
      () => updateAiApprovalQueueItem(getActionId(item), payload, { timeoutMs: APPROVAL_ACTION_TIMEOUT_MS }),
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

  const workers = useMemo(() => safeArray(commandCenter?.workers), [commandCenter?.workers]);
  const queue = useMemo(() => safeArray(commandCenter?.queue), [commandCenter?.queue]);
  const recentRuns = useMemo(() => safeArray(commandCenter?.recentRuns), [commandCenter?.recentRuns]);
  const metrics = commandCenter?.metrics || {};
  const approvalItems = useMemo(() => safeArray(approvalQueue?.items), [approvalQueue?.items]);
  const previousHighlightedStatusRef = useRef("");
  const focusQueueState = useMemo(() => buildFocusQueueState(approvalItems), [approvalItems]);
  const completedHistoryActions = focusQueueState?.completedHistoryActions;
  const safeCompletedHistoryActions = useMemo(() => (Array.isArray(completedHistoryActions)
    ? completedHistoryActions.filter(Boolean)
    : []), [completedHistoryActions]);
  const routeHighlightSections = useMemo(() => getRouteHighlightSections({
    ...focusQueueState,
    completedHistoryActions: safeCompletedHistoryActions,
    rawQueueActions: queue,
  }), [focusQueueState, safeCompletedHistoryActions, queue]);
  const selectedApprovalItems = safeArray(focusQueueState?.tabActions?.[activeApprovalTab] || focusQueueState?.focusActions);
  const highlightedAction = isObjectAction(highlightResolution?.action) ? highlightResolution.action : null;
  const highlightedActionId = getActionId(highlightedAction);
  const highlightedActionSection = highlightResolution?.section || null;
  const isHighlightedApprovalItem = useCallback((item) => {
    if (!isObjectAction(item)) return false;
    const itemId = getActionId(item);
    if (highlightedActionId && itemId === highlightedActionId) return true;
    return Boolean(targetLeadId && getLeadId(item) === targetLeadId);
  }, [highlightedActionId, targetLeadId]);
  const prioritizeHighlightedItems = (items, limit) => {
    const safeItems = safeArray(items);
    const sliced = limit ? safeItems.slice(0, limit) : safeItems;
    const highlighted = safeItems.find(isHighlightedApprovalItem);
    if (highlighted && !safeArray(sliced).some((item) => getActionId(item) === getActionId(highlighted))) return [highlighted, ...sliced.slice(0, Math.max(0, (limit || safeItems.length) - 1))];
    return sliced;
  };
  const highlightedActionMissing = Boolean(targetActionId && !loading && highlightResolutionReady && !highlightResolution?.found);
  const approvalMetrics = { ...(approvalQueue?.metrics || {}), ...(focusQueueState?.metrics || {}), ...(focusSummary || {}) };
  const sequenceDrafts = safeArray(approvalQueue.items).filter(isSequenceDraft).sort((a, b) => getItemCreatedTime(b) - getItemCreatedTime(a));
  const sequenceTemplates = getSequenceTemplates(aiSequences);
  const selectableSequenceLeads = useMemo(() => [...safeArray(crmLeads)].sort((a, b) => getLeadPriorityValue(b) - getLeadPriorityValue(a)).slice(0, 25), [crmLeads]);

  useEffect(() => {
    console.info("[ai-workers-focus] focus queue built", { count: safeArray(focusQueueState?.focusActions).length, actionableNow: focusQueueState?.metrics?.actionableNow || 0 });
    console.info("[ai-workers-focus] legacy actions hidden", { count: focusQueueState?.metrics?.hiddenLegacy || 0 });
  }, [focusQueueState?.focusActions?.length, focusQueueState?.metrics?.actionableNow, focusQueueState?.metrics?.hiddenLegacy]);

  useEffect(() => {
    if (!targetActionId) {
      setHighlightResolution(createEmptyHighlightResolution());
      setHighlightResolutionReady(false);
      return;
    }

    console.info("[ai-workers-focus] resolving highlighted action", { actionId: targetActionId });
    const nextResolution = resolveHighlightedAction(targetActionId, routeHighlightSections);
    setHighlightResolution(nextResolution);
    setHighlightResolutionReady(true);

    if (!nextResolution.found) {
      console.info("[ai-workers-focus] highlight skipped safely", { actionId: targetActionId, reason: "not_found" });
      return;
    }

    if (nextResolution.section === "completed") {
      console.info("[ai-workers-focus] completed action resolved", { actionId: targetActionId });
    }

    const sectionToOpen = nextResolution.section && nextResolution.section !== "focus" ? nextResolution.section : "";
    if (!sectionToOpen) return;
    setExpandedSections((current) => {
      if (current?.[sectionToOpen]) return current;
      return { ...current, [sectionToOpen]: true };
    });
  }, [targetActionId, routeHighlightSections]);


  useEffect(() => {
    if (loading || !highlightedActionId || typeof window === "undefined" || typeof document === "undefined") return undefined;

    const sectionToOpen = highlightedActionSection && highlightedActionSection !== "focus" ? highlightedActionSection : "";
    let frameId;
    const scrollHighlightedAction = () => {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      if (sectionToOpen) {
        const detailsRef = detailsRefs?.[sectionToOpen];
        if (!safeOpenDetails(detailsRef)) {
          console.info("[ai-workers-focus] details ref missing, skipped safely", { actionId: highlightedActionId, section: sectionToOpen });
        }
      }
      const escapedActionId = window.CSS?.escape ? window.CSS.escape(highlightedActionId) : String(highlightedActionId).replace(/"/g, '\\"');
      const element = typeof document.querySelector === "function" ? document.querySelector(`[data-action-id="${escapedActionId}"]`) : null;
      if (element && typeof element.scrollIntoView === "function") {
        highlightRef.current = element;
        console.info("[ai-workers-focus] highlight target mounted", { actionId: highlightedActionId, section: highlightedActionSection });
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      console.info("[ai-workers-focus] highlight skipped safely", { actionId: highlightedActionId, reason: element ? "scroll_unavailable" : "target_not_mounted" });
    };

    frameId = window.requestAnimationFrame
      ? window.requestAnimationFrame(scrollHighlightedAction)
      : window.setTimeout(scrollHighlightedAction, 0);

    return () => {
      if (window.cancelAnimationFrame && typeof frameId === "number") window.cancelAnimationFrame(frameId);
      else if (frameId) window.clearTimeout(frameId);
    };
  }, [loading, highlightedActionId, highlightedActionSection, expandedSections, activeApprovalTab, detailsRefs]);

  useEffect(() => {
    if (!targetActionId) {
      previousHighlightedStatusRef.current = "";
      return;
    }

    const currentStatus = getActionStatus(highlightedAction);
    const previousStatus = previousHighlightedStatusRef.current;
    if (previousStatus && activeActionStatuses.has(previousStatus) && isFinishedActionStatus(currentStatus)) {
      setMessage("Сообщение отправлено");
      if (currentStatus === "completed" || currentStatus === "executed") {
        setExpandedSections((current) => ({ ...current, completed: true }));
      }
    }
    previousHighlightedStatusRef.current = currentStatus;
  }, [targetActionId, highlightedActionId, highlightedAction]);

  function renderApprovalRow(item, { history = false } = {}) {
    const payload = getActionPayload(item);
    const itemId = getActionId(item);
    const itemStatus = getActionStatus(item) || "unknown";
    const shouldRouteHighlight = Boolean(targetActionId && itemId === targetActionId);
    const shouldHighlight = shouldRouteHighlight || (!history && isHighlightedApprovalItem(item));
    const isApproveBusy = Boolean(busyActions[getApprovalActionKey(itemId, "approve")]);
    const isEditBusy = Boolean(busyActions[getApprovalActionKey(itemId, "edit")]);
    const isRejectBusy = Boolean(busyActions[getApprovalActionKey(itemId, "reject")]);
    const executeLoadingKey = getApprovalActionKey(itemId, "execute");
    const isExecuteActionBusy = Boolean(busyActions[executeLoadingKey]) || loadingKey === executeLoadingKey;
    const isItemBusy = isApproveBusy || isEditBusy || isRejectBusy || isExecuteActionBusy;
    const busyLabel = isApproveBusy ? approvalActionLoadingLabels.approve : isEditBusy ? approvalActionLoadingLabels.edit : isRejectBusy ? approvalActionLoadingLabels.reject : isExecuteActionBusy ? approvalActionLoadingLabels.execute : "";
    const isEditingThisDraft = editingDraft.itemId === itemId;
    const isTelegramDraftItem = isTelegramReplyDraft(item);
    const isEmailDraftItem = isEmailFollowupDraft(item);
    const executableButtonState = isApprovalItemExecutable(item) ? getExecutableButtonState(item, { isItemBusy, currentLoadingKey: loadingKey }) : null;
    const showExecutableButton = Boolean(executableButtonState && ["pending_approval", "approved"].includes(itemStatus));
    const isSendStyleButton = canAutoApproveAndExecuteDraft(item) || isEmailDraftItem;
    const canEditItem = ["pending_approval", "failed"].includes(itemStatus);
    const canRejectItem = ["pending_approval", "failed"].includes(itemStatus);
    if (isTelegramDraftItem && executableButtonState) logTelegramSendButtonState(item, executableButtonState);

    return (
      <article
        id={itemId ? getActionDomId(itemId) : undefined}
        data-action-id={itemId || undefined}
        ref={shouldHighlight ? highlightRef : null}
        className={`approval-row ${history ? "approval-history-row" : ""} approval-${itemStatus} ${shouldHighlight ? "route-highlight" : ""}`}
        key={itemId || `${getLeadId(item)}-${itemStatus}-${getActionTitle(item) || "action"}`}
      >
        <div className="approval-main">
          <strong>{sanitizeVisibleAiText(getActionTitle(item))}</strong>
          {shouldRouteHighlight && <span className="approval-route-badge">Открыто по ссылке</span>}
          <p>{shortRecommendation(item)}</p>
          {renderStageDetails(item)}
          {renderMeetingScheduleDetails(item, { onDownloadIcs: handleDownloadIcs })}
          {renderFollowupSequenceDetails(item)}
          {renderTelegramReplyDraft(item, {
            isEditing: isEditingThisDraft,
            editText: isEditingThisDraft ? editingDraft.text : getDraftText(item),
            onEditTextChange: (text) => setEditingDraft({ itemId, text }),
            onSaveEdit: () => saveApprovalItemEdit(item, editingDraft.text),
            onCancelEdit: () => setEditingDraft({ itemId: "", text: "" }),
            editBusy: isItemBusy,
          })}
          {renderEmailFollowupDraft(item, {
            isEditing: isEditingThisDraft,
            editText: isEditingThisDraft ? editingDraft.text : getDraftText(item),
            onEditTextChange: (text) => setEditingDraft({ itemId, text }),
            onSaveEdit: () => saveApprovalItemEdit(item, editingDraft.text),
            onCancelEdit: () => setEditingDraft({ itemId: "", text: "" }),
            editBusy: isItemBusy,
          })}
          {item.errorMessage && <small className="email-error-text">Ошибка выполнения: {formatApprovalErrorMessage(item.errorMessage)}</small>}
          {executableButtonState && isAiSendDebugBadgeEnabled() && (
            <small className="send-debug-badge">
              buttonEnabled={String(executableButtonState.buttonEnabled)} · actionId={itemId} · status={itemStatus}
            </small>
          )}
        </div>
        <div><span>Лид</span><b>{getActionLeadName(item) || "—"}</b></div>
        <div><span>AI сотрудник</span><b>{item?.workerName || item?.worker?.name || "AI"}</b></div>
        <div><span>Канал</span><b>{payload.channel || payload.suggestedChannel || (item?.lead?.telegram ? "telegram" : item?.lead?.email ? "email" : "crm")}</b></div>
        <div><span>Тип</span><b>{actionTypeLabels[getItemType(item)] || getItemType(item)}</b></div>
        <div><span>Статус</span><b className={`glow-status ${itemStatus}`}>{approvalStatusLabels[itemStatus] || itemStatus}</b><small>{formatDate(item.updatedAt || item.updated_at || item.createdAt || item.created_at)}</small></div>
        <div className="approval-actions">
          {!history && ["pending_approval", "failed"].includes(itemStatus) && (
            <button type="button" className="ghost-button compact" onClick={() => handleApprovalAction(item, "approve")} disabled={isItemBusy}>{isApproveBusy ? busyLabel : "Одобрить"}</button>
          )}
          {!history && canEditItem && (
            <button type="button" className="ghost-button compact" onClick={() => handleEditApprovalItem(item)} disabled={isItemBusy || ["executing","completed"].includes(itemStatus)}>{isEditBusy ? "Сохраняем…" : "Изменить"}</button>
          )}
          {!history && canRejectItem && !["executing", "completed", "rejected"].includes(itemStatus) && (
            <button type="button" className="ghost-button compact danger-action" onClick={() => handleApprovalAction(item, "reject")} disabled={isItemBusy}>{isRejectBusy ? busyLabel : "Отклонить"}</button>
          )}
          {!history && showExecutableButton && (
            isSendStyleButton ? (
              <button type="button" className="btn primary compact approval-send-button" onClick={() => handleApprovalAction(item, "execute")} disabled={executableButtonState.disabled} aria-busy={isExecuteActionBusy}>{isExecuteActionBusy ? approvalActionLoadingLabels.send : "Отправить"}</button>
            ) : (
              <button type="button" className="btn primary compact" onClick={() => handleApprovalAction(item, "execute")} disabled={executableButtonState.disabled}>{isExecuteActionBusy ? busyLabel : "Выполнить"}</button>
            )
          )}
          {history && <span className="approval-history-note">{getApprovalFooterStatusLabel(itemStatus)}</span>}
        </div>
      </article>
    );
  }

  function renderMalformedApprovalRow(action, { history = false, error = null } = {}) {
    const actionId = getActionId(action);
    const itemStatus = getActionStatus(action) || "malformed";
    const shouldHighlight = Boolean(targetActionId && actionId === targetActionId);
    if (error) console.error("[ai-workers-ui] safe approval row fallback", { actionId, error });
    return (
      <article
        id={actionId ? getActionDomId(actionId) : undefined}
        data-action-id={actionId || undefined}
        ref={shouldHighlight ? highlightRef : null}
        className={`approval-row ${history ? "approval-history-row" : ""} approval-${itemStatus} malformed-approval-row ${shouldHighlight ? "route-highlight" : ""}`}
        key={actionId || `malformed-${Math.random().toString(36).slice(2)}`}
      >
        <div className="approval-main">
          <strong>AI action не удалось отрисовать безопасно</strong>
          {shouldHighlight && <span className="approval-route-badge">Открыто по ссылке</span>}
          <p>{sanitizeVisibleAiText(getActionTitle(action) || "Некорректные данные AI действия")}</p>
          {error?.message && <small className="email-error-text">Render error: {error.message}</small>}
        </div>
        <div><span>Лид</span><b>{getActionLeadName(action) || "—"}</b></div>
        <div><span>AI сотрудник</span><b>AI</b></div>
        <div><span>Канал</span><b>{getActionPayload(action).channel || "crm"}</b></div>
        <div><span>Тип</span><b>{actionTypeLabels[getItemType(action)] || getItemType(action) || "—"}</b></div>
        <div><span>Статус</span><b className={`glow-status ${itemStatus}`}>{approvalStatusLabels[itemStatus] || itemStatus || "—"}</b></div>
        <div className="approval-actions">{history && <span className="approval-history-note">{getApprovalFooterStatusLabel(itemStatus)}</span>}</div>
      </article>
    );
  }

  function SafeApprovalRow({ action, history = false }) {
    try {
      if (!isObjectAction(action) || !getActionId(action)) {
        return renderMalformedApprovalRow(action, { history });
      }
      return renderApprovalRow(action, { history });
    } catch (rowError) {
      return renderMalformedApprovalRow(action, { history, error: rowError });
    }
  }

  function renderRawQueueSection() {
    const safeItems = safeArray(queue);
    if (!safeItems.length) return null;
    const visibleItems = prioritizeHighlightedItems(safeItems, 12);
    const detailsRef = detailsRefs?.raw;
    return (
      <details
        ref={detailsRef}
        className="approval-collapsed-section raw-queue-history-section"
        open={Boolean(expandedSections?.raw)}
        onToggle={(event) => {
          const node = event?.currentTarget;
          const isOpen = Boolean(node && typeof node === "object" && "open" in node && node.open);
          setExpandedSections((current) => ({ ...current, raw: isOpen }));
        }}
      >
        <summary>
          <span>Show raw queue history</span>
          <b>Доступно в журнале</b>
        </summary>
        <div className="raw-queue-history-copy">
          <span className="eyebrow">История AI задач</span>
          <p>Legacy queue preview скрыт по умолчанию, чтобы Focus Queue оставалась главным рабочим списком.</p>
        </div>
        <div className="ai-queue-list raw-queue-history-list">
          {visibleItems.map((item) => {
            const itemId = getActionId(item);
            const shouldHighlight = isHighlightedApprovalItem(item);
            return (
              <article
                id={itemId ? getActionDomId(itemId) : undefined}
                data-action-id={itemId || undefined}
                ref={shouldHighlight ? highlightRef : null}
                className={`ai-queue-item ${shouldHighlight ? "route-highlight" : ""}`}
                key={itemId || `raw-queue-${safeItems.indexOf(item)}`}
              >
                <div>
                  <strong>{sanitizeVisibleAiText(getActionTitle(item) || item?.title)}</strong>
                  {shouldHighlight && <span className="approval-route-badge">Открыто по ссылке</span>}
                  <p>{shortRecommendation(item)}</p>
                  <small>{formatDate(item?.created_at || item?.createdAt)} · {item?.action_type || getItemType(item) || "AI task"}</small>
                </div>
                <b>{getActionStatus(item) === "pending_approval" ? "Ждёт одобрения" : getActionStatus(item)}</b>
              </article>
            );
          })}
        </div>
      </details>
    );
  }

  function renderCollapsedSection({ id, title, count, items, history = false }) {
    const safeItems = id === "completed"
      ? (Array.isArray(completedHistoryActions) ? safeCompletedHistoryActions : [])
      : safeArray(items);
    if (id === "completed") {
      console.info("[ai-workers-focus] rendering completed history", {
        rawIsArray: Array.isArray(completedHistoryActions),
        count: safeItems.length,
      });
    }
    if (!Array.isArray(safeItems) || !safeItems.length) return null;
    const visibleItems = prioritizeHighlightedItems(safeItems, id === "all" ? 50 : 12);
    const detailsRef = detailsRefs?.[id];
    return (
      <details
        ref={detailsRef}
        className="approval-collapsed-section"
        open={Boolean(expandedSections?.[id])}
        onToggle={(event) => {
          const node = event?.currentTarget;
          const isOpen = Boolean(node && typeof node === "object" && "open" in node && node.open);
          setExpandedSections((current) => ({ ...current, [id]: isOpen }));
        }}
      >
        <summary>
          <span>{title}</span>
          <b>{count ?? safeItems.length}</b>
        </summary>
        <div className="approval-table approval-history-table">
          {Array.isArray(visibleItems) && visibleItems.map((item) => <SafeApprovalRow action={item} history={history} key={getActionId(item) || `${id}-malformed-${safeItems.indexOf(item)}`} />)}
        </div>
      </details>
    );
  }

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
      {highlightedActionMissing && (
        <p className="ai-workers-route-notice dashboard-alert">AI action не найден.</p>
      )}
      {highlightedAction && highlightedActionSection === "completed" && (
        <p className="ai-workers-route-notice dashboard-alert">Действие из ссылки уже завершено и показано в completed history.</p>
      )}
      {highlightedAction && highlightedActionSection === "raw" && (
        <p className="ai-workers-route-notice dashboard-alert">Действие из ссылки найдено в raw queue history — журнал открыт автоматически.</p>
      )}


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
        <StatCard label="Actionable now" value={loading ? "…" : String(approvalMetrics.actionableNow || 0)} hint="Фокусные задачи, требующие действия сейчас" tone="violet" />
        <StatCard label="Needs approval" value={loading ? "…" : String(approvalMetrics.needsApproval || 0)} hint="Ожидают решения менеджера" tone="pink" />
        <StatCard label="Failed unresolved" value={loading ? "…" : String(approvalMetrics.failedUnresolved || 0)} hint="Ошибки без более свежего успешного fallback" tone="pink" />
        <StatCard label="История AI задач" value={loading ? "…" : "Журнал"} hint="Доступно в журнале без шума в Focus Queue" tone="violet" />
        <StatCard label="AI эффективность" value={loading ? "…" : `${metrics.efficiency || 0}%`} hint="Доля успешных запусков AI работников" />
        <StatCard label="Meetings scheduled by AI" value={loading ? "…" : String(approvalMetrics.meetingsScheduledByAi || 0)} hint="После approval менеджера" tone="violet" />
        <StatCard label="Pending meeting proposals" value={loading ? "…" : String(approvalMetrics.pendingMeetingProposals || 0)} hint="AI предложения demo-созвона ждут решения" tone="pink" />
        <StatCard label="Next Best Actions pending" value={loading ? "…" : String(metrics.nextBestActionsPending || 0)} hint="AI NBA ждут approval менеджера" tone="pink" />
        <StatCard label="Next Best Actions generated today" value={loading ? "…" : String(metrics.nextBestActionsGeneratedToday || 0)} hint="Создано AI NBA сегодня" tone="violet" />
        <StatCard label="Выручка под контролем AI" value={loading ? "…" : formatMoney(metrics.revenueUnderAi)} hint="Плейсхолдер revenue impact по открытой воронке" tone="violet" />
      </section>
      <p className="focus-total-history-note">Всего AI задач в истории: {loading ? "…" : (approvalMetrics.totalHistory || safeArray(approvalQueue?.items).length || 0)}</p>



      <Panel className="ai-sequence-orchestrator-widget">
        <div className="panel-head focus-queue-head">
          <div>
            <span className="eyebrow">AI Sequence Orchestrator</span>
            <h3>Safe sequence drafts for manager approval</h3>
            <p>Never auto-send. AI will generate drafts for manager approval and show safe status: Step generated and waiting for approval.</p>
          </div>
          <span className="live-pill focus-live-pill"><i />Active: {aiSequences.metrics?.active || safeArray(aiSequences.activeSequences).length || 0}</span>
        </div>
        <div className="approval-metric-strip sequence-metric-strip">
          <span>Active sequences <b>{aiSequences.metrics?.active || safeArray(aiSequences.activeSequences).length || 0}</b></span>
          <span>Due soon <b>{getDueSoonCount(aiSequences.activeSequences)}</b></span>
          <span>Generated drafts <b>{sequenceDrafts.length}</b></span>
          <span>Completion rate <b>{aiSequences.completionRate || 0}%</b></span>
        </div>
        <div className="ai-sequence-worker-grid">
          <div className="ai-sequence-start-box">
            <label className="crm-field"><span>High-priority lead</span><select value={sequenceLeadId} onChange={(event) => setSequenceLeadId(event.target.value)}><option value="">Select lead</option>{selectableSequenceLeads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.company || stageLabel(lead.status)} · score {lead.aiScore?.score || lead.aiPriority || "—"}</option>)}</select></label>
            {sequenceTemplates.length > 1 && <label className="crm-field"><span>Template</span><select value={sequenceTemplateId} onChange={(event) => setSequenceTemplateId(event.target.value)}>{sequenceTemplates.map((template) => <option key={template.id || "default"} value={template.id}>{template.name}</option>)}</select></label>}
            <button className="btn primary compact" type="button" onClick={handleStartSelectedSequence} disabled={sequenceBusy || !sequenceLeadId}>{sequenceBusy ? "Starting sequence…" : "Start sequence for selected lead"}</button>
          </div>
          <div className="ai-sequence-draft-list">
            <h4>Latest sequence drafts</h4>
            {sequenceDrafts.length === 0 && <p className="empty-state">No AI sequence drafts yet.</p>}
            {sequenceDrafts.slice(0, 4).map((item) => (
              <article className="ai-sequence-draft-row" key={getActionId(item) || item.id}>
                <strong>{getActionLeadName(item) || "Lead"}</strong>
                <span className="sequence-status-badge pending_approval">Step generated and waiting for approval</span>
                <p>{shortRecommendation(item)}</p>
                <small>{getApprovalFooterStatusLabel(item.status)} · {formatDate(item.createdAt || item.created_at)}</small>
              </article>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="ai-approval-center-panel">
        <div className="panel-head focus-queue-head">
          <div>
            <span className="eyebrow">Контроль человеком</span>
            <h3>Focus Queue</h3>
            <p>Показываем только задачи, которые реально требуют действия менеджера сейчас.</p>
          </div>
          <span className="live-pill focus-live-pill"><i />Actionable now: {approvalMetrics.actionableNow || 0}</span>
        </div>
        <div className="approval-metric-strip focus-metric-strip">
          <span>Actionable now <b>{approvalMetrics.actionableNow || 0}</b></span>
          <span>Needs approval <b>{approvalMetrics.needsApproval || 0}</b></span>
          <span>Failed unresolved <b>{approvalMetrics.failedUnresolved || 0}</b></span>
          <span>История AI задач <b>Доступно в журнале</b></span>
          <span>Completed history <b>{approvalMetrics.completedHistory || 0}</b></span>
          <span>Safety history <b>{approvalMetrics.safetyHistory || 0}</b></span>
          <span>Выполнено сегодня <b>{approvalMetrics.executedToday || 0}</b></span>
          <span>Успешность <b>{approvalMetrics.successRate || 0}%</b></span>
        </div>
        <div className="focus-tabs" role="tablist" aria-label="AI Workers approval filters">
          {safeArray(focusTabs).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeApprovalTab === tab.id}
              className={activeApprovalTab === tab.id ? "active" : ""}
              onClick={() => setActiveApprovalTab(tab.id)}
            >
              {tab.label}
              <span>{safeArray(focusQueueState?.tabActions?.[tab.id]).length || 0}</span>
            </button>
          ))}
        </div>
        <div className="approval-table">
          {selectedApprovalItems.length === 0 && <p className="empty-state">Нет AI действий в выбранном фильтре.</p>}
          {prioritizeHighlightedItems(selectedApprovalItems, activeApprovalTab === "focus" ? FOCUS_QUEUE_LIMIT : 50).map((item) => <SafeApprovalRow action={item} key={getActionId(item) || `focus-malformed-${selectedApprovalItems.indexOf(item)}`} />)}
        </div>
        <div className="approval-collapsed-list">
          {renderCollapsedSection({ id: "legacy", title: "Show legacy pending", count: safeArray(focusQueueState?.hiddenLegacyActions).length, items: focusQueueState?.hiddenLegacyActions })}
          {renderCollapsedSection({ id: "completed", title: "Show completed history", count: safeCompletedHistoryActions.length, items: safeCompletedHistoryActions, history: true })}
          {renderCollapsedSection({ id: "safety", title: "Show safety history", count: safeArray(focusQueueState?.safetyHistoryActions).length, items: focusQueueState?.safetyHistoryActions, history: true })}
          {renderCollapsedSection({ id: "all", title: "Show all actions", count: safeArray(focusQueueState?.allActions).length, items: focusQueueState?.allActions, history: true })}
          {renderRawQueueSection()}
        </div>
      </Panel>

      <section className="worker-card-grid">
        {loading && <Panel className="ai-worker-card"><p className="empty-state">Загружаем AI сотрудников…</p></Panel>}
        {!loading && safeArray(workers).map((worker) => (
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
                {busyWorker === worker.id ? "Выполняется…" : worker.type === "ai_lead_scoring_engine" ? "Запустить scoring" : worker.type === "ai_next_best_action_engine" ? "Run Next Best Actions" : "Запустить"}
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
              <span className="eyebrow">Контроль качества</span>
              <h3>Ожидают и требуют внимания</h3>
            </div>
          </div>
          <div className="approval-lanes">
            <div>
              <span>Pending focus actions</span>
              <strong>{approvalMetrics.needsApproval || 0}</strong>
              <p>Фокусные черновики, follow-up и next best actions ждут решения менеджера.</p>
            </div>
            <div>
              <span>Failed unresolved</span>
              <strong>{approvalMetrics.failedUnresolved || 0}</strong>
              <p>Ошибки без более свежего успешного fallback остаются видимыми для восстановления.</p>
            </div>
            <div>
              <span>Safety history</span>
              <strong>{approvalMetrics.safetyHistory || 0}</strong>
              <p>Защитные и тестовые события доступны в журнале, но не шумят в Focus Queue.</p>
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
            {safeArray(recentRuns).map((run) => (
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


export default function AiWorkersPage() {
  return (
    <AiWorkersErrorBoundary>
      <AiWorkersPageContent />
    </AiWorkersErrorBoundary>
  );
}
