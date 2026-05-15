import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { fetchAiCommandCenter, runAiWorker, seedDemoSalesPipeline, updateAiWorker } from "../services/api";

const typeLabels = {
  ai_sdr_agent: "AI SDR Agent",
  ai_followup_worker: "AI Follow-up Worker",
  ai_revenue_analyst: "AI Revenue Analyst",
  ai_crm_assistant: "AI CRM Assistant",
  ai_email_assistant: "AI Email Assistant",
  ai_telegram_assistant: "AI Telegram Assistant",
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
  failed: "Ошибка",
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

function shortRecommendation(item) {
  const text = item.recommendation || item.title || "AI рекомендация ожидает решения";
  return text.length > 130 ? `${text.slice(0, 130)}…` : text;
}

export default function AiWorkersPage() {
  const [commandCenter, setCommandCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyWorker, setBusyWorker] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCommandCenter({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await fetchAiCommandCenter();
      setCommandCenter(response.commandCenter || null);
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
        <StatCard label="Выручка под контролем AI" value={loading ? "…" : formatMoney(metrics.revenueUnderAi)} hint="Плейсхолдер revenue impact по открытой воронке" tone="violet" />
      </section>

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
