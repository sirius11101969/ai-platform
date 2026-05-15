import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { createAiTask, fetchAiTask, fetchAiTasks, fetchProfile } from "../services/api";
import { orders, quickActions, userProfile } from "../data/mockData";

const taskTypeLabels = {
  text_generation: "AI draft",
  sales_email: "Sales email",
  crm_summary: "CRM summary",
  lead_follow_up: "Lead follow-up",
};

const initialTaskForm = {
  type: "text_generation",
  prompt: "",
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusText(status) {
  const labels = {
    pending: "В очереди",
    processing: "В работе",
    completed: "Готово",
    failed: "Ошибка",
  };
  return labels[status] || status;
}

function renderTaskResult(result) {
  if (!result) return "Результат появится после обработки задачи.";
  if (result.content) return result.content;
  if (Array.isArray(result.bullets)) return result.bullets.join("\n• ");
  if (Array.isArray(result.steps)) return result.steps.join("\n• ");
  return JSON.stringify(result, null, 2);
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [costs, setCosts] = useState({});
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const [profileResponse, tasksResponse] = await Promise.all([fetchProfile(), fetchAiTasks()]);
      setProfile(profileResponse.user || null);
      setTasks(tasksResponse.tasks || []);
      setCosts(tasksResponse.costs || {});
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const activeTasks = tasks.filter((task) => ["pending", "processing"].includes(task.status));
    if (activeTasks.length === 0) return undefined;

    const interval = window.setInterval(async () => {
      try {
        const updates = await Promise.all(activeTasks.map((task) => fetchAiTask(task.id)));
        setTasks((currentTasks) => currentTasks.map((task) => {
          const updated = updates.find((response) => response.task?.id === task.id)?.task;
          return updated || task;
        }));
      } catch (_error) {
        // Keep the current task list visible; the next manual refresh can recover.
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [tasks]);

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const activeTasks = tasks.filter((task) => ["pending", "processing"].includes(task.status)).length;
  const creditsSpent = tasks.reduce((sum, task) => sum + Number(task.credits_spent || 0), 0);
  const creditBalance = Number(profile?.credits || 0);
  const creditsUsedPercent = Math.min(100, Math.round((creditsSpent / Math.max(creditBalance + creditsSpent, 1)) * 100));

  const sortedTasks = useMemo(() => tasks.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [tasks]);

  async function handleCreateTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await createAiTask(taskForm);
      setTasks((currentTasks) => [response.task, ...currentTasks]);
      setProfile((currentProfile) => currentProfile ? { ...currentProfile, credits: response.remainingCredits } : currentProfile);
      setTaskForm(initialTaskForm);
      setMessage("AI-задача создана, credits списаны, обработка запущена.");
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать AI-задачу");
    } finally {
      setSaving(false);
    }
  }

  const displayProfile = profile || userProfile;

  return (
    <main className="workspace-page">
      <PageHeading
        eyebrow="Dashboard"
        title="Операционная панель AI‑команды"
        copy="Профиль, credits, подписки и AI-задачи собраны в защищённой зоне для ежедневной работы growth-команды."
        action={<Link className="btn primary compact" to="/crm">Открыть CRM</Link>}
      />

      {error && <p className="auth-error dashboard-alert">{error}</p>}
      {message && <p className="success-alert dashboard-alert">{message}</p>}

      <section className="dashboard-stats">
        <StatCard label="Credits balance" value={loading ? "…" : creditBalance.toLocaleString("ru-RU")} hint="Доступно для новых AI-задач" />
        <StatCard label="AI tasks" value={loading ? "…" : String(tasks.length)} hint={`${activeTasks} в обработке · ${completedTasks} готово`} tone="violet" />
        <StatCard label="Credits spent" value={loading ? "…" : creditsSpent.toLocaleString("ru-RU")} hint="Списано через credits ledger" tone="pink" />
      </section>

      <section className="app-grid two-columns">
        <Panel className="profile-card">
          <span className="eyebrow">User profile</span>
          <div className="profile-hero">
            <div className="profile-avatar">{String(displayProfile.email || displayProfile.name || "AI").slice(0, 2).toUpperCase()}</div>
            <div>
              <h3>{displayProfile.email || displayProfile.name}</h3>
              <p>{displayProfile.plan || "free"} · JWT protected workspace</p>
              <span>{displayProfile.id || displayProfile.company}</span>
            </div>
          </div>
        </Panel>

        <Panel className="credits-card">
          <span className="eyebrow">Credits block</span>
          <div className="credits-number">{creditBalance.toLocaleString("ru-RU")}</div>
          <p>{activeTasks > 0 ? `${activeTasks} AI-задач обрабатываются сейчас` : "Баланс готов к новым AI-задачам"}</p>
          <div className="progress-track"><i style={{ width: `${creditsUsedPercent}%` }} /></div>
          <small>Использовано {creditsUsedPercent}% от суммарного доступного объёма</small>
        </Panel>
      </section>

      <section className="app-grid two-columns align-start">
        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Create AI task</span>
              <h3>Новая AI-задача</h3>
            </div>
          </div>
          <form className="ai-task-form" onSubmit={handleCreateTask}>
            <label className="crm-field">
              <span>Тип задачи</span>
              <select value={taskForm.type} onChange={(event) => setTaskForm({ ...taskForm, type: event.target.value })}>
                {Object.keys(taskTypeLabels).map((type) => (
                  <option value={type} key={type}>{taskTypeLabels[type]} · {costs[type] || 0} credits</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span>Prompt *</span>
              <textarea
                value={taskForm.prompt}
                onChange={(event) => setTaskForm({ ...taskForm, prompt: event.target.value })}
                placeholder="Например: подготовь follow-up для лида после демо CRM automation"
                required
              />
            </label>
            <button className="btn primary compact" disabled={saving || loading} type="submit">
              {saving ? "Запускаем…" : "Создать AI-задачу"}
            </button>
          </form>
        </Panel>

        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Task statuses</span>
              <h3>История AI-задач</h3>
            </div>
            <button className="ghost-button" type="button" onClick={loadDashboard} disabled={loading}>Обновить</button>
          </div>
          <div className="task-list ai-history-list">
            {loading && <p className="empty-state">Загружаем AI-задачи…</p>}
            {!loading && sortedTasks.length === 0 && <p className="empty-state">AI-задач пока нет. Создайте первую задачу слева.</p>}
            {sortedTasks.map((task) => (
              <article className={`task-card ai-task-row ${task.status}`} key={task.id}>
                <div>
                  <strong>{taskTypeLabels[task.type] || task.type}</strong>
                  <span>{statusText(task.status)} · {task.credits_spent} credits · {formatDate(task.created_at)}</span>
                  <small>{task.prompt}</small>
                  <pre>{renderTaskResult(task.result)}</pre>
                </div>
                <b>{task.status}</b>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel>
        <div className="panel-head">
          <div>
            <span className="eyebrow">Orders & quick actions</span>
            <h3>Оплаты, тариф и быстрые действия</h3>
          </div>
        </div>
        <div className="order-list dashboard-orders">
          {orders.map((order) => (
            <article key={order.title}>
              <div>
                <strong>{order.title}</strong>
                <span>{order.meta}</span>
              </div>
              <b>{order.amount}</b>
            </article>
          ))}
        </div>
        <div className="quick-actions dashboard-quick-actions">
          {quickActions.map((action) => <button type="button" key={action}>{action}</button>)}
        </div>
      </Panel>
    </main>
  );
}
