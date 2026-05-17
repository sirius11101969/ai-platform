import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { isInternalAiDebugEnabled, sanitizeCustomerVisibleText, sanitizeVisibleAiText } from "../utils/uiSanitizer";
import { approveAiApprovalQueueItem, downloadCrmMeetingIcs, executeAiApprovalQueueItem, fetchAiApprovalQueue, fetchAiCommandCenter, fetchAiWorkersFocusSummary, rejectAiApprovalQueueItem, runAiWorker, seedDemoSalesPipeline, updateAiApprovalQueueItem, updateAiWorker } from "../services/api";

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
      <span>Reason <b>{sanitizeVisibleAiText(payload.reason || item.recommendation || "AI обнаружил сигнал для смены этапа.")}</b></span>
    </div>
  );
}

function getDraftText(item) {
  return item?.payload?.editedText || item?.payload?.edited_text || item?.payload?.customerText || item?.payload?.customer_text || item?.payload?.suggestedText || item?.payload?.draftText || item?.payload?.body || item?.payload?.text || item?.payload?.message || "";
}

function getInternalAiContext(item) {
  const payload = item?.payload || {};
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
  return item?.payload?.inboundText || item?.payload?.inboundMessage || item?.payload?.customerMessage || "";
}

function getTelegramChatId(item) {
  return item?.lead?.telegramChatId || item?.payload?.telegramChatId || item?.payload?.telegram_chat_id || item?.payload?.chatId || "";
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
  return item?.actionType === "telegram_meeting_confirmation_draft" || item?.executionType === "telegram_meeting_confirmation_draft";
}

function isFollowupSequenceDraft(item) {
  return item?.actionType === "followup_sequence_draft" || item?.executionType === "followup_sequence_draft";
}

function isEmailFollowupDraft(item) {
  return item?.actionType === "email_followup_draft" || item?.executionType === "email_followup_draft";
}

function isTelegramReplyDraft(item) {
  return item?.actionType === "telegram_reply_draft" || item?.executionType === "telegram_reply_draft" || isTelegramMeetingConfirmationDraft(item) || isFollowupSequenceDraft(item);
}

function renderFollowupSequenceDetails(item) {
  if (!isFollowupSequenceDraft(item)) return null;
  const payload = item.payload || {};
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
  const wasEdited = Boolean(item.payload?.editedByManager || item.payload?.editedText || item.payload?.edited_text);
  const forecastRiskBadge = getForecastRiskBadge(item);
  return (
    <div className="telegram-reply-draft-card">
      <div className="telegram-reply-card-head">
        <span className="telegram-badge">{isFollowupSequenceDraft(item) ? (item.payload?.channel || "follow-up") : "Telegram"}</span>
        <span className="telegram-meta-pill">Этап: {stageLabel(item.payload?.leadStage || item.payload?.currentStage || item.lead?.status)}</span>
        {forecastRiskBadge && <span className="telegram-meta-pill risk">{forecastRiskBadge}</span>}
        {wasEdited && <span className="telegram-meta-pill edited">Изменено менеджером</span>}
      </div>
      <div>
        <span>{isTelegramMeetingConfirmationDraft(item) ? "Лид" : isFollowupSequenceDraft(item) ? "Последнее касание" : "Последнее входящее сообщение"}</span>
        <p>{isTelegramMeetingConfirmationDraft(item) ? (item.lead?.name || item.payload?.leadName || "—") : isFollowupSequenceDraft(item) ? sanitizeCustomerVisibleText(item.payload?.lastMessageText || "—") : inbound}</p>
      </div>
      {isTelegramMeetingConfirmationDraft(item) && (
        <div>
          <span>Запланированное время</span>
          <p>{formatMeetingStart(item.payload?.scheduledTime || item.payload?.proposedStartTime)}</p>
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
  const payload = item.payload || {};
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
        <p>{item.lead?.name || payload.leadName || "—"}</p>
      </div>
      <div>
        <span>Email</span>
        <p>{payload.email || payload.to || item.lead?.email || "—"}</p>
      </div>
      <div>
        <span>Тема письма</span>
        <p>{sanitizeVisibleAiText(payload.subject || item.title || "—")}</p>
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
  const text = sanitizeVisibleAiText(item?.payload?.suggestedText || item.recommendation || item.title || "AI рекомендация ожидает решения");
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
  return executableApprovalTypes.has(item.executionType || item.actionType);
}

function sortApprovalItemsByCreatedDesc(items) {
  return [...items].sort((left, right) => new Date(right.createdAt || right.created_at || 0).getTime() - new Date(left.createdAt || left.created_at || 0).getTime());
}

function canAutoApproveAndExecuteDraft(item) {
  return isTelegramReplyDraft(item) || isFollowupSequenceDraft(item) || isEmailFollowupDraft(item);
}

function getExecutableButtonState(item, { isItemBusy = false, currentLoadingKey = "" } = {}) {
  const executeLoadingKey = getApprovalActionKey(item.id, "execute");
  const isExecutable = isApprovalItemExecutable(item);
  const canExecuteApproved = item.status === "approved";
  const canExecutePendingDraft = item.status === "pending_approval" && canAutoApproveAndExecuteDraft(item);
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
  if (!nextItem?.id) return items;
  return items.map((item) => (item.id === nextItem.id ? { ...item, ...nextItem } : item));
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
  console.log("[ai-workers-ui] telegram send via execute", { actionId: item.id, actionType: item.executionType || item.actionType });
}

function getApprovalItemType(item) {
  return item?.executionType || item?.actionType || "";
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

function getItemCreatedTime(item) {
  return new Date(item?.createdAt || item?.created_at || 0).getTime() || 0;
}

function getItemUpdatedTime(item) {
  return new Date(item?.updatedAt || item?.updated_at || item?.createdAt || 0).getTime() || 0;
}

function getItemType(item) {
  return item?.executionType || item?.actionType || "";
}

function getItemSearchText(item) {
  return [item?.title, item?.recommendation, item?.errorMessage, item?.payload?.testName, item?.payload?.source, item?.payload?.scenario].filter(Boolean).join(" ").toLowerCase();
}

function isRecentAction(item, now = Date.now()) {
  return now - getItemCreatedTime(item) <= FOCUS_RECENT_WINDOW_MS;
}

function isCustomerFacingAction(item) {
  return customerFacingActionTypes.has(getItemType(item)) || ["email", "telegram"].includes(String(item?.payload?.channel || item?.payload?.suggestedChannel || "").toLowerCase());
}

function isFollowupAction(item) {
  return followupActionTypes.has(getItemType(item));
}

function isMeetingAction(item) {
  return meetingActionTypes.has(getItemType(item));
}

function isSafetyHistoryAction(item) {
  const text = getItemSearchText(item);
  return /unsafe copy guard test|safety[-_ ]?test|copy guard|ai safety|sanitizer test/.test(text) || item?.payload?.source === "copy_guard_test" || item?.payload?.safetyTest === true;
}

function isGenericLowValueLeadPriority(item) {
  if (getItemType(item) !== "lead_priority_recommendation") return false;
  const priority = String(item?.payload?.priority || item?.payload?.aiPriority || item?.payload?.value || "").toLowerCase();
  const score = Number(item?.payload?.score || item?.payload?.aiScore || 0);
  return ["", "low", "medium", "normal"].includes(priority) && score < 70;
}

function hasNewerCompletedFallback(item, items) {
  if (item?.status !== "failed" || !item?.leadId) return false;
  const itemTime = getItemUpdatedTime(item);
  return items.some((candidate) => {
    if (candidate.id === item.id || candidate.leadId !== item.leadId) return false;
    if (!["completed", "executed"].includes(candidate.status)) return false;
    if (!isCustomerFacingAction(candidate)) return false;
    if (getItemUpdatedTime(candidate) <= itemTime) return false;
    const candidateChannel = String(candidate?.payload?.channel || candidate?.payload?.suggestedChannel || "").toLowerCase();
    const itemChannel = String(item?.payload?.channel || item?.payload?.suggestedChannel || "").toLowerCase();
    return candidateChannel === "email" || candidateChannel !== itemChannel;
  });
}

function getFocusPriority(item, items, now = Date.now()) {
  const type = getItemType(item);
  const source = String(item?.payload?.source || item?.workerName || item?.payload?.engine || "").toLowerCase();
  const status = item?.status;
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
  if (finishedActionStatuses.has(item?.status)) return true;
  if (isSafetyHistoryAction(item)) return true;
  if (item?.status === "failed" && hasNewerCompletedFallback(item, items)) return true;
  if (type === "lead_scoring_update" && ["completed", "executed"].includes(item?.status)) return true;
  if (["telegram_draft", "email_draft"].includes(type) && !isRecentAction(item, now)) return true;
  if (isGenericLowValueLeadPriority(item)) return true;
  return false;
}

function buildFocusQueueState(items, now = Date.now()) {
  const sorted = sortApprovalItemsByCreatedDesc(items || []);
  const completedHistoryActions = sorted.filter((item) => ["completed", "executed", "rejected", "cancelled"].includes(item.status) && !isSafetyHistoryAction(item));
  const safetyHistoryActions = sorted.filter(isSafetyHistoryAction);
  const focusCandidates = sorted
    .filter((item) => !shouldHideFromFocus(item, sorted, now))
    .filter((item) => activeActionStatuses.has(item.status) || (item.status === "failed" && !hasNewerCompletedFallback(item, sorted)))
    .map((item) => ({ item, priority: getFocusPriority(item, sorted, now) }))
    .filter(({ priority }) => priority < 99)
    .sort((left, right) => left.priority - right.priority || getItemCreatedTime(right.item) - getItemCreatedTime(left.item))
    .map(({ item }) => item);
  const focusActions = focusCandidates.slice(0, FOCUS_QUEUE_LIMIT);
  const focusIds = new Set(focusActions.map((item) => item.id));
  const hiddenLegacyActions = sorted.filter((item) => !focusIds.has(item.id) && !completedHistoryActions.some((historyItem) => historyItem.id === item.id) && !safetyHistoryActions.some((historyItem) => historyItem.id === item.id));
  const unresolvedFailedActions = sorted.filter((item) => item.status === "failed" && !hasNewerCompletedFallback(item, sorted) && !isSafetyHistoryAction(item));
  const needsApprovalActions = sorted.filter((item) => activeActionStatuses.has(item.status) && !isSafetyHistoryAction(item));
  const meetingsActions = sorted.filter((item) => isMeetingAction(item) && !isSafetyHistoryAction(item) && !finishedActionStatuses.has(item.status));
  const followupActions = sorted.filter((item) => isFollowupAction(item) && !isSafetyHistoryAction(item) && !finishedActionStatuses.has(item.status));

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
      completedHistory: completedHistoryActions.length,
      safetyHistory: safetyHistoryActions.length,
    },
  };
}

function logTelegramSendButtonState(item, buttonState) {
  console.log("[ai-workers-ui] send button state", {
    actionId: item.id,
    actionType: buttonState.actionType,
    status: item.status,
    buttonEnabled: buttonState.buttonEnabled,
    disabled: buttonState.disabled,
    loadingKey: buttonState.loadingKey,
  });
}

export default function AiWorkersPage() {
  const [commandCenter, setCommandCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyWorker, setBusyWorker] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [approvalQueue, setApprovalQueue] = useState({ items: [], metrics: {} });
  const [focusSummary, setFocusSummary] = useState(null);
  const [activeApprovalTab, setActiveApprovalTab] = useState("focus");
  const [expandedSections, setExpandedSections] = useState({ legacy: false, completed: false, safety: false, all: false });
  const [busyActions, setBusyActions] = useState({});
  const [loadingKey, setLoadingKey] = useState("");
  const actionInFlightRef = useRef(new Set());
  const [editingDraft, setEditingDraft] = useState({ itemId: "", text: "" });
  const location = useLocation();
  const highlightRef = useRef(null);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const targetActionId = params.get("actionId") || params.get("approvalId") || "";
  const targetLeadId = params.get("leadId") || "";

  async function loadCommandCenter({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const queueParams = targetActionId ? {} : (targetLeadId ? { leadId: targetLeadId } : {});
      const focusParams = { actionId: targetActionId, leadId: targetLeadId };
      const [response, approvalResponse, focusResponse] = await Promise.all([fetchAiCommandCenter(), fetchAiApprovalQueue(queueParams), fetchAiWorkersFocusSummary(focusParams)]);
      setCommandCenter(response.commandCenter || null);
      setApprovalQueue({ items: approvalResponse.items || [], metrics: approvalResponse.metrics || {} });
      setFocusSummary(focusResponse || null);
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

  useEffect(() => {
    if (!loading && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, targetActionId, targetLeadId, approvalQueue.items, expandedSections, activeApprovalTab]);

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
        ? `${worker.name}: scoring завершён для ${response.scoredLeads?.filter((item) => !item.error).length || 0} лидов.`
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
    const actionKey = getApprovalActionKey(item.id, action);
    if (actionInFlightRef.current.has(actionKey)) {
      logApprovalAction("failed", { itemId: item.id, action, reason: "action already in progress" });
      return;
    }

    actionInFlightRef.current.add(actionKey);
    setBusyActions((current) => ({ ...current, [actionKey]: { itemId: item.id, action } }));
    if (action === "execute") setLoadingKey(actionKey);
    setError("");
    setMessage("");
    logApprovalAction("start", { itemId: item.id, action, status: item.status });

    try {
      const response = await withApprovalActionTimeout(requestFactory(), action);
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
      const errorMessage = getApprovalActionErrorMessage(requestError, action);
      setError(errorMessage);
      logApprovalAction("failed", { itemId: item.id, action, error: errorMessage });
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

    if (action === "execute" && (isTelegramReplyDraft(item) || isEmailFollowupDraft(item))) {
      console.log("[ai-workers-ui] send clicked", { actionId: item.id, actionType: getApprovalItemType(item), status: item.status });
      logTelegramSendViaExecute(item);
    }

    const executeApprovalItem = async () => {
      if ((isTelegramReplyDraft(item) || isEmailFollowupDraft(item)) && item.status === "pending_approval") {
        await approveAiApprovalQueueItem(item.id, requestOptions);
      }
      return executeAiApprovalQueueItem(item.id, requestOptions);
    };

    const actionRequests = {
      approve: () => approveAiApprovalQueueItem(item.id, requestOptions),
      reject: () => rejectAiApprovalQueueItem(item.id, requestOptions),
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
        setMessage((isTelegramReplyDraft(item) || isEmailFollowupDraft(item)) ? "Отправлено" : "Выполнено");
        return;
      }
      setMessage(approvalActionMessages[action] || "Статус AI действия обновлён");
    });
  }

  function handleEditApprovalItem(item) {
    const itemHasBusyAction = Object.keys(busyActions).some((key) => key.startsWith(`${item.id}:`));
    if (itemHasBusyAction) {
      logApprovalAction("failed", { itemId: item.id, action: "edit", reason: "action already in progress" });
      return;
    }

    const isTelegramReplyDraftItem = isTelegramReplyDraft(item);
    if (isTelegramReplyDraftItem || isFollowupSequenceDraft(item) || isEmailFollowupDraft(item)) {
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

    if (isTelegramReplyDraft(item) || isFollowupSequenceDraft(item) || isEmailFollowupDraft(item)) {
      const normalizedText = String(nextText || "").trim();
      payload = { payload: { ...(item.payload || {}), customerText: normalizedText, draftText: item.payload?.draftText || item.payload?.body || item.payload?.text || item.payload?.message || item.recommendation || "", editedText: normalizedText, edited_text: normalizedText, body: isEmailFollowupDraft(item) ? normalizedText : item.payload?.body, text: normalizedText, message: normalizedText, editedByManager: true } };
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
  const focusQueueState = useMemo(() => buildFocusQueueState(approvalItems), [approvalItems]);
  const selectedApprovalItems = focusQueueState.tabActions[activeApprovalTab] || focusQueueState.focusActions;
  const isHighlightedApprovalItem = (item) => Boolean((targetActionId && item.id === targetActionId) || (targetLeadId && item.leadId === targetLeadId));
  const prioritizeHighlightedItems = (items, limit) => {
    const sliced = limit ? items.slice(0, limit) : items;
    const highlighted = items.find(isHighlightedApprovalItem);
    if (highlighted && !sliced.some((item) => item.id === highlighted.id)) return [highlighted, ...sliced.slice(0, Math.max(0, (limit || items.length) - 1))];
    return sliced;
  };
  const approvalMetrics = { ...(approvalQueue.metrics || {}), ...(focusQueueState.metrics || {}), ...(focusSummary || {}) };
  const pendingActions = useMemo(() => queue.filter((item) => item.status === "pending_approval"), [queue]);
  const failedActions = useMemo(() => queue.filter((item) => item.status === "failed"), [queue]);

  useEffect(() => {
    console.info("[ai-workers-focus] focus queue built", { count: focusQueueState.focusActions.length, actionableNow: focusQueueState.metrics.actionableNow });
    console.info("[ai-workers-focus] legacy actions hidden", { count: focusQueueState.metrics.hiddenLegacy });
  }, [focusQueueState.focusActions.length, focusQueueState.metrics.actionableNow, focusQueueState.metrics.hiddenLegacy]);

  useEffect(() => {
    if (!targetActionId && !targetLeadId) return;
    const matchSection = (items) => items.some(isHighlightedApprovalItem);
    const nextExpanded = {};
    if (matchSection(focusQueueState.hiddenLegacyActions)) nextExpanded.legacy = true;
    if (matchSection(focusQueueState.completedHistoryActions)) nextExpanded.completed = true;
    if (matchSection(focusQueueState.safetyHistoryActions)) nextExpanded.safety = true;
    if (!matchSection(selectedApprovalItems) && matchSection(focusQueueState.allActions)) nextExpanded.all = true;
    if (!Object.keys(nextExpanded).length) return;
    setExpandedSections((current) => ({ ...current, ...nextExpanded }));
    console.info("[ai-workers-focus] route highlight expanded hidden section", { actionId: targetActionId, leadId: targetLeadId, sections: Object.keys(nextExpanded) });
  }, [targetActionId, targetLeadId, focusQueueState, selectedApprovalItems]);

  function renderApprovalRow(item, { history = false } = {}) {
    const isApproveBusy = Boolean(busyActions[getApprovalActionKey(item.id, "approve")]);
    const isEditBusy = Boolean(busyActions[getApprovalActionKey(item.id, "edit")]);
    const isRejectBusy = Boolean(busyActions[getApprovalActionKey(item.id, "reject")]);
    const executeLoadingKey = getApprovalActionKey(item.id, "execute");
    const isExecuteActionBusy = Boolean(busyActions[executeLoadingKey]) || loadingKey === executeLoadingKey;
    const isItemBusy = isApproveBusy || isEditBusy || isRejectBusy || isExecuteActionBusy;
    const busyLabel = isApproveBusy ? approvalActionLoadingLabels.approve : isEditBusy ? approvalActionLoadingLabels.edit : isRejectBusy ? approvalActionLoadingLabels.reject : isExecuteActionBusy ? approvalActionLoadingLabels.execute : "";
    const isEditingThisDraft = editingDraft.itemId === item.id;
    const isTelegramDraftItem = isTelegramReplyDraft(item);
    const isEmailDraftItem = isEmailFollowupDraft(item);
    const executableButtonState = isApprovalItemExecutable(item) ? getExecutableButtonState(item, { isItemBusy, currentLoadingKey: loadingKey }) : null;
    const showExecutableButton = Boolean(executableButtonState && ["pending_approval", "approved"].includes(item.status));
    const isSendStyleButton = canAutoApproveAndExecuteDraft(item) || isEmailDraftItem;
    const canEditItem = ["pending_approval", "failed"].includes(item.status);
    const canRejectItem = ["pending_approval", "failed"].includes(item.status);
    if (isTelegramDraftItem && executableButtonState) logTelegramSendButtonState(item, executableButtonState);

    return (
      <article ref={isHighlightedApprovalItem(item) ? highlightRef : null} className={`approval-row ${history ? "approval-history-row" : ""} approval-${item.status} ${isHighlightedApprovalItem(item) ? "route-highlight" : ""}`} key={item.id}>
        <div className="approval-main">
          <strong>{sanitizeVisibleAiText(item.title)}</strong>
          <p>{shortRecommendation(item)}</p>
          {renderStageDetails(item)}
          {renderMeetingScheduleDetails(item, { onDownloadIcs: handleDownloadIcs })}
          {renderFollowupSequenceDetails(item)}
          {renderTelegramReplyDraft(item, {
            isEditing: isEditingThisDraft,
            editText: isEditingThisDraft ? editingDraft.text : getDraftText(item),
            onEditTextChange: (text) => setEditingDraft({ itemId: item.id, text }),
            onSaveEdit: () => saveApprovalItemEdit(item, editingDraft.text),
            onCancelEdit: () => setEditingDraft({ itemId: "", text: "" }),
            editBusy: isItemBusy,
          })}
          {renderEmailFollowupDraft(item, {
            isEditing: isEditingThisDraft,
            editText: isEditingThisDraft ? editingDraft.text : getDraftText(item),
            onEditTextChange: (text) => setEditingDraft({ itemId: item.id, text }),
            onSaveEdit: () => saveApprovalItemEdit(item, editingDraft.text),
            onCancelEdit: () => setEditingDraft({ itemId: "", text: "" }),
            editBusy: isItemBusy,
          })}
          {item.errorMessage && <small className="email-error-text">Ошибка выполнения: {formatApprovalErrorMessage(item.errorMessage)}</small>}
          {executableButtonState && !history && (
            <small className="send-debug-badge">
              buttonEnabled={String(executableButtonState.buttonEnabled)} · actionId={item.id} · status={item.status}
            </small>
          )}
        </div>
        <div><span>Лид</span><b>{item.lead?.name || "—"}</b></div>
        <div><span>AI сотрудник</span><b>{item.workerName || "AI"}</b></div>
        <div><span>Канал</span><b>{item.payload?.channel || item.payload?.suggestedChannel || (item.lead?.telegram ? "telegram" : item.lead?.email ? "email" : "crm")}</b></div>
        <div><span>Тип</span><b>{actionTypeLabels[item.executionType] || actionTypeLabels[item.actionType] || item.actionType}</b></div>
        <div><span>Статус</span><b className={`glow-status ${item.status}`}>{approvalStatusLabels[item.status] || item.status}</b><small>{formatDate(item.updatedAt || item.createdAt)}</small></div>
        <div className="approval-actions">
          {!history && ["pending_approval", "failed"].includes(item.status) && (
            <button type="button" className="ghost-button compact" onClick={() => handleApprovalAction(item, "approve")} disabled={isItemBusy}>{isApproveBusy ? busyLabel : "Одобрить"}</button>
          )}
          {!history && canEditItem && (
            <button type="button" className="ghost-button compact" onClick={() => handleEditApprovalItem(item)} disabled={isItemBusy || ["executing","completed"].includes(item.status)}>{isEditBusy ? "Сохраняем…" : "Изменить"}</button>
          )}
          {!history && canRejectItem && !["executing", "completed", "rejected"].includes(item.status) && (
            <button type="button" className="ghost-button compact danger-action" onClick={() => handleApprovalAction(item, "reject")} disabled={isItemBusy}>{isRejectBusy ? busyLabel : "Отклонить"}</button>
          )}
          {!history && showExecutableButton && (
            isSendStyleButton ? (
              <button type="button" className="btn primary compact approval-send-button" onClick={() => handleApprovalAction(item, "execute")} disabled={executableButtonState.disabled} aria-busy={isExecuteActionBusy}>{isExecuteActionBusy ? approvalActionLoadingLabels.send : "Отправить"}</button>
            ) : (
              <button type="button" className="btn primary compact" onClick={() => handleApprovalAction(item, "execute")} disabled={executableButtonState.disabled}>{isExecuteActionBusy ? busyLabel : "Выполнить"}</button>
            )
          )}
          {history && <span className="approval-history-note">{getApprovalFooterStatusLabel(item.status)}</span>}
        </div>
      </article>
    );
  }

  function renderCollapsedSection({ id, title, count, items, history = false }) {
    if (!items.length) return null;
    return (
      <details className="approval-collapsed-section" open={expandedSections[id]} onToggle={(event) => setExpandedSections((current) => ({ ...current, [id]: event.currentTarget.open }))}>
        <summary>
          <span>{title}</span>
          <b>{count}</b>
        </summary>
        <div className="approval-table approval-history-table">
          {prioritizeHighlightedItems(items, id === "all" ? 50 : 12).map((item) => renderApprovalRow(item, { history }))}
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
        <StatCard label="Hidden legacy" value={loading ? "…" : String(approvalMetrics.hiddenLegacy || 0)} hint="Скрыто из Focus Queue, доступно в истории" tone="violet" />
        <StatCard label="AI эффективность" value={loading ? "…" : `${metrics.efficiency || 0}%`} hint="Доля успешных запусков AI работников" />
        <StatCard label="Meetings scheduled by AI" value={loading ? "…" : String(approvalMetrics.meetingsScheduledByAi || 0)} hint="После approval менеджера" tone="violet" />
        <StatCard label="Pending meeting proposals" value={loading ? "…" : String(approvalMetrics.pendingMeetingProposals || 0)} hint="AI предложения demo-созвона ждут решения" tone="pink" />
        <StatCard label="Next Best Actions pending" value={loading ? "…" : String(metrics.nextBestActionsPending || 0)} hint="AI NBA ждут approval менеджера" tone="pink" />
        <StatCard label="Next Best Actions generated today" value={loading ? "…" : String(metrics.nextBestActionsGeneratedToday || 0)} hint="Создано AI NBA сегодня" tone="violet" />
        <StatCard label="Выручка под контролем AI" value={loading ? "…" : formatMoney(metrics.revenueUnderAi)} hint="Плейсхолдер revenue impact по открытой воронке" tone="violet" />
      </section>
      <p className="focus-total-history-note">Всего AI задач в истории: {loading ? "…" : (approvalMetrics.totalHistory || approvalQueue.items.length || 0)}</p>

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
          <span>Hidden legacy <b>{approvalMetrics.hiddenLegacy || 0}</b></span>
          <span>Completed history <b>{approvalMetrics.completedHistory || 0}</b></span>
          <span>Safety history <b>{approvalMetrics.safetyHistory || 0}</b></span>
          <span>Выполнено сегодня <b>{approvalMetrics.executedToday || 0}</b></span>
          <span>Успешность <b>{approvalMetrics.successRate || 0}%</b></span>
        </div>
        <div className="focus-tabs" role="tablist" aria-label="AI Workers approval filters">
          {focusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeApprovalTab === tab.id}
              className={activeApprovalTab === tab.id ? "active" : ""}
              onClick={() => setActiveApprovalTab(tab.id)}
            >
              {tab.label}
              <span>{focusQueueState.tabActions[tab.id]?.length || 0}</span>
            </button>
          ))}
        </div>
        <div className="approval-table">
          {selectedApprovalItems.length === 0 && <p className="empty-state">Нет AI действий в выбранном фильтре.</p>}
          {prioritizeHighlightedItems(selectedApprovalItems, activeApprovalTab === "focus" ? FOCUS_QUEUE_LIMIT : 50).map((item) => renderApprovalRow(item))}
        </div>
        <div className="approval-collapsed-list">
          {renderCollapsedSection({ id: "legacy", title: "Show legacy pending", count: focusQueueState.hiddenLegacyActions.length, items: focusQueueState.hiddenLegacyActions })}
          {renderCollapsedSection({ id: "completed", title: "Show completed history", count: focusQueueState.completedHistoryActions.length, items: focusQueueState.completedHistoryActions, history: true })}
          {renderCollapsedSection({ id: "safety", title: "Show safety history", count: focusQueueState.safetyHistoryActions.length, items: focusQueueState.safetyHistoryActions, history: true })}
          {renderCollapsedSection({ id: "all", title: "Show all actions", count: focusQueueState.allActions.length, items: focusQueueState.allActions, history: true })}
        </div>
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
              <span className="eyebrow">Очередь</span>
              <h3>Статус AI задач</h3>
            </div>
            <span className="live-pill"><i />{metrics.queueActive || 0} активных</span>
          </div>
          <div className="ai-queue-list">
            {queue.length === 0 && <p className="empty-state">Очередь пуста. Запустите AI сотрудника, чтобы создать рекомендации.</p>}
            {prioritizeHighlightedItems(queue, 8).map((item) => (
              <article ref={isHighlightedApprovalItem(item) ? highlightRef : null} className={`ai-queue-item ${isHighlightedApprovalItem(item) ? "route-highlight" : ""}`} key={item.id}>
                <div>
                  <strong>{sanitizeVisibleAiText(item.title)}</strong>
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
