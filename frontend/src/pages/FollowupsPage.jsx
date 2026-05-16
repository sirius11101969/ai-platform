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

export default function FollowupsPage() {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
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
    setBusy("scan");
    setError("");
    setMessage("");
    try {
      const response = await runAiFollowupScan();
      setMessage(`Сканирование завершено: создано ${response.created?.length || 0}, дублей пропущено ${response.skippedDuplicates?.length || 0}.`);
      await load({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось выполнить сканирование");
    } finally {
      setBusy("");
    }
  }

  async function handleAction(item, action) {
    setBusy(`${item.id}:${action}`);
    setError("");
    setMessage("");
    try {
      let response;
      if (action === "approve") response = await approveAiFollowup(item.id);
      if (action === "reject") response = await rejectAiFollowup(item.id);
      if (action === "send") response = await sendAiFollowup(item.id);
      if (response?.item) setItems((current) => mergeItem(current, response.item));
      if (response?.error) setError(response.error);
      else setMessage(action === "approve" ? "Follow-up одобрен." : action === "reject" ? "Follow-up отклонён." : "Follow-up отправлен или создан как CRM reminder.");
      await load({ silent: true });
    } catch (requestError) {
      setError(requestError.message || "Не удалось выполнить действие");
    } finally {
      setBusy("");
    }
  }

  async function handleEdit(item) {
    const generatedMessage = window.prompt("Изменить follow-up сообщение", item.generatedMessage || "");
    if (generatedMessage === null) return;
    setBusy(`${item.id}:edit`);
    try {
      const response = await updateAiFollowup(item.id, { generatedMessage });
      if (response?.item) setItems((current) => mergeItem(current, response.item));
    } catch (requestError) {
      setError(requestError.message || "Не удалось изменить follow-up");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="app-page followups-page">
      <PageHeading
        eyebrow="AI Autonomous Follow-up Engine v1"
        title="AI Follow-up Center"
        copy="AI находит неактивных лидов и готовит касания только на одобрение. Автоотправка выключена."
        action={<button className="btn primary" type="button" onClick={handleScan} disabled={busy === "scan"}>{busy === "scan" ? "Сканируем…" : "Запустить scan"}</button>}
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
          {items.map((item) => (
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
                {item.error && <span>Ошибка: {item.error}</span>}
              </div>
              <div className="approval-actions">
                <button className="ghost-button compact" type="button" onClick={() => handleAction(item, "approve")} disabled={busy || item.status !== "suggested"}>Одобрить</button>
                <button className="ghost-button compact" type="button" onClick={() => handleEdit(item)} disabled={busy || !["suggested", "approved", "failed"].includes(item.status)}>Изменить</button>
                <button className="ghost-button compact danger-action" type="button" onClick={() => handleAction(item, "reject")} disabled={busy || !["suggested", "failed"].includes(item.status)}>Отклонить</button>
                <button className="btn primary compact" type="button" onClick={() => handleAction(item, "send")} disabled={busy || item.status !== "approved"}>Отправить</button>
                <Link className="ghost-button compact" to={`/crm?lead=${item.leadId}`}>CRM</Link>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </main>
  );
}
