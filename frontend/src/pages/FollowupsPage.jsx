import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { approveAiFollowup, fetchAiFollowups, rejectAiFollowup, runAiFollowupScan, sendAiFollowup, updateAiFollowup } from "../services/api";

const statusLabels = { suggested: "ждёт одобрения", approved: "одобрено", rejected: "отклонено", sent: "отправлено", failed: "ошибка" };
const channelLabels = { telegram: "Telegram", email: "Email", crm: "CRM reminder" };
const urgencyLabels = { low: "низкая", medium: "средняя", high: "высокая", critical: "критично" };

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function mergeItem(items, next) {
  if (!next?.id) return items;
  return items.map((item) => item.id === next.id ? { ...item, ...next } : item);
}

function getActionError(error, fallback) {
  return error?.message || error?.payload?.error || fallback;
}

function getActionKey(itemId, action) {
  return `${itemId}:${action}`;
}

function isActionBusy(itemId, action, loadingActions) {
  return Boolean(loadingActions[getActionKey(itemId, action)]);
}

function isItemBusy(itemId, loadingActions) {
  const itemPrefix = `${itemId}:`;
  return Object.keys(loadingActions).some((key) => key.startsWith(itemPrefix));
}

function getActionButtonLabel(itemId, action, label, loadingActions) {
  return isActionBusy(itemId, action, loadingActions) ? "Выполняем…" : label;
}

function getEditButtonLabel(itemId, loadingActions) {
  return isActionBusy(itemId, "edit", loadingActions) ? "Сохраняем…" : "Изменить";
}

export default function FollowupsPage() {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({});
  const [scanBusy, setScanBusy] = useState(false);
  const [actionErrors, setActionErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await fetchAiFollowups();
      setItems(response.items || []);
      setMetrics(response.metrics || {});
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить follow-up центр");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const pending = useMemo(() => items.filter((item) => ["suggested", "approved", "failed"].includes(item.status)), [items]);

  async function handleScan() {
    setScanBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await runAiFollowupScan();
      const createdCount = response.createdCount ?? response.created?.length ?? 0;
      const skippedCount = response.skippedCount ?? response.skippedDuplicates?.length ?? 0;
      const autoSeededMessage = response.rulesSeeded > 0
        ? "Правила follow-up были созданы автоматически. "
        : "";
      setMessage(`${autoSeededMessage}Сканирование завершено: создано ${createdCount}, дублей пропущено ${skippedCount}.`);
      await load({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось выполнить сканирование");
    } finally {
      setScanBusy(false);
    }
  }

  async function handleAction(item, action) {
    const actionKey = getActionKey(item.id, action);
    setLoadingActions((current) => ({ ...current, [actionKey]: true }));
    setActionErrors((current) => {
      const { [item.id]: _removed, ...remaining } = current;
      return remaining;
    });
    setError("");
    setMessage("");
    try {
      let response;
      if (action === "approve") response = await approveAiFollowup(item.id);
      if (action === "reject") response = await rejectAiFollowup(item.id);
      if (action === "send") response = await sendAiFollowup(item.id);
      if (response?.item) setItems((current) => mergeItem(current, response.item));
      const actionError = response?.error || "";
      const actionMessage = action === "approve" ? "Follow-up одобрен." : action === "reject" ? "Follow-up отклонён." : "Follow-up отправлен";
      await load({ silent: true });
      if (actionError) {
        setActionErrors((current) => ({ ...current, [item.id]: actionError }));
      } else {
        setMessage(actionMessage);
      }
    } catch (requestError) {
      setActionErrors((current) => ({ ...current, [item.id]: getActionError(requestError, "Не удалось выполнить действие") }));
    } finally {
      setLoadingActions((current) => {
        const { [actionKey]: _removed, ...remaining } = current;
        return remaining;
      });
    }
  }

  async function handleEdit(item) {
    const generatedMessage = window.prompt("Изменить follow-up сообщение", item.generatedMessage || "");
    if (generatedMessage === null) return;
    const actionKey = getActionKey(item.id, "edit");
    setLoadingActions((current) => ({ ...current, [actionKey]: true }));
    setActionErrors((current) => {
      const { [item.id]: _removed, ...remaining } = current;
      return remaining;
    });
    setError("");
    setMessage("");
    try {
      const response = await updateAiFollowup(item.id, { generatedMessage });
      if (response?.item) setItems((current) => mergeItem(current, response.item));
      await load({ silent: true });
      setMessage("Follow-up обновлён.");
    } catch (requestError) {
      setActionErrors((current) => ({ ...current, [item.id]: getActionError(requestError, "Не удалось изменить follow-up") }));
    } finally {
      setLoadingActions((current) => {
        const { [actionKey]: _removed, ...remaining } = current;
        return remaining;
      });
    }
  }

  return (
    <main className="app-page followups-page">
      <PageHeading
        eyebrow="AI Autonomous Follow-up Engine v1"
        title="AI Follow-up Center"
        copy="AI находит неактивных лидов и готовит касания только на одобрение. Автоотправка выключена."
        action={<button className="btn primary" type="button" onClick={handleScan} disabled={scanBusy}>{scanBusy ? "Сканируем…" : "Запустить scan"}</button>}
      />

      {(error || message) && <div className={error ? "form-error" : "form-success"}>{error || message}</div>}

      <section className="stats-grid">
        <StatCard label="Follow-ups pending" value={loading ? "…" : String(metrics.pending || 0)} hint="suggested + approved" tone="pink" />
        <StatCard label="Hot leads without contact" value={loading ? "…" : String(metrics.hotWithoutContact || 0)} hint="AI score ≥ 70 без свежего контакта" tone="violet" />
        <StatCard label="Follow-ups sent today" value={loading ? "…" : String(metrics.sentToday || 0)} hint="отправлено сегодня" />
        <StatCard label="Follow-up conversion" value={`${metrics.conversionPlaceholder || 0}%`} hint="placeholder для будущей автономной аналитики" tone="violet" />
      </section>

      <Panel title="Лиды, которым нужен follow-up" eyebrow={`${pending.length} активных рекомендаций`}>
        {loading && <p className="empty-state">Загрузка follow-up очереди…</p>}
        {!loading && items.length === 0 && <p className="empty-state">Пока нет рекомендаций. Запустите scan, чтобы найти неактивных лидов.</p>}
        <div className="approval-list followup-center-list">
          {items.map((item) => {
            const itemBusy = isItemBusy(item.id, loadingActions);
            const itemError = actionErrors[item.id];

            return (
            <article className={`approval-card followup-card ${item.status}`} key={item.id}>
              <div className="approval-card-head">
                <div>
                  <span className="eyebrow">{item.ruleType} · {channelLabels[item.suggestedChannel] || item.suggestedChannel}</span>
                  <h3>{item.lead?.name || "Лид"}{item.lead?.company ? ` · ${item.lead.company}` : ""}</h3>
                  <p>{item.reason || "AI обнаружил необходимость касания"}</p>
                </div>
                <span className={`urgency-badge ${item.urgency}`}>{urgencyLabels[item.urgency] || item.urgency}</span>
              </div>
              <pre className="ai-output-box">{item.generatedMessage}</pre>
              <div className="approval-meta">
                <span>{statusLabels[item.status] || item.status}</span>
                <span>Запланировано: {formatDate(item.scheduledFor)}</span>
                {(itemError || item.error) && <span>Ошибка: {itemError || item.error}</span>}
              </div>
              <div className="approval-actions">
                <button className="ghost-button compact" type="button" onClick={() => handleAction(item, "approve")} disabled={itemBusy || item.status !== "suggested"}>{getActionButtonLabel(item.id, "approve", "Одобрить", loadingActions)}</button>
                <button className="ghost-button compact" type="button" onClick={() => handleEdit(item)} disabled={itemBusy || !["suggested", "approved", "failed"].includes(item.status)}>{getEditButtonLabel(item.id, loadingActions)}</button>
                <button className="ghost-button compact danger-action" type="button" onClick={() => handleAction(item, "reject")} disabled={itemBusy || !["suggested", "failed"].includes(item.status)}>{getActionButtonLabel(item.id, "reject", "Отклонить", loadingActions)}</button>
                <button className="btn primary compact" type="button" onClick={() => handleAction(item, "send")} disabled={itemBusy || item.status !== "approved"}>{getActionButtonLabel(item.id, "send", "Отправить", loadingActions)}</button>
                <Link className="ghost-button compact" to={`/crm?lead=${item.leadId}`}>CRM</Link>
              </div>
            </article>
            );
          })}
        </div>
      </Panel>
    </main>
  );
}
